import * as THREE from "three";
import { drawProceduralPattern, type ProceduralDescriptor } from "./proceduralPattern";

const TEXTURE_SIZE = 512;

// Cached by descriptor identity so switching back to a previously-used demo
// material doesn't redraw/reallocate a canvas texture. Only ever called
// from components mounted inside an R3F <Canvas> (client-only), so
// `document` is always available here.
const cache = new Map<string, THREE.CanvasTexture>();

export const getProceduralTexture = (descriptor: ProceduralDescriptor): THREE.CanvasTexture => {
  const key = JSON.stringify(descriptor);
  const cached = cache.get(key);
  if (cached) return cached;

  const canvas = document.createElement("canvas");
  canvas.width = TEXTURE_SIZE;
  canvas.height = TEXTURE_SIZE;
  const ctx = canvas.getContext("2d")!;
  drawProceduralPattern(ctx, descriptor, TEXTURE_SIZE, TEXTURE_SIZE);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  cache.set(key, texture);
  return texture;
};
