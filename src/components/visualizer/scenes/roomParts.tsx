import { useEffect, useMemo } from "react";
import * as THREE from "three";

const DEFAULT_FLOOR_COLOR = "#DDD3C4";

// One floor tile = 8 boards across x 2 board-lengths, 2 scene units square,
// so a board is 0.25 wide x 1.0 long. The tile repeats across the floor
// plane (see PLANK_TILE_UNITS); each board has its own end-joint position.
const PLANK_TILE_UNITS = 2;
const PLANK_COLS = 8;
const PLANK_ROWS = 2;

const parseHex = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/** Bakes a plank floor: every board gets its own slight tone shift and a
 * grain, with a clearly visible groove between boards and staggered end
 * joints. The groove is darker than a light floor and LIGHTER than a dark
 * one, otherwise the lines vanish on the walnut finish. */
const usePlankTexture = (color: string) => {
  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const size = 1024;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const [r, g, b] = parseHex(color);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const grooveColor = luminance > 0.38 ? "rgba(30,20,10,0.55)" : "rgba(255,240,220,0.32)";
    const boardW = size / PLANK_COLS;
    const boardH = size / PLANK_ROWS;

    // deterministic pseudo-random so the floor doesn't reshuffle on re-render
    let seed = 7;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    for (let col = 0; col < PLANK_COLS; col++) {
      const x = col * boardW;
      // every board gets its own end-joint offset, so joints don't line up
      const yOffset = rand() * boardH;
      // one look per board-length in the tile; the tile repeats every
      // PLANK_ROWS lengths, so a length wrapping past the tile edge must
      // reuse the same look or a visible seam appears at the tile border.
      const looks = Array.from({ length: PLANK_ROWS }, () => ({
        k: 1 + (rand() - 0.5) * 0.14,
        grain: Array.from({ length: 12 }, () => ({ gx: rand(), light: rand() > 0.5, w: 0.6 + rand() * 1.6, d1: rand() - 0.5, d2: rand() - 0.5 })),
      }));
      for (let n = -1; n <= PLANK_ROWS; n++) {
        const y = n * boardH + yOffset;
        const look = looks[((n % PLANK_ROWS) + PLANK_ROWS) % PLANK_ROWS];
        ctx.fillStyle = `rgb(${Math.min(255, r * look.k)},${Math.min(255, g * look.k)},${Math.min(255, b * look.k)})`;
        ctx.fillRect(x, y, boardW, boardH);
        for (const gr of look.grain) {
          const gx = x + gr.gx * boardW;
          ctx.strokeStyle = gr.light ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
          ctx.lineWidth = gr.w;
          ctx.beginPath();
          ctx.moveTo(gx, y);
          ctx.bezierCurveTo(gx + gr.d1 * 10, y + boardH * 0.33, gx + gr.d2 * 10, y + boardH * 0.66, gx + gr.d1 * 6, y + boardH);
          ctx.stroke();
        }
        // grooves: long edge and short end joint
        ctx.fillStyle = grooveColor;
        ctx.fillRect(x, y, 3.5, boardH);
        ctx.fillRect(x, y, boardW, 3.5);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(40 / PLANK_TILE_UNITS, 40 / PLANK_TILE_UNITS);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
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
      {/* 40x40, not the room's own ~7x5 footprint -- a plane sized to just
          the room left its far edge only ~6 units out, well within the
          camera's max dolly distance (9), so the floor's boundary against
          the sky showed up as a hard horizontal line across the frame.
          Pushing the edge to +-20 keeps it outside any reachable camera
          position. */}
      <planeGeometry args={[40, 40]} />
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
 * read as "a wall in a room" instead of a flat backdrop panel.
 *
 * BUG: this always positioned itself at world x=0 regardless of the
 * wall's own x -- harmless for BackWall (which is always centered at
 * x=0), but for SideWall (x=-2.7) it meant the baseboard/crown boxes
 * rendered as two long strips cutting straight through the middle of the
 * room at x=0, near the floor and near the ceiling, completely detached
 * from the actual side wall. That's what showed up as horizontal white
 * lines slicing across the whole scene. */
const WallTrim = ({ x = 0, width, height, y, z, rotationY = 0 }: { x?: number; width: number; height: number; y: number; z: number; rotationY?: number }) => (
  <group position={[x, y, z]} rotation={[0, rotationY, 0]}>
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
      <WallTrim x={x} width={5.3} height={WALL_HEIGHT} y={WALL_Y} z={0.4} rotationY={Math.PI / 2} />
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
    {/* Same reasoning as Floor's 40x40 -- a plane sized to the room left
        its edge well within camera range, showing up as a hard line
        across the frame where the ceiling ended and the sky began. */}
    <planeGeometry args={[40, 40]} />
    {/* emissive so the underside isn't lit only by upward-bounced light,
        which left it a murky brown-grey */}
    <meshStandardMaterial color={color} roughness={0.95} emissive="#E8E2D6" emissiveIntensity={0.55} />
  </mesh>
);

