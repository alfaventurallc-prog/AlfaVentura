const DEFAULT_FLOOR_COLOR = "#DDD3C4";

export const Floor = ({ color = DEFAULT_FLOOR_COLOR, roughness = 0.95 }: { color?: string; roughness?: number }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.06, 0]} receiveShadow>
    <planeGeometry args={[12, 12]} />
    <meshStandardMaterial color={color} roughness={roughness} />
  </mesh>
);

export const BackWall = ({ color }: { color: string }) => (
  <mesh position={[0, 0.9, -1.75]}>
    <planeGeometry args={[7, 4]} />
    <meshStandardMaterial color={color} roughness={1} />
  </mesh>
);

export const SideWall = ({ color, x }: { color: string; x: number }) => (
  <mesh position={[x, 0.9, 0.4]} rotation={[0, Math.PI / 2, 0]}>
    <planeGeometry args={[5.3, 4]} />
    <meshStandardMaterial color={color} roughness={1} />
  </mesh>
);

/**
 * A simple window set into the side wall -- a bare wall with nothing on it
 * reads as a stage backdrop rather than a room. Sky-tinted "glass" plane
 * plus a thin frame sitting just proud of the wall face.
 */
export const Window = ({ x, z = 0.5, y = 1.35 }: { x: number; z?: number; y?: number }) => (
  <group position={[x, y, z]} rotation={[0, Math.PI / 2, 0]}>
    <mesh>
      <planeGeometry args={[1.15, 1.0]} />
      <meshStandardMaterial color="#CFE3EC" roughness={0.15} metalness={0.1} emissive="#DCEEF5" emissiveIntensity={0.25} />
    </mesh>
    <mesh position={[0, 0, 0.001]}>
      <planeGeometry args={[0.04, 1.0]} />
      <meshStandardMaterial color="#F5F1E8" roughness={0.6} />
    </mesh>
    <mesh position={[0, 0, 0.001]}>
      <planeGeometry args={[1.15, 0.04]} />
      <meshStandardMaterial color="#F5F1E8" roughness={0.6} />
    </mesh>
    <mesh position={[0, 0, -0.005]}>
      <planeGeometry args={[1.27, 1.12]} />
      <meshStandardMaterial color="#F5F1E8" roughness={0.6} />
    </mesh>
  </group>
);
