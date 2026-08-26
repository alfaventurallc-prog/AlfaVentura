/**
 * Samples a representative solid color from a product photo (deterministic
 * average of a downscaled copy — no AI). Used for surfaces where stretching
 * the actual photo would look wrong (e.g. a cabinet door too small to show
 * a whole slab/cabinet photograph clearly) but the surface should still
 * visually reflect the real product rather than a generic placeholder tone.
 */
export const extractAverageColor = (image: HTMLImageElement): string => {
  const size = 24;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(image, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);

  let r = 0;
  let g = 0;
  let b = 0;
  const count = size * size;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }
  r = Math.round(r / count);
  g = Math.round(g / count);
  b = Math.round(b / count);

  const hex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`;
};

const colorCache = new Map<string, string>();

export const getAverageColorForImage = (src: string): Promise<string> =>
  new Promise((resolve) => {
    const cached = colorCache.get(src);
    if (cached) {
      resolve(cached);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const color = extractAverageColor(img);
        colorCache.set(src, color);
        resolve(color);
      } catch {
        resolve("#D8C9AE");
      }
    };
    img.onerror = () => resolve("#D8C9AE");
    img.src = src;
  });
