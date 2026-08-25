"use client";

import { Suspense, useEffect, useState, type RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls, Environment, type CameraControls as CameraControlsImpl } from "@react-three/drei";
import KitchenScene from "./scenes/KitchenScene";
import BathroomScene from "./scenes/BathroomScene";
import PlaceholderScene from "./scenes/PlaceholderScene";
import VisualizerErrorBoundary from "./VisualizerErrorBoundary";
import type { VisualizerProduct } from "../../../types";
import type { SpaceDef } from "@/data/scenes";

interface VisualizerCanvasProps {
  space: SpaceDef;
  materials: Record<string, VisualizerProduct | null>;
  activeApplication: string;
  lightingMode: "day" | "evening";
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

const SceneSwitch = ({ space, materials, activeApplication }: Omit<VisualizerCanvasProps, "lightingMode" | "cameraControlsRef">) => {
  if (space.id === "kitchen") {
    return <KitchenScene materials={materials} activeApplication={activeApplication} />;
  }
  if (space.id === "bathroom") {
    return <BathroomScene materials={materials} activeApplication={activeApplication} />;
  }
  return (
    <PlaceholderScene
      applicationId={space.applications[0].id}
      materials={materials}
      activeApplication={activeApplication}
    />
  );
};

const VisualizerCanvas = ({ space, materials, activeApplication, lightingMode, cameraControlsRef }: VisualizerCanvasProps) => {
  const [webglOk, setWebglOk] = useState(true);

  useEffect(() => {
    setWebglOk(hasWebGL());
  }, []);

  if (!webglOk) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[380px] rounded-2xl bg-[#EDE6DA] border border-[#E8DDD0] text-center px-6">
        <p className="text-[#78716C] text-sm">
          Your browser doesn't support 3D previews. Please try a different browser or device.
        </p>
      </div>
    );
  }

  return (
    <VisualizerErrorBoundary>
      <Canvas shadows camera={{ position: space.cameraPresets.perspective.slice(0, 3) as [number, number, number], fov: 45 }}>
        <ambientLight intensity={lightingMode === "day" ? 0.7 : 0.35} />
        <directionalLight
          position={[5, 6, 4]}
          intensity={lightingMode === "day" ? 1.2 : 0.5}
          castShadow
        />
        <Suspense fallback={null}>
          <SceneSwitch space={space} materials={materials} activeApplication={activeApplication} />
          <Environment preset={lightingMode === "day" ? "apartment" : "sunset"} />
        </Suspense>
        <CameraControls
          ref={cameraControlsRef}
          minDistance={2.2}
          maxDistance={9}
          minPolarAngle={0.15}
          maxPolarAngle={Math.PI / 2.05}
        />
      </Canvas>
    </VisualizerErrorBoundary>
  );
};

export default VisualizerCanvas;
