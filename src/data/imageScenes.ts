import type { CameraPreset } from "./scenes";

export type ImageView = "primary" | "full" | "detail";

/**
 * Camera presets for the Image Kitchen (Layout B) -- calibrated to that
 * scene's own geometry (src/components/visualizer/scenes/ImageKitchenScene.tsx),
 * separate from the interactive 3D Kitchen's KITCHEN_CAMERA.
 */
export const IMAGE_CAMERAS: Record<ImageView, CameraPreset> = {
  // Hero 3/4 composition -- island + feature wall both readable.
  primary: [2.2, 1.3, 2.5, 0, 0.05, -0.2],
  // Pulled back further to show the whole room.
  full: [3.6, 2.1, 4.3, 0, 0.15, -0.3],
  // Close on the island top / right waterfall corner for texture detail.
  detail: [0.85, 0.32, 0.95, 0.55, 0.02, 0.25],
};

export const IMAGE_VIEW_LABELS: Record<ImageView, string> = {
  primary: "Material View",
  full: "Full Kitchen View",
  detail: "Detail View",
};
