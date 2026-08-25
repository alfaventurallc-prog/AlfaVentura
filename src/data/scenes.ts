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
      front: [0, 0.6, 6.2, 0, 0.1, 0],
      perspective: [5.2, 2.6, 5.6, 0, 0, 0],
      top: [0, 7.5, 0.4, 0, 0, 0.4],
    },
  },
  {
    id: "bathroom",
    label: "Bathroom",
    hasFullScene: true,
    applications: [{ id: "vanity", label: "Vanity Top" }],
    cameraPresets: {
      front: [-0.5, 0.5, 5.6, -0.5, 0.1, -1.15],
      perspective: [5.2, 2.6, 5.6, 0, 0, 0],
      top: [0, 7.5, 0.4, 0, 0, 0.4],
    },
  },
  {
    id: "dining",
    label: "Dining",
    hasFullScene: false,
    applications: [{ id: "tabletop", label: "Dining Tabletop" }],
    cameraPresets: {
      front: [0, 0.9, 5.2, 0, 0, 0],
      perspective: [4.4, 2.4, 4.6, 0, 0, 0],
      top: [0, 6.5, 0.1, 0, 0, 0.1],
    },
  },
  {
    id: "living",
    label: "Living",
    hasFullScene: false,
    applications: [{ id: "coffeeTable", label: "Coffee Table" }],
    cameraPresets: {
      front: [0, 0.7, 5.2, 0, 0, 0],
      perspective: [4.4, 2.4, 4.6, 0, 0, 0],
      top: [0, 6.5, 0.1, 0, 0, 0.1],
    },
  },
  {
    id: "commercial",
    label: "Commercial",
    hasFullScene: false,
    applications: [{ id: "receptionDesk", label: "Reception Desk" }],
    cameraPresets: {
      front: [0, 1, 5.6, 0, 0.2, 0],
      perspective: [4.6, 2.6, 4.8, 0, 0, 0],
      top: [0, 6.8, 0.1, 0, 0, 0.1],
    },
  },
];

export const getSpace = (spaceId: string) => SPACES.find((s) => s.id === spaceId) ?? SPACES[0];
