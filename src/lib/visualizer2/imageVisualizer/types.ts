/**
 * Step 8: Image Visualizer -- upload a real photo, mark the surface(s) to
 * change, apply an Alfa Ventura material. Everything here runs entirely
 * client-side (no server round-trip) because no AI segmentation/generation
 * provider is configured in this project (see segmentationProvider.ts) --
 * that also means the uploaded photo never leaves the browser in the
 * current build, and there are no API keys/backend credentials involved
 * at all for this path.
 */

export type ImageProcessingStatus = "idle" | "uploading" | "analyzing" | "editing" | "ready" | "generating" | "complete" | "error";

export const IMAGE_SURFACE_TYPES = ["floor", "wall", "countertop", "backsplash", "accentWall"] as const;
export type ImageSurfaceType = (typeof IMAGE_SURFACE_TYPES)[number];

export const IMAGE_SURFACE_LABELS: Record<ImageSurfaceType, string> = {
  floor: "Floor",
  wall: "Wall",
  countertop: "Countertop",
  backsplash: "Backsplash",
  accentWall: "Accent Wall",
};

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // 20MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** One surface's manually-painted region -- a same-size alpha mask, plus
 * an undo/redo history of its own ImageData snapshots. Detection
 * confidence is included for when a real segmentation provider is wired
 * in; the manual/fallback path always reports it as null. */
export interface SurfaceMask {
  surfaceType: ImageSurfaceType;
  maskDataUrl: string | null;
  confidence: number | null;
}
