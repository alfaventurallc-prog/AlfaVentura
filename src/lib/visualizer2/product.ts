import type { ProceduralDescriptor } from "@/three/proceduralPattern";
import type { MaterialMode, SizeOption } from "./layout";

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
}

export const PRODUCT_CATEGORIES = ["Quartz", "Marble", "Stone", "Concrete", "Terrazzo", "Wood", "Solid Color"] as const;
export type ProductCategoryName = (typeof PRODUCT_CATEGORIES)[number];
