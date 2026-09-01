import * as THREE from "three";
import { MaterialSurface, SolidBox } from "../MaterialSurface";
import { BackWall, Floor, SideWall, Window } from "./roomParts";
import type { LayoutId, ThicknessMm, EdgeProfile } from "@/data/kitchenCatalog";
import { thicknessScale } from "@/data/kitchenCatalog";
import type { WaterfallOption } from "@/lib/visualizerUrlState";
import type { VisualizerProduct } from "../../../../types";

const WALL_COLOR = "#EFEAE0";
const DOOR_COLOR = "#3C332B";
const HANDLE_COLOR = "#9C9691";

interface KitchenSceneProps {
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
}

/** Visual approximation of a 45-degree chamfer along a slab's front-top
 * corner -- a true bevel needs custom (non-box) geometry, this is a thin
 * diagonal strip that reads as a soft chamfer highlight without one. */
const BevelEdge = ({ length, centerX, topY, frontZ }: { length: number; centerX: number; topY: number; frontZ: number }) => (
  <mesh position={[centerX, topY - 0.01, frontZ - 0.01]} rotation={[Math.PI / 4, 0, 0]}>
    <boxGeometry args={[length, 0.02, 0.02]} />
    <meshStandardMaterial color="#F3EFE6" roughness={0.2} metalness={0} />
  </mesh>
);

const CabinetDoor = ({
  x,
  z,
  width,
  y = -0.425,
  height = 0.72,
  color = DOOR_COLOR,
}: {
  x: number;
  z: number;
  width: number;
  y?: number;
  height?: number;
  color?: string;
}) => (
  <group>
    <SolidBox args={[width, height, 0.035]} position={[x, y, z]} color={color} roughness={0.4} />
    <SolidBox args={[width - 0.06, 0.012, 0.012]} position={[x, y + height / 2 - 0.05, z + 0.03]} color={HANDLE_COLOR} roughness={0.3} />
  </group>
);

/** Stainless-steel, French-door style fridge -- a tall body plus a thin
 * centre seam and two vertical bar handles so it clearly reads as a fridge
 * rather than a plain box. */
const Fridge = ({ x, z, facing = 0 }: { x: number; z: number; facing?: number }) => {
  const width = 0.9;
  const depth = 0.72;
  const height = 1.95;
  const bodyY = -0.85 + height / 2;
  const topY = -0.85 + height;

  return (
    <group position={[x, 0, z]} rotation={[0, facing, 0]}>
      <SolidBox args={[width, height, depth]} position={[0, bodyY, 0]} color="#C7CBCE" roughness={0.35} metalness={0.55} />
      {/* seam between the two French doors */}
      <SolidBox args={[0.01, height - 0.06, 0.01]} position={[0, bodyY, depth / 2 + 0.005]} color="#8E9296" roughness={0.4} metalness={0.4} />
      {/* door handles */}
      <SolidBox args={[0.02, height * 0.55, 0.03]} position={[-width * 0.14, bodyY + 0.05, depth / 2 + 0.02]} color="#5B5F63" roughness={0.25} metalness={0.6} />
      <SolidBox args={[0.02, height * 0.55, 0.03]} position={[width * 0.14, bodyY + 0.05, depth / 2 + 0.02]} color="#5B5F63" roughness={0.25} metalness={0.6} />
      {/* slim top trim so it reads as built-in rather than a floating box */}
      <SolidBox args={[width + 0.02, 0.02, depth + 0.02]} position={[0, topY - 0.01, 0]} color="#B3B7BA" roughness={0.3} metalness={0.5} />
    </group>
  );
};

const SinkFaucet = ({ x, z }: { x: number; z: number }) => (
  <>
    <mesh position={[x, 0.09, z]}>
      <boxGeometry args={[0.55, 0.03, 0.35]} />
      <meshStandardMaterial color="#B9BCBE" roughness={0.25} metalness={0.6} />
    </mesh>
    <mesh position={[x, 0.35, z - 0.32]} castShadow>
      <cylinderGeometry args={[0.016, 0.016, 0.32, 12]} />
      <meshStandardMaterial color={HANDLE_COLOR} roughness={0.2} metalness={0.7} />
    </mesh>
    <mesh position={[x, 0.49, z - 0.22]} rotation={[Math.PI / 2.4, 0, 0]} castShadow>
      <cylinderGeometry args={[0.014, 0.014, 0.18, 12]} />
      <meshStandardMaterial color={HANDLE_COLOR} roughness={0.2} metalness={0.7} />
    </mesh>
  </>
);

