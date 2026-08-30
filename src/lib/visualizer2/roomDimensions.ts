import type { SurfaceId } from "./surfaces";

/**
 * Real-world physical dimensions (mm) for each room surface -- kept
 * separate from the Three.js scene's metre-based geometry (Room.tsx) so
 * the layout engine's tile-count/repeat math has an explicit source of
 * truth instead of hard-coded numbers buried in a rendering component.
 * (1 scene unit = 1 metre = 1000mm, matching Room.tsx's ROOM_WIDTH etc.)
 */
export const SURFACE_DIMENSIONS_MM: Record<SurfaceId, { width: number; height: number }> = {
  floor: { width: 8000, height: 8000 },
  backWall: { width: 8000, height: 4000 },
  leftWall: { width: 8000, height: 4000 },
  rightWall: { width: 8000, height: 4000 },
};
