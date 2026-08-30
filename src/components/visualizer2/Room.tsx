"use client";

import * as THREE from "three";
import RoomSurface from "./RoomSurface";
import type { SurfaceId, SurfaceMaterials } from "@/lib/visualizer2/surfaces";
import type { Product } from "@/lib/visualizer2/product";

const ROOM_WIDTH = 8;
const ROOM_DEPTH = 8;
const ROOM_HEIGHT = 4;

interface RoomProps {
  materials: SurfaceMaterials;
  surfaceProducts: Record<SurfaceId, Product | null>;
  selectedSurface: SurfaceId | null;
  onSelectSurface: (id: SurfaceId) => void;
}

/**
 * Room
 * ├── Floor
 * ├── BackWall
 * ├── LeftWall
 * ├── RightWall
 * └── Ceiling (plain, non-interactive -- just closes the space visually)
 *
 * Each architectural surface below is its own mesh/material so a future
 * step can assign a different Alfa Ventura product to each independently.
 */
const Room = ({ materials, surfaceProducts, selectedSurface, onSelectSurface }: RoomProps) => (
  <group>
    <RoomSurface
      id="floor"
      position={[0, 0, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      args={[ROOM_WIDTH, ROOM_DEPTH]}
      material={materials.floor}
      product={surfaceProducts.floor}
      selected={selectedSurface === "floor"}
      onSelect={onSelectSurface}
    />
    <RoomSurface
      id="backWall"
      position={[0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2]}
      rotation={[0, 0, 0]}
      args={[ROOM_WIDTH, ROOM_HEIGHT]}
      material={materials.backWall}
      product={surfaceProducts.backWall}
      selected={selectedSurface === "backWall"}
      onSelect={onSelectSurface}
    />
    <RoomSurface
      id="leftWall"
      position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}
      rotation={[0, Math.PI / 2, 0]}
      args={[ROOM_DEPTH, ROOM_HEIGHT]}
      material={materials.leftWall}
      product={surfaceProducts.leftWall}
      selected={selectedSurface === "leftWall"}
      onSelect={onSelectSurface}
    />
    <RoomSurface
      id="rightWall"
      position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}
      rotation={[0, -Math.PI / 2, 0]}
      args={[ROOM_DEPTH, ROOM_HEIGHT]}
      material={materials.rightWall}
      product={surfaceProducts.rightWall}
      selected={selectedSurface === "rightWall"}
      onSelect={onSelectSurface}
    />
    {/* Ceiling: not a selectable/material surface for this step, just closes the room */}
    <mesh position={[0, ROOM_HEIGHT, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
      <meshStandardMaterial color="#FAF7F2" roughness={1} side={THREE.DoubleSide} />
    </mesh>
  </group>
);

export default Room;
