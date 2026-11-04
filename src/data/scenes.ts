import type { SpaceId } from "./kitchenCatalog";

export type CameraPreset = [number, number, number, number, number, number];

/**
 * Camera presets for the single predefined kitchen scene. The kitchen
 * geometry never changes -- only the quartz material applied to its
 * countertop/island/backsplash surfaces does.
 */
export const KITCHEN_CAMERA: {
  hero: CameraPreset;
} = {
  // Human eye-level, not a bird's-eye/top-down view: the floor sits at
  // world y=-0.85, so a camera y of 0.78 puts the eye ~1.63m above the
  // floor (roughly 5'4"), and the look-at target's y of 0.15 aims at the
  // counter/backsplash area instead of down at the floor. The previous
  // preset (y=1.25 camera, y=-0.1 target) put the eye ~2.1m up looking
  // steeply down, which read as an abstract top-down block layout rather
  // than someone standing in the kitchen.
  // Pulled back and aimed slightly higher so the upper cabinets sit inside
  // the frame instead of being cut off by its top edge.
  hero: [3.1, 1.0, 3.05, -0.2, 0.42, -0.45],
};

/** Start view per space: [camera x, y, z, target x, y, z]. The kitchen keeps
 * the orbit target at the origin, as it had before spaces existed. */
export const SPACE_CAMERA: Record<SpaceId, CameraPreset> = {
  kitchen: [3.1, 1.0, 3.05, 0, 0, 0],
  bathroom: [2.3, 0.8, 2.5, -0.5, 0.25, -1.0],
  living: [3.2, 0.9, 3.3, -0.6, 0.15, -0.7],
  commercial: [3.0, 0.95, 3.5, -0.2, 0.2, -0.6],
};