/** Small warm LED line under the upper cabinets -- reads as ambient task
 * lighting over the counter, a strong "this is a real kitchen" cue. */
const UnderCabinetLight = ({ x, z, width, y = 0.86 }: { x: number; z: number; width: number; y?: number }) => (
  <mesh position={[x, y, z]}>
    <boxGeometry args={[width - 0.1, 0.015, 0.02]} />
    <meshStandardMaterial color="#FFE9C2" emissive="#FFD9A0" emissiveIntensity={1.4} roughness={0.5} toneMapped={false} />
  </mesh>
);

/** A bowl of fruit + cutting board resting on a countertop -- small lived-in
 * details that make an empty slab read as a used kitchen counter. */
const CountertopDecor = ({ x, z, topY }: { x: number; z: number; topY: number }) => (
  <group position={[x, topY, z]}>
    <mesh position={[-0.05, 0.015, 0]} castShadow>
      <boxGeometry args={[0.34, 0.02, 0.24]} />
      <meshStandardMaterial color="#9C7A4D" roughness={0.5} />
    </mesh>
    <mesh position={[0.32, 0.045, 0.02]} castShadow>
      <cylinderGeometry args={[0.11, 0.09, 0.06, 20]} />
      <meshStandardMaterial color="#EDEAE2" roughness={0.3} />
    </mesh>
    {[
      ["#C9432B", 0.3, 0.09, -0.01],
      ["#D9A62E", 0.35, 0.095, 0.04],
      ["#8FA85C", 0.29, 0.095, 0.06],
    ].map(([color, px, py, pz], i) => (
      <mesh key={i} position={[Number(px), Number(py), Number(pz)]} castShadow>
        <sphereGeometry args={[0.045, 14, 14]} />
        <meshStandardMaterial color={color as string} roughness={0.4} />
      </mesh>
    ))}
  </group>
);

/** Back-wall run: base cabinets + countertop + upper cabinets + backsplash + sink. */
const WallRun = ({
  width,
  centerX,
  z,
  cabinetColor,
  countertopProduct,
  backsplashProduct,
  withUpper = true,
  withSink = true,
  thicknessMm = 20,
  veinRotation = 0,
  edgeProfile = "square",
}: {
  width: number;
  centerX: number;
  z: number;
  cabinetColor: string;
  countertopProduct: VisualizerProduct | null;
  backsplashProduct: VisualizerProduct | null;
  withUpper?: boolean;
  withSink?: boolean;
  thicknessMm?: ThicknessMm;
  veinRotation?: 0 | 90;
  edgeProfile?: EdgeProfile;
}) => {
  const doorCount = Math.max(2, Math.round(width / 0.95));
  const doorWidth = width / doorCount - 0.1;
  const doorXs = Array.from({ length: doorCount }, (_, i) => centerX - width / 2 + width / doorCount * (i + 0.5));
  // Top surface stays at a fixed height regardless of thickness -- the extra
  // material extends downward, like a real slab measured from its top face.
  const topY = 0.09;
  const slabHeight = topY * thicknessScale(thicknessMm);

  return (
    <group>
      <SolidBox args={[width, 0.85, 0.62]} position={[centerX, -0.425, z]} color={cabinetColor} roughness={0.55} />
      {doorXs.map((x, i) => (
        <CabinetDoor key={i} x={x} z={z + 0.31 - 0.03} width={doorWidth} color={cabinetColor === DOOR_COLOR ? "#2A241E" : DOOR_COLOR} />
      ))}
      <MaterialSurface
        product={countertopProduct}
        args={[width + 0.16, slabHeight, 0.7]}
        position={[centerX, topY - slabHeight / 2, z]}
        heroFace="top"
        veinRotationDeg={veinRotation}
      />
      {edgeProfile === "beveled" && <BevelEdge length={width + 0.16} centerX={centerX} topY={topY} frontZ={z + 0.35} />}

      {withUpper && (
        <>
          <SolidBox args={[width, 0.55, 0.3]} position={[centerX, 1.15, z - 0.55]} color={cabinetColor} roughness={0.55} />
          {doorXs.map((x, i) => (
            <CabinetDoor key={i} x={x} z={z - 0.67} width={doorWidth} y={1.15} height={0.45} color={cabinetColor === DOOR_COLOR ? "#2A241E" : DOOR_COLOR} />
          ))}
          {/* Backsplash spans the full countertop-to-upper-cabinet height
              (0.09 to 0.875) and its depth now extends back to z-0.4 to
              physically touch the upper cabinet's front face (also z-0.4) --
              it previously stopped 0.05 units short in depth, leaving a gap
              you could see through to the wall behind (the bright seam). */}
          <MaterialSurface product={backsplashProduct} args={[width + 0.16, 0.785, 0.1]} position={[centerX, 0.4825, z - 0.35]} heroFace="front" />
          <UnderCabinetLight x={centerX} z={z - 0.42} width={width} y={0.865} />
        </>
      )}

      {withSink && <SinkFaucet x={centerX} z={z + 0.05} />}
      {withSink && <CountertopDecor x={centerX + width / 2 - 0.55} z={z} topY={0.09} />}
    </group>
  );
};

