/**
 * Step 1 foundation for the new Marfil-style 3D Visualizer (route:
 * /visualizer-v2). This is intentionally minimal -- an empty premium room
 * with independently selectable architectural surfaces -- so later steps
 * can layer a product library, tile patterns, grout, vein direction,
 * waterfall edges, save/share, etc. on top without restructuring this.
 */

export type SurfaceId = "floor" | "backWall" | "leftWall" | "rightWall";

export const SURFACE_IDS: SurfaceId[] = ["floor", "backWall", "leftWall", "rightWall"];

export const SURFACE_LABELS: Record<SurfaceId, string> = {
  floor: "Floor",
  backWall: "Back Wall",
  leftWall: "Left Wall",
  rightWall: "Right Wall",
};

/** A material is described abstractly (not as a Product yet) so a future
 * step can swap this out for `{ productId, textureUrl, ... }` without
 * touching any component that reads `surfaceMaterials`. */
export interface SurfaceMaterial {
  color: string;
  roughness: number;
}

export type SurfaceMaterials = Record<SurfaceId, SurfaceMaterial>;

export const DEFAULT_SURFACE_MATERIALS: SurfaceMaterials = {
  floor: { color: "#D9D2C4", roughness: 0.85 },
  backWall: { color: "#EFEAE0", roughness: 1 },
  leftWall: { color: "#EFEAE0", roughness: 1 },
  rightWall: { color: "#EFEAE0", roughness: 1 },
};
