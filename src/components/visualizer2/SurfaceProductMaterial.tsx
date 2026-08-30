"use client";

import { useMemo } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { getProceduralTexture } from "@/three/proceduralTexture";
import { buildTilePatternCanvas } from "@/three/tilePattern";
import { extractAverageColor } from "@/three/extractAverageColor";
import { FINISH_ROUGHNESS, type Product } from "@/lib/visualizer2/product";
import type { SurfaceMaterialConfig } from "@/lib/visualizer2/layout";

interface SurfaceProductMaterialProps {
  product: Product;
  config: SurfaceMaterialConfig;
  surfaceMm: { width: number; height: number };
  highlighted: boolean;
  /** Step 5 bookmatch: mirror the pattern horizontally/vertically -- used
   * to render the second half of a bookmatched pair so it reads as the
   * same slab opened like a book, not a duplicate. */
  mirrorX?: boolean;
  mirrorY?: boolean;
}

/** Cheap string hash -> deterministic seed for the ashlar/herringbone RNG,
 * so a given product+config always looks the same, not random per render. */
const hashSeed = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
};

const highlightProps = (highlighted: boolean) => ({
  emissive: highlighted ? "#9B7040" : "#000000",
  emissiveIntensity: highlighted ? 0.08 : 0,
});

/** Where the fractional leftover of a non-integer repeat count goes, so
 * the installed pattern starts from the requested edge (or centered). */
const alignOffset = (repeat: number, alignment: SurfaceMaterialConfig["alignment"]): number => {
  const frac = repeat % 1;
  if (alignment === "right" || alignment === "bottom") return -frac;
  if (alignment === "left" || alignment === "top") return 0;
  return -frac / 2; // center
};

const finishTexture = (
  texture: THREE.Texture,
  repeat: [number, number],
  offset: [number, number],
  rotationDeg: number,
  mirrorX?: boolean,
  mirrorY?: boolean
) => {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  const rx = mirrorX ? -repeat[0] : repeat[0];
  const ry = mirrorY ? -repeat[1] : repeat[1];
  texture.repeat.set(rx, ry);
  texture.offset.set(offset[0], offset[1]);
  texture.center.set(0.5, 0.5);
  texture.rotation = THREE.MathUtils.degToRad(rotationDeg);
  texture.needsUpdate = true;
  return texture;
};

/** Demo material (procedural pattern/color) in tile or slab mode. */
const DemoSurfaceMaterial = ({ product, config, surfaceMm, highlighted, mirrorX, mirrorY }: SurfaceProductMaterialProps) => {
  const roughness = FINISH_ROUGHNESS[product.finish];
  const descriptor = product.descriptor!;

  const { texture, repeat, offset, rotationDeg } = useMemo(() => {
    if (config.mode === "slab") {
      const t = getProceduralTexture(descriptor).clone();
      t.needsUpdate = true;
      const size = product.sizes.find((s) => s.mode === "slab") ?? { width: 1200, height: 2400 };
      const rx = (surfaceMm.width / size.width / config.scale) || 1;
      const ry = (surfaceMm.height / size.height / config.scale) || 1;
      return { texture: t, repeat: [rx, ry] as [number, number], offset: [config.offsetX, config.offsetY] as [number, number], rotationDeg: config.rotation };
    }

    const size = product.sizes.find((s) => s.id === config.sizeId && s.mode === "tile") ?? product.sizes.find((s) => s.mode === "tile") ?? {
      width: 300,
      height: 300,
    };
    const tileW = config.veinOrientation === "vertical" ? size.height : size.width;
    const tileH = config.veinOrientation === "vertical" ? size.width : size.height;
    const { canvas, cellWidthMm, cellHeightMm } = buildTilePatternCanvas({
      layout: config.layout,
      tileWidthMm: tileW,
      tileHeightMm: tileH,
      groutWidthMm: config.mode === "tile" ? config.groutWidthMm : 0,
      groutColor: config.groutColor,
      tileColor: descriptor.baseColor,
      seed: hashSeed(product.id),
    });
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    const rx = surfaceMm.width / cellWidthMm / config.scale;
    const ry = surfaceMm.height / cellHeightMm / config.scale;
    const baseRotation = config.layout === "diagonal" ? 45 : 0;
    const ox = alignOffset(rx, config.alignment) + config.offsetX;
    const oy = alignOffset(ry, config.alignment) + config.offsetY;
    return { texture: t, repeat: [rx, ry] as [number, number], offset: [ox, oy] as [number, number], rotationDeg: baseRotation + config.rotation };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id, JSON.stringify(config), surfaceMm.width, surfaceMm.height]);

  finishTexture(texture, repeat, offset, rotationDeg, mirrorX, mirrorY);

  return <meshStandardMaterial map={texture} roughness={roughness} metalness={0} {...highlightProps(highlighted)} />;
};

