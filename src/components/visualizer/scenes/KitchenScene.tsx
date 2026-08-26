import * as THREE from "three";
import { MaterialSurface, SolidBox } from "../MaterialSurface";
import { BackWall, Floor, SideWall, Window } from "./roomParts";
import type { LayoutId } from "@/data/kitchenCatalog";
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
}

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
const Fridge = ({ x, z }: { x: number; z: number }) => {
  const width = 0.9;
  const depth = 0.72;
  const height = 1.95;
  const bodyY = -0.85 + height / 2;
  const topY = -0.85 + height;

  return (
    <group>
      <SolidBox args={[width, height, depth]} position={[x, bodyY, z]} color="#C7CBCE" roughness={0.35} metalness={0.55} />
      {/* seam between the two French doors */}
      <SolidBox args={[0.01, height - 0.06, 0.01]} position={[x, bodyY, z + depth / 2 + 0.005]} color="#8E9296" roughness={0.4} metalness={0.4} />
      {/* door handles */}
      <SolidBox args={[0.02, height * 0.55, 0.03]} position={[x - width * 0.14, bodyY + 0.05, z + depth / 2 + 0.02]} color="#5B5F63" roughness={0.25} metalness={0.6} />
      <SolidBox args={[0.02, height * 0.55, 0.03]} position={[x + width * 0.14, bodyY + 0.05, z + depth / 2 + 0.02]} color="#5B5F63" roughness={0.25} metalness={0.6} />
      {/* slim top trim so it reads as built-in rather than a floating box */}
      <SolidBox args={[width + 0.02, 0.02, depth + 0.02]} position={[x, topY - 0.01, z]} color="#B3B7BA" roughness={0.3} metalness={0.5} />
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
const UnderCabinetLight = ({ x, z, width }: { x: number; z: number; width: number }) => (
  <mesh position={[x, 0.86, z]}>
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
}: {
  width: number;
  centerX: number;
  z: number;
  cabinetColor: string;
  countertopProduct: VisualizerProduct | null;
  backsplashProduct: VisualizerProduct | null;
  withUpper?: boolean;
  withSink?: boolean;
}) => {
  const doorCount = Math.max(2, Math.round(width / 0.95));
  const doorWidth = width / doorCount - 0.1;
  const doorXs = Array.from({ length: doorCount }, (_, i) => centerX - width / 2 + width / doorCount * (i + 0.5));

  return (
    <group>
      <SolidBox args={[width, 0.85, 0.62]} position={[centerX, -0.425, z]} color={cabinetColor} roughness={0.55} />
      {doorXs.map((x, i) => (
        <CabinetDoor key={i} x={x} z={z + 0.31 - 0.03} width={doorWidth} color={cabinetColor === DOOR_COLOR ? "#2A241E" : DOOR_COLOR} />
      ))}
      <MaterialSurface product={countertopProduct} args={[width + 0.16, 0.09, 0.7]} position={[centerX, 0.045, z]} heroFace="top" />

      {withUpper && (
        <>
          <SolidBox args={[width, 0.55, 0.3]} position={[centerX, 1.15, z - 0.55]} color={cabinetColor} roughness={0.55} />
          {doorXs.map((x, i) => (
            <CabinetDoor key={i} x={x} z={z - 0.67} width={doorWidth} y={1.15} height={0.45} color={cabinetColor === DOOR_COLOR ? "#2A241E" : DOOR_COLOR} />
          ))}
          <MaterialSurface product={backsplashProduct} args={[width + 0.16, 0.55, 0.05]} position={[centerX, 0.365, z - 0.325]} heroFace="front" />
          <UnderCabinetLight x={centerX} z={z - 0.42} width={width} />
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

const Island = ({ cabinetColor, countertopProduct }: { cabinetColor: string; countertopProduct: VisualizerProduct | null }) => (
  <group>
    <SolidBox args={[1.7, 0.85, 0.85]} position={[-0.1, -0.425, 0.55]} color={cabinetColor} roughness={0.55} />
    <CabinetDoor x={-0.1} z={0.965} width={0.72} color={cabinetColor === DOOR_COLOR ? "#2A241E" : DOOR_COLOR} />
    <MaterialSurface product={countertopProduct} args={[1.86, 0.1, 1.0]} position={[-0.1, 0.05, 0.55]} heroFace="top" />
    {/* waterfall side -- the same slab continuing down the left end. Depth and
        outer-face x match the top slab exactly so the two surfaces meet flush
        at the mitre line instead of leaving a visible lip/step. */}
    <MaterialSurface product={countertopProduct} args={[0.06, 0.85, 1.0]} position={[-1.0, -0.425, 0.55]} heroFace="side" />
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

const KitchenScene = ({
  layout,
  mirrored,
  cabinetColor,
  countertopProduct,
  backsplashProduct,
  floorColor,
  floorRoughness,
}: KitchenSceneProps) => (
  <group scale={[mirrored ? -1 : 1, 1, 1]}>
    <Floor color={floorColor} roughness={floorRoughness} />
    <BackWall color={WALL_COLOR} />
    <SideWall color={WALL_COLOR} x={-2.7} />
    <Window x={-2.68} z={0.6} />
    {/* free-standing fridge just past the main run's right end, on every layout */}
    <Fridge x={2.55} z={-1.05} />

    {layout === "island" && (
      <>
        <WallRun
          width={3.8}
          centerX={0.1}
          z={-1.05}
          cabinetColor={cabinetColor}
          countertopProduct={countertopProduct}
          backsplashProduct={backsplashProduct}
        />
        <Island cabinetColor={cabinetColor} countertopProduct={countertopProduct} />
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
        />
      </>
    )}
  </group>
);

export default KitchenScene;
