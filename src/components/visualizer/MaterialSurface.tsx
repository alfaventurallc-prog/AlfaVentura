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

/** Real-world size (in scene units, ~metres) that ONE photo of the slab
 * covers vertically. Every surface samples the photo at this same density
 * instead of cropping it to fit each face: cover-fitting a square photo to a
 * 4m x 0.8m backsplash magnified a thin strip of it ~5x, which is what read
 * as a stretched, smeared texture. */
export const PHOTO_WORLD_SIZE = 2.0;

/** Maps the photo onto a face at a fixed real-world scale. Long faces mirror
 * the photo edge-to-edge (MirroredRepeatWrapping), so there's no hard tile
 * seam and no magnification; faces smaller than the photo show a centred
 * window of it. Mutates `tex` in place. */
const fitTextureToFace = (tex: THREE.Texture, faceWidth: number, faceHeight: number, imageAspect: number) => {
  const repeatX = faceWidth / (PHOTO_WORLD_SIZE * imageAspect);
  const repeatY = faceHeight / PHOTO_WORLD_SIZE;
  tex.wrapS = THREE.MirroredRepeatWrapping;
  tex.wrapT = THREE.MirroredRepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.offset.set(Math.max(0, (1 - repeatX) / 2), Math.max(0, (1 - repeatY) / 2));
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
}: FaceProps & { product: VisualizerProduct }) => {
  const texture = useTexture(product.image);
  texture.colorSpace = THREE.SRGBColorSpace;

  // A quarter-turn on the vein swaps which face dimension the image's own
  // width/height should cover-fit against.
  const rotated = Math.abs(veinRotationDeg % 180) === 90;

  // Sample the photo at a fixed real-world scale (see fitTextureToFace).
  const img = texture.image as HTMLImageElement | undefined;
  const imageAspect = img?.width && img?.height ? img.width / img.height : 1;
  const rawFaceWidth = heroFace === "side" || heroFace === "sideEnd" ? args[2] : args[0];
  const rawFaceHeight = heroFace === "top" ? args[2] : args[1];
  const faceWidth = rotated ? rawFaceHeight : rawFaceWidth;
  const faceHeight = rotated ? rawFaceWidth : rawFaceHeight;
  if (img?.width && img?.height) {
    fitTextureToFace(texture, faceWidth, faceHeight, imageAspect);
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
  map,
}: FaceProps & { color?: string; roughness?: number; metalness?: number; map?: THREE.Texture | null }) => (
  <mesh position={position} castShadow receiveShadow>
    <boxGeometry args={args} />
    <meshStandardMaterial color={map ? "#ffffff" : color} map={map ?? undefined} roughness={roughness} metalness={metalness} />
  </mesh>
);


/**
 * Extrudes a polygon footprint (points are [x, z] in world space) straight
 * up into one solid, and gives every vertex a UV taken from its WORLD
 * position (top/bottom: x,z; side walls: horizontal run, y). That is what
 * lets an L-shaped countertop be a single mesh whose pattern flows around
 * the corner with no seam, instead of two boxes each showing their own crop.
 */
const makeExtrudedFootprint = (points: [number, number][], bottomY: number, height: number) => {
  const shape = new THREE.Shape(points.map(([x, z]) => new THREE.Vector2(x, -z)));
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false });
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, bottomY, 0);

  const pos = geometry.attributes.position;
  const nor = geometry.attributes.normal;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const nx = Math.abs(nor.getX(i));
    const ny = Math.abs(nor.getY(i));
    const nz = Math.abs(nor.getZ(i));
    let u = x;
    let v = y;
    if (ny > nx && ny > nz) {
      u = x;
      v = z;
    } else if (nx > nz) {
      u = z;
      v = y;
    }
    uv[i * 2] = u;
    uv[i * 2 + 1] = v;
  }
  geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return geometry;
};

export const useExtrudedFootprint = (points: [number, number][], bottomY: number, height: number) => {
  const key = JSON.stringify(points);
  const geometry = useMemo(
    () => makeExtrudedFootprint(points, bottomY, height),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, bottomY, height]
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return geometry;
};

/** A plain-colored (optionally wood-grain mapped) extruded solid. */
export const SolidExtrusion = ({
  geometry,
  color,
  roughness = 0.55,
  metalness = 0,
  map,
}: {
  geometry: THREE.BufferGeometry;
  color: string;
  roughness?: number;
  metalness?: number;
  map?: THREE.Texture | null;
}) => (
  <mesh geometry={geometry} castShadow receiveShadow>
    <meshStandardMaterial color={map ? "#ffffff" : color} map={map ?? undefined} roughness={roughness} metalness={metalness} />
  </mesh>
);

const TexturedSlabInner = ({
  product,
  geometry,
  veinRotationDeg,
}: {
  product: VisualizerProduct;
  geometry: THREE.BufferGeometry;
  veinRotationDeg: number;
}) => {
  const source = useTexture(product.image);

  const { map, normalMap } = useMemo(() => {
    const img = source.image as HTMLImageElement | undefined;
    const aspect = img?.width && img?.height ? img.width / img.height : 1;
    const configure = (t: THREE.Texture) => {
      t.wrapS = THREE.MirroredRepeatWrapping;
      t.wrapT = THREE.MirroredRepeatWrapping;
      // geometry UVs are raw world units, so this is what sets the density
      t.repeat.set(1 / (PHOTO_WORLD_SIZE * aspect), 1 / PHOTO_WORLD_SIZE);
      t.offset.set(0, 0);
      t.center.set(0, 0);
      t.rotation = THREE.MathUtils.degToRad(veinRotationDeg);
      t.needsUpdate = true;
    };
    const color = source.clone();
    color.colorSpace = THREE.SRGBColorSpace;
    configure(color);
    let normal: THREE.Texture | null = null;
    if (img?.width) {
      try {
        normal = generateNormalMapFromImage(img, 0.6);
        configure(normal);
      } catch {
        normal = null;
      }
    }
    return { map: color, normalMap: normal };
  }, [source, veinRotationDeg]);

  useEffect(
    () => () => {
      map.dispose();
      normalMap?.dispose();
    },
    [map, normalMap]
  );

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        map={map}
        normalMap={normalMap ?? undefined}
        normalScale={normalMap ? new THREE.Vector2(0.45, 0.45) : undefined}
        roughness={0.15}
        metalness={0}
        envMapIntensity={1.15}
      />
    </mesh>
  );
};

/** A stone-photo-textured extruded solid (top, edges and any wall faces all
 * sample the same world-anchored pattern). Falls back to the neutral stone
 * tone until a product is chosen / while its photo loads. */
export const TexturedSlab = ({
  product,
  geometry,
  veinRotationDeg = 0,
}: {
  product: VisualizerProduct | null;
  geometry: THREE.BufferGeometry;
  veinRotationDeg?: number;
}) => {
  const neutral = (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial color={DEFAULT_COLOR} roughness={0.7} />
    </mesh>
  );
  if (!product) return neutral;
  return (
    <Suspense fallback={neutral}>
      <TexturedSlabInner product={product} geometry={geometry} veinRotationDeg={veinRotationDeg} />
    </Suspense>
  );
};
