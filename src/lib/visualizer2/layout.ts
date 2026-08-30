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

export type VeinOrientation = "auto" | "horizontal" | "vertical";

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
  veinOrientation: "auto",
};

// ---------------------------------------------------------------------
// Step 5: countertop/slab fabrication -- a second, independent config
// that only applies to surfaceType "countertop"/"island". Kept separate
// from SurfaceMaterialConfig (which every surface has) since fabrication
// concepts like overhang/waterfall/bookmatch are meaningless for a floor
// or wall.
// ---------------------------------------------------------------------

export type EdgeProfile = "square" | "eased" | "beveled" | "bullnose";
export const EDGE_PROFILE_OPTIONS: EdgeProfile[] = ["square", "eased", "beveled", "bullnose"];

export type WaterfallSide = "none" | "left" | "right" | "both";
export type SeamMode = "auto" | "visible" | "hidden";
export type BookmatchType = "standard" | "mirrored";
export type BookmatchDirection = "left-right" | "top-bottom";

export interface CutoutDef {
  id: string;
  type: "sink" | "cooktop" | "faucet";
  /** Position/size as a percentage of the countertop's own footprint, so
   * it stays correctly placed regardless of countertop dimensions. */
  xPct: number;
  yPct: number;
  widthPct: number;
  depthPct: number;
}

export interface CountertopFabricationConfig {
  thicknessMm: number;
  edgeProfile: EdgeProfile;
  overhangMm: number;
  waterfall: WaterfallSide;
  seams: SeamMode;
  bookmatch: boolean;
  bookmatchType: BookmatchType;
  bookmatchDirection: BookmatchDirection;
  cutouts: CutoutDef[];
}

export const DEFAULT_FABRICATION_CONFIG: CountertopFabricationConfig = {
  thicknessMm: 20,
  edgeProfile: "square",
  overhangMm: 20,
  waterfall: "none",
  seams: "auto",
  bookmatch: false,
  bookmatchType: "standard",
  bookmatchDirection: "left-right",
  cutouts: [],
};

export const THICKNESS_MM_OPTIONS = [12, 20, 30];

export const GROUT_PRESETS = [
  { name: "White", color: "#EDE9E0" },
  { name: "Warm White", color: "#E4DCC9" },
  { name: "Grey", color: "#A8A29E" },
  { name: "Dark Grey", color: "#57534E" },
  { name: "Black", color: "#1C1917" },
];

export const ROTATION_PRESETS = [0, 45, 90, 180, 270];
