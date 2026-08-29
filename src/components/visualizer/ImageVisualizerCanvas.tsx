"use client";

import { Suspense, useEffect, useState, type RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls, Environment, type CameraControls as CameraControlsImpl } from "@react-three/drei";
import * as THREE from "three";
import ImageKitchenScene from "./scenes/ImageKitchenScene";
import VisualizerErrorBoundary from "./VisualizerErrorBoundary";
import { IMAGE_CAMERAS, type ImageView } from "@/data/imageScenes";
import type { EdgeProfile, ThicknessMm } from "@/data/kitchenCatalog";
import type { WaterfallOption } from "@/lib/visualizerUrlState";
import type { VisualizerProduct } from "../../../types";

interface ImageVisualizerCanvasProps {
  view: ImageView;
  countertopProduct: VisualizerProduct | null;
  backsplashProduct: VisualizerProduct | null;
  waterfall: WaterfallOption;
  thicknessMm: ThicknessMm;
  veinRotation: 0 | 90;
  edgeProfile: EdgeProfile;
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

/** Animates the shared CameraControls to the selected view's preset
 * whenever `view` changes -- setting the Canvas's own `camera` prop only
 * affects the very first mount, not a live switch between Primary/Full/Detail. */
const ViewDriver = ({ view, cameraControlsRef }: { view: ImageView; cameraControlsRef: RefObject<CameraControlsImpl | null> }) => {
  useEffect(() => {
    const [px, py, pz, tx, ty, tz] = IMAGE_CAMERAS[view];
    cameraControlsRef.current?.setLookAt(px, py, pz, tx, ty, tz, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);
  return null;
};

const ImageVisualizerCanvas = ({
  view,
  countertopProduct,
  backsplashProduct,
  waterfall,
  thicknessMm,
  veinRotation,
  edgeProfile,
  cameraControlsRef,
  canvasRef,
}: ImageVisualizerCanvasProps) => {
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
      <Canvas
        ref={canvasRef}
        shadows
        gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.95, preserveDrawingBuffer: true }}
        camera={{ position: IMAGE_CAMERAS.primary.slice(0, 3) as [number, number, number], fov: 38 }}
      >
        <ambientLight intensity={0.42} />
        <directionalLight
          position={[3, 5, 2.5]}
          intensity={1.35}
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
        <directionalLight position={[-3, 2, -2]} intensity={0.25} />
        <Suspense fallback={null}>
          <ImageKitchenScene
            countertopProduct={countertopProduct}
            backsplashProduct={backsplashProduct}
            waterfall={waterfall}
            thicknessMm={thicknessMm}
            veinRotation={veinRotation}
            edgeProfile={edgeProfile}
          />
          <Environment preset="apartment" environmentIntensity={0.35} />
        </Suspense>
        <CameraControls ref={cameraControlsRef} minDistance={0.5} maxDistance={8} minPolarAngle={0.15} maxPolarAngle={Math.PI / 2.05} />
        <ViewDriver view={view} cameraControlsRef={cameraControlsRef} />
      </Canvas>
    </VisualizerErrorBoundary>
  );
};

export default ImageVisualizerCanvas;