const PendantLight = ({ x, z }: { x: number; z: number }) => (
  <group position={[x, 0, z]}>
    <mesh position={[0, 1.55, 0]}>
      <cylinderGeometry args={[0.006, 0.006, 0.7, 6]} />
      <meshStandardMaterial color="#2A241E" roughness={0.4} />
    </mesh>
    <mesh position={[0, 1.16, 0]} castShadow>
      <cylinderGeometry args={[0.1, 0.13, 0.16, 24, 1, true]} />
      <meshStandardMaterial color="#2A241E" roughness={0.35} metalness={0.3} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, 1.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.1, 24]} />
      <meshStandardMaterial color="#FFE9C2" emissive="#FFD9A0" emissiveIntensity={1.2} toneMapped={false} />
    </mesh>
  </group>
);

const Island = ({
  cabinetColor,
  countertopProduct,
  waterfall,
  thicknessMm = 20,
  veinRotation = 0,
  edgeProfile = "square",
}: {
  cabinetColor: string;
  countertopProduct: VisualizerProduct | null;
  waterfall: WaterfallOption;
  thicknessMm?: ThicknessMm;
  veinRotation?: 0 | 90;
  edgeProfile?: EdgeProfile;
}) => {
  const topY = 0.1;
  const scale = thicknessScale(thicknessMm);
  const slabHeight = topY * scale;
  // The waterfall panel's own thickness (how chunky the slab edge reads)
  // scales the same way as the top, so both stay visually one slab.
  const waterfallThickness = 0.06 * scale;
  const leftOuterX = -1.03;
  const rightOuterX = 0.83;

  return (
    <group>
      <SolidBox args={[1.7, 0.85, 0.85]} position={[-0.1, -0.425, 0.55]} color={cabinetColor} roughness={0.55} />
      <CabinetDoor x={-0.1} z={0.965} width={0.72} color={cabinetColor === DOOR_COLOR ? "#2A241E" : DOOR_COLOR} />
      <MaterialSurface
        product={countertopProduct}
        args={[1.86, slabHeight, 1.0]}
        position={[-0.1, topY - slabHeight / 2, 0.55]}
        heroFace="top"
        veinRotationDeg={veinRotation}
      />
      {edgeProfile === "beveled" && <BevelEdge length={1.86} centerX={-0.1} topY={topY} frontZ={1.05} />}
      {/* waterfall edges -- the same slab continuing down the selected end(s).
          Depth and outer-face x match the top slab exactly so the two surfaces
          meet flush at the mitre line instead of leaving a visible lip/step.
          Left and right panels use identical args/y/z, mirrored in x, so
          "both" is perfectly symmetrical. */}
      {(waterfall === "left" || waterfall === "both") && (
        <MaterialSurface
          product={countertopProduct}
          args={[waterfallThickness, 0.85, 1.0]}
          position={[leftOuterX + waterfallThickness / 2, -0.425, 0.55]}
          heroFace="side"
        />
      )}
      {(waterfall === "right" || waterfall === "both") && (
        <MaterialSurface
          product={countertopProduct}
          args={[waterfallThickness, 0.85, 1.0]}
          position={[rightOuterX - waterfallThickness / 2, -0.425, 0.55]}
          heroFace="sideEnd"
        />
      )}
      <CountertopDecor x={-0.55} z={0.35} topY={0.1} />
      <PendantLight x={0.25} z={0.35} />
      <PendantLight x={-0.5} z={0.35} />

      <group position={[-0.1, -0.65, 1.25]}>
        <mesh position={[0, 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.06, 24]} />
          <meshStandardMaterial color={DOOR_COLOR} roughness={0.5} />
        </mesh>
        {[
          [-0.14, -0.14],
          [0.14, -0.14],
          [-0.14, 0.14],
          [0.14, 0.14],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 0, z]} castShadow>
            <cylinderGeometry args={[0.014, 0.014, 0.68, 8]} />
            <meshStandardMaterial color={HANDLE_COLOR} roughness={0.3} metalness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

const KitchenScene = ({
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
}: KitchenSceneProps) => (
  <group scale={[mirrored ? -1 : 1, 1, 1]}>
    <Floor color={floorColor} roughness={floorRoughness} />
    <BackWall color={WALL_COLOR} />
    <SideWall color={WALL_COLOR} x={-2.7} />
    <Window x={-2.68} z={0.6} />
    {/* free-standing fridge along the side wall, clear of the island/L-shape
        return leg footprint and positioned so it actually sits inside the
        default camera frame (the earlier spot past the main run's right end
        was outside the view frustum entirely). */}
    <Fridge x={-2.15} z={1.35} facing={Math.PI / 2} />

    {layout === "island" && (
      <>
        <WallRun
          width={3.8}
          centerX={0.1}
          z={-1.05}
          cabinetColor={cabinetColor}
          countertopProduct={countertopProduct}
          backsplashProduct={backsplashProduct}
          thicknessMm={thicknessMm}
          veinRotation={veinRotation}
          edgeProfile={edgeProfile}
        />
        <Island
          cabinetColor={cabinetColor}
          countertopProduct={countertopProduct}
          waterfall={waterfall}
          thicknessMm={thicknessMm}
          veinRotation={veinRotation}
          edgeProfile={edgeProfile}
        />
      </>
    )}

    {layout === "lshape" && (
      <>
        <WallRun
          width={3.8}
          centerX={0.1}
          z={-1.05}
          cabinetColor={cabinetColor}
          countertopProduct={countertopProduct}
          backsplashProduct={backsplashProduct}
          thicknessMm={thicknessMm}
          veinRotation={veinRotation}
          edgeProfile={edgeProfile}
        />
        {/* perpendicular return along the left wall, forming the L. Positioned
            so its countertop footprint sits just short of the main run's
            countertop edge -- the two used to overlap in 3D, which z-fought
            and looked like a broken, messy seam at the inside corner. */}
        <group position={[-2.27, 0, -0.15]} rotation={[0, Math.PI / 2, 0]}>
          <WallRun
            width={1.7}
            centerX={0}
            z={0}
            cabinetColor={cabinetColor}
            countertopProduct={countertopProduct}
            backsplashProduct={backsplashProduct}
            withUpper={false}
            withSink={false}
            thicknessMm={thicknessMm}
            veinRotation={veinRotation}
            edgeProfile={edgeProfile}
          />
        </group>
      </>
    )}

    {layout === "galley" && (
      <>
        <WallRun
          width={3.8}
          centerX={0.1}
          z={-1.05}
          cabinetColor={cabinetColor}
          countertopProduct={countertopProduct}
          backsplashProduct={backsplashProduct}
          thicknessMm={thicknessMm}
          veinRotation={veinRotation}
          edgeProfile={edgeProfile}
        />
        <WallRun
          width={3.4}
          centerX={0.1}
          z={0.95}
          cabinetColor={cabinetColor}
          countertopProduct={countertopProduct}
          backsplashProduct={null}
          withUpper={false}
          withSink={false}
          thicknessMm={thicknessMm}
          veinRotation={veinRotation}
          edgeProfile={edgeProfile}
        />
      </>
    )}
  </group>
);

export default KitchenScene;
