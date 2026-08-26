import { MaterialSurface, SolidBox } from "../MaterialSurface";
import { BackWall, Floor, SideWall } from "./roomParts";
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
        </>
      )}

      {withSink && <SinkFaucet x={centerX} z={z + 0.05} />}
    </group>
  );
};

const Island = ({ cabinetColor, countertopProduct }: { cabinetColor: string; countertopProduct: VisualizerProduct | null }) => (
  <group>
    <SolidBox args={[1.7, 0.85, 0.85]} position={[-0.1, -0.425, 0.55]} color={cabinetColor} roughness={0.55} />
    <CabinetDoor x={-0.1} z={0.965} width={0.72} color={cabinetColor === DOOR_COLOR ? "#2A241E" : DOOR_COLOR} />
    <MaterialSurface product={countertopProduct} args={[1.86, 0.1, 1.0]} position={[-0.1, 0.05, 0.55]} heroFace="top" />
    {/* waterfall side -- the same slab continuing down the left end. Depth and
        outer-face x match the top slab exactly so the two surfaces meet flush
        at the mitre line instead of leaving a visible lip/step. */}
    <MaterialSurface product={countertopProduct} args={[0.06, 0.85, 1.0]} position={[-1.0, -0.425, 0.55]} heroFace="side" />

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
