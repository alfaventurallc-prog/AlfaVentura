"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, RoundedBox, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Finish } from "../../types";

type RoomId = "kitchen" | "bathroom";

const ROOMS: { id: RoomId; label: string }[] = [
  { id: "kitchen", label: "Kitchen" },
  { id: "bathroom", label: "Bathroom" },
];

const CABINET_COLOR = "#9B7040";
const CABINET_DOOR_COLOR = "#7A5520";
const KITCHEN_WALL_COLOR = "#F3EEE5";
const BATHROOM_WALL_COLOR = "#E7EEEF";
const FLOOR_COLOR = "#DDD3C4";
const METAL_COLOR = "#B8B8B8";
const PORCELAIN_COLOR = "#FAF8F5";

type Vec3 = [number, number, number];

const CountertopSlab = ({
  textureUrl,
  args,
  position,
}: {
  textureUrl: string;
  args: Vec3;
  position: Vec3;
}) => {
  const texture = useTexture(textureUrl);
  texture.colorSpace = THREE.SRGBColorSpace;

  return (
    <RoundedBox
      args={args}
      radius={Math.min(0.02, args[1] / 3)}
      smoothness={4}
      position={position}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial map={texture} roughness={0.35} metalness={0.15} />
    </RoundedBox>
  );
};

const SolidBox = ({ args, position, color = CABINET_COLOR }: { args: Vec3; position: Vec3; color?: string }) => (
  <mesh position={position} castShadow receiveShadow>
    <boxGeometry args={args} />
    <meshStandardMaterial color={color} roughness={0.65} />
  </mesh>
);

const Floor = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.06, 0]} receiveShadow>
    <planeGeometry args={[12, 12]} />
    <meshStandardMaterial color={FLOOR_COLOR} roughness={0.95} />
  </mesh>
);

const BackWall = ({ color }: { color: string }) => (
  <mesh position={[0, 0.9, -1.75]}>
    <planeGeometry args={[7, 4]} />
    <meshStandardMaterial color={color} roughness={1} />
  </mesh>
);

const SideWall = ({ color, x }: { color: string; x: number }) => (
  <mesh position={[x, 0.9, 0.4]} rotation={[0, Math.PI / 2, 0]}>
    <planeGeometry args={[4.3, 4]} />
    <meshStandardMaterial color={color} roughness={1} />
  </mesh>
);

const KitchenScene = ({ textureUrl }: { textureUrl: string }) => (
  <group>
    <Floor />
    <BackWall color={KITCHEN_WALL_COLOR} />
    <SideWall color={KITCHEN_WALL_COLOR} x={-2.2} />

    {/* base cabinet run */}
    <SolidBox args={[3.8, 0.85, 0.62]} position={[0.1, -0.425, -1.05]} />
    {[-1.55, -0.6, 0.35, 1.3].map((x, i) => (
      <SolidBox key={i} args={[0.85, 0.72, 0.02]} position={[x, -0.425, -0.75]} color={CABINET_DOOR_COLOR} />
    ))}
    <CountertopSlab textureUrl={textureUrl} args={[3.96, 0.09, 0.7]} position={[0.1, 0.045, -1.05]} />

    {/* upper cabinets + backsplash */}
    <SolidBox args={[3.8, 0.55, 0.3]} position={[0.1, 1.15, -1.6]} />
    <CountertopSlab textureUrl={textureUrl} args={[3.96, 0.55, 0.05]} position={[0.1, 0.365, -1.375]} />

    {/* sink cutout */}
    <mesh position={[0.1, 0.095, -1.0]}>
      <boxGeometry args={[0.55, 0.02, 0.35]} />
      <meshStandardMaterial color="#2B2724" roughness={0.4} />
    </mesh>

    {/* island */}
    <SolidBox args={[1.7, 0.85, 0.85]} position={[-0.1, -0.425, 0.55]} />
    <SolidBox args={[0.75, 0.72, 0.02]} position={[-0.1, -0.425, 0.98]} color={CABINET_DOOR_COLOR} />
    <CountertopSlab textureUrl={textureUrl} args={[1.86, 0.1, 1.0]} position={[-0.1, 0.05, 0.55]} />

    {/* bar stool at the island */}
    <group position={[-0.1, -0.65, 1.25]}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.06, 24]} />
        <meshStandardMaterial color={CABINET_DOOR_COLOR} roughness={0.5} />
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

