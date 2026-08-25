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
  /** Default application shown/highlighted when this space loads. */
  defaultApplication: string;
  cameraPresets: {
    /** Wide showroom-photograph view of the whole space — the default view. */
    hero: CameraPreset;
    front: CameraPreset;
    top: CameraPreset;
  };
  /** A medium "focus" shot for each application, used when it's selected. */
  applicationCameras: Record<string, CameraPreset>;
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
    defaultApplication: "island",
    cameraPresets: {
      hero: [2.9, 1.55, 2.7, -0.3, -0.1, -0.35],
      front: [0.1, 0.35, 3.2, 0.1, 0, -0.3],
      top: [0, 6.2, 0.2, 0, 0, 0.2],
    },
    applicationCameras: {
      countertop: [0.5, 0.8, 1.35, 0.1, 0.05, -1.0],
      island: [1.25, 0.9, 1.85, -0.1, 0.05, 0.55],
      backsplash: [0.55, 0.7, -0.25, 0.1, 0.365, -1.35],
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
    defaultApplication: "vanity",
    cameraPresets: {
      hero: [1.9, 1.35, 2.2, -0.6, -0.15, -0.7],
      front: [-0.5, 0.35, 3.0, -0.5, 0, -0.7],
      top: [0, 6.2, 0.2, 0, 0, 0.2],
    },
    applicationCameras: {
      vanity: [0.5, 0.75, 0.35, -0.5, -0.005, -1.05],
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
    defaultApplication: "tabletop",
    cameraPresets: {
      hero: [2.4, 1.15, 2.6, 0, -0.15, 0],
      front: [0, 0.5, 3.0, 0, -0.1, 0],
      top: [0, 5.6, 0.1, 0, 0, 0.1],
    },
    applicationCameras: {
      tabletop: [1.1, 0.55, 1.3, 0, -0.26, 0],
    },
    surfaceFocus: { tabletop: [0, -0.26, 0] },
  },
  {
    id: "living",
    label: "Living",
    hasFullScene: false,
    applications: [{ id: "coffeeTable", label: "Coffee Table" }],
    defaultApplication: "coffeeTable",
    cameraPresets: {
      hero: [2.4, 1.0, 2.6, 0, -0.2, 0],
      front: [0, 0.4, 3.0, 0, -0.2, 0],
      top: [0, 5.6, 0.1, 0, 0, 0.1],
    },
    applicationCameras: {
      coffeeTable: [1.1, 0.5, 1.3, 0, -0.26, 0],
    },
    surfaceFocus: { coffeeTable: [0, -0.26, 0] },
  },
  {
    id: "commercial",
    label: "Commercial",
    hasFullScene: false,
    applications: [{ id: "receptionDesk", label: "Reception Desk" }],
    defaultApplication: "receptionDesk",
    cameraPresets: {
      hero: [2.6, 1.2, 2.8, 0, -0.1, 0],
      front: [0, 0.5, 3.2, 0, 0, 0],
      top: [0, 5.8, 0.1, 0, 0, 0.1],
    },
    applicationCameras: {
      receptionDesk: [1.2, 0.6, 1.4, 0, -0.26, 0],
    },
    surfaceFocus: { receptionDesk: [0, -0.26, 0] },
  },
];

export const getSpace = (spaceId: string) => SPACES.find((s) => s.id === spaceId) ?? SPACES[0];
