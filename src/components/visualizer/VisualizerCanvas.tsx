"use client";

import { Suspense, useEffect, useState, type RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls, Environment, type CameraControls as CameraControlsImpl } from "@react-three/drei";
import * as THREE from "three";
import KitchenScene from "./scenes/KitchenScene";
import VisualizerErrorBoundary from "./VisualizerErrorBoundary";
import { KITCHEN_CAMERA } from "@/data/scenes";
import type { LayoutId } from "@/data/kitchenCatalog";
import type { WaterfallOption } from "@/lib/visualizerUrlState";
import type { VisualizerProduct } from "../../../types";

interface VisualizerCanvasProps {
  layout: LayoutId;
  mirrored: boolean;
  cabinetColor: string;
  countertopProduct: VisualizerProduct | null;
  backsplashProduct: VisualizerProduct | null;
  floorColor: string;
  floorRoughness: number;
  waterfall: WaterfallOption;
  lightingMode: "day" | "evening";
  cameraControlsRef: RefObject<CameraControlsImpl | null>;
  canvasRef?: RefObject<HTMLCanvasElement | null>;
}

const hasWebGL = () => {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
};

const VisualizerCanvas = ({
  layout,
  mirrored,
  cabinetColor,
  countertopProduct,
  backsplashProduct,
  floorColor,
  floorRoughness,
  waterfall,
  lightingMode,
  cameraControlsRef,
  canvasRef,
}: VisualizerCanvasProps) => {
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

  const isDay = lightingMode === "day";

  return (
    <VisualizerErrorBoundary>
      <Canvas
        ref={canvasRef}
        shadows
        gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: isDay ? 0.95 : 0.7, preserveDrawingBuffer: true }}
        camera={{ position: KITCHEN_CAMERA.hero.slice(0, 3) as [number, number, number], fov: 40 }}
      >
        <ambientLight intensity={isDay ? 0.4 : 0.22} />
        <directionalLight
          position={[3.5, 5, 3]}
          intensity={isDay ? 1.3 : 0.6}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0004}
          shadow-camera-left={-4}
          shadow-camera-right={4}
          shadow-camera-top={4}
          shadow-camera-bottom={-4}
          shadow-camera-near={0.5}
          shadow-camera-far={12}
        />
        {/* soft fill from the opposite side so shadows don't go pure black */}
        <directionalLight position={[-3, 2, -2]} intensity={isDay ? 0.25 : 0.1} />
        <Suspense fallback={null}>
          <KitchenScene
            layout={layout}
            mirrored={mirrored}
            cabinetColor={cabinetColor}
            countertopProduct={countertopProduct}
            backsplashProduct={backsplashProduct}
            floorColor={floorColor}
            floorRoughness={floorRoughness}
            waterfall={waterfall}
          />
          <Environment preset={isDay ? "apartment" : "sunset"} environmentIntensity={isDay ? 0.35 : 0.25} />
        </Suspense>
        <CameraControls
          ref={cameraControlsRef}
          minDistance={0.9}
          maxDistance={9}
          minPolarAngle={0.15}
          maxPolarAngle={Math.PI / 2.05}
        />
      </Canvas>
    </VisualizerErrorBoundary>
  );
};

export default VisualizerCanvas;
