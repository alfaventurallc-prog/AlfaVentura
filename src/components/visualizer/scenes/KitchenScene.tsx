import * as THREE from "three";
import { MaterialSurface, SolidBox, SolidExtrusion, TexturedSlab, useExtrudedFootprint } from "../MaterialSurface";
import { BackWall, Ceiling, Floor, SideWall, useWoodGrainTexture } from "./roomParts";
import type { LayoutId, ThicknessMm, EdgeProfile } from "@/data/kitchenCatalog";
import { thicknessScale } from "@/data/kitchenCatalog";
import type { WaterfallOption } from "@/lib/visualizerUrlState";
import type { VisualizerProduct } from "../../../../types";

const WALL_COLOR = "#EFEAE0";
const HANDLE_COLOR = "#9C9691";
const RECESS_COLOR = "#241C15";

type Pt = [number, number];

interface KitchenSceneProps {
  layout: LayoutId;
  mirrored: boolean;
  cabinetColor: string;
  countertopProduct: VisualizerProduct | null;
  backsplashProduct: VisualizerProduct | null;
  floorColor: string;
  floorRoughness: number;
  waterfall: WaterfallOption;
  thicknessMm: ThicknessMm;
  veinRotation: 0 | 90;
  edgeProfile: EdgeProfile;
}

/** Darken a "#rrggbb" hex color by the given factor (0-1, lower = darker). */
const darken = (hex: string, factor: number): string => {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const r = clamp(((n >> 16) & 0xff) * factor);
  const g = clamp(((n >> 8) & 0xff) * factor);
  const b = clamp((n & 0xff) * factor);
  const toHex = (v: number) => v.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/** A rounded ("bullnose") front-top edge -- a thin cylinder running along
 * the counter's front corner, muted so it blends with any slab tone. */
const BevelEdge = ({ position, length, axis = "x" }: { position: [number, number, number]; length: number; axis?: "x" | "z" }) => (
  <mesh position={position} rotation={axis === "x" ? [0, 0, Math.PI / 2] : [Math.PI / 2, 0, 0]} castShadow receiveShadow>
    <cylinderGeometry args={[0.014, 0.014, length, 16]} />
    <meshStandardMaterial color="#CFC6B4" roughness={0.35} metalness={0} />
  </mesh>
);

/**
 * A shaker-style cabinet door, centred on `position`, facing local +Z
 * (rotate about Y to face another way). Built as a slab plus four raised
 * frame rails around a recessed centre panel, with a bar handle on posts.
 *
 * The previous doors were sunk ~1cm BEHIND the cabinet body's front face,
 * so only their knobs poked out and every cabinet read as one plain box.
 * These sit proud of the face, which is what makes them read as doors.
 */
const SLAB = 0.03;
const ShakerDoor = ({
  position,
  rotationY = 0,
  width,
  height,
  color,
  map,
  handle = "top",
}: {
  position: [number, number, number];
  rotationY?: number;
  width: number;
  height: number;
  color: string;
  map?: THREE.Texture | null;
  handle?: "top" | "bottom";
}) => {
  const rail = 0.07;
  const railZ = SLAB / 2 + 0.006;
  const handleY = handle === "top" ? height / 2 - 0.11 : -height / 2 + 0.11;
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <SolidBox args={[width, height, SLAB]} position={[0, 0, 0]} color={color} map={map} roughness={0.5} />
      <SolidBox args={[width, rail, 0.012]} position={[0, height / 2 - rail / 2, railZ]} color={color} map={map} roughness={0.5} />
      <SolidBox args={[width, rail, 0.012]} position={[0, -height / 2 + rail / 2, railZ]} color={color} map={map} roughness={0.5} />
      <SolidBox args={[rail, height - rail * 2, 0.012]} position={[width / 2 - rail / 2, 0, railZ]} color={color} map={map} roughness={0.5} />
      <SolidBox args={[rail, height - rail * 2, 0.012]} position={[-width / 2 + rail / 2, 0, railZ]} color={color} map={map} roughness={0.5} />
      <SolidBox
        args={[width - rail * 2, height - rail * 2, 0.006]}
        position={[0, 0, SLAB / 2 + 0.003]}
        color={darken(color, 0.9)}
        roughness={0.55}
      />
      <SolidBox args={[0.16, 0.014, 0.014]} position={[0, handleY, SLAB / 2 + 0.05]} color={HANDLE_COLOR} roughness={0.25} metalness={0.7} />
      <SolidBox args={[0.012, 0.012, 0.04]} position={[-0.06, handleY, SLAB / 2 + 0.03]} color={HANDLE_COLOR} roughness={0.25} metalness={0.7} />
      <SolidBox args={[0.012, 0.012, 0.04]} position={[0.06, handleY, SLAB / 2 + 0.03]} color={HANDLE_COLOR} roughness={0.25} metalness={0.7} />
    </group>
  );
};

