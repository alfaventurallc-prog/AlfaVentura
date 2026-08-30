import type { LayoutPattern } from "@/lib/visualizer2/layout";

/** Pixels-per-mm used when rasterizing a tile pattern into a canvas --
 * high enough to read as a real material at typical camera distance,
 * capped so canvases stay small regardless of real tile size. */
const PPM = 0.5;
const MAX_CANVAS = 1024;

const makeRng = (seed: number) => {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export interface TilePatternParams {
  layout: LayoutPattern;
  tileWidthMm: number;
  tileHeightMm: number;
  groutWidthMm: number;
  groutColor: string;
  tileColor: string;
  seed: number;
}

export interface TilePatternResult {
  canvas: HTMLCanvasElement;
  /** Real-world mm one full copy of this canvas represents once tiled with
   * RepeatWrapping -- how the caller converts surface size into a repeat
   * count. For non-repeating patch patterns (herringbone/ashlar) this is
   * just the patch's own extent, so repeat approximates rather than tiles
   * perfectly seamlessly -- disclosed as a known limitation. */
  cellWidthMm: number;
  cellHeightMm: number;
}

const clampCanvas = (n: number) => Math.max(8, Math.min(MAX_CANVAS, Math.round(n)));

const fillGrout = (ctx: CanvasRenderingContext2D, w: number, h: number, color: string) => {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
};

export const buildTilePatternCanvas = (p: TilePatternParams): TilePatternResult => {
  const { layout, tileWidthMm, tileHeightMm, groutWidthMm, groutColor, tileColor, seed } = p;
  const tw = tileWidthMm * PPM;
  const th = tileHeightMm * PPM;
  const g = Math.max(0, groutWidthMm) * PPM;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  switch (layout) {
    case "brick": {
      const cellW = clampCanvas(tw + g);
      const rowH = th + g;
      canvas.width = cellW;
      canvas.height = clampCanvas(rowH * 2);
      fillGrout(ctx, canvas.width, canvas.height, groutColor);
      ctx.fillStyle = tileColor;
      // Row 0: one full-width tile.
      ctx.fillRect(g / 2, g / 2, tw, th);
      // Row 1: shifted half a tile -- drawn twice so it wraps seamlessly
      // when the canvas repeats horizontally.
      const half = cellW / 2;
      ctx.fillRect(half + g / 2, rowH + g / 2, tw, th);
      ctx.fillRect(half + g / 2 - cellW, rowH + g / 2, tw, th);
      return { canvas, cellWidthMm: tileWidthMm + groutWidthMm, cellHeightMm: (tileHeightMm + groutWidthMm) * 2 };
    }
    case "thirdOffset": {
      const cellW = clampCanvas(tw + g);
      const rowH = th + g;
      canvas.width = cellW;
      canvas.height = clampCanvas(rowH * 3);
      fillGrout(ctx, canvas.width, canvas.height, groutColor);
      ctx.fillStyle = tileColor;
      for (let row = 0; row < 3; row++) {
        const shift = (cellW / 3) * row;
        const y = rowH * row + g / 2;
        ctx.fillRect(shift + g / 2, y, tw, th);
        ctx.fillRect(shift + g / 2 - cellW, y, tw, th);
      }
      return { canvas, cellWidthMm: tileWidthMm + groutWidthMm, cellHeightMm: (tileHeightMm + groutWidthMm) * 3 };
    }
    case "herringbone": {
      const size = clampCanvas(Math.max(tw, th) * 5);
      canvas.width = size;
      canvas.height = size;
      fillGrout(ctx, size, size, groutColor);
      ctx.fillStyle = tileColor;
      const s = Math.min(tw, th);
      const l = Math.max(tw, th);
      const step = s + g;
      const cols = Math.ceil(size / step) + 4;
      const rows = Math.ceil(size / step) + 4;
      for (let j = -2; j < rows; j++) {
        for (let i = -2; i < cols; i++) {
          const horizontal = (i + j) % 2 === 0;
          const x = i * step;
          const y = j * step;
          if (horizontal) ctx.fillRect(x, y, l, s);
          else ctx.fillRect(x, y, s, l);
        }
      }
      // Patch approximation: real dimensions of what was drawn, in mm.
      const mm = size / PPM;
      return { canvas, cellWidthMm: mm, cellHeightMm: mm };
    }
    case "ashlar": {
      const size = clampCanvas(Math.max(tw, th) * 6);
      canvas.width = size;
      canvas.height = size;
      fillGrout(ctx, size, size, groutColor);
      ctx.fillStyle = tileColor;
      const rng = makeRng(seed);
      const widths = [tw * 0.66, tw, tw * 1.5];
      let y = 0;
      while (y < size) {
        let x = 0;
        while (x < size) {
          const w = widths[Math.floor(rng() * widths.length)];
          ctx.fillRect(x + g / 2, y + g / 2, w - g, th - g);
          x += w;
        }
        y += th + g;
      }
      const mm = size / PPM;
      return { canvas, cellWidthMm: mm, cellHeightMm: mm };
    }
    case "grid":
    case "diagonal":
    case "slab":
    default: {
      canvas.width = clampCanvas(tw + g);
      canvas.height = clampCanvas(th + g);
      fillGrout(ctx, canvas.width, canvas.height, groutColor);
      ctx.fillStyle = tileColor;
      ctx.fillRect(g / 2, g / 2, tw, th);
      return { canvas, cellWidthMm: tileWidthMm + groutWidthMm, cellHeightMm: tileHeightMm + groutWidthMm };
    }
  }
};
