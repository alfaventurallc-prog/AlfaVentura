import type { Product } from "./product";

/**
 * The website's actual product record shape (Prisma `Product` + its
 * `Category` relation, via src/actions/products.ts -- the same
 * `getProducts()`/`getProductById()` the product pages themselves use).
 * This is the single source of truth; the Visualizer never maintains its
 * own separate product database.
 */
export interface AlfaVenturaProduct {
  id: string;
  slug: string;
  title: string;
  images: string[];
  category?: { name: string } | null;
}

/**
 * AlfaVenturaProduct -> VisualizerProduct. Keeps the website's product
 * model free of anything Visualizer-specific (sizes, fabrication
 * capabilities, PBR defaults) -- those live here, not on the Prisma model,
 * so the website's own product pages/admin never need to know about them.
 *
 * Real per-product size/thickness/edge-profile/finish data doesn't exist
 * in the current schema (see Step 6 report), so this adapter fills in one
 * sensible, clearly-documented default set common to Alfa's quartz slabs
 * rather than inventing per-product specs. Once real fabrication data is
 * added to the schema, only this function needs to change.
 */
export const adaptAlfaProduct = (p: AlfaVenturaProduct): Product => ({
  id: p.id,
  slug: p.slug,
  name: p.title,
  collection: "Alfa Ventura Quartz",
  category: "Quartz",
  finish: "Polished",
  availableSizes: ["600 x 600 mm", "3200 x 1600 mm"],
  availableModes: ["tile", "slab"],
  sizes: [
    { id: "600x600", width: 600, height: 600, unit: "mm", mode: "tile" },
    { id: "3200x1600", width: 3200, height: 1600, unit: "mm", mode: "slab" },
  ],
  source: "alfa",
  imageUrl: p.images[0],
  materialType: "quartz",
  applicationTypes: ["floor", "wall", "backsplash", "countertop", "island"],
  availableThicknesses: [12, 20, 30],
  availableEdgeProfiles: ["square", "eased", "beveled", "bullnose"],
  supportsBookmatch: true,
  supportsWaterfall: true,
});