/**
 * A row of doors across one cabinet face. `axis` "x" = the run goes along
 * X and the face looks toward +Z; "z" = it goes along Z and looks toward +X.
 * `front` is the world coordinate of the face itself. A dark strip sits
 * behind the doors so the small gaps between them read as real reveal lines
 * instead of vanishing into the same-coloured cabinet body.
 */
const DoorRow = ({
  axis,
  front,
  from,
  to,
  y,
  height,
  color,
  map,
  handle = "top",
}: {
  axis: "x" | "z";
  front: number;
  from: number;
  to: number;
  y: number;
  height: number;
  color: string;
  map?: THREE.Texture | null;
  handle?: "top" | "bottom";
}) => {
  const length = to - from;
  const count = Math.max(1, Math.round(length / 0.95));
  const doorW = length / count - 0.016;
  const mid = (from + to) / 2;
  const alongX = axis === "x";
  return (
    <group>
      <SolidBox
        args={alongX ? [length, height, 0.004] : [0.004, height, length]}
        position={alongX ? [mid, y, front + 0.002] : [front + 0.002, y, mid]}
        color={RECESS_COLOR}
        roughness={0.9}
      />
      {Array.from({ length: count }, (_, i) => {
        const c = from + (length / count) * (i + 0.5);
        return (
          <ShakerDoor
            key={i}
            position={alongX ? [c, y, front + SLAB / 2] : [front + SLAB / 2, y, c]}
            rotationY={alongX ? 0 : Math.PI / 2}
            width={doorW}
            height={height}
            color={color}
            map={map}
            handle={handle}
          />
        );
      })}
    </group>
  );
};

const STEEL = "#B7BBBD";

/** Built-in dishwasher: stainless front panel with a control strip and a
 * long bar handle, centred at `x`, flush with the base-cabinet face `front`. */
const Dishwasher = ({ x, front, y, height }: { x: number; front: number; y: number; height: number }) => {
  const w = 0.6;
  const zf = front + 0.02;
  return (
    <group>
      <SolidBox args={[w + 0.012, height, 0.004]} position={[x, y, front + 0.002]} color={RECESS_COLOR} roughness={0.9} />
      <SolidBox args={[w, height - 0.01, 0.03]} position={[x, y, front + 0.015]} color={STEEL} roughness={0.28} metalness={0.75} />
      <SolidBox args={[w - 0.04, 0.06, 0.006]} position={[x, y + height / 2 - 0.075, zf + 0.0]} color="#1B1D1F" roughness={0.3} metalness={0.3} />
      <SolidBox args={[0.012, 0.012, 0.006]} position={[x + w / 2 - 0.06, y + height / 2 - 0.075, zf + 0.004]} color="#7FE3FF" roughness={0.3} />
      <SolidBox args={[w - 0.12, 0.016, 0.016]} position={[x, y + height / 2 - 0.16, front + 0.06]} color="#D5D8DA" roughness={0.2} metalness={0.85} />
      <SolidBox args={[0.014, 0.014, 0.035]} position={[x - (w - 0.16) / 2, y + height / 2 - 0.16, front + 0.042]} color="#D5D8DA" roughness={0.2} metalness={0.85} />
      <SolidBox args={[0.014, 0.014, 0.035]} position={[x + (w - 0.16) / 2, y + height / 2 - 0.16, front + 0.042]} color="#D5D8DA" roughness={0.2} metalness={0.85} />
    </group>
  );
};

