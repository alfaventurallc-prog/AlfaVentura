import type { ImageSurfaceType, SurfaceMask } from "./types";

/**
 * Vendor-agnostic abstraction for automatic surface detection. The
 * Visualizer only ever calls this interface -- swapping in a real
 * provider (a hosted segmentation model, a vision API, etc.) later is a
 * new class implementing this, wired up in one place (see
 * `getSegmentationProvider` below), with zero changes to the UI.
 *
 * IMPORTANT: any real implementation that needs a secret API key MUST call
 * that provider from a server route (e.g. src/app/api/.../route.ts) using
 * an env var read server-side -- never from this client-side module.
 * `analyze()` in that case would fetch() an internal API route, not the
 * vendor directly.
 */
export interface ImageSegmentationProvider {
  readonly name: string;
  readonly isConfigured: boolean;
  analyze(image: HTMLImageElement): Promise<SurfaceMask[]>;
}

/**
 * No segmentation provider is configured in this project/environment --
 * confirmed before building this step (no vendor credentials, no existing
 * integration to reuse). This provider is honest about that: it never
 * fabricates a detected mask. The UI falls back straight to manual
 * brush/eraser masking, which works fully offline.
 */
class NullSegmentationProvider implements ImageSegmentationProvider {
  readonly name = "none";
  readonly isConfigured = false;

  async analyze(_image: HTMLImageElement): Promise<SurfaceMask[]> {
    return [];
  }
}

let provider: ImageSegmentationProvider | null = null;

export const getSegmentationProvider = (): ImageSegmentationProvider => {
  if (!provider) provider = new NullSegmentationProvider();
  return provider;
};

export const emptyMask = (surfaceType: ImageSurfaceType): SurfaceMask => ({ surfaceType, maskDataUrl: null, confidence: null });
