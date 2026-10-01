/**
 * Many product photos are a slab standing in a warehouse (roof, pallet,
 * lifting clamp, neighbouring slabs) rather than a clean texture scan. Used
 * as-is, the whole photo -- background included -- gets mapped onto the
 * countertop, so only part of the stone shows and the rest is warehouse.
 *
 * This finds the slab inside the photo (deterministic colour analysis, no
 * AI): seed a colour from the image centre, grow a rectangle outward while
 * its edges still match that colour, then pull each edge back in until it is
 * clean stone (drops the clamp and the slab's own rim/shadow). Clean scans
 * come back as (almost) the full frame and are returned untouched.
 */

export type CropSource = HTMLImageElement | ImageBitmap | HTMLCanvasElement;

const ANALYSIS_WIDTH = 160;
/** Max RGB distance from the seed colour that still counts as "slab". */
const COLOR_TOLERANCE = 55;
/** Fraction of an edge band that must match for the rectangle to grow. */
const GROW_FRACTION = 0.7;
/** Fraction an edge band must match to count as clean stone. */
const CLEAN_FRACTION = 0.97;
/** How far (fraction of the found rect) an edge may be pulled back in. */
const MAX_SHRINK = 0.2;
const MAX_OUTPUT = 2048;

export interface SlabRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** The slab's bounds as fractions (0-1) of the image, or null to use the whole photo. */
export const findSlabRect = (image: CropSource): SlabRect | null => {
  const W = ANALYSIS_WIDTH;
  const H = Math.max(8, Math.round((ANALYSIS_WIDTH * image.height) / image.width));
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(image, 0, 0, W, H);
  const d = ctx.getImageData(0, 0, W, H).data;

  const cx0 = Math.floor(W * 0.4);
  const cx1 = Math.ceil(W * 0.6) - 1;
  const cy0 = Math.floor(H * 0.4);
  const cy1 = Math.ceil(H * 0.6) - 1;
  const rs: number[] = [];
  const gs: number[] = [];
  const bs: number[] = [];
  for (let y = cy0; y <= cy1; y++) {
    for (let x = cx0; x <= cx1; x++) {
      const i = (y * W + x) * 4;
      rs.push(d[i]);
      gs.push(d[i + 1]);
      bs.push(d[i + 2]);
    }
  }
  const median = (a: number[]) => a.sort((p, q) => p - q)[a.length >> 1];
  const sr = median(rs);
  const sg = median(gs);
  const sb = median(bs);

  const mask = new Uint8Array(W * H);
  // A dark slab against a dark warehouse needs a much tighter match than a
  // white slab against grey walls, so the tolerance scales with brightness.
  const seedLum = (sr + sg + sb) / 3;
  const tolerance = Math.min(COLOR_TOLERANCE, 12 + seedLum * 0.6);
  const tol2 = tolerance * tolerance;
  for (let i = 0; i < W * H; i++) {
    const dr = d[i * 4] - sr;
    const dg = d[i * 4 + 1] - sg;
    const db = d[i * 4 + 2] - sb;
    mask[i] = dr * dr + dg * dg + db * db <= tol2 ? 1 : 0;
  }

  const rowFrac = (y: number, x0: number, x1: number) => {
    let s = 0;
    for (let x = x0; x <= x1; x++) s += mask[y * W + x];
    return s / (x1 - x0 + 1);
  };
  const colFrac = (x: number, y0: number, y1: number) => {
    let s = 0;
    for (let y = y0; y <= y1; y++) s += mask[y * W + x];
    return s / (y1 - y0 + 1);
  };
  // Average over a 3-line band so a single vein along a row can't stop growth.
  const band = (frac: (p: number, a: number, b: number) => number, start: number, dir: number, max: number, a: number, b: number) => {
    let s = 0;
    let n = 0;
    for (let k = 0; k < 3; k++) {
      const p = start + dir * k;
      if (p < 0 || p > max) break;
      s += frac(p, a, b);
      n++;
    }
    return n ? s / n : 0;
  };

  let l = cx0;
  let r = cx1;
  let t = cy0;
  let b = cy1;
  for (let changed = true; changed; ) {
    changed = false;
    if (t > 0 && band(rowFrac, t - 1, -1, H - 1, l, r) >= GROW_FRACTION) (t--, (changed = true));
    if (b < H - 1 && band(rowFrac, b + 1, 1, H - 1, l, r) >= GROW_FRACTION) (b++, (changed = true));
    if (l > 0 && band(colFrac, l - 1, -1, W - 1, t, b) >= GROW_FRACTION) (l--, (changed = true));
    if (r < W - 1 && band(colFrac, r + 1, 1, W - 1, t, b) >= GROW_FRACTION) (r++, (changed = true));
  }

  // Pull each edge in until it's clean stone (clamp, rim, shadow, background sliver).
  const maxDy = Math.floor((b - t) * MAX_SHRINK);
  const maxDx = Math.floor((r - l) * MAX_SHRINK);
  for (let k = 0; k < maxDy && band(rowFrac, t, 1, H - 1, l, r) < CLEAN_FRACTION; k++) t++;
  for (let k = 0; k < maxDy && band(rowFrac, b, -1, H - 1, l, r) < CLEAN_FRACTION; k++) b--;
  for (let k = 0; k < maxDx && band(colFrac, l, 1, W - 1, t, b) < CLEAN_FRACTION; k++) l++;
  for (let k = 0; k < maxDx && band(colFrac, r, -1, W - 1, t, b) < CLEAN_FRACTION; k++) r--;
  // One more line in on every side so no antialiased rim survives.
  t = Math.min(t + 1, b);
  b = Math.max(b - 1, t);
  l = Math.min(l + 1, r);
  r = Math.max(r - 1, l);

  const rect = { x: l / W, y: t / H, w: (r - l + 1) / W, h: (b - t + 1) / H };
  // Too small = probably not a slab photo at all; nearly full = already a clean scan.
  if (rect.w * rect.h < 0.15) return null;
  if (rect.w > 0.95 && rect.h > 0.95) return null;
  return rect;
};

const cache = new WeakMap<object, CropSource>();

/** The slab-only region of a product photo (cached per image), or the image itself when it's already clean. */
export const cropToSlab = (image: CropSource): CropSource => {
  const hit = cache.get(image);
  if (hit) return hit;
  let result: CropSource = image;
  try {
    const rect = findSlabRect(image);
    if (rect) {
      const sx = rect.x * image.width;
      const sy = rect.y * image.height;
      const sw = rect.w * image.width;
      const sh = rect.h * image.height;
      const scale = Math.min(1, MAX_OUTPUT / Math.max(sw, sh));
      const out = document.createElement("canvas");
      out.width = Math.max(1, Math.round(sw * scale));
      out.height = Math.max(1, Math.round(sh * scale));
      out.getContext("2d")!.drawImage(image, sx, sy, sw, sh, 0, 0, out.width, out.height);
      result = out;
    }
  } catch {
    // Tainted canvas (no CORS) or similar: fall back to the full photo.
    result = image;
  }
  cache.set(image, result);
  return result;
};
