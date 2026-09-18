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
  hero: [2.5, 0.78, 2.45, -0.2, 0.15, -0.35],
};
