import { MaterialSurface, SolidBox } from "../MaterialSurface";
import { BackWall, Floor, SideWall } from "./roomParts";
import type { VisualizerProduct } from "../../../../types";

const WALL_COLOR = "#F3EEE5";
const DOOR_COLOR = "#7A5520";
const METAL_COLOR = "#B8B8B8";

interface KitchenSceneProps {
  materials: Record<string, VisualizerProduct | null>;
  activeApplication: string;
}

const KitchenScene = ({ materials, activeApplication }: KitchenSceneProps) => (
  <group>
    <Floor />
    <BackWall color={WALL_COLOR} />
    <SideWall color={WALL_COLOR} x={-2.2} />

    {/* base cabinet run */}
    <SolidBox args={[3.8, 0.85, 0.62]} position={[0.1, -0.425, -1.05]} />
    {[-1.55, -0.6, 0.35, 1.3].map((x, i) => (
      <SolidBox key={i} args={[0.85, 0.72, 0.02]} position={[x, -0.425, -0.75]} color={DOOR_COLOR} />
    ))}
    <MaterialSurface
      product={materials.countertop ?? null}
      args={[3.96, 0.09, 0.7]}
      position={[0.1, 0.045, -1.05]}
      highlighted={activeApplication === "countertop"}
    />

    {/* upper cabinets + backsplash */}
    <SolidBox args={[3.8, 0.55, 0.3]} position={[0.1, 1.15, -1.6]} />
    <MaterialSurface
      product={materials.backsplash ?? null}
      args={[3.96, 0.55, 0.05]}
      position={[0.1, 0.365, -1.375]}
      highlighted={activeApplication === "backsplash"}
    />

    {/* sink cutout */}
    <mesh position={[0.1, 0.095, -1.0]}>
      <boxGeometry args={[0.55, 0.02, 0.35]} />
      <meshStandardMaterial color="#2B2724" roughness={0.4} />
    </mesh>

    {/* island */}
    <SolidBox args={[1.7, 0.85, 0.85]} position={[-0.1, -0.425, 0.55]} />
    <SolidBox args={[0.75, 0.72, 0.02]} position={[-0.1, -0.425, 0.98]} color={DOOR_COLOR} />
    <MaterialSurface
      product={materials.island ?? null}
      args={[1.86, 0.1, 1.0]}
      position={[-0.1, 0.05, 0.55]}
      highlighted={activeApplication === "island"}
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
          <meshStandardMaterial color={METAL_COLOR} roughness={0.3} metalness={0.6} />
        </mesh>
      ))}
    </group>
  </group>
);

export default KitchenScene;
