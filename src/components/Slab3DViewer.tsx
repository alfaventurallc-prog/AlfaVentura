"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, RoundedBox, useTexture } from "@react-three/drei";
import * as THREE from "three";

const FINISHES = [
  { name: "Calacatta", image: "/quartz-calacatta-series.webp" },
  { name: "Carrara", image: "/quartz-carrara-series.webp" },
  { name: "Basic", image: "/quartz-basic-series.webp" },
  { name: "Multi Exotic", image: "/quartz-multi-exotic.webp" },
];

type SceneId = "cabinets" | "quartz-slab-designs" | "vanities" | "fabricated-countertops-vanities";

const SCENES: { id: SceneId; label: string }[] = [
  { id: "cabinets", label: "Cabinets" },
  { id: "quartz-slab-designs", label: "Quartz Slab Designs" },
  { id: "vanities", label: "Vanities" },
  { id: "fabricated-countertops-vanities", label: "Fabricated Countertops & Vanities" },
];

const CABINET_COLOR = "#9B7040";
const CABINET_DOOR_COLOR = "#7A5520";
const WALL_COLOR = "#F3EEE5";
const FLOOR_COLOR = "#DDD3C4";
const METAL_COLOR = "#B8B8B8";

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
    <RoundedBox args={args} radius={Math.min(0.02, args[1] / 3)} smoothness={4} position={position} castShadow receiveShadow>
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
    <planeGeometry args={[10, 10]} />
    <meshStandardMaterial color={FLOOR_COLOR} roughness={0.95} />
  </mesh>
);

const BackWall = () => (
  <mesh position={[0, 0.7, -1.1]}>
    <planeGeometry args={[6, 3.4]} />
    <meshStandardMaterial color={WALL_COLOR} roughness={1} />
  </mesh>
);

const KitchenCabinetsScene = ({ textureUrl }: { textureUrl: string }) => (
  <group>
    <Floor />
    <BackWall />
    <SolidBox args={[3.2, 0.85, 0.62]} position={[0, -0.425, 0]} />
    {[-1.05, 0, 1.05].map((x, i) => (
      <SolidBox key={i} args={[0.95, 0.72, 0.02]} position={[x, -0.425, 0.32]} color={CABINET_DOOR_COLOR} />
    ))}
    <CountertopSlab textureUrl={textureUrl} args={[3.36, 0.09, 0.7]} position={[0, 0.045, 0]} />
    <CountertopSlab textureUrl={textureUrl} args={[3.36, 0.55, 0.05]} position={[0, 0.365, -0.325]} />
  </group>
);

const KitchenCounterScene = ({ textureUrl }: { textureUrl: string }) => (
  <group>
    <Floor />
    <BackWall />
    <SolidBox args={[3.2, 0.85, 0.62]} position={[0, -0.425, 0]} color={CABINET_COLOR} />
    {[-1.05, 0, 1.05].map((x, i) => (
      <SolidBox key={i} args={[0.95, 0.72, 0.02]} position={[x, -0.425, 0.32]} color={CABINET_DOOR_COLOR} />
    ))}
    {/* upper cabinets */}
    <SolidBox args={[3.2, 0.55, 0.3]} position={[0, 1.15, -0.95]} color={CABINET_COLOR} />
    <CountertopSlab textureUrl={textureUrl} args={[3.36, 0.09, 0.7]} position={[0, 0.045, 0]} />
    {/* sink cutout hint */}
    <mesh position={[0, 0.095, 0.05]}>
      <boxGeometry args={[0.55, 0.02, 0.35]} />
      <meshStandardMaterial color="#2B2724" roughness={0.4} />
    </mesh>
    <CountertopSlab textureUrl={textureUrl} args={[3.36, 0.55, 0.05]} position={[0, 0.365, -0.325]} />
  </group>
);

