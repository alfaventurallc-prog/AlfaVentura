export interface NormalizedPoint {
  x: number;
  y: number;
}

export interface SurfaceArea {
  label: string;
  /** Exactly 4 quadrilateral corners (normalized 0-1), used for the perspective warp. */
  corners: [NormalizedPoint, NormalizedPoint, NormalizedPoint, NormalizedPoint];
}

export interface ImageScene {
  id: string;
  name: string;
  image: string;
  spaceId: string;
  /** applicationId -> designated area on this photo. */
  surfaces: Record<string, SurfaceArea>;
}

// Starting polygon, hand-estimated against /ban4.png -- use /visualizer/mask-editor
// to click-correct it precisely against the real rendered photo.
export const IMAGE_SCENES: ImageScene[] = [
  {
    id: "kitchen-island-01",
    name: "Modern Kitchen Island",
    image: "/ban4.png",
    spaceId: "kitchen",
    surfaces: {
      island: {
        label: "Kitchen Island",
        corners: [
          { x: 0.27, y: 0.66 },
          { x: 0.61, y: 0.37 },
          { x: 0.89, y: 0.47 },
          { x: 0.73, y: 0.79 },
        ],
      },
    },
  },
];

export const getImageScenesForSpace = (spaceId: string) => IMAGE_SCENES.filter((s) => s.spaceId === spaceId);
