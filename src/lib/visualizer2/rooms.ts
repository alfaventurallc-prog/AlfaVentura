/**
 * Step 4: room/space definitions. A RoomDef is pure data -- geometry
 * placement (metres, for the procedural renderer), physical dimensions
 * (mm, for the Step 3 tile/slab engine), available surfaces, and a default
 * camera. Nothing about the Visualizer's UI or state cares whether a room
 * is "procedural" or a future GLB import; both expose the same surface
 * list shape (see RoomRenderer.tsx).
 */

export type SurfaceType = "floor" | "wall" | "countertop" | "backsplash" | "ceiling";

export interface RoomSurfaceDef {
  id: string;
  label: string;
  type: SurfaceType;
  /** Procedural placement, in scene metres (ignored for GLB rooms, which
   * use glbSurfaceMap to find the mesh instead). */
  position: [number, number, number];
  rotation: [number, number, number];
  args: [number, number];
  /** Real-world size in mm -- feeds the Step 3 layout engine directly. */
  widthMm: number;
  heightMm: number;
  defaultColor: string;
  defaultRoughness: number;
}

export interface RoomCameraPreset {
  position: [number, number, number];
  target: [number, number, number];
}

export type RoomCategory = "kitchen" | "bathroom" | "living" | "bedroom";

export interface RoomDef {
  id: string;
  category: RoomCategory;
  name: string;
  modelType: "procedural" | "glb";
  /** For modelType "glb": path under /public, e.g. "/models/rooms/kitchen-modern-01.glb". */
  modelPath?: string;
  /** For modelType "glb": app-level surface id -> mesh name inside the GLB. */
  glbSurfaceMap?: Record<string, string>;
  dimensionsMm: { width: number; depth: number; height: number };
  surfaces: RoomSurfaceDef[];
  camera: RoomCameraPreset;
}

const WALL_COLOR = "#EFEAE0";
const FLOOR_COLOR = "#D9D2C4";
const COUNTER_COLOR = "#E9E4D8";