/** Real Alfa Ventura product (source: "alfa") in tile or slab mode. Tile
 * mode uses the photo's average color as the tile fill (see the file-level
 * note) rather than compositing the full photo into every tile cell. */
const AlfaSurfaceMaterial = ({ product, config, surfaceMm, highlighted, mirrorX, mirrorY }: SurfaceProductMaterialProps) => {
  const roughness = FINISH_ROUGHNESS[product.finish];
  const rawTexture = useTexture(product.imageUrl!);

  const { texture, repeat, offset, rotationDeg } = useMemo(() => {
    if (config.mode === "slab") {
      const t = rawTexture.clone();
      t.colorSpace = THREE.SRGBColorSpace;
      t.needsUpdate = true;
      const size = product.sizes.find((s) => s.mode === "slab") ?? { width: 1200, height: 2400 };
      const rx = (surfaceMm.width / size.width / config.scale) || 1;
      const ry = (surfaceMm.height / size.height / config.scale) || 1;
      return { texture: t, repeat: [rx, ry] as [number, number], offset: [config.offsetX, config.offsetY] as [number, number], rotationDeg: config.rotation };
    }

    const size = product.sizes.find((s) => s.id === config.sizeId && s.mode === "tile") ?? product.sizes.find((s) => s.mode === "tile") ?? {
      width: 600,
      height: 600,
    };
    const tileW = config.veinOrientation === "vertical" ? size.height : size.width;
    const tileH = config.veinOrientation === "vertical" ? size.width : size.height;

    // The tile fill is this photo's own average color -- a genuine
    // real-material color (not a fabricated one), rendered as a repeating
    // tile pattern rather than stretching/compositing the full photo into
    // every cell (a heavier, async pipeline deferred for a later pass).
    const img = rawTexture.image as HTMLImageElement | undefined;
    const tileColor = img?.width ? extractAverageColor(img) : "#D8C9AE";

    const { canvas, cellWidthMm, cellHeightMm } = buildTilePatternCanvas({
      layout: config.layout,
      tileWidthMm: tileW,
      tileHeightMm: tileH,
      groutWidthMm: config.groutWidthMm,
      groutColor: config.groutColor,
      tileColor,
      seed: hashSeed(product.id),
    });
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    const rx = surfaceMm.width / cellWidthMm / config.scale;
    const ry = surfaceMm.height / cellHeightMm / config.scale;
    const baseRotation = config.layout === "diagonal" ? 45 : 0;
    const ox = alignOffset(rx, config.alignment) + config.offsetX;
    const oy = alignOffset(ry, config.alignment) + config.offsetY;
    return { texture: t, repeat: [rx, ry] as [number, number], offset: [ox, oy] as [number, number], rotationDeg: baseRotation + config.rotation };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawTexture, product.id, JSON.stringify(config), surfaceMm.width, surfaceMm.height]);

  finishTexture(texture, repeat, offset, rotationDeg, mirrorX, mirrorY);

  return <meshStandardMaterial map={texture} roughness={roughness} metalness={0} {...highlightProps(highlighted)} />;
};

/**
 * Resolves one product + its Step 3 install configuration into an actual
 * PBR material on the currently selected surface. The "alfa" branch
 * suspends while the real photo loads (drei's useTexture) -- RoomSurface
 * wraps this in <Suspense> with the surface's own flat color as the
 * fallback, so the surface never goes blank while a material loads.
 */
const SurfaceProductMaterial = (props: SurfaceProductMaterialProps) =>
  props.product.source === "demo" ? <DemoSurfaceMaterial {...props} /> : <AlfaSurfaceMaterial {...props} />;

export default SurfaceProductMaterial;
