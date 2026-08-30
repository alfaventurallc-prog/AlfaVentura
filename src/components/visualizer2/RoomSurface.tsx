"use client";

import { useState } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { SurfaceId, SurfaceMaterial } from "@/lib/visualizer2/surfaces";

interface RoomSurfaceProps {
  id: SurfaceId;
  position: [number, number, number];
  rotation: [number, number, number];
  args: [number, number];
  material: SurfaceMaterial;
  selected: boolean;
  onSelect: (id: SurfaceId) => void;
}

/**
 * One independent architectural surface (floor/back wall/left wall/right
 * wall). Each is its own mesh with its own material so a future step can
 * apply a different product to each without touching the others.
 * Hover/selected state is a restrained emissive lift -- no bright outlines.
 */
const RoomSurface = ({ id, position, rotation, args, material, selected, onSelect }: RoomSurfaceProps) => {
  const [hovered, setHovered] = useState(false);

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

  const emissiveIntensity = selected ? 0.1 : hovered ? 0.05 : 0;

  return (
    <mesh
      position={position}
      rotation={rotation}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
      receiveShadow
    >
      <planeGeometry args={args} />
      <meshStandardMaterial
        color={material.color}
        roughness={material.roughness}
        emissive={selected || hovered ? new THREE.Color("#9B7040") : new THREE.Color("#000000")}
        emissiveIntensity={emissiveIntensity}
      />
    </mesh>
  );
};

export default RoomSurface;
