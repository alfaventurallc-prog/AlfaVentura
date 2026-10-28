import type { LayoutId, ThicknessMm, EdgeProfile } from "@/data/kitchenCatalog";
import { THICKNESS_OPTIONS, EDGE_PROFILES } from "@/data/kitchenCatalog";

export type WaterfallOption = "none" | "left" | "right" | "both";

export interface KitchenConfig {
  layout: LayoutId;
  mirrored: boolean;
  cabinetId: string | null;
  countertopId: string | null;
  backsplashId: string | null;
  floorId: string | null;
  waterfall: WaterfallOption;
  thicknessMm: ThicknessMm;
  /** Vein/pattern direction on the countertop top surface: 0 = as
   * photographed ("horizontal"), 90 = turned a quarter-turn ("vertical"). */
  veinRotation: 0 | 90;
  edgeProfile: EdgeProfile;
  /** MSI-style "Use countertop for backsplash" -- when on, picking a new
   * countertop also applies it to the backsplash. */
  syncBacksplash: boolean;
}

export const encodeConfigToParams = (config: KitchenConfig): URLSearchParams => {
  const params = new URLSearchParams();
  params.set("layout", config.layout);
  if (config.mirrored) params.set("mirrored", "1");
  if (config.cabinetId) params.set("cabinet", config.cabinetId);
  if (config.countertopId) params.set("countertop", config.countertopId);
  if (config.backsplashId) params.set("backsplash", config.backsplashId);
  if (config.floorId) params.set("floor", config.floorId);
  if (config.waterfall !== "both") params.set("waterfall", config.waterfall);
  if (config.thicknessMm !== 20) params.set("thickness", String(config.thicknessMm));
  if (config.veinRotation !== 0) params.set("vein", String(config.veinRotation));
  if (config.edgeProfile !== "square") params.set("edge", config.edgeProfile);
  if (config.syncBacksplash) params.set("syncBacksplash", "1");
  return params;
};

export const decodeConfigFromParams = (params: URLSearchParams): Partial<KitchenConfig> => {
  const layout = params.get("layout");
  const waterfall = params.get("waterfall");
  const thickness = Number(params.get("thickness"));
  const vein = params.get("vein");
  const edge = params.get("edge");
  // Only keys actually present in the URL are returned, so a partial link
  // (e.g. ?countertop=<id> from a product page) keeps every other default
  // instead of nulling the cabinet, backsplash and floor.
  const id = (key: string) => params.get(key) || undefined;
  const ids = {
    cabinetId: id("cabinet"),
    countertopId: id("countertop"),
    backsplashId: id("backsplash"),
    floorId: id("floor"),
  };
  return {
    ...(layout === "island" || layout === "lshape" || layout === "galley" ? { layout } : {}),
    mirrored: params.get("mirrored") === "1",
    ...Object.fromEntries(Object.entries(ids).filter(([, v]) => v !== undefined)),
    ...(waterfall === "none" || waterfall === "left" || waterfall === "right" || waterfall === "both" ? { waterfall } : {}),
    ...(THICKNESS_OPTIONS.includes(thickness as ThicknessMm) ? { thicknessMm: thickness as ThicknessMm } : {}),
    ...(vein === "90" ? { veinRotation: 90 as const } : {}),
    ...(EDGE_PROFILES.includes(edge as EdgeProfile) ? { edgeProfile: edge as EdgeProfile } : {}),
    syncBacksplash: params.get("syncBacksplash") === "1",
  };
};
