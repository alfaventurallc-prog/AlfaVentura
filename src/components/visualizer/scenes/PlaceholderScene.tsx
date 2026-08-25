import { MaterialSurface, SolidBox } from "../MaterialSurface";
import { BackWall, Floor, SideWall } from "./roomParts";
import type { VisualizerProduct } from "../../../../types";

const WALL_COLOR = "#F0EBE1";
const BASE_COLOR = "#7A5520";

interface PlaceholderSceneProps {
  applicationId: string;
  materials: Record<string, VisualizerProduct | null>;
  activeApplication: string;
}

/**
 * Minimal starting scene for spaces that don't have a fully modeled room
 * yet (Dining / Living / Commercial) — a single surface on a simple base,
 * so every space in the picker is real and functional rather than a dead
 * button. Swap in a fuller scene here once one is built for that space.
 */
const PlaceholderScene = ({ applicationId, materials, activeApplication }: PlaceholderSceneProps) => (
  <group>
    <Floor />
    <BackWall color={WALL_COLOR} />
    <SideWall color={WALL_COLOR} x={-2} />

    <SolidBox args={[1.9, 0.72, 0.95]} position={[0, -0.66, 0]} color={BASE_COLOR} />
    <MaterialSurface
      product={materials[applicationId] ?? null}
      args={[2.05, 0.08, 1.05]}
      position={[0, -0.26, 0]}
      highlighted={activeApplication === applicationId}
    />
  </group>
);

export default PlaceholderScene;
