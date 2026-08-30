"use client";

import { Suspense, useState } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import SurfaceProductMaterial from "./SurfaceProductMaterial";
import type { RoomSurfaceDef } from "@/lib/visualizer2/rooms";
import type { Product } from "@/lib/visualizer2/product";
import type { SurfaceMaterialConfig, CountertopFabricationConfig } from "@/lib/visualizer2/layout";

interface CountertopRendererProps {
  surfaceDef: RoomSurfaceDef;
  product: Product | null;
  config: SurfaceMaterialConfig;
  fabrication: CountertopFabricationConfig;
  selected: boolean;
  onSelect: (id: string) => void;
}

/**
 * Step 5: a real slab volume for countertop/island surfaces, replacing the
 * flat plane every other surface uses. Thickness, overhang, edge profile,
 * and waterfall are actual geometry -- not text labels or a flat image.
 * Non-countertop surfaces are untouched (still plain RoomSurface planes).
 */
const CountertopRenderer = ({ surfaceDef, product, config, fabrication, selected, onSelect }: CountertopRendererProps) => {
  const [hovered, setHovered] = useState(false);
  const highlighted = selected || hovered;

  const thicknessM = fabrication.thicknessMm / 1000;
  const overhangM = fabrication.overhangMm / 1000;
  const [w, baseDepth] = surfaceDef.args;
  const depth = baseDepth + overhangM;
  const [cx, topY, cz] = surfaceDef.position;
  const centerZ = cz + overhangM / 2;
  const centerY = topY - thicknessM / 2;
  const floorY = 0;

  const surfaceMm = { width: surfaceDef.widthMm, height: surfaceDef.heightMm };
  const fallbackMaterial = <meshStandardMaterial color={surfaceDef.defaultColor} roughness={surfaceDef.defaultRoughness} />;

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
    onSelect(surfaceDef.id);
  };

  const renderSlabMesh = (
    args: [number, number, number],
    position: [number, number, number],
    mirrorX?: boolean,
    mirrorY?: boolean,
    key?: string
  ) => (
    <mesh key={key} position={position} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut} onClick={handleClick} castShadow receiveShadow>
      <boxGeometry args={args} />
      {product ? (
        <Suspense fallback={fallbackMaterial}>
          <SurfaceProductMaterial product={product} config={config} surfaceMm={surfaceMm} highlighted={highlighted} mirrorX={mirrorX} mirrorY={mirrorY} />
        </Suspense>
      ) : (
        fallbackMaterial
      )}
    </mesh>
  );

  const bookmatchLR = fabrication.bookmatchDirection === "left-right";

  const countertopMeshes = fabrication.bookmatch
    ? bookmatchLR
      ? [
          renderSlabMesh([w / 2, thicknessM, depth], [cx - w / 4, centerY, centerZ], false, false, "a"),
          renderSlabMesh([w / 2, thicknessM, depth], [cx + w / 4, centerY, centerZ], true, false, "b"),
        ]
      : [
          renderSlabMesh([w, thicknessM, depth / 2], [cx, centerY, centerZ - depth / 4], false, false, "a"),
          renderSlabMesh([w, thicknessM, depth / 2], [cx, centerY, centerZ + depth / 4], false, true, "b"),
        ]
    : [renderSlabMesh([w, thicknessM, depth], [cx, centerY, centerZ], false, false, "main")];

  // Edge profile: a thin decorative strip along the front-top corner --
  // visible but subtle, not a full re-geometried chamfer/fillet.
  const frontZ = centerZ + depth / 2;
  const edgeMesh = (() => {
    if (fabrication.edgeProfile === "square") return null;
    if (fabrication.edgeProfile === "bullnose") {
      return (
        <mesh position={[cx, topY - thicknessM / 2, frontZ]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[thicknessM / 2, thicknessM / 2, w, 16, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color={surfaceDef.defaultColor} roughness={0.25} />
        </mesh>
      );
    }
    // eased / beveled -- a thin 45-degree chamfer strip.
    const size = fabrication.edgeProfile === "beveled" ? 0.02 : 0.012;
    return (
      <mesh position={[cx, topY - size * 0.4, frontZ - size * 0.4]} rotation={[Math.PI / 4, 0, 0]}>
        <boxGeometry args={[w, size, size]} />
        <meshStandardMaterial color="#F3EFE6" roughness={0.2} />
      </mesh>
    );
  })();

  // Waterfall: the same slab continuing straight down to the floor at the
  // selected end(s), same material/config, same thickness.
  const waterfallHeight = topY - thicknessM - floorY;
  const waterfallY = floorY + waterfallHeight / 2;
  const leftX = cx - w / 2 + thicknessM / 2;
  const rightX = cx + w / 2 - thicknessM / 2;
  const waterfalls = [];
  if ((fabrication.waterfall === "left" || fabrication.waterfall === "both") && waterfallHeight > 0) {
    waterfalls.push(renderSlabMesh([thicknessM, waterfallHeight, depth], [leftX, waterfallY, centerZ], false, false, "wf-left"));
  }
  if ((fabrication.waterfall === "right" || fabrication.waterfall === "both") && waterfallHeight > 0) {
    waterfalls.push(renderSlabMesh([thicknessM, waterfallHeight, depth], [rightX, waterfallY, centerZ], false, false, "wf-right"));
  }

  return (
    <group>
      {countertopMeshes}
      {edgeMesh}
      {waterfalls}
    </group>
  );
};

export default CountertopRenderer;
