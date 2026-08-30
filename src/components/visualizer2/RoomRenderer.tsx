"use client";

import ProceduralRoom from "./ProceduralRoom";
import GLBRoom from "./GLBRoom";
import type { RoomDef } from "@/lib/visualizer2/rooms";
import type { Product } from "@/lib/visualizer2/product";
import type { SurfaceMaterialConfig } from "@/lib/visualizer2/layout";

interface RoomRendererProps {
  room: RoomDef;
  surfaceProducts: Record<string, Product | null>;
  surfaceConfigs: Record<string, SurfaceMaterialConfig>;
  selectedSurface: string | null;
  onSelectSurface: (id: string) => void;
}

/**
 * The one place the rest of the Visualizer talks to "a room" -- it never
 * needs to know whether that room is procedural geometry or an imported
 * GLB; both render the same surface list through the same RoomSurface/
 * SurfaceProductMaterial pipeline.
 */
const RoomRenderer = (props: RoomRendererProps) => (props.room.modelType === "glb" ? <GLBRoom {...props} /> : <ProceduralRoom {...props} />);

export default RoomRenderer;
