/**
 * Step 9: a small, provider-agnostic analytics abstraction. No analytics
 * vendor is configured in this project, so `track()` currently just logs
 * to the console in development and is a no-op in production -- wiring in
 * a real provider (GA4, PostHog, Segment, etc.) later means implementing
 * the body of `track()` once, here; every call site below stays the same.
 *
 * Deliberately only meaningful, discrete events -- never per-frame or
 * per-pixel noise (camera drags, slider movement).
 */
export type VisualizerAnalyticsEvent =
  | "visualizer_opened"
  | "room_selected"
  | "surface_selected"
  | "product_selected"
  | "layout_changed"
  | "fabrication_changed"
  | "design_saved"
  | "design_shared"
  | "visualization_downloaded"
  | "image_uploaded"
  | "image_visualization_generated";

export const track = (event: VisualizerAnalyticsEvent, payload?: Record<string, string | number | boolean | null>) => {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.debug(`[analytics] ${event}`, payload ?? {});
  }
  // Real provider call goes here, e.g.:
  // if (typeof window !== "undefined" && window.gtag) window.gtag("event", event, payload);
};
