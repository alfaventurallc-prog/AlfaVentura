"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, RoundedBox, useTexture } from "@react-three/drei";
import * as THREE from "three";

const DESIGNS = [
  { name: "Calacatta", image: "/quartz-calacatta-series.webp" },
  { name: "Carrara", image: "/quartz-carrara-series.webp" },
  { name: "Basic", image: "/quartz-basic-series.webp" },
  { name: "Multi Exotic", image: "/quartz-multi-exotic.webp" },
];

const Slab = ({ textureUrl }: { textureUrl: string }) => {
  const texture = useTexture(textureUrl);
  texture.colorSpace = THREE.SRGBColorSpace;

  return (
    <RoundedBox args={[3.2, 0.14, 2]} radius={0.03} smoothness={4} castShadow receiveShadow>
      <meshStandardMaterial map={texture} roughness={0.35} metalness={0.15} />
    </RoundedBox>
  );
};

const Slab3DViewer = () => {
  const [selected, setSelected] = useState(DESIGNS[0]);

  return (
    <div className="w-full">
      <div className="relative w-full h-[60vh] min-h-[380px] max-h-[560px] rounded-2xl overflow-hidden bg-[#EDE6DA] border border-[#E8DDD0]">
        <Canvas shadows camera={{ position: [3.5, 2.6, 3.5], fov: 40 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 6, 4]} intensity={1.2} castShadow />
          <Suspense fallback={null}>
            <Slab textureUrl={selected.image} />
            <Environment preset="apartment" />
          </Suspense>
          <OrbitControls
            enablePan={false}
            minDistance={2.5}
            maxDistance={7}
            autoRotate
            autoRotateSpeed={1.2}
          />
        </Canvas>

        <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-[#78716C] bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-full">
          Drag to rotate · Pinch or scroll to zoom
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
        {DESIGNS.map((design) => (
          <button
            key={design.name}
            type="button"
            onClick={() => setSelected(design)}
            className="flex flex-col items-center gap-2"
          >
            <span
              className={`block w-16 h-16 rounded-xl bg-cover bg-center border-2 transition-colors ${
                selected.name === design.name ? "border-[#9B7040]" : "border-transparent"
              }`}
              style={{ backgroundImage: `url(${design.image})` }}
            />
            <span
              className={`text-xs font-semibold ${
                selected.name === design.name ? "text-[#9B7040]" : "text-[#57534E]"
              }`}
            >
              {design.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Slab3DViewer;
