"use client";

import * as THREE from "three";
import RoomSurface from "./RoomSurface";
import type { RoomDef } from "@/lib/visualizer2/rooms";
import type { Product } from "@/lib/visualizer2/product";
import type { SurfaceMaterialConfig } from "@/lib/visualizer2/layout";
import { DEFAULT_SURFACE_CONFIG } from "@/lib/visualizer2/layout";

interface ProceduralRoomProps {
  room: RoomDef;
  surfaceProducts: Record<string, Product | null>;
  surfaceConfigs: Record<string, SurfaceMaterialConfig>;
  selectedSurface: string | null;
  onSelectSurface: (id: string) => void;
}

/**
 * Renders any RoomDef whose surfaces already carry explicit procedural
 * placement (position/rotation/args in metres -- see rooms.ts). Adding a
 * new procedural room is just adding data to ROOMS; this component never
 * changes. A plain ceiling closes the room visually (not a selectable
 * material surface, matching Step 1's floor/wall-only scope).
 */
const ProceduralRoom = ({ room, surfaceProducts, surfaceConfigs, selectedSurface, onSelectSurface }: ProceduralRoomProps) => (
  <group>
    {room.surfaces.map((s) => (
      <RoomSurface
        key={s.id}
        id={s.id}
        position={s.position}
        rotation={s.rotation}
        args={s.args}
        material={{ color: s.defaultColor, roughness: s.defaultRoughness }}
        product={surfaceProducts[s.id] ?? null}
        config={surfaceConfigs[s.id] ?? DEFAULT_SURFACE_CONFIG}
        surfaceMm={{ width: s.widthMm, height: s.heightMm }}
        selected={selectedSurface === s.id}
        onSelect={onSelectSurface}
      />
    ))}
    <mesh position={[0, room.dimensionsMm.height / 1000, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[room.dimensionsMm.width / 1000, room.dimensionsMm.depth / 1000]} />
      <meshStandardMaterial color="#FAF7F2" roughness={1} side={THREE.DoubleSide} />
    </mesh>
  </group>
);

export default ProceduralRoom;
