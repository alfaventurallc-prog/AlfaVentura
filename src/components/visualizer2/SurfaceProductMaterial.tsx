"use client";

import { useMemo } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { getProceduralTexture } from "@/three/proceduralTexture";
import { FINISH_ROUGHNESS, type Product } from "@/lib/visualizer2/product";

interface SurfaceProductMaterialProps {
  product: Product;
  /** How many times the texture repeats across the surface -- computed
   * from the surface's real dimensions against a nominal tile/slab size,
   * so it reads as tiled material rather than one stretched image. */
  repeat: [number, number];
  highlighted: boolean;
}

const highlightProps = (highlighted: boolean) => ({
  emissive: highlighted ? "#9B7040" : "#000000",
  emissiveIntensity: highlighted ? 0.08 : 0,
});

/** Demo material: a procedural canvas pattern (Marble/Stone/Concrete/etc). */
const DemoSurfaceMaterial = ({ product, repeat, highlighted }: SurfaceProductMaterialProps) => {
  const roughness = FINISH_ROUGHNESS[product.finish];
  const texture = useMemo(() => {
    const t = getProceduralTexture(product.descriptor!).clone();
    t.needsUpdate = true;
    t.repeat.set(repeat[0], repeat[1]);
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id, repeat[0], repeat[1]]);

  return <meshStandardMaterial map={texture} roughness={roughness} metalness={0} {...highlightProps(highlighted)} />;
};

/** Real Alfa Ventura product: the actual uploaded photo, tiled/repeated. */
const AlfaSurfaceMaterial = ({ product, repeat, highlighted }: SurfaceProductMaterialProps) => {
  const roughness = FINISH_ROUGHNESS[product.finish];
  const rawTexture = useTexture(product.imageUrl!);
  const texture = useMemo(() => {
    const t = rawTexture.clone();
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
    t.needsUpdate = true;
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawTexture, repeat[0], repeat[1]]);

  return <meshStandardMaterial map={texture} roughness={roughness} metalness={0} {...highlightProps(highlighted)} />;
};

/**
 * Resolves one product (real Alfa photo or procedural demo pattern) into an
 * actual PBR material on the currently selected surface. The "alfa" branch
 * suspends while the real photo loads (drei's useTexture) -- RoomSurface
 * wraps this in <Suspense> with the surface's own flat color as the
 * fallback, so the surface never goes blank while a material loads.
 */
const SurfaceProductMaterial = (props: SurfaceProductMaterialProps) =>
  props.product.source === "demo" ? <DemoSurfaceMaterial {...props} /> : <AlfaSurfaceMaterial {...props} />;

export default SurfaceProductMaterial;
