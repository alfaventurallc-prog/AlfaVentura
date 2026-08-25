import { applyHomography, computeHomography, invertHomography, pointInPolygon, type Point } from "./homography";

const MAX_WORKING_WIDTH = 1400;

export interface SlabPlacementOptions {
  textureScale?: number;
  offsetX?: number;
  offsetY?: number;
  /** Degrees. */
  rotation?: number;
}

const toRadians = (deg: number) => (deg * Math.PI) / 180;

const drawToCanvas = (image: HTMLImageElement, maxWidth: number) => {
  const scale = Math.min(1, maxWidth / image.naturalWidth);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return { canvas, ctx };
};

const sampleBilinear = (data: Uint8ClampedArray, w: number, h: number, x: number, y: number) => {
  const cx = Math.min(w - 1.001, Math.max(0, x));
  const cy = Math.min(h - 1.001, Math.max(0, y));
  const x0 = Math.floor(cx);
  const y0 = Math.floor(cy);
  const x1 = x0 + 1;
  const y1 = y0 + 1;
  const fx = cx - x0;
  const fy = cy - y0;

  const at = (px: number, py: number, c: number) => data[(py * w + px) * 4 + c];
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const out = [0, 0, 0, 0];
  for (let c = 0; c < 4; c++) {
    const top = lerp(at(x0, y0, c), at(x1, y0, c), fx);
    const bottom = lerp(at(x0, y1, c), at(x1, y1, c), fx);
    out[c] = lerp(top, bottom, fy);
  }
  return out;
};

/**
 * Composites a slab design into a designated polygon area of a base photo,
 * warped to match that area's real perspective (via a 3x3 homography from
 * the unit square to the area's 4 corners) and multiplied by the base
 * photo's own luminance so shadows/highlights on the original surface stay
 * visible instead of the slab looking like a flat pasted sticker.
 *
 * `corners` are the 4 quadrilateral corners (normalized 0-1, image space)
 * that define the perspective; `clipPolygon` (defaults to `corners`) is
 * the visible-area mask, which may have more points for an irregular shape.
 */
export const renderSlabOnImage = (
  baseImage: HTMLImageElement,
  slabImage: HTMLImageElement,
  corners: [Point, Point, Point, Point],
  options: SlabPlacementOptions = {},
  clipPolygon?: Point[]
): HTMLCanvasElement => {
  const { textureScale = 1, offsetX = 0, offsetY = 0, rotation = 0 } = options;

  const { canvas: baseCanvas, ctx: baseCtx } = drawToCanvas(baseImage, MAX_WORKING_WIDTH);
  const { width: w, height: h } = baseCanvas;
  const baseData = baseCtx.getImageData(0, 0, w, h);

  const { ctx: slabCtx, canvas: slabCanvas } = drawToCanvas(slabImage, 900);
  const slabData = slabCtx.getImageData(0, 0, slabCanvas.width, slabCanvas.height);

  const destCorners = corners.map((p) => ({ x: p.x * w, y: p.y * h })) as [Point, Point, Point, Point];
  const srcCorners: [Point, Point, Point, Point] = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ];
  const forward = computeHomography(srcCorners, destCorners);
  const inverse = invertHomography(forward);

  const polygonPx = (clipPolygon ?? corners).map((p) => ({ x: p.x * w, y: p.y * h }));
  const minX = Math.max(0, Math.floor(Math.min(...polygonPx.map((p) => p.x))));
  const maxX = Math.min(w - 1, Math.ceil(Math.max(...polygonPx.map((p) => p.x))));
  const minY = Math.max(0, Math.floor(Math.min(...polygonPx.map((p) => p.y))));
  const maxY = Math.min(h - 1, Math.ceil(Math.max(...polygonPx.map((p) => p.y))));

  const cos = Math.cos(toRadians(rotation));
  const sin = Math.sin(toRadians(rotation));

  for (let py = minY; py <= maxY; py++) {
    for (let px = minX; px <= maxX; px++) {
      if (!pointInPolygon({ x: px, y: py }, polygonPx)) continue;

      const uv = applyHomography(inverse, px, py);
      if (uv.x < -0.001 || uv.x > 1.001 || uv.y < -0.001 || uv.y > 1.001) continue;

      // rotate around the tile's center, then apply scale + offset
      const cxU = uv.x - 0.5;
      const cyU = uv.y - 0.5;
      const ru = cxU * cos - cyU * sin;
      const rv = cxU * sin + cyU * cos;
      let su = 0.5 + ru / textureScale + offsetX;
      let sv = 0.5 + rv / textureScale + offsetY;
      su = Math.min(0.999, Math.max(0, su));
      sv = Math.min(0.999, Math.max(0, sv));

      const [sr, sg, sb] = sampleBilinear(slabData.data, slabData.width, slabData.height, su * slabData.width, sv * slabData.height);

      const baseIndex = (py * w + px) * 4;
      const br = baseData.data[baseIndex];
      const bg = baseData.data[baseIndex + 1];
      const bb = baseData.data[baseIndex + 2];
      const luminance = (0.2126 * br + 0.7152 * bg + 0.0722 * bb) / 255;
      const lightMul = Math.min(1.6, Math.max(0.35, luminance / 0.5));

      baseData.data[baseIndex] = Math.min(255, sr * lightMul);
      baseData.data[baseIndex + 1] = Math.min(255, sg * lightMul);
      baseData.data[baseIndex + 2] = Math.min(255, sb * lightMul);
    }
  }

  baseCtx.putImageData(baseData, 0, 0);
  return baseCanvas;
};
