/**
 * Step 3: the tile/slab layout engine's configuration shape. A Product
 * (product.ts) defines WHAT the material is; a SurfaceMaterialConfig
 * defines HOW it's installed on one particular surface. Kept separate on
 * purpose -- the same product can be tiled one way on the floor and a
 * different way on a wall.
 */

export type MaterialMode = "tile" | "slab";

export type LayoutPattern = "grid" | "brick" | "thirdOffset" | "herringbone" | "diagonal" | "ashlar" | "slab";

export const TILE_LAYOUTS: { id: LayoutPattern; label: string }[] = [
  { id: "grid", label: "Grid" },
  { id: "brick", label: "Brick" },
  { id: "thirdOffset", label: "1/3 Offset" },
  { id: "herringbone", label: "Herringbone" },
  { id: "diagonal", label: "Diagonal" },
  { id: "ashlar", label: "Ashlar" },
];

export type Alignment = "center" | "left" | "right" | "top" | "bottom";

export type VeinOrientation = "horizontal" | "vertical";

export interface SizeOption {
  id: string;
  width: number;
  height: number;
  unit: "mm";
  mode: MaterialMode;
}

export interface SurfaceMaterialConfig {
  productId: string | null;
  mode: MaterialMode;
  sizeId: string | null;
  layout: LayoutPattern;
  /** degrees */
  rotation: number;
  /** visualization-only multiplier -- never changes the product's real mm size */
  scale: number;
  offsetX: number;
  offsetY: number;
  groutWidthMm: number;
  groutColor: string;
  alignment: Alignment;
  veinOrientation: VeinOrientation;
}

export const DEFAULT_SURFACE_CONFIG: SurfaceMaterialConfig = {
  productId: null,
  mode: "tile",
  sizeId: null,
  layout: "grid",
  rotation: 0,
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  groutWidthMm: 2,
  groutColor: "#D8D5CF",
  alignment: "center",
  veinOrientation: "horizontal",
};

export const GROUT_PRESETS = [
  { name: "White", color: "#EDE9E0" },
  { name: "Warm White", color: "#E4DCC9" },
  { name: "Grey", color: "#A8A29E" },
  { name: "Dark Grey", color: "#57534E" },
  { name: "Black", color: "#1C1917" },
];

export const ROTATION_PRESETS = [0, 45, 90, 180, 270];
