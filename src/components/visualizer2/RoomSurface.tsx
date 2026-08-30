"use client";

import { Suspense, useState } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import SurfaceProductMaterial from "./SurfaceProductMaterial";
import type { SurfaceId, SurfaceMaterial } from "@/lib/visualizer2/surfaces";
import type { Product } from "@/lib/visualizer2/product";
import type { SurfaceMaterialConfig } from "@/lib/visualizer2/layout";

interface RoomSurfaceProps {
  id: SurfaceId;
  position: [number, number, number];
  rotation: [number, number, number];
  args: [number, number];
  material: SurfaceMaterial;
  product: Product | null;
  config: SurfaceMaterialConfig;
  surfaceMm: { width: number; height: number };
  selected: boolean;
  onSelect: (id: SurfaceId) => void;
}

/**
 * One independent architectural surface (floor/back wall/left wall/right
 * wall). Each is its own mesh with its own material so a future step can
 * apply a different product to each without touching the others.
 * Hover/selected state is a restrained emissive lift -- no bright outlines.
 */
const RoomSurface = ({ id, position, rotation, args, material, product, config, surfaceMm, selected, onSelect }: RoomSurfaceProps) => {
  const [hovered, setHovered] = useState(false);
  const highlighted = selected || hovered;

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = "auto";
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(id);
  };

  return (
    <mesh position={position} rotation={rotation} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut} onClick={handleClick} receiveShadow>
      <planeGeometry args={args} />
      {product ? (
        <Suspense fallback={<meshStandardMaterial color={material.color} roughness={material.roughness} />}>
          <SurfaceProductMaterial product={product} config={config} surfaceMm={surfaceMm} highlighted={highlighted} />
        </Suspense>
      ) : (
        <meshStandardMaterial
          color={material.color}
          roughness={material.roughness}
          emissive={highlighted ? "#9B7040" : "#000000"}
          emissiveIntensity={selected ? 0.1 : hovered ? 0.05 : 0}
        />
      )}
    </mesh>
  );
};

export default RoomSurface;
