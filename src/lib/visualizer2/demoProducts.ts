import type { Product } from "./product";

/**
 * Demo materials for the categories that have no real Alfa Ventura product
 * data yet (only "Quartz" is real -- see visualizer-v2/page.tsx, which
 * fetches actual quartz slab products and merges them in). Each one is
 * rendered from its `descriptor` via src/three/proceduralPattern.ts --
 * deterministic, offline, no external/stock imagery. Replace this file
 * with real Alfa Ventura product data as those categories become
 * available; nothing else in the Visualizer needs to change.
 */
export const DEMO_PRODUCTS: Product[] = [
  {
    id: "demo-marble-bianco",
    name: "Bianco Marble",
    collection: "Marble Collection",
    category: "Marble",
    finish: "Polished",
    availableSizes: ["1200 x 2400 mm"],
    source: "demo",
    descriptor: { pattern: "marble", baseColor: "#F2EFE9", veinColor: "#B9AFA0", seed: 11 },
  },
  {
    id: "demo-marble-grigio",
    name: "Grigio Marble",
    collection: "Marble Collection",
    category: "Marble",
    finish: "Honed",
    availableSizes: ["1200 x 2400 mm"],
    source: "demo",
    descriptor: { pattern: "marble", baseColor: "#CFCDC8", veinColor: "#8A8783", seed: 27 },
  },
  {
    id: "demo-stone-slate",
    name: "Slate Stone",
    collection: "Natural Stone Collection",
    category: "Stone",
    finish: "Matte",
    availableSizes: ["600 x 600 mm", "900 x 900 mm"],
    source: "demo",
    descriptor: { pattern: "stone", baseColor: "#5B5F63", seed: 42 },
  },
  {
    id: "demo-stone-sand",
    name: "Sand Stone",
    collection: "Natural Stone Collection",
    category: "Stone",
    finish: "Honed",
    availableSizes: ["600 x 600 mm"],
    source: "demo",
    descriptor: { pattern: "stone", baseColor: "#C7B79A", seed: 58 },
  },
  {
    id: "demo-concrete-grey",
    name: "Urban Concrete",
    collection: "Concrete Collection",
    category: "Concrete",
    finish: "Concrete",
    availableSizes: ["1000 x 1000 mm"],
    source: "demo",
    descriptor: { pattern: "concrete", baseColor: "#9B9B93", seed: 73 },
  },
  {
    id: "demo-terrazzo-classic",
    name: "Classic Terrazzo",
    collection: "Terrazzo Collection",
    category: "Terrazzo",
    finish: "Polished",
    availableSizes: ["600 x 600 mm"],
    source: "demo",
    descriptor: { pattern: "terrazzo", baseColor: "#EDE9E0", accentColors: ["#C9432B", "#D9A62E", "#3C5A6B"], seed: 91 },
  },
  {
    id: "demo-wood-oak",
    name: "Natural Oak",
    collection: "Wood Collection",
    category: "Wood",
    finish: "Matte",
    availableSizes: ["150 x 900 mm plank"],
    source: "demo",
    descriptor: { pattern: "wood", baseColor: "#B98E5C", veinColor: "#00000030", seed: 15 },
  },
  {
    id: "demo-wood-walnut",
    name: "Warm Walnut",
    collection: "Wood Collection",
    category: "Wood",
    finish: "Honed",
    availableSizes: ["150 x 900 mm plank"],
    source: "demo",
    descriptor: { pattern: "wood", baseColor: "#6B4A34", veinColor: "#00000040", seed: 33 },
  },
  {
    id: "demo-solid-white",
    name: "Pure White",
    collection: "Solid Colors",
    category: "Solid Color",
    finish: "Matte",
    availableSizes: ["Custom"],
    source: "demo",
    descriptor: { pattern: "solid", baseColor: "#F5F1EA", seed: 1 },
  },
  {
    id: "demo-solid-charcoal",
    name: "Charcoal",
    collection: "Solid Colors",
    category: "Solid Color",
    finish: "Polished",
    availableSizes: ["Custom"],
    source: "demo",
    descriptor: { pattern: "solid", baseColor: "#2A241E", seed: 2 },
  },
];
