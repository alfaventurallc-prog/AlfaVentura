"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { generateNormalMapFromImage } from "@/three/generateNormalMap";
import type { VisualizerProduct } from "../../../types";

export type Vec3 = [number, number, number];
export type HeroFace = "top" | "front" | "side";

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
const HERO_INDEX: Record<HeroFace, number> = { top: 2, front: 4, side: 1 };

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

  // Cover-fit: crop the photo to the face's own aspect ratio instead of
  // stretching it to fill, so the slab pattern keeps its real proportions.
  const img = texture.image as HTMLImageElement | undefined;
  if (img?.width && img?.height) {
    const faceWidth = heroFace === "side" ? args[2] : args[0];
    const faceHeight = heroFace === "top" ? args[2] : args[1];
    const faceAspect = faceWidth / faceHeight;
    const imageAspect = img.width / img.height;

    if (imageAspect > faceAspect) {
      const repeatX = faceAspect / imageAspect;
      texture.repeat.set(repeatX, 1);
      texture.offset.set((1 - repeatX) / 2, 0);
    } else {
      const repeatY = imageAspect / faceAspect;
      texture.repeat.set(1, repeatY);
      texture.offset.set(0, (1 - repeatY) / 2);
    }
  } else {
    texture.repeat.set(1, 1);
    texture.offset.set(0, 0);
  }
  texture.needsUpdate = true;

  // Derive a normal map from the product photo itself (no authored normal
  // map exists for any product) so the polished stone catches light with
  // real micro-surface variation instead of looking like a flat sticker.
  const normalMap = useMemo(() => {
    const img = texture.image as HTMLImageElement | undefined;
    if (!img || !img.width) return null;
    try {
      return generateNormalMapFromImage(img, 0.6);
    } catch {
      return null;
    }
  }, [texture]);

  useEffect(() => () => normalMap?.dispose(), [normalMap]);

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
            normalMap={normalMap ?? undefined}
            normalScale={normalMap ? new THREE.Vector2(0.45, 0.45) : undefined}
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

export const SolidBox = ({
  args,
  position,
  color = "#9B7040",
  roughness = 0.6,
  metalness = 0,
}: FaceProps & { color?: string; roughness?: number; metalness?: number }) => (
  <mesh position={position} castShadow receiveShadow>
    <boxGeometry args={args} />
    <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
  </mesh>
);
