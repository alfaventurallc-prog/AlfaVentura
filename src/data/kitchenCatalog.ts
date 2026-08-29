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

// Standard industry slab thicknesses -- not attributed to any specific
// Alfa Ventura product (the catalog has no per-product thickness field yet),
// this is a generic customization affecting the countertop/waterfall
// geometry, same as offering a floor finish independent of the stone brand.
export const THICKNESS_OPTIONS = [20, 30] as const;
export type ThicknessMm = (typeof THICKNESS_OPTIONS)[number];

/** Countertop top slabs are modelled at a 20mm baseline; scale that world
 * height by the selected thickness so 30mm renders visibly chunkier. */
export const thicknessScale = (mm: ThicknessMm): number => mm / 20;

// Square is the box's own edge as modelled today. Beveled is a visual
// approximation (a thin 45-degree strip along the front edge) rather than a
// true chamfered mesh -- an accurate chamfer needs custom (non-box)
// geometry, a bigger lift called out separately.
export const EDGE_PROFILES = ["square", "beveled"] as const;
export type EdgeProfile = (typeof EDGE_PROFILES)[number];

export type MaterialCategory = "cabinet" | "countertop" | "backsplash" | "floor";

export const MATERIAL_CATEGORY_LABELS: Record<MaterialCategory, string> = {
  cabinet: "Cabinet",
  countertop: "Countertop",
  backsplash: "Backsplash",
  floor: "Floor",
};
