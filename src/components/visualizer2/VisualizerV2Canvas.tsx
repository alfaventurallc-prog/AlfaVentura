"use client";

import { Suspense, useEffect, useState, type RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls, Environment } from "@react-three/drei";
import type { CameraControls as CameraControlsImpl } from "@react-three/drei";
import * as THREE from "three";
import Room from "./Room";
import type { SurfaceId, SurfaceMaterials } from "@/lib/visualizer2/surfaces";
import type { Product } from "@/lib/visualizer2/product";

interface VisualizerV2CanvasProps {
  materials: SurfaceMaterials;
  surfaceProducts: Record<SurfaceId, Product | null>;
  selectedSurface: SurfaceId | null;
  onSelectSurface: (id: SurfaceId) => void;
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

const HERO_CAMERA_POSITION: [number, number, number] = [4.6, 2.2, 5.4];

const VisualizerV2Canvas = ({ materials, surfaceProducts, selectedSurface, onSelectSurface, cameraControlsRef }: VisualizerV2CanvasProps) => {
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
      camera={{ position: HERO_CAMERA_POSITION, fov: 45 }}
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
        <Room materials={materials} surfaceProducts={surfaceProducts} selectedSurface={selectedSurface} onSelectSurface={onSelectSurface} />
        <Environment preset="apartment" environmentIntensity={0.3} />
      </Suspense>
      {/* minDistance/maxDistance keep the camera from clipping into a wall or
          the floor; maxPolarAngle keeps it from dipping below floor level. */}
      <CameraControls ref={cameraControlsRef} minDistance={1.5} maxDistance={9} minPolarAngle={0.2} maxPolarAngle={Math.PI / 2.1} />
    </Canvas>
  );
};

export default VisualizerV2Canvas;
