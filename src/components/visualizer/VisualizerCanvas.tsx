"use client";

import { Suspense, useEffect, useState, type RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls, ContactShadows, Environment, Html, type CameraControls as CameraControlsImpl } from "@react-three/drei";
import * as THREE from "three";
import KitchenScene from "./scenes/KitchenScene";
import VisualizerErrorBoundary from "./VisualizerErrorBoundary";
import { KITCHEN_CAMERA } from "@/data/scenes";
import type { LayoutId, ThicknessMm, EdgeProfile } from "@/data/kitchenCatalog";
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
  thicknessMm: ThicknessMm;
  veinRotation: 0 | 90;
  edgeProfile: EdgeProfile;
  lightingMode: "day" | "evening";
  cameraControlsRef: RefObject<CameraControlsImpl | null>;
  canvasRef?: RefObject<HTMLCanvasElement | null>;
}

/** Shown behind the canvas while the scene's textures/environment load --
 * previously Suspense fell back to `null`, so the panel just went blank for
 * a moment on first load or a material swap, reading as a stall/bug rather
 * than progress. */
const CanvasLoadingSkeleton = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-[#EDE6DA]">
    <div
      className="absolute inset-0 bg-[linear-gradient(110deg,#EDE6DA_8%,#F5EFE4_18%,#EDE6DA_33%)] bg-[length:800px_100%] animate-shimmer"
      aria-hidden
    />
    <div className="relative flex flex-col items-center gap-2 text-[#9B7040]">
      <div className="w-8 h-8 rounded-full border-2 border-[#9B7040]/25 border-t-[#9B7040] animate-spin" />
      <span className="text-xs font-semibold uppercase tracking-wide text-[#8A7B68]">Loading design…</span>
    </div>
  </div>
);

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
  thicknessMm,
  veinRotation,
  edgeProfile,
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
        {/* 3-point lighting: key (sun through the "window" side), fill
            (soft opposite-side bounce so shadows don't go pure black), and
            a subtle rim/back light for edge separation -- tinted cool for
            Day, warm for Evening so the toggle reads as an actual time-of-
            day change rather than just a brightness slider. */}
        <ambientLight intensity={isDay ? 0.4 : 0.22} color={isDay ? "#EAF2FF" : "#3A2C1E"} />
        <directionalLight
          position={[3.5, 5, 3]}
          intensity={isDay ? 1.35 : 0.75}
          color={isDay ? "#FFFFFF" : "#FFB870"}
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
        <directionalLight position={[-3, 2, -2]} intensity={isDay ? 0.28 : 0.16} color={isDay ? "#D9E9FF" : "#7A4A2A"} />
        {/* rim light from behind/above, separates the counter's silhouette
            from the backdrop -- absent before, which flattened the scene */}
        <directionalLight position={[0, 3.5, -3.5]} intensity={isDay ? 0.22 : 0.3} color={isDay ? "#FFFFFF" : "#FF8A4C"} />
        {/* <Environment> below sets scene.environment (for reflections)
            AND, by default, scene.background -- which replaced the visible
            backdrop with the raw equirectangular HDRI photo. Above the
            ceiling line that photo's own horizon/warped edge is what
            rendered as a skewed brown trapezoid with a stray bright strip
            in it (there is no ceiling-geometry bug -- the ceiling plane
            itself was fine; this background image was floating above and
            behind it). Environment's background={false} below keeps the
            HDRI for lighting/reflections only, and this flat color shows
            as the visible sky instead. */}
        <color attach="background" args={[isDay ? "#EAE3D6" : "#2A2018"]} />
        <Suspense fallback={<Html fullscreen><CanvasLoadingSkeleton /></Html>}>
          <KitchenScene
            layout={layout}
            mirrored={mirrored}
            cabinetColor={cabinetColor}
            countertopProduct={countertopProduct}
            backsplashProduct={backsplashProduct}
            floorColor={floorColor}
            floorRoughness={floorRoughness}
            waterfall={waterfall}
            thicknessMm={thicknessMm}
            veinRotation={veinRotation}
            edgeProfile={edgeProfile}
          />
          {/* Soft contact shadow disc under the cabinets/island so they
              read as resting on the floor instead of floating -- a real
              shadow map alone left the underside of the toe-kick reading
              flat and disconnected from the floor. */}
          <ContactShadows position={[0, -0.849, 0]} opacity={isDay ? 0.55 : 0.7} scale={10} blur={2.8} far={1.2} />
          <Environment preset={isDay ? "apartment" : "sunset"} environmentIntensity={isDay ? 0.35 : 0.3} background={false} />
        </Suspense>
        <CameraControls
          ref={cameraControlsRef}
          minDistance={0.9}
          maxDistance={9}
          // Was 0.15 (~8.6deg from straight down), which let users drag
          // into a near-top-down "floor plan" view. 0.85 (~49deg) keeps
          // the scene readable as a room from any angle the user drags to.
          minPolarAngle={0.85}
          maxPolarAngle={Math.PI / 2.05}
        />
      </Canvas>
    </VisualizerErrorBoundary>
  );
};

export default VisualizerCanvas;
