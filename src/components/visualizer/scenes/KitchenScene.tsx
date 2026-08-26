import * as THREE from "three";
import { MaterialSurface, SolidBox } from "../MaterialSurface";
import { BackWall, Floor, SideWall } from "./roomParts";
import type { LayoutId } from "@/data/kitchenCatalog";
import type { VisualizerProduct } from "../../../../types";

const WALL_COLOR = "#EFEAE0";
const DOOR_COLOR = "#3C332B";
const HANDLE_COLOR = "#9C9691";
const STEEL_COLOR = "#C7C9CA";

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

/** Flush 4-burner cooktop set into the countertop. */
const Hob = ({ x, z }: { x: number; z: number }) => (
  <group>
    <mesh position={[x, 0.096, z]}>
      <boxGeometry args={[0.56, 0.012, 0.5]} />
      <meshStandardMaterial color="#12100E" roughness={0.15} metalness={0.2} />
    </mesh>
    {[
      [-0.14, -0.11],
      [0.14, -0.11],
      [-0.14, 0.11],
      [0.14, 0.11],
    ].map(([dx, dz], i) => (
      <mesh key={i} position={[x + dx, 0.103, z + dz]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.05, 0.065, 24]} />
        <meshStandardMaterial color={STEEL_COLOR} roughness={0.3} metalness={0.7} />
      </mesh>
    ))}
  </group>
);

/** Base-height dishwasher front with a control strip. */
const Dishwasher = ({ x, z }: { x: number; z: number }) => (
  <group>
    <SolidBox args={[0.82, 0.72, 0.035]} position={[x, -0.425, z]} color={STEEL_COLOR} roughness={0.35} />
    <SolidBox args={[0.7, 0.03, 0.012]} position={[x, -0.09, z + 0.03]} color="#3A3D3E" roughness={0.4} />
  </group>
);

/** Tall floor-to-upper-cabinet unit: oven (with window) + microwave + pantry doors above. */
const OvenTower = ({ x, z }: { x: number; z: number }) => (
  <group>
    <SolidBox args={[0.82, 2.55, 0.62]} position={[x, 0.215, z]} color={DOOR_COLOR} roughness={0.55} />
    {/* oven door + window */}
    <SolidBox args={[0.74, 0.68, 0.03]} position={[x, -0.62, z + 0.31]} color="#26221D" roughness={0.3} />
    <mesh position={[x, -0.6, z + 0.325]}>
      <boxGeometry args={[0.5, 0.32, 0.008]} />
      <meshStandardMaterial color="#0B0B0C" roughness={0.1} metalness={0.3} />
    </mesh>
    <SolidBox args={[0.5, 0.02, 0.012]} position={[x, -0.3, z + 0.33]} color={STEEL_COLOR} roughness={0.3} />
    {/* microwave */}
    <SolidBox args={[0.74, 0.34, 0.03]} position={[x, 0.16, z + 0.31]} color="#26221D" roughness={0.3} />
    <SolidBox args={[0.55, 0.2, 0.008]} position={[x, 0.16, z + 0.325]} color="#0B0B0C" roughness={0.1} metalness={0.2} />
    {/* pantry doors up top */}
    <CabinetDoor x={x} z={z + 0.31} width={0.74} y={0.75} height={0.55} />
    <CabinetDoor x={x} z={z + 0.31} width={0.74} y={1.34} height={0.55} />
  </group>
);

/** Tall stainless refrigerator with a vertical handle. */
const Fridge = ({ x, z }: { x: number; z: number }) => (
  <group>
    <SolidBox args={[0.85, 2.55, 0.68]} position={[x, 0.215, z]} color={STEEL_COLOR} roughness={0.4} />
    <SolidBox args={[0.02, 1.9, 0.02]} position={[x - 0.3, 0.4, z + 0.35]} color="#8E9294" roughness={0.25} metalness={0.6} />
    <SolidBox args={[0.7, 0.012, 0.012]} position={[x, -0.5, z + 0.345]} color="#7C7F80" roughness={0.4} />
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
  withHob = false,
  withDishwasher = false,
}: {
  width: number;
  centerX: number;
  z: number;
  cabinetColor: string;
  countertopProduct: VisualizerProduct | null;
  backsplashProduct: VisualizerProduct | null;
  withUpper?: boolean;
  withSink?: boolean;
  withHob?: boolean;
  withDishwasher?: boolean;
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
        </>
      )}

      {withSink && <SinkFaucet x={centerX} z={z + 0.05} />}
      {withHob && <Hob x={centerX + width * 0.21} z={z} />}
      {withDishwasher && <Dishwasher x={centerX - width * 0.15} z={z + 0.28} />}
    </group>
  );
};

const Island = ({ cabinetColor, countertopProduct }: { cabinetColor: string; countertopProduct: VisualizerProduct | null }) => (
  <group>
    <SolidBox args={[1.7, 0.85, 0.85]} position={[-0.1, -0.425, 0.55]} color={cabinetColor} roughness={0.55} />
    <CabinetDoor x={-0.1} z={0.965} width={0.72} color={cabinetColor === DOOR_COLOR ? "#2A241E" : DOOR_COLOR} />
    <MaterialSurface product={countertopProduct} args={[1.86, 0.1, 1.0]} position={[-0.1, 0.05, 0.55]} heroFace="top" />
    {/* waterfall side -- the same slab continuing down the left end */}
    <MaterialSurface product={countertopProduct} args={[0.06, 0.85, 0.9]} position={[-0.98, -0.425, 0.55]} heroFace="side" />

    {/* pendant lights */}
    {[-0.55, -0.1, 0.35].map((x, i) => (
      <group key={i} position={[x, 0, 0.35]}>
        <mesh position={[0, 1.15, 0]}>
          <cylinderGeometry args={[0.006, 0.006, 0.75, 6]} />
          <meshStandardMaterial color="#2A2620" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.75, 0]}>
          <coneGeometry args={[0.11, 0.14, 20, 1, true]} />
          <meshStandardMaterial color="#3C332B" roughness={0.3} metalness={0.4} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.68, 0]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshStandardMaterial color="#FFE9C2" emissive="#FFCB80" emissiveIntensity={0.6} roughness={0.4} />
        </mesh>
      </group>
    ))}

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
    <SideWall color={WALL_COLOR} x={-2.2} />

    {layout === "island" && (
      <>
        <WallRun
          width={3.8}
          centerX={0.1}
          z={-1.05}
          cabinetColor={cabinetColor}
          countertopProduct={countertopProduct}
          backsplashProduct={backsplashProduct}
          withHob
          withDishwasher
        />
        <OvenTower x={1.75} z={-1.05} />
        <Fridge x={-1.6} z={-1.05} />
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
          withHob
          withDishwasher
        />
        <OvenTower x={1.75} z={-1.05} />
        {/* perpendicular return along the left wall, forming the L */}
        <group position={[-1.9, 0, -0.15]} rotation={[0, Math.PI / 2, 0]}>
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
          <Fridge x={0.55} z={0} />
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
          withHob
        />
        <OvenTower x={1.75} z={-1.05} />
        <WallRun
          width={3.4}
          centerX={0.1}
          z={0.95}
          cabinetColor={cabinetColor}
          countertopProduct={countertopProduct}
          backsplashProduct={null}
          withUpper={false}
          withSink={false}
          withDishwasher
        />
        <Fridge x={-1.5} z={0.95} />
      </>
    )}
  </group>
);

export default KitchenScene;
