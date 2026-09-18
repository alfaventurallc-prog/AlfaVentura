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

/** World-space XZ bounding box of an entire multi-segment countertop run
 * (e.g. the L-shape's main run + return leg together). When passed to a
 * "top" face, that face's crop is computed as its own sub-window of ONE
 * shared crop of the photo across the whole box, instead of each segment
 * independently cover-fitting the photo to just its own dimensions -- so
 * the veining/pattern actually flows continuously across the seam between
 * two separate meshes instead of each one showing an unrelated crop of
 * the same photo (which reads as two different slabs even when the
 * geometry itself touches with zero gap). */
export interface WorldTopUV {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

interface FaceProps {
  args: Vec3;
  position: Vec3;
  highlighted?: boolean;
  /** Which face of the box is the visible "hero" surface the texture goes on. */
  heroFace?: HeroFace;
  /** Rotates the slab's vein/pattern in-plane (0 = as photographed, 90 = turned a quarter-turn) -- a texture transform, not a fake per-product attribute. */
  veinRotationDeg?: number;
  /** See WorldTopUV. Only meaningful for heroFace="top". */
  worldTopUV?: WorldTopUV;
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

/** Cover-fit crop a texture against a given face size -- always a single,
 * uncropped-looking continuous image via ClampToEdgeWrapping, never tiled.
 * This used to switch to RepeatWrapping (with repeat > 1) once a face's
 * aspect ratio diverged enough from the photo's own aspect ratio, which
 * visibly repeated the same image side-by-side -- reading as multiple
 * separate stretched panels instead of one continuous slab. Now every
 * face always gets exactly one crop of the photo (repeat pinned to 1,1),
 * accepting some horizontal/vertical crop on very elongated faces instead
 * of ever tiling. Mutates `tex` in place. */
const fitTextureToFace = (tex: THREE.Texture, faceWidth: number, faceHeight: number, imageAspect: number) => {
  const faceAspect = faceWidth / faceHeight;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;

  if (imageAspect > faceAspect) {
    // Photo is wider than the face -- crop its left/right edges, keep full height.
    const repeatX = faceAspect / imageAspect;
    tex.repeat.set(repeatX, 1);
    tex.offset.set((1 - repeatX) / 2, 0);
  } else {
    // Photo is taller than the face -- crop its top/bottom edges, keep full width.
    const repeatY = imageAspect / faceAspect;
    tex.repeat.set(1, repeatY);
    tex.offset.set(0, (1 - repeatY) / 2);
  }
  tex.center.set(0.5, 0.5);
  tex.needsUpdate = true;
};

/** Same cover-fit-crop idea as fitTextureToFace, but computed against a
 * shared world-space bounding box (see WorldTopUV) instead of this one
 * face's own dimensions -- first works out the single crop the whole box
 * would get, then carves out just this face's own sub-rectangle of that
 * crop based on where it sits (in world X/Z) inside the box. Two faces
 * that together tile the box (e.g. the L-shape's two countertop meshes)
 * end up sampling adjoining, correctly-oriented slices of the exact same
 * crop, so the pattern reads as continuous across the seam between them. */
const fitTextureToSharedBox = (tex: THREE.Texture, position: Vec3, args: Vec3, box: WorldTopUV, imageAspect: number) => {
  const boxWidth = box.maxX - box.minX;
  const boxHeight = box.maxZ - box.minZ;
  const boxAspect = boxWidth / boxHeight;

  let repeat0X = 1;
  let repeat0Y = 1;
  let offset0X = 0;
  let offset0Y = 0;
  if (imageAspect > boxAspect) {
    repeat0X = boxAspect / imageAspect;
    offset0X = (1 - repeat0X) / 2;
  } else {
    repeat0Y = imageAspect / boxAspect;
    offset0Y = (1 - repeat0Y) / 2;
  }

  const faceMinX = position[0] - args[0] / 2;
  const faceMinZ = position[2] - args[2] / 2;
  const fracXStart = (faceMinX - box.minX) / boxWidth;
  const fracXSpan = args[0] / boxWidth;
  const fracZStart = (faceMinZ - box.minZ) / boxHeight;
  const fracZSpan = args[2] / boxHeight;

  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.repeat.set(repeat0X * fracXSpan, repeat0Y * fracZSpan);
  tex.offset.set(offset0X + repeat0X * fracXStart, offset0Y + repeat0Y * fracZStart);
  tex.center.set(0.5, 0.5);
  tex.needsUpdate = true;
};

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
  worldTopUV,
}: FaceProps & { product: VisualizerProduct }) => {
  const texture = useTexture(product.image);
  texture.colorSpace = THREE.SRGBColorSpace;

  // A quarter-turn on the vein swaps which face dimension the image's own
  // width/height should cover-fit against.
  const rotated = Math.abs(veinRotationDeg % 180) === 90;

  // Cover-fit: crop the photo to the face's own aspect ratio instead of
  // stretching it to fill, so the slab pattern keeps its real proportions.
  // On a face MUCH wider than the photo (a long countertop run), a single
  // clamped crop stretches that one photo thin across the whole width and
  // the veining goes flat/washed-out -- repeat it sideways instead, the
  // same way a real run that long would actually need more than one slab
  // width, rather than one image stretched to fit.
  const img = texture.image as HTMLImageElement | undefined;
  const imageAspect = img?.width && img?.height ? img.width / img.height : 1;
  const rawFaceWidth = heroFace === "side" || heroFace === "sideEnd" ? args[2] : args[0];
  const rawFaceHeight = heroFace === "top" ? args[2] : args[1];
  const faceWidth = rotated ? rawFaceHeight : rawFaceWidth;
  const faceHeight = rotated ? rawFaceWidth : rawFaceHeight;
  if (img?.width && img?.height) {
    // worldTopUV (e.g. the L-shape's main run + return leg) makes this
    // face sample its own sub-window of one shared crop across the whole
    // multi-segment run, instead of independently cover-fitting the photo
    // to just this face -- otherwise two segments that touch with zero
    // geometric gap still show unrelated crops of the veining, reading as
    // two different slabs rather than one continuous surface.
    if (heroFace === "top" && worldTopUV && !rotated) {
      fitTextureToSharedBox(texture, position, args, worldTopUV, imageAspect);
    } else {
      fitTextureToFace(texture, faceWidth, faceHeight, imageAspect);
    }
  } else {
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.repeat.set(1, 1);
    texture.offset.set(0, 0);
  }
  texture.rotation = THREE.MathUtils.degToRad(veinRotationDeg);
  texture.needsUpdate = true;

  // The countertop's own thickness/edge bands -- same slab pattern
  // continuing onto every visible vertical edge, not a flat tint, so it
  // reads as one continuous piece of material rather than a stone top
  // glued onto a painted strip. Only meaningful for a horizontal slab
  // (heroFace "top"). All four side faces are textured (not just the
  // "front" one) because a WallRun can sit inside a rotated parent group
  // (the L-shape return leg rotates its whole group 90 degrees) -- which
  // local face ends up facing the camera then isn't fixed, so every edge
  // needs the real texture, not just one hard-coded local direction.
  const edgeTextures = useMemo(() => {
    if (heroFace !== "top" || !img?.width) return null;
    const front = texture.clone();
    fitTextureToFace(front, args[0], args[1], imageAspect);
    const side = texture.clone();
    fitTextureToFace(side, args[2], args[1], imageAspect);
    return { front, back: front, side, sideEnd: side };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texture, heroFace, args[0], args[1], args[2], imageAspect]);

  useEffect(
    () => () => {
      edgeTextures?.front.dispose();
      edgeTextures?.side.dispose();
    },
    [edgeTextures]
  );

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
  // Box material index -> which edge texture belongs there: [+X, -X, +Y, -Y, +Z, -Z].
  const EDGE_TEXTURE_BY_INDEX: (keyof NonNullable<typeof edgeTextures> | null)[] = [
    "sideEnd",
    "side",
    null,
    null,
    "front",
    "back",
  ];

  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const edgeKey = EDGE_TEXTURE_BY_INDEX[i];
        const edgeMap = edgeKey ? edgeTextures?.[edgeKey] : null;
        if (i === heroIndex) {
          return (
            <meshStandardMaterial
              key={i}
              attach={`material-${i}`}
              map={texture}
              normalMap={normalMap ?? undefined}
              normalScale={normalMap ? new THREE.Vector2(0.45, 0.45) : undefined}
              roughness={0.15}
              metalness={0}
              envMapIntensity={1.15}
              emissive={highlighted ? HIGHLIGHT_COLOR : "#000000"}
              emissiveIntensity={highlighted ? 0.06 : 0}
            />
          );
        }
        if (edgeMap) {
          return (
            <meshStandardMaterial
              key={i}
              attach={`material-${i}`}
              map={edgeMap}
              roughness={0.28}
              metalness={0}
              emissive={edgeEmissive}
              emissiveIntensity={edgeEmissiveIntensity}
            />
          );
        }
        return (
          <meshStandardMaterial
            key={i}
            attach={`material-${i}`}
            color={edgeColor}
            roughness={0.35}
            metalness={0}
            emissive={edgeEmissive}
            emissiveIntensity={edgeEmissiveIntensity}
          />
        );
      })}
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
  worldTopUV,
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
        worldTopUV={worldTopUV}
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
  map,
}: FaceProps & { color?: string; roughness?: number; metalness?: number; map?: THREE.Texture | null }) => (
  <mesh position={position} castShadow receiveShadow>
    <boxGeometry args={args} />
    <meshStandardMaterial color={map ? "#ffffff" : color} map={map ?? undefined} roughness={roughness} metalness={metalness} />
  </mesh>
);
