/**
 * Deterministic, offline canvas patterns for the Step 2 demo material
 * categories (Marble/Stone/Concrete/Terrazzo/Wood/Solid Color) that have
 * no real Alfa Ventura product data yet -- no external images, no AI
 * generation, just a seeded pseudo-random draw so the same product always
 * looks the same whether it's a small thumbnail or the full 3D texture.
 */

export type PatternKind = "solid" | "marble" | "stone" | "concrete" | "terrazzo" | "wood";

export interface ProceduralDescriptor {
  pattern: PatternKind;
  baseColor: string;
  veinColor?: string;
  accentColors?: string[];
  seed: number;
}

/** mulberry32 -- small, fast, deterministic PRNG from an integer seed. */
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

export const drawProceduralPattern = (ctx: CanvasRenderingContext2D, d: ProceduralDescriptor, w: number, h: number) => {
  const rng = makeRng(d.seed);
  ctx.fillStyle = d.baseColor;
  ctx.fillRect(0, 0, w, h);

  switch (d.pattern) {
    case "marble": {
      const veinColor = d.veinColor ?? "#FFFFFF";
      for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = veinColor;
        ctx.globalAlpha = 0.15 + rng() * 0.2;
        ctx.lineWidth = 1 + rng() * 2.5;
        ctx.beginPath();
        const startX = rng() * w;
        ctx.moveTo(startX, 0);
        ctx.bezierCurveTo(rng() * w, h * 0.33, rng() * w, h * 0.66, rng() * w, h);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      break;
    }
    case "stone": {
      for (let i = 0; i < 900; i++) {
        const shade = rng() > 0.5 ? "#000000" : "#FFFFFF";
        ctx.fillStyle = shade;
        ctx.globalAlpha = rng() * 0.06;
        const r = rng() * 1.6;
        ctx.beginPath();
        ctx.arc(rng() * w, rng() * h, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      break;
    }
    case "concrete": {
      for (let i = 0; i < 400; i++) {
        ctx.fillStyle = rng() > 0.5 ? "#00000010" : "#FFFFFF10";
        const rw = 10 + rng() * 40;
        const rh = 10 + rng() * 40;
        ctx.fillRect(rng() * w, rng() * h, rw, rh);
      }
      break;
    }
    case "terrazzo": {
      const accents = d.accentColors ?? ["#C9432B", "#D9A62E", "#3C5A6B"];
      for (let i = 0; i < 60; i++) {
        ctx.fillStyle = accents[Math.floor(rng() * accents.length)];
        ctx.beginPath();
        ctx.arc(rng() * w, rng() * h, 3 + rng() * 8, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case "wood": {
      const veinColor = d.veinColor ?? "#00000030";
      for (let y = 0; y < h; y += 6 + rng() * 4) {
        ctx.strokeStyle = veinColor;
        ctx.lineWidth = 1 + rng();
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= w; x += w / 8) {
          ctx.lineTo(x, y + Math.sin((x / w) * Math.PI * 2 + rng()) * 4);
        }
        ctx.stroke();
      }
      break;
    }
    case "solid":
    default: {
      // Subtle vignette so a flat color still reads as a physical surface.
      const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) / 1.3);
      gradient.addColorStop(0, "#00000000");
      gradient.addColorStop(1, "#00000012");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
      break;
    }
  }
};
