import { MaterialSurface, SolidBox } from "../MaterialSurface";
import { thicknessScale, type EdgeProfile, type ThicknessMm } from "@/data/kitchenCatalog";
import type { WaterfallOption } from "@/lib/visualizerUrlState";
import type { VisualizerProduct } from "../../../../types";

/**
 * Image Kitchen -- Layout B. A deliberately different composition from the
 * interactive 3D Kitchen (Layout A): one large single island facing a
 * full-height stone backsplash wall, dark minimal cabinetry, no sink/wall
 * run. Built for hero/editorial camera framing (Primary/Full/Detail), not
 * for orbiting around and configuring like the 3D kitchen is.
 */

const WALL_COLOR = "#EDE7DC";
const CABINET_COLOR = "#141210";

interface ImageKitchenSceneProps {
  countertopProduct: VisualizerProduct | null;
  backsplashProduct: VisualizerProduct | null;
  waterfall: WaterfallOption;
  thicknessMm: ThicknessMm;
  veinRotation: 0 | 90;
  edgeProfile: EdgeProfile;
}

const Room = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.85, 0]} receiveShadow>
      <planeGeometry args={[10, 8]} />
      <meshStandardMaterial color="#C9BFAE" roughness={0.45} />
    </mesh>
    {/* full-height backsplash/feature wall behind the island */}
    <mesh position={[0, 1.15, -1.1]}>
      <planeGeometry args={[5.6, 4]} />
      <meshStandardMaterial color={WALL_COLOR} roughness={1} />
    </mesh>
    <mesh position={[-2.9, 1.15, 0.6]} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[4, 4]} />
      <meshStandardMaterial color={WALL_COLOR} roughness={1} />
    </mesh>
  </group>
);

/** Floor-to-ceiling stone feature wall behind the island -- the editorial
 * centerpiece a presentation shot needs, unlike the small backsplash strip
 * in the interactive kitchen. */
const FeatureWall = ({ product }: { product: VisualizerProduct | null }) => (
  <MaterialSurface product={product} args={[3.6, 2.3, 0.05]} position={[0, 0.55, -1.07]} heroFace="front" />
);

const IslandDoor = ({ x }: { x: number }) => (
  <group>
    <SolidBox args={[0.62, 0.7, 0.03]} position={[x, -0.44, 0.42]} color={CABINET_COLOR} roughness={0.3} />
    <SolidBox args={[0.5, 0.01, 0.01]} position={[x, -0.16, 0.44]} color="#8A8579" roughness={0.3} metalness={0.4} />
  </group>
);

const Island = ({
  countertopProduct,
  waterfall,
  thicknessMm,
  veinRotation,
  edgeProfile,
}: {
  countertopProduct: VisualizerProduct | null;
  waterfall: WaterfallOption;
  thicknessMm: ThicknessMm;
  veinRotation: 0 | 90;
  edgeProfile: EdgeProfile;
}) => {
  const length = 2.6;
  const depth = 0.95;
  const topY = 0.09;
  const scale = thicknessScale(thicknessMm);
  const slabHeight = topY * scale;
  const waterfallThickness = 0.07 * scale;
  const leftOuterX = -length / 2 - 0.05;
  const rightOuterX = length / 2 + 0.05;

  return (
    <group>
      <SolidBox args={[length, 0.82, depth]} position={[0, -0.44, 0]} color={CABINET_COLOR} roughness={0.35} />
      <IslandDoor x={-0.75} />
      <IslandDoor x={-0.05} />
      <IslandDoor x={0.65} />
      <MaterialSurface
        product={countertopProduct}
        args={[length + 0.1, slabHeight, depth + 0.1]}
        position={[0, topY - slabHeight / 2, 0]}
        heroFace="top"
        veinRotationDeg={veinRotation}
      />
      {edgeProfile === "beveled" && (
        <mesh position={[0, topY - 0.01, depth / 2 + 0.04]} rotation={[Math.PI / 4, 0, 0]}>
          <boxGeometry args={[length + 0.1, 0.022, 0.022]} />
          <meshStandardMaterial color="#F3EFE6" roughness={0.2} />
        </mesh>
      )}
      {(waterfall === "left" || waterfall === "both") && (
        <MaterialSurface
          product={countertopProduct}
          args={[waterfallThickness, 0.82, depth + 0.1]}
          position={[leftOuterX + waterfallThickness / 2, -0.44, 0]}
          heroFace="side"
        />
      )}
      {(waterfall === "right" || waterfall === "both") && (
        <MaterialSurface
          product={countertopProduct}
          args={[waterfallThickness, 0.82, depth + 0.1]}
          position={[rightOuterX - waterfallThickness / 2, -0.44, 0]}
          heroFace="sideEnd"
        />
      )}
    </group>
  );
};

const PendantCluster = () => (
  <>
    {[-0.75, 0, 0.75].map((x) => (
      <group key={x} position={[x, 0, 0]}>
        <mesh position={[0, 1.7, 0]}>
          <cylinderGeometry args={[0.005, 0.005, 0.9, 6]} />
          <meshStandardMaterial color="#141210" roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.2, 0]} castShadow>
          <sphereGeometry args={[0.09, 20, 20]} />
          <meshStandardMaterial color="#141210" roughness={0.3} metalness={0.4} />
        </mesh>
        <mesh position={[0, 1.13, 0]}>
          <circleGeometry args={[0.06, 20]} />
          <meshStandardMaterial color="#FFE9C2" emissive="#FFD9A0" emissiveIntensity={1.3} toneMapped={false} />
        </mesh>
      </group>
    ))}
  </>
);

const ImageKitchenScene = ({
  countertopProduct,
  backsplashProduct,
  waterfall,
  thicknessMm,
  veinRotation,
  edgeProfile,
}: ImageKitchenSceneProps) => (
  <group>
    <Room />
    <FeatureWall product={backsplashProduct} />
    <Island
      countertopProduct={countertopProduct}
      waterfall={waterfall}
      thicknessMm={thicknessMm}
      veinRotation={veinRotation}
      edgeProfile={edgeProfile}
    />
    <PendantCluster />
  </group>
);

export default ImageKitchenScene;