const BathroomScene = ({ textureUrl }: { textureUrl: string }) => (
  <group>
    <Floor />
    <BackWall color={BATHROOM_WALL_COLOR} />
    <SideWall color={BATHROOM_WALL_COLOR} x={-1.7} />

    {/* vanity */}
    <SolidBox args={[2.1, 0.78, 0.5]} position={[-0.5, -0.47, -1.15]} />
    <SolidBox args={[0.9, 0.66, 0.02]} position={[-1.0, -0.47, -0.89]} color={CABINET_DOOR_COLOR} />
    <SolidBox args={[0.9, 0.66, 0.02]} position={[0, -0.47, -0.89]} color={CABINET_DOOR_COLOR} />
    <CountertopSlab textureUrl={textureUrl} args={[2.26, 0.09, 0.56]} position={[-0.5, -0.005, -1.15]} />

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
    <RoundedBox args={[0.8, 0.55, 1.9]} radius={0.08} smoothness={4} position={[1.55, -0.72, 0.1]} castShadow receiveShadow>
      <meshStandardMaterial color={PORCELAIN_COLOR} roughness={0.3} />
    </RoundedBox>
    <RoundedBox args={[0.68, 0.14, 1.76]} radius={0.06} smoothness={4} position={[1.55, -0.48, 0.1]} receiveShadow>
      <meshStandardMaterial color="#CFE0E4" roughness={0.2} />
    </RoundedBox>
  </group>
);

const ROOM_COMPONENTS: Record<RoomId, (props: { textureUrl: string }) => React.JSX.Element> = {
  kitchen: KitchenScene,
  bathroom: BathroomScene,
};

const Slab3DViewer = ({ finishes }: { finishes: Finish[] }) => {
  const [room, setRoom] = useState<RoomId>("kitchen");
  const [finish, setFinish] = useState(finishes[0]);

  const RoomComponent = ROOM_COMPONENTS[room];

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        {ROOMS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRoom(r.id)}
            className={`px-5 py-2 rounded-full text-sm font-semibold border transition-colors ${
              room === r.id
                ? "bg-[#9B7040] text-white border-[#9B7040]"
                : "bg-white text-[#57534E] border-[#E8DDD0] hover:border-[#9B7040]"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="relative w-full h-[65vh] min-h-[420px] max-h-[600px] rounded-2xl overflow-hidden bg-[#EDE6DA] border border-[#E8DDD0]">
        <Canvas shadows camera={{ position: [5.2, 2.6, 5.6], fov: 45 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 6, 4]} intensity={1.2} castShadow />
          <Suspense fallback={null}>
            <RoomComponent textureUrl={finish.image} />
            <Environment preset="apartment" />
          </Suspense>
          <OrbitControls
            enablePan={false}
            minDistance={3}
            maxDistance={10}
            maxPolarAngle={Math.PI / 2.05}
            autoRotate={false}
          />
        </Canvas>

        <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-[#78716C] bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-full">
          Drag to rotate · Pinch or scroll to zoom
        </p>
      </div>

      <p className="text-center text-sm font-semibold text-[#44403C] mt-8 mb-3">
        Choose one of your products to see it installed
      </p>
      <div className="flex items-center gap-4 overflow-x-auto px-2 pb-2">
        {finishes.map((f) => (
          <button
            key={f.name}
            type="button"
            onClick={() => setFinish(f)}
            className="flex flex-col items-center gap-2 shrink-0"
          >
            <span
              className={`block w-16 h-16 rounded-xl bg-cover bg-center border-2 transition-colors ${
                finish.name === f.name ? "border-[#9B7040]" : "border-transparent"
              }`}
              style={{ backgroundImage: `url(${f.image})` }}
            />
            <span
              className={`text-xs font-semibold text-center max-w-[80px] leading-tight ${
                finish.name === f.name ? "text-[#9B7040]" : "text-[#57534E]"
              }`}
            >
              {f.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Slab3DViewer;
