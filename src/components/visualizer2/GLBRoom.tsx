"use client";

import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import RoomSurface from "./RoomSurface";
import type { RoomDef } from "@/lib/visualizer2/rooms";
import type { Product } from "@/lib/visualizer2/product";
import type { SurfaceMaterialConfig } from "@/lib/visualizer2/layout";
import { DEFAULT_SURFACE_CONFIG } from "@/lib/visualizer2/layout";

interface GLBRoomProps {
  room: RoomDef;
  surfaceProducts: Record<string, Product | null>;
  surfaceConfigs: Record<string, SurfaceMaterialConfig>;
  selectedSurface: string | null;
  onSelectSurface: (id: string) => void;
}

/**
 * Prepared for a production GLB/GLTF room -- no such asset exists in this
 * project yet, so this component is unused (every current RoomDef has
 * modelType: "procedural") and untested against a real file. It's wired
 * up so that turning a room into a GLB later is: drop the file at
 * room.modelPath, add room.glbSurfaceMap (app surface id -> mesh name in
 * the file), flip modelType to "glb". Nothing else in the Visualizer
 * changes -- RoomRenderer picks this component automatically.
 *
 * Once a real mesh is found by name, this replaces the rest of the GLB's
 * own material with the same RoomSurface/SurfaceProductMaterial pipeline
 * procedural rooms use, so material application code never needs to know
 * which kind of room it's looking at.
 */
const GLBRoom = ({ room, surfaceProducts, surfaceConfigs, selectedSurface, onSelectSurface }: GLBRoomProps) => {
  const gltf = useGLTF(room.modelPath!);

  useEffect(() => {
    return () => {
      useGLTF.clear(room.modelPath!);
    };
  }, [room.modelPath]);

  const surfaceMap = room.glbSurfaceMap ?? {};

  return (
    <group>
      <primitive object={gltf.scene} />
      {room.surfaces.map((s) => {
        const meshName = surfaceMap[s.id];
        const mesh = meshName ? (gltf.scene.getObjectByName(meshName) as THREE.Mesh | undefined) : undefined;
        if (!mesh) return null;
        // Hide the GLB's own material for this mesh -- RoomSurface below
        // takes over rendering it at the same transform/geometry.
        mesh.visible = false;
        const worldPos = new THREE.Vector3();
        const worldQuat = new THREE.Quaternion();
        mesh.getWorldPosition(worldPos);
        mesh.getWorldQuaternion(worldQuat);
        const euler = new THREE.Euler().setFromQuaternion(worldQuat);
        const bbox = new THREE.Box3().setFromObject(mesh);
        const size = bbox.getSize(new THREE.Vector3());

        return (
          <RoomSurface
            key={s.id}
            id={s.id}
            position={[worldPos.x, worldPos.y, worldPos.z]}
            rotation={[euler.x, euler.y, euler.z]}
            args={[size.x || s.args[0], size.z || s.args[1]]}
            material={{ color: s.defaultColor, roughness: s.defaultRoughness }}
            product={surfaceProducts[s.id] ?? null}
            config={surfaceConfigs[s.id] ?? DEFAULT_SURFACE_CONFIG}
            surfaceMm={{ width: s.widthMm, height: s.heightMm }}
            selected={selectedSurface === s.id}
            onSelect={onSelectSurface}
          />
        );
      })}
    </group>
  );
};

export default GLBRoom;
