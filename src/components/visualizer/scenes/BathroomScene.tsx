import * as THREE from "three";
import { MaterialSurface, SolidBox } from "../MaterialSurface";
import { BackWall, Floor, SideWall } from "./roomParts";
import type { VisualizerProduct } from "../../../../types";

const WALL_COLOR = "#E7EEEF";
const DOOR_COLOR = "#7A5520";
const METAL_COLOR = "#B8B8B8";
const PORCELAIN_COLOR = "#FAF8F5";

interface BathroomSceneProps {
  materials: Record<string, VisualizerProduct | null>;
  activeApplication: string;
}

const BathroomScene = ({ materials, activeApplication }: BathroomSceneProps) => (
  <group>
    <Floor />
    <BackWall color={WALL_COLOR} />
    <SideWall color={WALL_COLOR} x={-1.7} />

    {/* vanity */}
    <SolidBox args={[2.1, 0.78, 0.5]} position={[-0.5, -0.47, -1.15]} />
    <SolidBox args={[0.9, 0.66, 0.02]} position={[-1.0, -0.47, -0.89]} color={DOOR_COLOR} />
    <SolidBox args={[0.9, 0.66, 0.02]} position={[0, -0.47, -0.89]} color={DOOR_COLOR} />
    <MaterialSurface
      product={materials.vanity ?? null}
      args={[2.26, 0.09, 0.56]}
      position={[-0.5, -0.005, -1.15]}
      highlighted={activeApplication === "vanity"}
    />

    {/* vessel basin */}
    <mesh position={[-0.5, 0.13, -1.13]} castShadow receiveShadow>
      <sphereGeometry args={[0.2, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color={PORCELAIN_COLOR} roughness={0.25} side={THREE.DoubleSide} />
    </mesh>

    {/* faucet */}
    <mesh position={[-0.5, 0.4, -1.3]} castShadow>
      <cylinderGeometry args={[0.018, 0.018, 0.4, 12]} />
      <meshStandardMaterial color={METAL_COLOR} roughness={0.2} metalness={0.8} />
    </mesh>
    <mesh position={[-0.5, 0.58, -1.2]} rotation={[Math.PI / 2.6, 0, 0]} castShadow>
      <cylinderGeometry args={[0.016, 0.016, 0.2, 12]} />
      <meshStandardMaterial color={METAL_COLOR} roughness={0.2} metalness={0.8} />
    </mesh>

    {/* mirror */}
    <mesh position={[-0.5, 0.95, -1.72]}>
      <planeGeometry args={[1.5, 0.95]} />
      <meshStandardMaterial color="#DCE7EA" roughness={0.05} metalness={0.3} />
    </mesh>

    {/* bathtub along the right wall */}
    <mesh position={[1.55, -0.72, 0.1]} castShadow receiveShadow>
      <boxGeometry args={[0.8, 0.55, 1.9]} />
      <meshStandardMaterial color={PORCELAIN_COLOR} roughness={0.3} />
    </mesh>
    <mesh position={[1.55, -0.48, 0.1]} receiveShadow>
      <boxGeometry args={[0.68, 0.14, 1.76]} />
      <meshStandardMaterial color="#CFE0E4" roughness={0.2} />
    </mesh>
  </group>
);

export default BathroomScene;
