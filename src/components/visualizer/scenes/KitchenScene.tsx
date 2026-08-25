import { MaterialSurface, SolidBox } from "../MaterialSurface";
import { BackWall, Floor, SideWall } from "./roomParts";
import type { VisualizerProduct } from "../../../../types";

const WALL_COLOR = "#EFEAE0";
const CARCASS_COLOR = "#D8C9AE";
const DOOR_COLOR = "#3C332B";
const HANDLE_COLOR = "#9C9691";

interface KitchenSceneProps {
  materials: Record<string, VisualizerProduct | null>;
  activeApplication: string;
}

const CabinetDoor = ({ x, z, width, y = -0.425, height = 0.72 }: { x: number; z: number; width: number; y?: number; height?: number }) => (
  <group>
    <SolidBox args={[width, height, 0.035]} position={[x, y, z]} color={DOOR_COLOR} roughness={0.4} />
    {/* handleless reveal groove: a slim recessed strip along the top edge */}
    <SolidBox args={[width - 0.06, 0.012, 0.012]} position={[x, y + height / 2 - 0.05, z + 0.03]} color={HANDLE_COLOR} roughness={0.3} />
  </group>
);

const KitchenScene = ({ materials, activeApplication }: KitchenSceneProps) => (
  <group>
    <Floor />
    <BackWall color={WALL_COLOR} />
    <SideWall color={WALL_COLOR} x={-2.2} />

    {/* base cabinet run */}
    <SolidBox args={[3.8, 0.85, 0.62]} position={[0.1, -0.425, -1.05]} color={CARCASS_COLOR} roughness={0.55} />
    {[-1.55, -0.6, 0.35, 1.3].map((x, i) => (
      <CabinetDoor key={i} x={x} z={-0.72} width={0.82} />
    ))}
    <MaterialSurface
      product={materials.countertop ?? null}
      args={[3.96, 0.09, 0.7]}
      position={[0.1, 0.045, -1.05]}
      highlighted={activeApplication === "countertop"}
      heroFace="top"
    />

    {/* upper cabinets + backsplash */}
    <SolidBox args={[3.8, 0.55, 0.3]} position={[0.1, 1.15, -1.6]} color={CARCASS_COLOR} roughness={0.55} />
    {[-1.55, -0.6, 0.35, 1.3].map((x, i) => (
      <CabinetDoor key={i} x={x} z={-1.42} width={0.82} y={1.15} height={0.45} />
    ))}
    <MaterialSurface
      product={materials.backsplash ?? null}
      args={[3.96, 0.55, 0.05]}
      position={[0.1, 0.365, -1.375]}
      highlighted={activeApplication === "backsplash"}
      heroFace="front"
    />

    {/* sink + faucet */}
    <mesh position={[0.1, 0.09, -1.0]}>
      <boxGeometry args={[0.55, 0.03, 0.35]} />
      <meshStandardMaterial color="#B9BCBE" roughness={0.25} metalness={0.6} />
    </mesh>
    <mesh position={[0.1, 0.35, -1.32]} castShadow>
      <cylinderGeometry args={[0.016, 0.016, 0.32, 12]} />
      <meshStandardMaterial color={HANDLE_COLOR} roughness={0.2} metalness={0.7} />
    </mesh>
    <mesh position={[0.1, 0.49, -1.22]} rotation={[Math.PI / 2.4, 0, 0]} castShadow>
      <cylinderGeometry args={[0.014, 0.014, 0.18, 12]} />
      <meshStandardMaterial color={HANDLE_COLOR} roughness={0.2} metalness={0.7} />
    </mesh>

    {/* island */}
    <SolidBox args={[1.7, 0.85, 0.85]} position={[-0.1, -0.425, 0.55]} color={CARCASS_COLOR} roughness={0.55} />
    <CabinetDoor x={-0.1} z={0.965} width={0.72} />
    <MaterialSurface
      product={materials.island ?? null}
      args={[1.86, 0.1, 1.0]}
      position={[-0.1, 0.05, 0.55]}
      highlighted={activeApplication === "island"}
      heroFace="top"
    />

    {/* bar stool at the island */}
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

export default KitchenScene;
