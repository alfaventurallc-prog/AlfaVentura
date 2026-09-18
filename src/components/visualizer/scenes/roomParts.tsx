import { useEffect, useMemo } from "react";
import * as THREE from "three";

const DEFAULT_FLOOR_COLOR = "#DDD3C4";

/** Bakes plank grooves into a canvas texture instead of a flat color --
 * a solid-color plane reads as a colored slab rather than a floor, since
 * there's nothing to show it's made of individual boards. */
const usePlankTexture = (color: string) => {
  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 512, 512);
    // vertical plank seams
    const plankWidth = 64;
    ctx.strokeStyle = "rgba(0,0,0,0.14)";
    ctx.lineWidth = 2;
    for (let x = plankWidth; x < 512; x += plankWidth) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    // staggered end-joints, offset every other row so it reads as real boards
    ctx.strokeStyle = "rgba(0,0,0,0.07)";
    const rowHeight = 128;
    for (let row = 0, y = 0; y < 512; y += rowHeight, row++) {
      const offset = row % 2 === 0 ? 0 : plankWidth / 2;
      for (let x = offset; x < 512; x += plankWidth) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + plankWidth, y);
        ctx.stroke();
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 6);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, [color]);

  useEffect(() => () => texture?.dispose(), [texture]);

  return texture;
};

/** Bakes subtle wood-grain streaks into a canvas texture for cabinet
 * carcasses -- a flat meshStandardMaterial color on a large cabinet face
 * reads as plastic/laminate with nothing to catch the eye; a faint grain
 * pattern (even a procedural one, not a real wood photo) is enough to read
 * as a painted/stained wood finish instead. */
export const useWoodGrainTexture = (color: string) => {
  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 70; i++) {
      const x = Math.random() * 256;
      ctx.strokeStyle = Math.random() > 0.5 ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)";
      ctx.lineWidth = 0.5 + Math.random() * 1.4;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.bezierCurveTo(
        x + Math.random() * 8 - 4,
        90,
        x + Math.random() * 8 - 4,
        180,
        x + Math.random() * 6 - 3,
        256
      );
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 1.4);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, [color]);

  useEffect(() => () => texture?.dispose(), [texture]);

  return texture;
};

export const Floor = ({ color = DEFAULT_FLOOR_COLOR, roughness = 0.95 }: { color?: string; roughness?: number }) => {
  const plankTexture = usePlankTexture(color);
  return (
    // Matches the cabinet/appliance bottom convention used throughout
    // KitchenScene (base boxes bottom out at y=-0.85) -- it used to sit
    // 0.21 lower than that, leaving every cabinet/fridge visibly floating
    // above the floor instead of resting on it.
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.85, 0]} receiveShadow>
      <planeGeometry args={[12, 12]} />
      {plankTexture ? (
        <meshStandardMaterial map={plankTexture} roughness={roughness} />
      ) : (
        <meshStandardMaterial color={color} roughness={roughness} />
      )}
    </mesh>
  );
};

export const BackWall = ({ color }: { color: string }) => (
  <mesh position={[0, 0.9, -1.75]}>
    <planeGeometry args={[7, 4]} />
    <meshStandardMaterial color={color} roughness={1} />
  </mesh>
);

export const SideWall = ({ color, x }: { color: string; x: number }) => (
  <mesh position={[x, 0.9, 0.4]} rotation={[0, Math.PI / 2, 0]}>
    <planeGeometry args={[5.3, 4]} />
    <meshStandardMaterial color={color} roughness={1} />
  </mesh>
);

/**
 * A simple window set into the side wall -- a bare wall with nothing on it
 * reads as a stage backdrop rather than a room. Sky-tinted "glass" plane
 * plus a thin frame sitting just proud of the wall face.
 */
export const Window = ({ x, z = 0.5, y = 1.35 }: { x: number; z?: number; y?: number }) => (
  <group position={[x, y, z]} rotation={[0, Math.PI / 2, 0]}>
    <mesh>
      <planeGeometry args={[1.15, 1.0]} />
      <meshStandardMaterial color="#CFE3EC" roughness={0.15} metalness={0.1} emissive="#DCEEF5" emissiveIntensity={0.25} />
    </mesh>
    <mesh position={[0, 0, 0.001]}>
      <planeGeometry args={[0.04, 1.0]} />
      <meshStandardMaterial color="#F5F1E8" roughness={0.6} />
    </mesh>
    <mesh position={[0, 0, 0.001]}>
      <planeGeometry args={[1.15, 0.04]} />
      <meshStandardMaterial color="#F5F1E8" roughness={0.6} />
    </mesh>
    <mesh position={[0, 0, -0.005]}>
      <planeGeometry args={[1.27, 1.12]} />
      <meshStandardMaterial color="#F5F1E8" roughness={0.6} />
    </mesh>
  </group>
);
