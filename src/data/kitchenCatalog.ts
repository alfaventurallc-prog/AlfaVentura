export type LayoutId = "island" | "lshape" | "galley";

export interface LayoutDef {
  id: LayoutId;
  name: string;
  description: string;
}

export const LAYOUTS: LayoutDef[] = [
  { id: "island", name: "Island", description: "Wall run plus a central island" },
  { id: "lshape", name: "L-Shape", description: "Wraps around a corner, no island" },
  { id: "galley", name: "Galley", description: "Two parallel counter runs" },
];

export interface FloorFinish {
  id: string;
  name: string;
  color: string;
  roughness: number;
}

// No dedicated "flooring" product category exists in the catalog yet (only
// Cabinets / Quartz Slab Designs / Vanities / Fabricated Countertops &
// Vanities do) -- these are generic complementary finishes, not attributed
// to Alfa Ventura products, exactly like most kitchen configurators treat
// floor/paint as separate from the stone brand's own catalog.
export const FLOOR_FINISHES: FloorFinish[] = [
  { id: "light-oak", name: "Light Oak", color: "#D9C4A3", roughness: 0.85 },
  { id: "warm-walnut", name: "Warm Walnut", color: "#6B4A34", roughness: 0.8 },
  { id: "weathered-grey", name: "Weathered Grey", color: "#A8A29E", roughness: 0.9 },
  { id: "polished-concrete", name: "Polished Concrete", color: "#C9C4BC", roughness: 0.5 },
];

export type MaterialCategory = "cabinet" | "countertop" | "backsplash" | "floor";

export const MATERIAL_CATEGORY_LABELS: Record<MaterialCategory, string> = {
  cabinet: "Cabinet",
  countertop: "Countertop",
  backsplash: "Backsplash",
  floor: "Floor",
};