export const ROOMS: RoomDef[] = [
  {
    id: "kitchen-modern-01",
    category: "kitchen",
    name: "Modern Kitchen",
    modelType: "procedural",
    // Ready for a real asset later -- swap modelType to "glb" and set these:
    modelPath: "/models/rooms/kitchen-modern-01.glb",
    glbSurfaceMap: { floor: "Floor", backWall: "Back_Wall", leftWall: "Left_Wall", rightWall: "Right_Wall", countertop: "Countertop", backsplash: "Backsplash" },
    dimensionsMm: { width: 6000, depth: 4500, height: 3000 },
    camera: { position: [4.6, 2.2, 5.4], target: [0, 1, -1] },
    surfaces: [
      { id: "floor", label: "Floor", type: "floor", position: [0, 0, 0], rotation: [-Math.PI / 2, 0, 0], args: [6, 4.5], widthMm: 6000, heightMm: 4500, defaultColor: FLOOR_COLOR, defaultRoughness: 0.85 },
      { id: "backWall", label: "Back Wall", type: "wall", position: [0, 1.5, -2.25], rotation: [0, 0, 0], args: [6, 3], widthMm: 6000, heightMm: 3000, defaultColor: WALL_COLOR, defaultRoughness: 1 },
      { id: "leftWall", label: "Left Wall", type: "wall", position: [-3, 1.5, 0], rotation: [0, Math.PI / 2, 0], args: [4.5, 3], widthMm: 4500, heightMm: 3000, defaultColor: WALL_COLOR, defaultRoughness: 1 },
      { id: "rightWall", label: "Right Wall", type: "wall", position: [3, 1.5, 0], rotation: [0, -Math.PI / 2, 0], args: [4.5, 3], widthMm: 4500, heightMm: 3000, defaultColor: WALL_COLOR, defaultRoughness: 1 },
      { id: "countertop", label: "Countertop", type: "countertop", position: [0, 0.9, -1.925], rotation: [-Math.PI / 2, 0, 0], args: [4, 0.65], widthMm: 4000, heightMm: 650, defaultColor: COUNTER_COLOR, defaultRoughness: 0.3 },
      { id: "backsplash", label: "Backsplash", type: "backsplash", position: [0, 1.5, -2.249], rotation: [0, 0, 0], args: [4, 0.6], widthMm: 4000, heightMm: 600, defaultColor: COUNTER_COLOR, defaultRoughness: 0.4 },
    ],
  },
  {
    id: "bathroom-modern-01",
    category: "bathroom",
    name: "Modern Bathroom",
    modelType: "procedural",
    modelPath: "/models/rooms/bathroom-modern-01.glb",
    glbSurfaceMap: { floor: "Floor", mainWall: "Main_Wall", sideWall: "Side_Wall", showerWall: "Shower_Wall" },
    dimensionsMm: { width: 3000, depth: 2400, height: 2800 },
    camera: { position: [2.6, 1.8, 2.7], target: [0, 1.2, -0.5] },
    surfaces: [
      { id: "floor", label: "Floor", type: "floor", position: [0, 0, 0], rotation: [-Math.PI / 2, 0, 0], args: [3, 2.4], widthMm: 3000, heightMm: 2400, defaultColor: FLOOR_COLOR, defaultRoughness: 0.6 },
      { id: "mainWall", label: "Main Wall", type: "wall", position: [0, 1.4, -1.2], rotation: [0, 0, 0], args: [3, 2.8], widthMm: 3000, heightMm: 2800, defaultColor: WALL_COLOR, defaultRoughness: 1 },
      { id: "sideWall", label: "Side Wall", type: "wall", position: [-1.5, 1.4, 0], rotation: [0, Math.PI / 2, 0], args: [2.4, 2.8], widthMm: 2400, heightMm: 2800, defaultColor: WALL_COLOR, defaultRoughness: 1 },
      { id: "showerWall", label: "Shower Wall", type: "wall", position: [1.5, 1.4, -0.6], rotation: [0, -Math.PI / 2, 0], args: [1.2, 2.8], widthMm: 1200, heightMm: 2800, defaultColor: WALL_COLOR, defaultRoughness: 0.5 },
    ],
  },
  {
    id: "living-modern-01",
    category: "living",
    name: "Modern Living Room",
    modelType: "procedural",
    modelPath: "/models/rooms/living-modern-01.glb",
    glbSurfaceMap: { floor: "Floor", mainWall: "Main_Wall", accentWall: "Accent_Wall" },
    dimensionsMm: { width: 6000, depth: 5000, height: 3000 },
    camera: { position: [5.2, 2.2, 5.6], target: [0, 1, -1] },
    surfaces: [
      { id: "floor", label: "Floor", type: "floor", position: [0, 0, 0], rotation: [-Math.PI / 2, 0, 0], args: [6, 5], widthMm: 6000, heightMm: 5000, defaultColor: FLOOR_COLOR, defaultRoughness: 0.7 },
      { id: "mainWall", label: "Main Wall", type: "wall", position: [0, 1.5, -2.5], rotation: [0, 0, 0], args: [6, 3], widthMm: 6000, heightMm: 3000, defaultColor: WALL_COLOR, defaultRoughness: 1 },
      { id: "accentWall", label: "Accent Wall", type: "wall", position: [-3, 1.5, 0], rotation: [0, Math.PI / 2, 0], args: [5, 3], widthMm: 5000, heightMm: 3000, defaultColor: WALL_COLOR, defaultRoughness: 1 },
    ],
  },
  {
    id: "bedroom-modern-01",
    category: "bedroom",
    name: "Modern Bedroom",
    modelType: "procedural",
    modelPath: "/models/rooms/bedroom-modern-01.glb",
    glbSurfaceMap: { floor: "Floor", mainWall: "Main_Wall", accentWall: "Accent_Wall" },
    dimensionsMm: { width: 4500, depth: 4000, height: 2900 },
    camera: { position: [3.8, 1.9, 4.3], target: [0, 1, -0.8] },
    surfaces: [
      { id: "floor", label: "Floor", type: "floor", position: [0, 0, 0], rotation: [-Math.PI / 2, 0, 0], args: [4.5, 4], widthMm: 4500, heightMm: 4000, defaultColor: FLOOR_COLOR, defaultRoughness: 0.75 },
      { id: "mainWall", label: "Main Wall", type: "wall", position: [0, 1.45, -2], rotation: [0, 0, 0], args: [4.5, 2.9], widthMm: 4500, heightMm: 2900, defaultColor: WALL_COLOR, defaultRoughness: 1 },
      { id: "accentWall", label: "Accent Wall", type: "wall", position: [2.25, 1.45, 0], rotation: [0, -Math.PI / 2, 0], args: [4, 2.9], widthMm: 4000, heightMm: 2900, defaultColor: WALL_COLOR, defaultRoughness: 1 },
    ],
  },
];

export const getRoom = (id: string): RoomDef => ROOMS.find((r) => r.id === id) ?? ROOMS[0];
