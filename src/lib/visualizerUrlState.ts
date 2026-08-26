import type { LayoutId } from "@/data/kitchenCatalog";

export interface KitchenConfig {
  layout: LayoutId;
  mirrored: boolean;
  cabinetId: string | null;
  countertopId: string | null;
  backsplashId: string | null;
  floorId: string | null;
}

export const encodeConfigToParams = (config: KitchenConfig): URLSearchParams => {
  const params = new URLSearchParams();
  params.set("layout", config.layout);
  if (config.mirrored) params.set("mirrored", "1");
  if (config.cabinetId) params.set("cabinet", config.cabinetId);
  if (config.countertopId) params.set("countertop", config.countertopId);
  if (config.backsplashId) params.set("backsplash", config.backsplashId);
  if (config.floorId) params.set("floor", config.floorId);
  return params;
};

export const decodeConfigFromParams = (params: URLSearchParams): Partial<KitchenConfig> => {
  const layout = params.get("layout");
  return {
    ...(layout === "island" || layout === "lshape" || layout === "galley" ? { layout } : {}),
    mirrored: params.get("mirrored") === "1",
    cabinetId: params.get("cabinet"),
    countertopId: params.get("countertop"),
    backsplashId: params.get("backsplash"),
    floorId: params.get("floor"),
  };
};
