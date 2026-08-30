import type { SurfaceMaterialConfig, CountertopFabricationConfig } from "./layout";
import { DEFAULT_SURFACE_CONFIG, DEFAULT_FABRICATION_CONFIG } from "./layout";
import type { Product } from "./product";
import { ROOMS, getRoom } from "./rooms";

export const DESIGN_SCHEMA_VERSION = 1;

export interface DesignCameraState {
  position: [number, number, number];
  target: [number, number, number];
}

export interface DesignRoomState {
  surfaces: Record<string, { config: SurfaceMaterialConfig; fabrication: CountertopFabricationConfig }>;
}

/**
 * Step 8: an Image Visualizer session, serialized the same disciplined
 * way as the 3D design state -- plain data only. There's no object-storage
 * backend in this project (see Step 7/8 reports), so `sourceImage`/
 * `masks`/`resultImage` are compressed data URLs rather than references;
 * that's the one deliberate exception to "don't store huge raw image data"
 * this build can offer without a real backend, and it's why the source
 * photo is downscaled before saving (see ImageVisualizerShell).
 */
export interface ImageVisualizationState {
  sourceImageDataUrl: string;
  masks: Partial<Record<string, string>>;
  surfaceConfigurations: Record<string, SurfaceMaterialConfig>;
  activeSurfaceType: string;
  productId: string | null;
  resultImageDataUrl?: string;
}

/**
 * A Design is the complete, plain-JSON-serializable Visualizer state --
 * every room's every surface, not just the one currently on screen (Step 7
 * requirement). Never holds a Three.js object, mesh, texture, or camera
 * instance directly -- only numbers/strings/booleans, so it can round-trip
 * through localStorage or a URL with no special handling.
 */
export interface Design {
  id: string;
  name: string;
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
  activeRoomId: string;
  rooms: Record<string, DesignRoomState>;
  camera?: DesignCameraState;
  previewDataUrl?: string;
  /** Present when this Design was saved from Image Visualizer mode. */
  imageVisualization?: ImageVisualizationState;
}

export const DEFAULT_DESIGN_NAME = "Untitled Design";

