import * as THREE from "three";

const WORK_SIZE = 512;

/**
 * Derives a normal map from a regular color photo using a Sobel filter over
 * luminance ("height from brightness"). It's not a physically-authored
 * normal map, but it gives polished stone photos real micro-surface
 * variation to catch light instead of reading as a flat printed texture --
 * there is no separate normal-map asset for any product, only the photo.
 */
export const generateNormalMapFromImage = (image: HTMLImageElement | ImageBitmap, strength = 1): THREE.CanvasTexture => {
  const srcCanvas = document.createElement("canvas");
  const aspect = image.width / image.height;
  const w = aspect >= 1 ? WORK_SIZE : Math.round(WORK_SIZE * aspect);
  const h = aspect >= 1 ? Math.round(WORK_SIZE / aspect) : WORK_SIZE;
  srcCanvas.width = w;
  srcCanvas.height = h;
  const srcCtx = srcCanvas.getContext("2d")!;
  srcCtx.drawImage(image, 0, 0, w, h);
  const src = srcCtx.getImageData(0, 0, w, h).data;

  const luminance = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const r = src[i * 4];
    const g = src[i * 4 + 1];
    const b = src[i * 4 + 2];
    luminance[i] = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  }

  const at = (x: number, y: number) => luminance[Math.min(h - 1, Math.max(0, y)) * w + Math.min(w - 1, Math.max(0, x))];

  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const outCtx = out.getContext("2d")!;
  const outData = outCtx.createImageData(w, h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // Sobel operator
      const gx =
        -1 * at(x - 1, y - 1) + 1 * at(x + 1, y - 1) +
        -2 * at(x - 1, y) + 2 * at(x + 1, y) +
        -1 * at(x - 1, y + 1) + 1 * at(x + 1, y + 1);
      const gy =
        -1 * at(x - 1, y - 1) - 2 * at(x, y - 1) - 1 * at(x + 1, y - 1) +
        1 * at(x - 1, y + 1) + 2 * at(x, y + 1) + 1 * at(x + 1, y + 1);

      const nx = -gx * strength;
      const ny = -gy * strength;
      const nz = 1;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);

      const i = (y * w + x) * 4;
      outData.data[i] = ((nx / len) * 0.5 + 0.5) * 255;
      outData.data[i + 1] = ((ny / len) * 0.5 + 0.5) * 255;
      outData.data[i + 2] = ((nz / len) * 0.5 + 0.5) * 255;
      outData.data[i + 3] = 255;
    }
  }

  outCtx.putImageData(outData, 0, 0);

  const texture = new THREE.CanvasTexture(out);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
};
