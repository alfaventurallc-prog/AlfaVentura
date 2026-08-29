import type { LayoutId, ThicknessMm } from "@/data/kitchenCatalog";
import { THICKNESS_OPTIONS } from "@/data/kitchenCatalog";

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
  return params;
};

export const decodeConfigFromParams = (params: URLSearchParams): Partial<KitchenConfig> => {
  const layout = params.get("layout");
  const waterfall = params.get("waterfall");
  const thickness = Number(params.get("thickness"));
  return {
    ...(layout === "island" || layout === "lshape" || layout === "galley" ? { layout } : {}),
    mirrored: params.get("mirrored") === "1",
    cabinetId: params.get("cabinet"),
    countertopId: params.get("countertop"),
    backsplashId: params.get("backsplash"),
    floorId: params.get("floor"),
    ...(waterfall === "none" || waterfall === "left" || waterfall === "right" || waterfall === "both" ? { waterfall } : {}),
    ...(THICKNESS_OPTIONS.includes(thickness as ThicknessMm) ? { thicknessMm: thickness as ThicknessMm } : {}),
  };
};
