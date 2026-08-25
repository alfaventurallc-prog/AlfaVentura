export type CameraPreset = [number, number, number, number, number, number];

/**
 * Camera presets for the single predefined kitchen scene. The kitchen
 * geometry never changes -- only the quartz material applied to its
 * countertop/island/backsplash surfaces does.
 */
export const KITCHEN_CAMERA: {
  hero: CameraPreset;
} = {
  hero: [2.9, 1.55, 2.7, -0.3, -0.1, -0.35],
};