const VanityScene = ({ textureUrl }: { textureUrl: string }) => (
  <group>
    <Floor />
    <BackWall />
    <SolidBox args={[2.1, 0.78, 0.5]} position={[0, -0.47, 0]} />
    <SolidBox args={[0.9, 0.66, 0.02]} position={[-0.5, -0.47, 0.26]} color={CABINET_DOOR_COLOR} />
    <SolidBox args={[0.9, 0.66, 0.02]} position={[0.5, -0.47, 0.26]} color={CABINET_DOOR_COLOR} />
    <CountertopSlab textureUrl={textureUrl} args={[2.26, 0.09, 0.56]} position={[0, -0.005, 0]} />
    {/* vessel basin */}
    <mesh position={[0, 0.13, 0.02]} castShadow receiveShadow>
      <sphereGeometry args={[0.22, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#FAF8F5" roughness={0.25} side={THREE.DoubleSide} />
    </mesh>
    {/* faucet */}
    <mesh position={[0, 0.42, -0.16]} castShadow>
      <cylinderGeometry args={[0.02, 0.02, 0.42, 12]} />
      <meshStandardMaterial color={METAL_COLOR} roughness={0.2} metalness={0.8} />
    </mesh>
    <mesh position={[0, 0.61, -0.06]} rotation={[Math.PI / 2.6, 0, 0]} castShadow>
      <cylinderGeometry args={[0.018, 0.018, 0.22, 12]} />
      <meshStandardMaterial color={METAL_COLOR} roughness={0.2} metalness={0.8} />
    </mesh>
    {/* mirror */}
    <mesh position={[0, 0.95, -1.08]}>
      <planeGeometry args={[1.6, 1]} />
      <meshStandardMaterial color="#DCE7EA" roughness={0.05} metalness={0.3} />
    </mesh>
  </group>
);

const IslandScene = ({ textureUrl }: { textureUrl: string }) => (
  <group>
    <Floor />
    <BackWall />
    <SolidBox args={[2.4, 0.85, 1.1]} position={[0, -0.425, 0.4]} />
    {[-0.75, 0, 0.75].map((x, i) => (
      <SolidBox key={i} args={[0.7, 0.72, 0.02]} position={[x, -0.425, 0.96]} color={CABINET_DOOR_COLOR} />
    ))}
    <CountertopSlab textureUrl={textureUrl} args={[2.6, 0.1, 1.3]} position={[0, 0.05, 0.4]} />
    {/* simple bar stool */}
    <group position={[0, -0.65, 1.15]}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.06, 24]} />
        <meshStandardMaterial color={CABINET_DOOR_COLOR} roughness={0.5} />
      </mesh>
      {[[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0, z]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.68, 8]} />
          <meshStandardMaterial color={METAL_COLOR} roughness={0.3} metalness={0.6} />
        </mesh>
      ))}
    </group>
  </group>
);

const SCENE_COMPONENTS: Record<SceneId, (props: { textureUrl: string }) => React.JSX.Element> = {
  cabinets: KitchenCabinetsScene,
  "quartz-slab-designs": KitchenCounterScene,
  vanities: VanityScene,
  "fabricated-countertops-vanities": IslandScene,
};

const Slab3DViewer = () => {
  const [scene, setScene] = useState<SceneId>("quartz-slab-designs");
  const [finish, setFinish] = useState(FINISHES[0]);

  const SceneComponent = SCENE_COMPONENTS[scene];

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        {SCENES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setScene(s.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
              scene === s.id
                ? "bg-[#9B7040] text-white border-[#9B7040]"
                : "bg-white text-[#57534E] border-[#E8DDD0] hover:border-[#9B7040]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="relative w-full h-[60vh] min-h-[380px] max-h-[560px] rounded-2xl overflow-hidden bg-[#EDE6DA] border border-[#E8DDD0]">
        <Canvas shadows camera={{ position: [3.6, 2.1, 3.6], fov: 42 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 6, 4]} intensity={1.2} castShadow />
          <Suspense fallback={null}>
            <SceneComponent textureUrl={finish.image} />
            <Environment preset="apartment" />
          </Suspense>
          <OrbitControls
            enablePan={false}
            minDistance={2.2}
            maxDistance={7}
            maxPolarAngle={Math.PI / 2.05}
            autoRotate
            autoRotateSpeed={1}
          />
        </Canvas>

        <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-[#78716C] bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-full">
          Drag to rotate · Pinch or scroll to zoom
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
        {FINISHES.map((f) => (
          <button
            key={f.name}
            type="button"
            onClick={() => setFinish(f)}
            className="flex flex-col items-center gap-2"
          >
            <span
              className={`block w-16 h-16 rounded-xl bg-cover bg-center border-2 transition-colors ${
                finish.name === f.name ? "border-[#9B7040]" : "border-transparent"
              }`}
              style={{ backgroundImage: `url(${f.image})` }}
            />
            <span
              className={`text-xs font-semibold ${
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