/** Countertop microwave facing +X (for the return leg): steel body, dark
 * glass door, side control column with a small display. */
const Microwave = ({ x, z, topY }: { x: number; z: number; topY: number }) => {
  const d = 0.36, w = 0.5, h = 0.27;
  const fx = x + d / 2;
  return (
    <group position={[0, topY, 0]}>
      <SolidBox args={[d, h, w]} position={[x, h / 2, z]} color={STEEL} roughness={0.3} metalness={0.7} />
      <SolidBox args={[0.008, h - 0.05, w * 0.68]} position={[fx + 0.002, h / 2, z + w * 0.12]} color="#15181A" roughness={0.12} metalness={0.4} />
      <SolidBox args={[0.008, 0.05, w * 0.2]} position={[fx + 0.002, h - 0.07, z - w * 0.32]} color="#101214" roughness={0.3} />
      <SolidBox args={[0.010, 0.012, 0.05]} position={[fx + 0.003, h - 0.07, z - w * 0.32]} color="#7FE3FF" roughness={0.3} />
      <SolidBox args={[0.012, 0.08, 0.012]} position={[fx + 0.012, h / 2, z - w * 0.24]} color="#D5D8DA" roughness={0.2} metalness={0.85} />
    </group>
  );
};

const SinkFaucet = ({ x, z }: { x: number; z: number }) => (
  <>
    <mesh position={[x, 0.09, z]}>
      <boxGeometry args={[0.55, 0.03, 0.35]} />
      <meshStandardMaterial color="#B9BCBE" roughness={0.25} metalness={0.6} />
    </mesh>
    <mesh position={[x, 0.35, z - 0.32]} castShadow>
      <cylinderGeometry args={[0.016, 0.016, 0.32, 12]} />
      <meshStandardMaterial color={HANDLE_COLOR} roughness={0.2} metalness={0.7} />
    </mesh>
    <mesh position={[x, 0.49, z - 0.22]} rotation={[Math.PI / 2.4, 0, 0]} castShadow>
      <cylinderGeometry args={[0.014, 0.014, 0.18, 12]} />
      <meshStandardMaterial color={HANDLE_COLOR} roughness={0.2} metalness={0.7} />
    </mesh>
  </>
);

/** Small warm LED line under the upper cabinets. */
const UnderCabinetLight = ({ position, args }: { position: [number, number, number]; args: [number, number, number] }) => (
  <mesh position={position}>
    <boxGeometry args={args} />
    <meshStandardMaterial color="#FFE9C2" emissive="#FFD9A0" emissiveIntensity={1.4} roughness={0.5} toneMapped={false} />
  </mesh>
);

/** A bowl of fruit + cutting board resting on a countertop. */
const CountertopDecor = ({ x, z, topY }: { x: number; z: number; topY: number }) => (
  <group position={[x, topY, z]}>
    <mesh position={[-0.05, 0.015, 0]} castShadow>
      <boxGeometry args={[0.34, 0.02, 0.24]} />
      <meshStandardMaterial color="#9C7A4D" roughness={0.5} />
    </mesh>
    <mesh position={[0.32, 0.045, 0.02]} castShadow>
      <cylinderGeometry args={[0.11, 0.09, 0.06, 20]} />
      <meshStandardMaterial color="#EDEAE2" roughness={0.3} />
    </mesh>
    {[
      ["#C9432B", 0.3, 0.09, -0.01],
      ["#D9A62E", 0.35, 0.095, 0.04],
      ["#8FA85C", 0.29, 0.095, 0.06],
    ].map(([color, px, py, pz], i) => (
      <mesh key={i} position={[Number(px), Number(py), Number(pz)]} castShadow>
        <sphereGeometry args={[0.045, 14, 14]} />
        <meshStandardMaterial color={color as string} roughness={0.4} />
      </mesh>
    ))}
  </group>
);

