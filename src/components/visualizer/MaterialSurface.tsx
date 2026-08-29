"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { generateNormalMapFromImage } from "@/three/generateNormalMap";
import { extractAverageColor } from "@/three/extractAverageColor";
import type { VisualizerProduct } from "../../../types";

export type Vec3 = [number, number, number];
/** "side" is the -X face, "sideEnd" is the +X face -- e.g. a waterfall edge
 * on the near end of an island vs. the matching one on the far end. */
export type HeroFace = "top" | "front" | "side" | "sideEnd";

const DEFAULT_COLOR = "#EDE8DD";
const EDGE_COLOR = "#E9E4D8";
const HIGHLIGHT_COLOR = "#C9A96E";

interface FaceProps {
  args: Vec3;
  position: Vec3;
  highlighted?: boolean;
  /** Which face of the box is the visible "hero" surface the texture goes on. */
  heroFace?: HeroFace;
  /** Rotates the slab's vein/pattern in-plane (0 = as photographed, 90 = turned a quarter-turn) -- a texture transform, not a fake per-product attribute. */
  veinRotationDeg?: number;
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
const HERO_INDEX: Record<HeroFace, number> = { top: 2, front: 4, side: 1, sideEnd: 0 };

/** Darken a "#rrggbb" hex color by the given factor (0-1, lower = darker). */
const shade = (hex: string, factor: number): string => {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const r = clamp(((n >> 16) & 0xff) * factor);
  const g = clamp(((n >> 8) & 0xff) * factor);
  const b = clamp((n & 0xff) * factor);
  const toHex = (v: number) => v.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const TexturedFace = ({
  product,
  args,
  position,
  highlighted,
  heroFace = "top",
  veinRotationDeg = 0,
}: FaceProps & { product: VisualizerProduct }) => {
  const texture = useTexture(product.image);
  // Clamp (not repeat) so one full slab photo spans the hero face once,
  // instead of tiling into small repeating stripes.
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  // A quarter-turn on the vein swaps which face dimension the image's own
  // width/height should cover-fit against.
  const rotated = Math.abs(veinRotationDeg % 180) === 90;

  // Cover-fit: crop the photo to the face's own aspect ratio instead of
  // stretching it to fill, so the slab pattern keeps its real proportions.
  const img = texture.image as HTMLImageElement | undefined;
  if (img?.width && img?.height) {
    const rawFaceWidth = heroFace === "side" || heroFace === "sideEnd" ? args[2] : args[0];
    const rawFaceHeight = heroFace === "top" ? args[2] : args[1];
    const faceWidth = rotated ? rawFaceHeight : rawFaceWidth;
    const faceHeight = rotated ? rawFaceWidth : rawFaceHeight;
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
  texture.center.set(0.5, 0.5);
  texture.rotation = THREE.MathUtils.degToRad(veinRotationDeg);
  texture.needsUpdate = true;

  // Derive a normal map from the product photo itself (no authored normal
  // map exists for any product) so the polished stone catches light with
  // real micro-surface variation instead of looking like a flat sticker.
  const normalMap = useMemo(() => {
    const img = texture.image as HTMLImageElement | undefined;
    if (!img || !img.width) return null;
    try {
      const map = generateNormalMapFromImage(img, 0.6);
      // Keep the bump detail aligned with the (possibly rotated) color map.
      map.wrapS = texture.wrapS;
      map.wrapT = texture.wrapT;
      map.repeat.copy(texture.repeat);
      map.offset.copy(texture.offset);
      map.center.copy(texture.center);
      map.rotation = texture.rotation;
      map.needsUpdate = true;
      return map;
    } catch {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texture, veinRotationDeg]);

  useEffect(() => () => normalMap?.dispose(), [normalMap]);

  // The other 5 faces of the box (the slab's edge/cross-section) can't show
  // the full photo without stretching -- but a flat, unrelated cream tone
  // there reads as a jarring mismatched seam wherever two edge faces meet at
  // a corner. Tinting them from the same photo's own average color instead
  // keeps the edge visually part of the same slab.
  const edgeColor = useMemo(() => {
    const img = texture.image as HTMLImageElement | undefined;
    if (!img?.width) return EDGE_COLOR;
    try {
      return shade(extractAverageColor(img), 0.85);
    } catch {
      return EDGE_COLOR;
    }
  }, [texture]);

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
            color={edgeColor}
            roughness={0.35}
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
  veinRotationDeg = 0,
}: FaceProps & { product: VisualizerProduct | null }) => {
  if (!product) {
    return <NeutralFace args={args} position={position} highlighted={highlighted} />;
  }

  return (
    <Suspense fallback={<NeutralFace args={args} position={position} highlighted={highlighted} />}>
      <TexturedFace
        product={product}
        args={args}
        position={position}
        highlighted={highlighted}
        heroFace={heroFace}
        veinRotationDeg={veinRotationDeg}
      />
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
