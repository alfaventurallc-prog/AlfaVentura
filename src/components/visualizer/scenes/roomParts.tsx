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

/** Bakes a very subtle plaster/paint noise into a wall's texture -- a
 * perfectly flat meshStandardMaterial color under directional light looks
 * like a stage backdrop rather than a painted wall, which has faint
 * roller/texture variation that catches light unevenly. */
const useWallTexture = (color: string) => {
  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 900; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.025)";
      ctx.fillRect(x, y, 1.5, 1.5);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 2);
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

const TRIM_COLOR = "#F7F3EA";

/** A thin baseboard strip along a wall's bottom edge and a crown molding
 * strip along its top -- these two lines are most of what makes a plane
 * read as "a wall in a room" instead of a flat backdrop panel. */
const WallTrim = ({ width, height, y, z, rotationY = 0 }: { width: number; height: number; y: number; z: number; rotationY?: number }) => (
  <group position={[0, y, z]} rotation={[0, rotationY, 0]}>
    <mesh position={[0, -height / 2 + 0.06, 0.01]}>
      <boxGeometry args={[width, 0.12, 0.02]} />
      <meshStandardMaterial color={TRIM_COLOR} roughness={0.5} />
    </mesh>
    <mesh position={[0, height / 2 - 0.05, 0.01]}>
      <boxGeometry args={[width, 0.1, 0.02]} />
      <meshStandardMaterial color={TRIM_COLOR} roughness={0.5} />
    </mesh>
  </group>
);

// Wall height/center spans exactly floor (-0.85) to ceiling (2.2) so the
// crown molding lands right at the ceiling line instead of floating past it.
const WALL_HEIGHT = 3.05;
const WALL_Y = 0.675;

export const BackWall = ({ color }: { color: string }) => {
  const wallTexture = useWallTexture(color);
  return (
    <>
      <mesh position={[0, WALL_Y, -1.75]} receiveShadow>
        <planeGeometry args={[7, WALL_HEIGHT]} />
        {wallTexture ? <meshStandardMaterial map={wallTexture} roughness={0.92} /> : <meshStandardMaterial color={color} roughness={0.92} />}
      </mesh>
      <WallTrim width={7} height={WALL_HEIGHT} y={WALL_Y} z={-1.74} />
    </>
  );
};

export const SideWall = ({ color, x }: { color: string; x: number }) => {
  const wallTexture = useWallTexture(color);
  return (
    <>
      <mesh position={[x, WALL_Y, 0.4]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[5.3, WALL_HEIGHT]} />
        {wallTexture ? <meshStandardMaterial map={wallTexture} roughness={0.92} /> : <meshStandardMaterial color={color} roughness={0.92} />}
      </mesh>
      <WallTrim width={5.3} height={WALL_HEIGHT} y={WALL_Y} z={0.4} rotationY={Math.PI / 2} />
    </>
  );
};

/** A plain ceiling plane above the room -- without it the walls just stop
 * partway up with open space above, which breaks the "enclosed room"
 * read as soon as the camera tilts up even slightly. */
export const Ceiling = ({ color = "#FBF8F2" }: { color?: string }) => (
  // y=2.2 clears the island's pendant lights (top ~1.9) with margin while
  // still keeping a believable ~3m ceiling height above the y=-0.85 floor.
  <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 2.2, 0]}>
    <planeGeometry args={[12, 12]} />
    <meshStandardMaterial color={color} roughness={0.95} />
  </mesh>
);

/**
 * A simple window set into a wall -- a bare wall with nothing on it reads
 * as a stage backdrop rather than a room. Sky-tinted "glass" plane plus a
 * thin frame sitting just proud of the wall face. `rotationY` defaults to
 * facing along the side wall (its original use); pass 0 to mount it on the
 * back wall instead, which already faces +Z with no rotation.
 */
export const Window = ({ x, z = 0.5, y = 1.35, rotationY = Math.PI / 2 }: { x: number; z?: number; y?: number; rotationY?: number }) => (
  <group position={[x, y, z]} rotation={[0, rotationY, 0]}>
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
