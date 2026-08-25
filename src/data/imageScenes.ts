import type { Quad } from "@/three/renderSlabOnImage";

export interface NormalizedPoint {
  x: number;
  y: number;
}

export interface SurfaceArea {
  label: string;
  /** One or more quadrilaterals (e.g. island top + front + waterfall side) that all receive the same product. */
  polygons: Quad[];
}

export interface ImageScene {
  id: string;
  name: string;
  image: string;
  spaceId: string;
  /** applicationId -> designated area(s) on this photo. */
  surfaces: Record<string, SurfaceArea>;
}

// Click-verified against the real rendered photo via /visualizer/mask-editor
// (previous entry here was a hand-estimated guess, replaced with this one).
export const IMAGE_SCENES: ImageScene[] = [
  {
    id: "kitchen-island-01",
    name: "Modern Kitchen Island",
    image: "/ban4.png",
    spaceId: "kitchen",
    surfaces: {
      island: {
        label: "Kitchen Island",
        polygons: [
          [
            { x: 0.304, y: 0.55 },
            { x: 0.581, y: 0.581 },
            { x: 0.582, y: 0.991 },
            { x: 0.456, y: 0.997 },
          ],
          [
            { x: 0.31, y: 0.55 },
            { x: 0.307, y: 0.917 },
            { x: 0.451, y: 0.991 },
            { x: 0.581, y: 0.988 },
          ],
          [
            { x: 0.579, y: 0.575 },
            { x: 0.307, y: 0.538 },
            { x: 0.68, y: 0.475 },
            { x: 0.841, y: 0.498 },
          ],
          [
            { x: 0.579, y: 0.593 },
            { x: 0.581, y: 0.991 },
            { x: 0.778, y: 0.785 },
            { x: 0.843, y: 0.506 },
          ],
          [
            { x: 0.334, y: 0.26 },
            { x: 0.525, y: 0.303 },
            { x: 0.524, y: 0.449 },
            { x: 0.336, y: 0.481 },
          ],
          [
            { x: 0.004, y: 0.004 },
            { x: 0.204, y: 0.116 },
            { x: 0.23, y: 0.768 },
            { x: 0.027, y: 0.877 },
          ],
        ],
      },
    },
  },
];

export const getImageScenesForSpace = (spaceId: string) => IMAGE_SCENES.filter((s) => s.spaceId === spaceId);
