"use client";

import { Suspense } from "react";
import { RoundedBox, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { VisualizerProduct } from "../../../types";

export type Vec3 = [number, number, number];

const DEFAULT_COLOR = "#E4DCCB";
const HIGHLIGHT_COLOR = "#C9A96E";

interface FaceProps {
  args: Vec3;
  position: Vec3;
  highlighted?: boolean;
}

const NeutralFace = ({ args, position, highlighted }: FaceProps) => (
  <RoundedBox
    args={args}
    radius={Math.min(0.02, args[1] / 3)}
    smoothness={4}
    position={position}
    castShadow
    receiveShadow
  >
    <meshStandardMaterial
      color={DEFAULT_COLOR}
      roughness={0.75}
      emissive={highlighted ? HIGHLIGHT_COLOR : "#000000"}
      emissiveIntensity={highlighted ? 0.12 : 0}
    />
  </RoundedBox>
);

const TexturedFace = ({
  product,
  args,
  position,
  highlighted,
}: FaceProps & { product: VisualizerProduct }) => {
  const texture = useTexture(product.image);
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
      <meshStandardMaterial
        map={texture}
        roughness={0.3}
        metalness={0.15}
        emissive={highlighted ? HIGHLIGHT_COLOR : "#000000"}
        emissiveIntensity={highlighted ? 0.1 : 0}
      />
    </RoundedBox>
  );
};

/**
 * A single "material slot" surface in a scene. Renders the given product's
 * photo as a texture, or a neutral stone-like default when nothing has been
 * picked for that slot yet. `highlighted` marks the currently active
 * application surface with a soft warm glow.
 */
export const MaterialSurface = ({ product, args, position, highlighted }: FaceProps & { product: VisualizerProduct | null }) => {
  if (!product) {
    return <NeutralFace args={args} position={position} highlighted={highlighted} />;
  }

  return (
    <Suspense fallback={<NeutralFace args={args} position={position} highlighted={highlighted} />}>
      <TexturedFace product={product} args={args} position={position} highlighted={highlighted} />
    </Suspense>
  );
};

export const SolidBox = ({ args, position, color = "#9B7040" }: FaceProps & { color?: string }) => (
  <mesh position={position} castShadow receiveShadow>
    <boxGeometry args={args} />
    <meshStandardMaterial color={color} roughness={0.65} />
  </mesh>
);