/**
 * The L-shaped kitchen, built as ONE continuous L instead of two straight
 * runs placed near each other. Countertop, base cabinet carcass, toe-kick,
 * backsplash and upper cabinets are each a single extruded L polygon, so
 * every corner is a true 90-degree join with no seam or gap, and the stone
 * pattern (UVs come from world position) flows around the corner.
 * Everything sits flush against the back wall (z=-1.75) and side wall
 * (x=-2.7), with a blind corner cabinet (no doors) where the runs meet.
 */
const LSHAPE_CT: Pt[] = [[-2.7, -1.75], [2.08, -1.75], [2.08, -1.1], [-2.05, -1.1], [-2.05, 0.6], [-2.7, 0.6]];
const LSHAPE_CAB: Pt[] = [[-2.7, -1.75], [2.03, -1.75], [2.03, -1.15], [-2.1, -1.15], [-2.1, 0.55], [-2.7, 0.55]];
const LSHAPE_TOE: Pt[] = [[-2.7, -1.75], [1.97, -1.75], [1.97, -1.21], [-2.16, -1.21], [-2.16, 0.49], [-2.7, 0.49]];
const LSHAPE_UPPER: Pt[] = [[-2.7, -1.75], [2.03, -1.75], [2.03, -1.43], [-2.38, -1.43], [-2.38, 0.55], [-2.7, 0.55]];
const LSHAPE_SPLASH: Pt[] = [[-2.7, -1.75], [2.08, -1.75], [2.08, -1.7], [-2.65, -1.7], [-2.65, 0.6], [-2.7, 0.6]];

