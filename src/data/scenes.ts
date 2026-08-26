export type CameraPreset = [number, number, number, number, number, number];

/**
 * Camera presets for the single predefined kitchen scene. The kitchen
 * geometry never changes -- only the quartz material applied to its
 * countertop/island/backsplash surfaces does.
 */
export const KITCHEN_CAMERA: {
  hero: CameraPreset;
} = {
  // Pulled ~18% closer to the same look-at point (and a slightly tighter FOV
  // in VisualizerCanvas) than the original preset -- that one left too much
  // empty floor/wall visible on either side of the counters.
  hero: [2.32, 1.25, 2.15, -0.3, -0.1, -0.35],
};
