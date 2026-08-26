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
