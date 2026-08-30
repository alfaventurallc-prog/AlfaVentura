"use client";

import { Suspense, useEffect, useState, type RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls, Environment } from "@react-three/drei";
import type { CameraControls as CameraControlsImpl } from "@react-three/drei";
import * as THREE from "three";
import RoomRenderer from "./RoomRenderer";
import VisualizerErrorBoundary from "../visualizer/VisualizerErrorBoundary";
import type { RoomDef } from "@/lib/visualizer2/rooms";
import type { Product } from "@/lib/visualizer2/product";
import type { SurfaceMaterialConfig } from "@/lib/visualizer2/layout";

interface VisualizerV2CanvasProps {
  room: RoomDef;
  surfaceProducts: Record<string, Product | null>;
  surfaceConfigs: Record<string, SurfaceMaterialConfig>;
  selectedSurface: string | null;
  onSelectSurface: (id: string) => void;
  cameraControlsRef: RefObject<CameraControlsImpl | null>;
}

const hasWebGL = () => {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
};

/** Moves the camera to the active room's preset whenever the room changes
 * -- the Canvas's own `camera` prop only sets the very first mount's
 * position, not a live switch between rooms. */
const RoomCameraDriver = ({ room, cameraControlsRef }: { room: RoomDef; cameraControlsRef: RefObject<CameraControlsImpl | null> }) => {
  useEffect(() => {
    const [px, py, pz] = room.camera.position;
    const [tx, ty, tz] = room.camera.target;
    cameraControlsRef.current?.setLookAt(px, py, pz, tx, ty, tz, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.id]);
  return null;
};

const VisualizerV2Canvas = ({ room, surfaceProducts, surfaceConfigs, selectedSurface, onSelectSurface, cameraControlsRef }: VisualizerV2CanvasProps) => {
  const [webglOk, setWebglOk] = useState(true);

  useEffect(() => {
    setWebglOk(hasWebGL());
  }, []);

  if (!webglOk) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[380px] bg-[#EDE6DA] text-center px-6">
        <p className="text-[#78716C] text-sm">Your browser doesn't support 3D previews. Please try a different browser or device.</p>
      </div>
    );
  }

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.95 }}
      camera={{ position: room.camera.position, fov: 45 }}
    >
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[4, 6, 3]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-near={0.5}
        shadow-camera-far={16}
      />
      <directionalLight position={[-3, 3, -2]} intensity={0.3} />
      <Suspense fallback={null}>
        <VisualizerErrorBoundary>
          <RoomRenderer
            room={room}
            surfaceProducts={surfaceProducts}
            surfaceConfigs={surfaceConfigs}
            selectedSurface={selectedSurface}
            onSelectSurface={onSelectSurface}
          />
        </VisualizerErrorBoundary>
        <Environment preset="apartment" environmentIntensity={0.3} />
      </Suspense>
      {/* minDistance/maxDistance keep the camera from clipping into a wall or
          the floor; maxPolarAngle keeps it from dipping below floor level. */}
      <CameraControls ref={cameraControlsRef} minDistance={1} maxDistance={10} minPolarAngle={0.2} maxPolarAngle={Math.PI / 2.1} />
      <RoomCameraDriver room={room} cameraControlsRef={cameraControlsRef} />
    </Canvas>
  );
};

export default VisualizerV2Canvas;