const LShapeKitchen = ({
  cabinetColor,
  cabinetTexture,
  countertopProduct,
  backsplashProduct,
  thicknessMm,
  veinRotation,
  edgeProfile,
}: {
  cabinetColor: string;
  cabinetTexture: THREE.Texture | null;
  countertopProduct: VisualizerProduct | null;
  backsplashProduct: VisualizerProduct | null;
  thicknessMm: ThicknessMm;
  veinRotation: 0 | 90;
  edgeProfile: EdgeProfile;
}) => {
  const topY = 0.09;
  const slabHeight = topY * thicknessScale(thicknessMm);

  const counterGeo = useExtrudedFootprint(LSHAPE_CT, topY - slabHeight, slabHeight);
  const cabinetGeo = useExtrudedFootprint(LSHAPE_CAB, -0.75, 0.75);
  const toeGeo = useExtrudedFootprint(LSHAPE_TOE, -0.85, 0.1);
  const upperGeo = useExtrudedFootprint(LSHAPE_UPPER, 0.875, 0.55);
  const splashGeo = useExtrudedFootprint(LSHAPE_SPLASH, topY, 0.875 - topY);

  return (
    <group>
      <SolidExtrusion geometry={toeGeo} color={RECESS_COLOR} roughness={0.9} />
      <SolidExtrusion geometry={cabinetGeo} color={cabinetColor} map={cabinetTexture} />
      <TexturedSlab product={countertopProduct} geometry={counterGeo} veinRotationDeg={veinRotation} />
      <TexturedSlab product={backsplashProduct} geometry={splashGeo} veinRotationDeg={veinRotation} />
      <SolidExtrusion geometry={upperGeo} color={cabinetColor} map={cabinetTexture} />

      {edgeProfile === "beveled" && (
        <>
          <BevelEdge position={[0.015, topY - 0.012, -1.1 - 0.012 + 0.024]} length={4.13} axis="x" />
          <BevelEdge position={[-2.05 - 0.012 + 0.024, topY - 0.012, -0.25]} length={1.7} axis="z" />
        </>
      )}

      {/* base doors: main run then return leg; the corner block behind the
          return leg (x < -2.1) is a blind corner, so no doors there */}
      <DoorRow axis="x" front={-1.15} from={-2.1} to={-1.0} y={-0.375} height={0.7} color={cabinetColor} map={cabinetTexture} />
      <Dishwasher x={-0.7} front={-1.15} y={-0.375} height={0.7} />
      <DoorRow axis="x" front={-1.15} from={-0.4} to={2.03} y={-0.375} height={0.7} color={cabinetColor} map={cabinetTexture} />
      <DoorRow axis="z" front={-2.1} from={-1.15} to={0.55} y={-0.375} height={0.7} color={cabinetColor} map={cabinetTexture} />
      {/* upper doors (these used to be hidden inside the upper cabinet box) */}
      <DoorRow axis="x" front={-1.43} from={-2.38} to={2.03} y={1.15} height={0.51} color={cabinetColor} map={cabinetTexture} handle="bottom" />
      <DoorRow axis="z" front={-2.38} from={-1.43} to={0.55} y={1.15} height={0.51} color={cabinetColor} map={cabinetTexture} handle="bottom" />

      <UnderCabinetLight position={[-0.175, 0.868, -1.4]} args={[4.2, 0.012, 0.02]} />
      <UnderCabinetLight position={[-2.35, 0.868, -0.44]} args={[0.02, 0.012, 1.85]} />

      <SinkFaucet x={0.1} z={-1.375} />
      <Microwave x={-2.4} z={-0.15} topY={topY} />
      <CountertopDecor x={1.45} z={-1.425} topY={topY} />
    </group>
  );
};

/** Straight run along the back wall (used by the island and galley layouts). */
const WallRun = ({
  width,
  centerX,
  z,
  cabinetColor,
  cabinetTexture,
  countertopProduct,
  backsplashProduct,
  withUpper = true,
  withSink = true,
  thicknessMm = 20,
  veinRotation = 0,
  edgeProfile = "square",
}: {
  width: number;
  centerX: number;
  z: number;
  cabinetColor: string;
  cabinetTexture?: THREE.Texture | null;
  countertopProduct: VisualizerProduct | null;
  backsplashProduct: VisualizerProduct | null;
  withUpper?: boolean;
  withSink?: boolean;
  thicknessMm?: ThicknessMm;
  veinRotation?: 0 | 90;
  edgeProfile?: EdgeProfile;
}) => {
  const topY = 0.09;
  const slabHeight = topY * thicknessScale(thicknessMm);
  const left = centerX - width / 2;
  const right = centerX + width / 2;
  const front = z + 0.31;

  return (
    <group>
      <SolidBox args={[width - 0.12, 0.1, 0.5]} position={[centerX, -0.8, z]} color={RECESS_COLOR} roughness={0.9} />
      <SolidBox args={[width, 0.75, 0.62]} position={[centerX, -0.375, z]} color={cabinetColor} roughness={0.55} map={cabinetTexture} />
      <DoorRow axis="x" front={front} from={left} to={right} y={-0.375} height={0.7} color={cabinetColor} map={cabinetTexture} />
      <MaterialSurface
        product={countertopProduct}
        args={[width + 0.16, slabHeight, 0.7]}
        position={[centerX, topY - slabHeight / 2, z]}
        heroFace="top"
        veinRotationDeg={veinRotation}
      />
      {edgeProfile === "beveled" && <BevelEdge position={[centerX, topY - 0.012, z + 0.35 - 0.012]} length={width + 0.16} axis="x" />}

      {withUpper && (
        <>
          <SolidBox args={[width, 0.55, 0.3]} position={[centerX, 1.15, z - 0.55]} color={cabinetColor} roughness={0.55} map={cabinetTexture} />
          <DoorRow axis="x" front={z - 0.4} from={left} to={right} y={1.15} height={0.51} color={cabinetColor} map={cabinetTexture} handle="bottom" />
          <MaterialSurface product={backsplashProduct} args={[width + 0.16, 0.785, 0.1]} position={[centerX, 0.4825, z - 0.35]} heroFace="front" />
          <UnderCabinetLight position={[centerX, 0.868, z - 0.37]} args={[width - 0.1, 0.012, 0.02]} />
        </>
      )}

      {withSink && <SinkFaucet x={centerX} z={z + 0.05} />}
      {withSink && <CountertopDecor x={centerX + width / 2 - 0.55} z={z} topY={0.09} />}
    </group>
  );
};

