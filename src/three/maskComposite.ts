/**
 * Composites a tile/slab pattern into a manually-painted mask region on a
 * real photo. Deliberately scoped (disclosed, not hidden): this clips the
 * pattern to the mask and blends it with the photo's own luminance
 * (multiply) so existing shadows/highlights show through -- it does NOT
 * do a full perspective/homography warp of the pattern to the room's
 * vanishing point (that's the earlier, since-removed masking system's
 * approach; rebuilding it is a larger follow-up if wanted). Occlusion
 * comes for free from the mask itself: anything the user didn't paint
 * (a chair leg, a sink) is simply outside the mask and stays the
 * untouched original pixel.
 */

interface CompositeParams {
  sourceImage: HTMLImageElement;
  /** Same pixel dimensions as sourceImage. White (any non-transparent,
   * non-black pixel) marks the painted region. */
  maskCanvas: HTMLCanvasElement;
  /** A tileable pattern (from tilePattern.ts) or a single slab photo. */
  patternCanvas: HTMLCanvasElement;
  /** How many times the pattern repeats across the mask's bounding box. */
  repeatX: number;
  repeatY: number;
}

const getMaskBoundingBox = (maskCanvas: HTMLCanvasElement) => {
  const ctx = maskCanvas.getContext("2d")!;
  const { data, width, height } = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  const step = 2; // sample every other pixel for performance on large photos
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX <= minX || maxY <= minY) return null;
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
};

export const compositeMaterialIntoMask = ({ sourceImage, maskCanvas, patternCanvas, repeatX, repeatY }: CompositeParams): HTMLCanvasElement => {
  const w = sourceImage.naturalWidth || sourceImage.width;
  const h = sourceImage.naturalHeight || sourceImage.height;

  const result = document.createElement("canvas");
  result.width = w;
  result.height = h;
  const ctx = result.getContext("2d")!;
  ctx.drawImage(sourceImage, 0, 0, w, h);

  const bbox = getMaskBoundingBox(maskCanvas);
  if (!bbox) return result; // nothing painted -- return the untouched photo

  // Build the material layer at full-image size, tiled across the mask's
  // bounding box only (cheaper than tiling the whole photo).
  const materialLayer = document.createElement("canvas");
  materialLayer.width = w;
  materialLayer.height = h;
  const mctx = materialLayer.getContext("2d")!;
  mctx.save();
  mctx.translate(bbox.x, bbox.y);
  const cellW = bbox.width / Math.max(1, repeatX);
  const cellH = bbox.height / Math.max(1, repeatY);
  const sx = cellW / patternCanvas.width;
  const sy = cellH / patternCanvas.height;
  mctx.scale(sx, sy);
  const pattern = mctx.createPattern(patternCanvas, "repeat");
  if (pattern) {
    mctx.fillStyle = pattern;
    mctx.fillRect(0, 0, bbox.width / sx, bbox.height / sy);
  }
  mctx.restore();

  // Clip the material to exactly the painted region.
  mctx.globalCompositeOperation = "destination-in";
  mctx.drawImage(maskCanvas, 0, 0);
  mctx.globalCompositeOperation = "source-over";

  // Multiply-blend onto the photo so existing shadows/highlights in that
  // area still read through the new material instead of flattening it.
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.drawImage(materialLayer, 0, 0);
  ctx.restore();

  // A light normal-blend pass at partial opacity restores some of the
  // material's true color (pure multiply alone can look too dark/muddy).
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.globalCompositeOperation = "source-over";
  ctx.drawImage(materialLayer, 0, 0);
  ctx.restore();

  return result;
};