export const createDesignId = () => `design_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

interface BuildDesignParams {
  id: string;
  name: string;
  createdAt?: string;
  activeRoomId: string;
  designState: Record<string, Record<string, SurfaceMaterialConfig>>;
  fabricationState: Record<string, Record<string, CountertopFabricationConfig>>;
  camera?: DesignCameraState;
  previewDataUrl?: string;
}

/** Plain state (React state objects) -> a serializable Design. Walks every
 * room ROOMS knows about (not just the active one) so a save captures the
 * complete configuration, per Step 7 section 1-2. */
export const serializeDesign = ({ id, name, createdAt, activeRoomId, designState, fabricationState, camera, previewDataUrl }: BuildDesignParams): Design => {
  const rooms: Record<string, DesignRoomState> = {};
  for (const room of ROOMS) {
    const roomConfigs = designState[room.id];
    const roomFabrication = fabricationState[room.id];
    if (!roomConfigs && !roomFabrication) continue;
    const surfaces: DesignRoomState["surfaces"] = {};
    for (const s of room.surfaces) {
      const config = roomConfigs?.[s.id];
      const fabrication = roomFabrication?.[s.id];
      if (!config && !fabrication) continue;
      surfaces[s.id] = { config: config ?? DEFAULT_SURFACE_CONFIG, fabrication: fabrication ?? DEFAULT_FABRICATION_CONFIG };
    }
    if (Object.keys(surfaces).length) rooms[room.id] = { surfaces };
  }

  const now = new Date().toISOString();
  return {
    id,
    name,
    schemaVersion: DESIGN_SCHEMA_VERSION,
    createdAt: createdAt ?? now,
    updatedAt: now,
    activeRoomId,
    rooms,
    camera,
    previewDataUrl,
  };
};

interface BuildImageDesignParams {
  id: string;
  name: string;
  createdAt?: string;
  imageVisualization: ImageVisualizationState;
}

/** Same contract as serializeDesign, for an Image Visualizer session --
 * rooms/activeRoomId are irrelevant here so they're left empty rather than
 * fabricated. */
export const serializeImageDesign = ({ id, name, createdAt, imageVisualization }: BuildImageDesignParams): Design => {
  const now = new Date().toISOString();
  return {
    id,
    name,
    schemaVersion: DESIGN_SCHEMA_VERSION,
    createdAt: createdAt ?? now,
    updatedAt: now,
    activeRoomId: ROOMS[0].id,
    rooms: {},
    imageVisualization,
  };
};

export interface DeserializedDesign {
  design: Design;
  designState: Record<string, Record<string, SurfaceMaterialConfig>>;
  fabricationState: Record<string, Record<string, CountertopFabricationConfig>>;
  /** Non-fatal issues found while restoring -- shown to the user as a
   * toast, never thrown. */
  warnings: string[];
}

/**
 * Design (untrusted -- from localStorage, a URL, or an imported file) ->
 * validated Visualizer state. Never throws: unknown rooms fall back to the
 * default room, unknown/removed products are dropped (surface keeps its
 * tile/fabrication settings but with productId: null, flagged as
 * unavailable) rather than invalidating the whole design.
 */
export const deserializeDesign = (raw: unknown, catalog: Product[]): DeserializedDesign | null => {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Partial<Design>;
  if (!data.id || !data.rooms || typeof data.rooms !== "object") return null;

  const warnings: string[] = [];
  const productIds = new Set(catalog.map((p) => p.id));

  let activeRoomId = data.activeRoomId && ROOMS.some((r) => r.id === data.activeRoomId) ? data.activeRoomId : ROOMS[0].id;
  if (data.activeRoomId && activeRoomId !== data.activeRoomId) {
    warnings.push("The original space is no longer available. A compatible space has been loaded.");
  }

  const designState: Record<string, Record<string, SurfaceMaterialConfig>> = {};
  const fabricationState: Record<string, Record<string, CountertopFabricationConfig>> = {};

  for (const [roomId, roomState] of Object.entries(data.rooms)) {
    const room = ROOMS.find((r) => r.id === roomId);
    if (!room || !roomState || typeof roomState !== "object") continue;
    const surfaces = (roomState as DesignRoomState).surfaces;
    if (!surfaces || typeof surfaces !== "object") continue;

    for (const [surfaceId, entry] of Object.entries(surfaces)) {
      if (!room.surfaces.some((s) => s.id === surfaceId)) continue;
      const config = { ...DEFAULT_SURFACE_CONFIG, ...(entry?.config ?? {}) };
      const fabrication = { ...DEFAULT_FABRICATION_CONFIG, ...(entry?.fabrication ?? {}) };

      if (config.productId && !productIds.has(config.productId)) {
        warnings.push(`"${room.surfaces.find((s) => s.id === surfaceId)?.label ?? surfaceId}" material is no longer available.`);
        config.productId = null;
      }

      designState[roomId] = designState[roomId] ?? {};
      designState[roomId][surfaceId] = config;
      fabricationState[roomId] = fabricationState[roomId] ?? {};
      fabricationState[roomId][surfaceId] = fabrication;
    }
  }

  const design: Design = {
    id: data.id,
    name: typeof data.name === "string" && data.name.trim() ? data.name : DEFAULT_DESIGN_NAME,
    schemaVersion: typeof data.schemaVersion === "number" ? data.schemaVersion : DESIGN_SCHEMA_VERSION,
    createdAt: data.createdAt ?? new Date().toISOString(),
    updatedAt: data.updatedAt ?? new Date().toISOString(),
    activeRoomId,
    rooms: data.rooms as Record<string, DesignRoomState>,
    camera: isValidCamera(data.camera) ? data.camera : undefined,
    previewDataUrl: typeof data.previewDataUrl === "string" ? data.previewDataUrl : undefined,
    imageVisualization: isValidImageVisualization(data.imageVisualization) ? data.imageVisualization : undefined,
  };

  return { design, designState, fabricationState, warnings };
};

const isValidImageVisualization = (v: unknown): v is ImageVisualizationState => {
  if (!v || typeof v !== "object") return false;
  const iv = v as Partial<ImageVisualizationState>;
  return typeof iv.sourceImageDataUrl === "string" && !!iv.masks && typeof iv.masks === "object" && !!iv.surfaceConfigurations;
};

const isValidCamera = (c: unknown): c is DesignCameraState => {
  if (!c || typeof c !== "object") return false;
  const cam = c as Partial<DesignCameraState>;
  return Array.isArray(cam.position) && cam.position.length === 3 && Array.isArray(cam.target) && cam.target.length === 3;
};

/** A compact, human-readable rundown of the current design -- Step 7's
 * "Design Summary", built from live product/config data (never raw IDs). */
export const buildDesignSummary = (
  room: ReturnType<typeof getRoom>,
  surfaceProducts: Record<string, Product | null>,
  surfaceConfigs: Record<string, SurfaceMaterialConfig>,
  fabricationConfigs: Record<string, CountertopFabricationConfig>
) =>
  room.surfaces
    .filter((s) => surfaceProducts[s.id])
    .map((s) => {
      const product = surfaceProducts[s.id]!;
      const config = surfaceConfigs[s.id];
      const fabrication = fabricationConfigs[s.id];
      const size = product.sizes.find((sz) => sz.id === config.sizeId);
      return {
        surfaceLabel: s.label,
        surfaceType: s.type,
        productName: product.name,
        collection: product.collection,
        finish: product.finish,
        size: size ? `${size.width} × ${size.height} mm` : undefined,
        thickness: fabrication ? `${fabrication.thicknessMm} mm` : undefined,
        edgeProfile: fabrication?.edgeProfile,
        waterfall: fabrication?.waterfall,
      };
    });