const PendantLight = ({ x, z }: { x: number; z: number }) => (
  <group position={[x, 0, z]}>
    <mesh position={[0, 1.55, 0]}>
      <cylinderGeometry args={[0.006, 0.006, 0.7, 6]} />
      <meshStandardMaterial color="#2A241E" roughness={0.4} />
    </mesh>
    <mesh position={[0, 1.16, 0]} castShadow>
      <cylinderGeometry args={[0.075, 0.1, 0.16, 24, 1, true]} />
      <meshStandardMaterial color="#2A241E" roughness={0.35} metalness={0.3} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, 1.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.075, 24]} />
      <meshStandardMaterial color="#FFE9C2" emissive="#FFD9A0" emissiveIntensity={1.2} toneMapped={false} />
    </mesh>
  </group>
);

const Island = ({
  cabinetColor,
  cabinetTexture,
  countertopProduct,
  waterfall,
  thicknessMm = 20,
  veinRotation = 0,
  edgeProfile = "square",
}: {
  cabinetColor: string;
  cabinetTexture?: THREE.Texture | null;
  countertopProduct: VisualizerProduct | null;
  waterfall: WaterfallOption;
  thicknessMm?: ThicknessMm;
  veinRotation?: 0 | 90;
  edgeProfile?: EdgeProfile;
}) => {
  const topY = 0.1;
  const scale = thicknessScale(thicknessMm);
  const slabHeight = topY * scale;
  const waterfallThickness = 0.06 * scale;
  const leftOuterX = -1.03;
  const rightOuterX = 0.83;

  return (
    <group>
      <SolidBox args={[1.58, 0.1, 0.73]} position={[-0.1, -0.8, 0.55]} color={RECESS_COLOR} roughness={0.9} />
      <SolidBox args={[1.7, 0.75, 0.85]} position={[-0.1, -0.375, 0.55]} color={cabinetColor} roughness={0.55} map={cabinetTexture} />
      <DoorRow axis="x" front={0.975} from={-0.95} to={0.75} y={-0.375} height={0.7} color={cabinetColor} map={cabinetTexture} />
      <MaterialSurface
        product={countertopProduct}
        args={[1.86, slabHeight, 1.0]}
        position={[-0.1, topY - slabHeight / 2, 0.55]}
        heroFace="top"
        veinRotationDeg={veinRotation}
      />
      {edgeProfile === "beveled" && <BevelEdge position={[-0.1, topY - 0.012, 1.05 - 0.012]} length={1.86} axis="x" />}
      {(waterfall === "left" || waterfall === "both") && (
        <MaterialSurface
          product={countertopProduct}
          args={[waterfallThickness, 0.85, 1.0]}
          position={[leftOuterX + waterfallThickness / 2, -0.425, 0.55]}
          heroFace="side"
        />
      )}
      {(waterfall === "right" || waterfall === "both") && (
        <MaterialSurface
          product={countertopProduct}
          args={[waterfallThickness, 0.85, 1.0]}
          position={[rightOuterX - waterfallThickness / 2, -0.425, 0.55]}
          heroFace="sideEnd"
        />
      )}
      <CountertopDecor x={-0.55} z={0.35} topY={0.1} />
      <PendantLight x={0.25} z={0.35} />
      <PendantLight x={-0.5} z={0.35} />

      <group position={[-0.1, -0.65, 1.25]}>
        <mesh position={[0, 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.06, 24]} />
          <meshStandardMaterial color="#3C332B" roughness={0.5} />
        </mesh>
        {[
          [-0.14, -0.14],
          [0.14, -0.14],
          [-0.14, 0.14],
          [0.14, 0.14],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 0, z]} castShadow>
            <cylinderGeometry args={[0.014, 0.014, 0.68, 8]} />
            <meshStandardMaterial color={HANDLE_COLOR} roughness={0.3} metalness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

const KitchenScene = ({
  layout,
  mirrored,
  cabinetColor,
  countertopProduct,
  backsplashProduct,
  floorColor,
  floorRoughness,
  waterfall,
  thicknessMm,
  veinRotation,
  edgeProfile,
}: KitchenSceneProps) => {
  // Generated once per cabinet color and shared by every cabinet body and
  // door in the scene, so the wood grain matches everywhere.
  const cabinetTexture = useWoodGrainTexture(cabinetColor);

  return (
    <group scale={[mirrored ? -1 : 1, 1, 1]}>
      <Floor color={floorColor} roughness={floorRoughness} />
      <BackWall color={WALL_COLOR} />
      <SideWall color={WALL_COLOR} x={-2.7} />
      {/* Solid corner post where the back and side walls meet, so the two
          thin planes have no shared edge to z-fight over. */}
      <SolidBox args={[0.08, 3.05, 0.08]} position={[-2.7, 0.675, -1.75]} color={WALL_COLOR} roughness={0.92} />
      <Ceiling />

      {layout === "island" && (
        <>
          <WallRun
            width={3.8}
            centerX={0.1}
            z={-1.05}
            cabinetColor={cabinetColor}
            cabinetTexture={cabinetTexture}
            countertopProduct={countertopProduct}
            backsplashProduct={backsplashProduct}
            thicknessMm={thicknessMm}
            veinRotation={veinRotation}
            edgeProfile={edgeProfile}
          />
          <Island
            cabinetColor={cabinetColor}
            cabinetTexture={cabinetTexture}
            countertopProduct={countertopProduct}
            waterfall={waterfall}
            thicknessMm={thicknessMm}
            veinRotation={veinRotation}
            edgeProfile={edgeProfile}
          />
        </>
      )}

      {layout === "lshape" && (
        <LShapeKitchen
          cabinetColor={cabinetColor}
          cabinetTexture={cabinetTexture}
          countertopProduct={countertopProduct}
          backsplashProduct={backsplashProduct}
          thicknessMm={thicknessMm}
          veinRotation={veinRotation}
          edgeProfile={edgeProfile}
        />
      )}

      {layout === "galley" && (
        <>
          <WallRun
            width={3.8}
            centerX={0.1}
            z={-1.05}
            cabinetColor={cabinetColor}
            cabinetTexture={cabinetTexture}
            countertopProduct={countertopProduct}
            backsplashProduct={backsplashProduct}
            thicknessMm={thicknessMm}
            veinRotation={veinRotation}
            edgeProfile={edgeProfile}
          />
          <WallRun
            width={3.4}
            centerX={0.1}
            z={0.95}
            cabinetColor={cabinetColor}
            cabinetTexture={cabinetTexture}
            countertopProduct={countertopProduct}
            backsplashProduct={null}
            withUpper={false}
            withSink={false}
            thicknessMm={thicknessMm}
            veinRotation={veinRotation}
            edgeProfile={edgeProfile}
          />
        </>
      )}
    </group>
  );
};

export default KitchenScene;
