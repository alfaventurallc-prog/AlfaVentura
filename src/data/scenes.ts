export interface ApplicationDef {
  id: string;
  label: string;
}

export type CameraPreset = [number, number, number, number, number, number];

export interface SpaceDef {
  id: string;
  label: string;
  hasFullScene: boolean;
  applications: ApplicationDef[];
  cameraPresets: {
    front: CameraPreset;
    perspective: CameraPreset;
    top: CameraPreset;
  };
  /** World-space center of each application's surface, for the "View Detail" close-up camera. */
  surfaceFocus: Record<string, [number, number, number]>;
}

export const SPACES: SpaceDef[] = [
  {
    id: "kitchen",
    label: "Kitchen",
    hasFullScene: true,
    applications: [
      { id: "countertop", label: "Countertop" },
      { id: "island", label: "Island" },
      { id: "backsplash", label: "Backsplash" },
    ],
    cameraPresets: {
      front: [0.1, 0.3, 3.4, 0.1, 0, -0.2],
      perspective: [4.0, 1.05, 4.3, 0, -0.05, -0.3],
      top: [0, 6.5, 0.2, 0, 0, 0.2],
    },
    surfaceFocus: {
      countertop: [0.1, 0.045, -1.0],
      island: [-0.1, 0.05, 0.55],
      backsplash: [0.1, 0.365, -1.35],
    },
  },
  {
    id: "bathroom",
    label: "Bathroom",
    hasFullScene: true,
    applications: [{ id: "vanity", label: "Vanity Top" }],
    cameraPresets: {
      front: [-0.5, 0.35, 3.2, -0.5, 0, -0.7],
      perspective: [3.8, 1.0, 4.0, -0.2, -0.1, -0.3],
      top: [0, 6.5, 0.2, 0, 0, 0.2],
    },
    surfaceFocus: {
      vanity: [-0.5, -0.005, -1.05],
    },
  },
  {
    id: "dining",
    label: "Dining",
    hasFullScene: false,
    applications: [{ id: "tabletop", label: "Dining Tabletop" }],
    cameraPresets: {
      front: [0, 0.5, 3.2, 0, -0.1, 0],
      perspective: [3.4, 1.0, 3.6, 0, -0.1, 0],
      top: [0, 5.8, 0.1, 0, 0, 0.1],
    },
    surfaceFocus: { tabletop: [0, -0.26, 0] },
  },
  {
    id: "living",
    label: "Living",
    hasFullScene: false,
    applications: [{ id: "coffeeTable", label: "Coffee Table" }],
    cameraPresets: {
      front: [0, 0.4, 3.2, 0, -0.2, 0],
      perspective: [3.4, 1.0, 3.6, 0, -0.1, 0],
      top: [0, 5.8, 0.1, 0, 0, 0.1],
    },
    surfaceFocus: { coffeeTable: [0, -0.26, 0] },
  },
  {
    id: "commercial",
    label: "Commercial",
    hasFullScene: false,
    applications: [{ id: "receptionDesk", label: "Reception Desk" }],
    cameraPresets: {
      front: [0, 0.5, 3.4, 0, 0, 0],
      perspective: [3.6, 1.1, 3.8, 0, -0.1, 0],
      top: [0, 6, 0.1, 0, 0, 0.1],
    },
    surfaceFocus: { receptionDesk: [0, -0.26, 0] },
  },
];

export const getSpace = (spaceId: string) => SPACES.find((s) => s.id === spaceId) ?? SPACES[0];
