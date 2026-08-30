import type { ProceduralDescriptor } from "@/three/proceduralPattern";
import type { MaterialMode, SizeOption, EdgeProfile } from "./layout";

export type MaterialType = "tile" | "slab" | "quartz" | "porcelain" | "marble" | "granite" | "stone";

export type Finish = "Polished" | "Honed" | "Matte" | "Concrete";

/** Lower roughness = shinier/more reflective. Concrete gets its own bucket
 * since it's both a finish and a material family for the demo set. */
export const FINISH_ROUGHNESS: Record<Finish, number> = {
  Polished: 0.12,
  Honed: 0.45,
  Matte: 0.75,
  Concrete: 0.85,
};

/**
 * One shared product shape for both real Alfa Ventura quartz products
 * (source: "alfa", a real Cloudinary photo) and the demo material
 * categories used until real Marble/Stone/Concrete/etc. products exist
 * (source: "demo", a procedural pattern descriptor). The Visualizer UI and
 * 3D material application only ever read this shape -- swapping "demo" for
 * real product data later doesn't require touching those components.
 */
export interface Product {
  id: string;
  /** Real Alfa Ventura products only -- used to link back to the actual
   * product page (/products/[slug]). Demo products have none. */
  slug?: string;
  name: string;
  collection: string;
  category: string;
  finish: Finish;
  availableSizes: string[];
  source: "alfa" | "demo";
  imageUrl?: string;
  descriptor?: ProceduralDescriptor;
  /** Step 3: which physical sizes this product comes in, and in which
   * mode(s) each size applies -- the UI only ever shows sizes valid for
   * the currently selected product+mode. */
  sizes: SizeOption[];
  availableModes: MaterialMode[];
  /** Step 5: countertop/slab fabrication capabilities -- the UI only shows
   * options a given product actually supports. */
  materialType: MaterialType;
  applicationTypes: string[];
  availableThicknesses: number[];
  availableEdgeProfiles: EdgeProfile[];
  supportsBookmatch: boolean;
  supportsWaterfall: boolean;
}

export const PRODUCT_CATEGORIES = ["Quartz", "Marble", "Stone", "Concrete", "Terrazzo", "Wood", "Solid Color"] as const;
export type ProductCategoryName = (typeof PRODUCT_CATEGORIES)[number];

/**
 * The one place that decides whether a product can go on a given surface
 * type in a given mode -- every UI list (ProductPanel, MaterialConfigPanel,
 * FabricationPanel) filters through this instead of re-deriving the same
 * checks. `mode` is optional: pass it to also check tile/slab support,
 * omit it to just check surface-type/application compatibility.
 */
export const isProductCompatible = (product: Product, surfaceType: string, mode?: MaterialMode): boolean => {
  if (!product.applicationTypes.includes(surfaceType)) return false;
  if (mode && !product.availableModes.includes(mode)) return false;
  return true;
};

/**
 * Defensive validation for product records coming from any source (real
 * catalog or demo data) -- logs a warning and returns false for anything
 * malformed rather than letting it reach the 3D renderer and crash.
 */
export const validateProduct = (product: Product): boolean => {
  const problems: string[] = [];
  if (!product.id) problems.push("missing id");
  if (!product.name) problems.push("missing name");
  if (!product.sizes?.length) problems.push("no sizes");
  if (!product.availableModes?.length) problems.push("no availableModes");
  if (product.source === "alfa" && !product.imageUrl) problems.push("alfa product missing imageUrl");
  if (product.source === "demo" && !product.descriptor) problems.push("demo product missing descriptor");

  if (problems.length) {
    console.warn(`[visualizer2] Skipping invalid product "${product.id ?? "(no id)"}": ${problems.join(", ")}`);
    return false;
  }
  return true;
};
