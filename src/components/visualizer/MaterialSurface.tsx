"use client";

import { Suspense } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { VisualizerProduct } from "../../../types";

export type Vec3 = [number, number, number];
export type HeroFace = "top" | "front";

const DEFAULT_COLOR = "#EDE8DD";
const EDGE_COLOR = "#E9E4D8";
const HIGHLIGHT_COLOR = "#C9A96E";

interface FaceProps {
  args: Vec3;
  position: Vec3;
  highlighted?: boolean;
  /** Which face of the box is the visible "hero" surface the texture goes on. */
  heroFace?: HeroFace;
}

const NeutralFace = ({ args, position, highlighted }: FaceProps) => (
  <mesh position={position} castShadow receiveShadow>
    <boxGeometry args={args} />
    <meshStandardMaterial
      color={DEFAULT_COLOR}
      roughness={0.7}
      emissive={highlighted ? HIGHLIGHT_COLOR : "#000000"}
      emissiveIntensity={highlighted ? 0.12 : 0}
    />
  </mesh>
);

/** Box material-array index for each face: [+X, -X, +Y, -Y, +Z, -Z]. */
const HERO_INDEX: Record<HeroFace, number> = { top: 2, front: 4 };

const TexturedFace = ({
  product,
  args,
  position,
  highlighted,
  heroFace = "top",
}: FaceProps & { product: VisualizerProduct }) => {
  const texture = useTexture(product.image);
  // Clamp (not repeat) so one full slab photo spans the hero face once,
  // instead of tiling into small repeating stripes.
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(1, 1);
  texture.needsUpdate = true;

  const heroIndex = HERO_INDEX[heroFace];
  const edgeEmissive = highlighted ? HIGHLIGHT_COLOR : "#000000";
  const edgeEmissiveIntensity = highlighted ? 0.08 : 0;

  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      {[0, 1, 2, 3, 4, 5].map((i) =>
        i === heroIndex ? (
          <meshStandardMaterial
            key={i}
            attach={`material-${i}`}
            map={texture}
            roughness={0.22}
            metalness={0}
            emissive={highlighted ? HIGHLIGHT_COLOR : "#000000"}
            emissiveIntensity={highlighted ? 0.06 : 0}
          />
        ) : (
          <meshStandardMaterial
            key={i}
            attach={`material-${i}`}
            color={EDGE_COLOR}
            roughness={0.45}
            metalness={0}
            emissive={edgeEmissive}
            emissiveIntensity={edgeEmissiveIntensity}
          />
        )
      )}
    </mesh>
  );
};

/**
 * A single "material slot" surface in a scene. Renders the given product's
 * photo as a texture on its hero face only (top for a horizontal slab,
 * front for a vertical panel like a backsplash) with the other faces kept
 * a neutral edge tone — the alternative, one texture wrapped uniformly
 * over every face, is what caused thin edge faces to show a squished,
 * repeating slice of the image. Falls back to a neutral stone-like
 * default when nothing has been picked for that slot yet.
 * `highlighted` marks the currently active application surface with a
 * soft warm glow.
 */
export const MaterialSurface = ({
  product,
  args,
  position,
  highlighted,
  heroFace = "top",
}: FaceProps & { product: VisualizerProduct | null }) => {
  if (!product) {
    return <NeutralFace args={args} position={position} highlighted={highlighted} />;
  }

  return (
    <Suspense fallback={<NeutralFace args={args} position={position} highlighted={highlighted} />}>
      <TexturedFace product={product} args={args} position={position} highlighted={highlighted} heroFace={heroFace} />
    </Suspense>
  );
};

export const SolidBox = ({ args, position, color = "#9B7040", roughness = 0.6 }: FaceProps & { color?: string; roughness?: number }) => (
  <mesh position={position} castShadow receiveShadow>
    <boxGeometry args={args} />
    <meshStandardMaterial color={color} roughness={roughness} metalness={0} />
  </mesh>
);
