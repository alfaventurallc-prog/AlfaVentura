"use client";

import { useMemo, useRef, useState } from "react";
import type { CameraControls as CameraControlsImpl } from "@react-three/drei";
import { SPACES, getSpace } from "@/data/scenes";
import SpaceSelector from "./SpaceSelector";
import ApplicationSelector from "./ApplicationSelector";
import ProductSelector from "./ProductSelector";
import VisualizerCanvas from "./VisualizerCanvas";
import SceneControls from "./SceneControls";
import ProductInfoPanel from "./ProductInfoPanel";
import type { VisualizerProduct } from "../../../types";

interface VisualizerShellProps {
  products: VisualizerProduct[];
}

const VisualizerShell = ({ products }: VisualizerShellProps) => {
  const [spaceId, setSpaceId] = useState(SPACES[0].id);
  const [activeApplication, setActiveApplication] = useState(SPACES[0].defaultApplication);
  const [sceneSelections, setSceneSelections] = useState<Record<string, VisualizerProduct | null>>({});
  const [lastSelectedProduct, setLastSelectedProduct] = useState<VisualizerProduct | null>(null);
  const [lightingMode, setLightingMode] = useState<"day" | "evening">("day");
  const cameraControlsRef = useRef<CameraControlsImpl | null>(null);

  const space = getSpace(spaceId);
  const activeApplicationLabel =
    space.applications.find((a) => a.id === activeApplication)?.label ?? space.applications[0].label;

  const materialsForSpace = useMemo(() => {
    const result: Record<string, VisualizerProduct | null> = {};
    space.applications.forEach((app) => {
      result[app.id] = sceneSelections[`${spaceId}:${app.id}`] ?? null;
    });
    return result;
  }, [sceneSelections, spaceId, space]);

  const moveCamera = (preset: (typeof space.cameraPresets)["hero"]) => {
    const [px, py, pz, tx, ty, tz] = preset;
    cameraControlsRef.current?.setLookAt(px, py, pz, tx, ty, tz, true);
  };

  const handleSelectSpace = (newSpaceId: string) => {
    if (newSpaceId === spaceId) return;
    const newSpace = getSpace(newSpaceId);
    setSpaceId(newSpaceId);
    setActiveApplication(newSpace.defaultApplication);
    moveCamera(newSpace.cameraPresets.hero);
  };

  const handleSelectApplication = (applicationId: string) => {
    setActiveApplication(applicationId);
    const preset = space.applicationCameras[applicationId];
    if (preset) moveCamera(preset);
  };

  const handleSelectProduct = (product: VisualizerProduct) => {
    setSceneSelections((prev) => ({ ...prev, [`${spaceId}:${activeApplication}`]: product }));
    setLastSelectedProduct(product);
  };

  const handleNavigate = (targetSpaceId: string, targetApplicationId: string) => {
    const targetSpace = getSpace(targetSpaceId);
    setSpaceId(targetSpaceId);
    setActiveApplication(targetApplicationId);
    if (lastSelectedProduct) {
      setSceneSelections((prev) => ({
        ...prev,
        [`${targetSpaceId}:${targetApplicationId}`]: lastSelectedProduct,
      }));
    }
    moveCamera(targetSpace.applicationCameras[targetApplicationId] ?? targetSpace.cameraPresets.hero);
  };

  const activeSurfaceProduct = materialsForSpace[activeApplication] ?? null;

  return (
    <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-8">
      {/* Center: 3D view + product selector */}
      <div className="order-1 lg:order-2 flex-1 min-w-0 flex flex-col gap-5">
        <div className="relative w-full h-[64vh] min-h-[440px] max-h-[680px] rounded-2xl overflow-hidden bg-[#EDE6DA] border border-[#E8DDD0]">
          <VisualizerCanvas
            space={space}
            materials={materialsForSpace}
            activeApplication={activeApplication}
            lightingMode={lightingMode}
            cameraControlsRef={cameraControlsRef}
          />
          <SceneControls
            space={space}
            activeApplication={activeApplication}
            cameraControlsRef={cameraControlsRef}
            lightingMode={lightingMode}
            onLightingChange={setLightingMode}
          />
          {activeSurfaceProduct && (
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl px-3.5 py-2 shadow-sm">
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#9B7040]">Selected Surface</p>
              <p className="text-sm font-bold text-[#1C1917] leading-tight">{activeSurfaceProduct.name}</p>
            </div>
          )}
          {!space.hasFullScene && (
            <p className="absolute bottom-3 right-3 text-xs text-[#78716C] bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
              Starting scene — full room detail coming soon
            </p>
          )}
        </div>

        {products.length === 0 ? (
          <p className="text-center text-[#78716C] text-sm py-4">No products available to preview yet.</p>
        ) : (
          <ProductSelector
            products={products}
            activeProductId={activeSurfaceProduct?.id ?? null}
            onSelect={handleSelectProduct}
          />
        )}
      </div>

      {/* Left: space + application */}
      <div className="order-2 lg:order-1 lg:w-[260px] lg:shrink-0 space-y-8">
        <SpaceSelector activeSpaceId={spaceId} onSelect={handleSelectSpace} />
        <ApplicationSelector
          applications={space.applications}
          activeApplicationId={activeApplication}
          onSelect={handleSelectApplication}
        />
      </div>

      {/* Right: selected product info + CTA */}
      <div className="order-3 lg:w-[320px] lg:shrink-0 lg:pl-6 lg:border-l lg:border-[#E8DDD0]">
        <ProductInfoPanel
          product={lastSelectedProduct}
          spaceLabel={space.label}
          applicationLabel={activeApplicationLabel}
          onNavigate={handleNavigate}
        />
      </div>
    </div>
  );
};

export default VisualizerShell;
