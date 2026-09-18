import * as THREE from "three";
import { MaterialSurface, SolidBox } from "../MaterialSurface";
import { BackWall, Ceiling, Floor, SideWall, useWoodGrainTexture } from "./roomParts";
import type { LayoutId, ThicknessMm, EdgeProfile } from "@/data/kitchenCatalog";
import { thicknessScale } from "@/data/kitchenCatalog";
import type { WaterfallOption } from "@/lib/visualizerUrlState";
import type { VisualizerProduct } from "../../../../types";

const WALL_COLOR = "#EFEAE0";
const DOOR_COLOR = "#3C332B";
const HANDLE_COLOR = "#9C9691";

/** Darken a "#rrggbb" hex color by the given factor (0-1, lower = darker) --
 * used to shade a cabinet door's recessed center panel a touch darker than
 * its frame, the shadow line that makes it read as a real shaker-style
 * door instead of a single flat block of color. */
const darken = (hex: string, factor: number): string => {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const r = clamp(((n >> 16) & 0xff) * factor);
  const g = clamp(((n >> 8) & 0xff) * factor);
  const b = clamp((n & 0xff) * factor);
  const toHex = (v: number) => v.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

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

/** A rounded ("bullnose") front-top edge -- a thin cylinder running along
 * the counter's front corner reads as an actual round-over under lighting,
 * unlike the previous flat diagonal strip (which just looked like a bright
 * white line cutting across the slab). Colored as a soft, muted highlight
 * rather than white so it blends with any slab tone instead of standing
 * out as its own separate piece. */
const BevelEdge = ({ length, centerX, topY, frontZ }: { length: number; centerX: number; topY: number; frontZ: number }) => (
  <mesh position={[centerX, topY - 0.012, frontZ - 0.012]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
    <cylinderGeometry args={[0.014, 0.014, length, 16]} />
    <meshStandardMaterial color="#CFC6B4" roughness={0.35} metalness={0} />
  </mesh>
);

const CabinetDoor = ({
  x,
  z,
  width,
  y = -0.425,
  height = 0.72,
  color = DOOR_COLOR,
}: {
  x: number;
  z: number;
  width: number;
  y?: number;
  height?: number;
  color?: string;
}) => (
  <group>
    <SolidBox args={[width, height, 0.035]} position={[x, y, z]} color={color} roughness={0.4} />
    {/* recessed center panel -- a shaker-style groove line so the door
        reads as a real panel instead of one flat block of color. Darkened
        further (0.82 -> 0.68) so the panel division is actually visible
        instead of reading as a near-invisible tonal shift. */}
    <SolidBox args={[width - 0.09, height - 0.14, 0.012]} position={[x, y, z - 0.006]} color={darken(color, 0.68)} roughness={0.5} />
    {/* cylindrical knob instead of a flat handle bar -- catches a small
        specular highlight and reads as real hardware rather than a
        painted-on stripe. */}
    <mesh position={[x, y + height / 2 - 0.06, z + 0.032]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[0.011, 0.011, 0.045, 10]} />
      <meshStandardMaterial color={HANDLE_COLOR} roughness={0.25} metalness={0.6} />
    </mesh>
  </group>
);

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

/** Small warm LED line under the upper cabinets -- reads as ambient task
 * lighting over the counter, a strong "this is a real kitchen" cue. */
const UnderCabinetLight = ({ x, z, width, y = 0.86 }: { x: number; z: number; width: number; y?: number }) => (
  <mesh position={[x, y, z]}>
    <boxGeometry args={[width - 0.1, 0.015, 0.02]} />
    <meshStandardMaterial color="#FFE9C2" emissive="#FFD9A0" emissiveIntensity={1.4} roughness={0.5} toneMapped={false} />
  </mesh>
);

/** A bowl of fruit + cutting board resting on a countertop -- small lived-in
 * details that make an empty slab read as a used kitchen counter. */
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

/** Back-wall run: base cabinets + countertop + upper cabinets + backsplash + sink. */
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
  const doorCount = Math.max(2, Math.round(width / 0.95));
  const doorWidth = width / doorCount - 0.1;
  const doorXs = Array.from({ length: doorCount }, (_, i) => centerX - width / 2 + width / doorCount * (i + 0.5));
  // Top surface stays at a fixed height regardless of thickness -- the extra
  // material extends downward, like a real slab measured from its top face.
  const topY = 0.09;
  const slabHeight = topY * thicknessScale(thicknessMm);

  return (
    <group>
      <SolidBox args={[width, 0.85, 0.62]} position={[centerX, -0.425, z]} color={cabinetColor} roughness={0.55} map={cabinetTexture} />
      {doorXs.map((x, i) => (
        <CabinetDoor key={i} x={x} z={z + 0.31 - 0.03} width={doorWidth} color={cabinetColor === DOOR_COLOR ? "#2A241E" : DOOR_COLOR} />
      ))}
      <MaterialSurface
        product={countertopProduct}
        args={[width + 0.16, slabHeight, 0.7]}
        position={[centerX, topY - slabHeight / 2, z]}
        heroFace="top"
        veinRotationDeg={veinRotation}
      />
      {edgeProfile === "beveled" && <BevelEdge length={width + 0.16} centerX={centerX} topY={topY} frontZ={z + 0.35} />}

      {withUpper && (
        <>
          <SolidBox args={[width, 0.55, 0.3]} position={[centerX, 1.15, z - 0.55]} color={cabinetColor} roughness={0.55} map={cabinetTexture} />
          {doorXs.map((x, i) => (
            <CabinetDoor key={i} x={x} z={z - 0.67} width={doorWidth} y={1.15} height={0.45} color={cabinetColor === DOOR_COLOR ? "#2A241E" : DOOR_COLOR} />
          ))}
          {/* Backsplash spans the full countertop-to-upper-cabinet height
              (0.09 to 0.875) and its depth now extends back to z-0.4 to
              physically touch the upper cabinet's front face (also z-0.4) --
              it previously stopped 0.05 units short in depth, leaving a gap
              you could see through to the wall behind (the bright seam). */}
          <MaterialSurface product={backsplashProduct} args={[width + 0.16, 0.785, 0.1]} position={[centerX, 0.4825, z - 0.35]} heroFace="front" />
          <UnderCabinetLight x={centerX} z={z - 0.42} width={width} y={0.865} />
        </>
      )}

      {withSink && <SinkFaucet x={centerX} z={z + 0.05} />}
      {withSink && <CountertopDecor x={centerX + width / 2 - 0.55} z={z} topY={0.09} />}
    </group>
  );
};

/** Cabinet door for a run that faces +X into the room (the L-shape's
 * perpendicular return leg) -- CabinetDoor above only faces +Z, so this is
 * its 90-degree-rotated counterpart: the "width" runs along Z instead of X. */
const ReturnLegDoor = ({
  x,
  z,
  width,
  y = -0.425,
  height = 0.72,
  color = DOOR_COLOR,
}: {
  x: number;
  z: number;
  width: number;
  y?: number;
  height?: number;
  color?: string;
}) => (
  <group>
    <SolidBox args={[0.035, height, width]} position={[x, y, z]} color={color} roughness={0.4} />
    <SolidBox args={[0.012, height - 0.14, width - 0.09]} position={[x - 0.006, y, z]} color={darken(color, 0.68)} roughness={0.5} />
    <mesh position={[x + 0.032, y + height / 2 - 0.06, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[0.011, 0.011, 0.045, 10]} />
      <meshStandardMaterial color={HANDLE_COLOR} roughness={0.25} metalness={0.6} />
    </mesh>
  </group>
);

/**
 * The L-shape's perpendicular second run, built directly in world
 * coordinates (no rotated group) so it can be derived from -- and always
 * stays flush with -- the main run and the side wall, instead of relying on
 * hand-tuned offsets that drift out of sync (the recurring source of gaps
 * and overlaps in earlier iterations).
 *
 * Geometrically this is a proper T-join, not an overlap: the return leg's
 * countertop/cabinet occupy X in [sideWallX, mainLeftEdge] -- a strip that
 * is fully outside the main run's own X range [mainLeftEdge, mainRightEdge]
 * -- so the two meet exactly at the shared plane x = mainLeftEdge with zero
 * gap and zero z-fighting, while the base cabinet's back face sits flush at
 * x = sideWallX with zero gap against the side wall.
 */
const ReturnLeg = ({
  sideWallX,
  mainLeftEdge,
  mainBackZ,
  length,
  cabinetColor,
  cabinetTexture,
  countertopProduct,
  backsplashProduct,
  withUpper = true,
  thicknessMm = 20,
  veinRotation = 0,
}: {
  sideWallX: number;
  mainLeftEdge: number;
  mainBackZ: number;
  length: number;
  cabinetColor: string;
  cabinetTexture?: THREE.Texture | null;
  countertopProduct: VisualizerProduct | null;
  backsplashProduct: VisualizerProduct | null;
  withUpper?: boolean;
  thicknessMm?: ThicknessMm;
  veinRotation?: 0 | 90;
}) => {
  const topY = 0.09;
  const slabHeight = topY * thicknessScale(thicknessMm);
  // The main run's countertop and this one meet at the exact same plane
  // (x = mainLeftEdge) computed the exact same way in both places, so in
  // principle they touch with zero gap -- but two independently-drawn
  // meshes sharing a perfectly coincident edge are still prone to a
  // hairline seam/z-fight at that boundary from GPU floating-point
  // rounding. OVERLAP nudges this slab 1.5cm further under the main run's
  // countertop (invisible -- both show the same slab surface there) and
  // Y_EPS drops it a fraction of a millimeter so the main run's top
  // consistently wins the depth test in that sliver instead of flickering.
  const OVERLAP = 0.015;
  const Y_EPS = 0.0006;

  const ctDepth = mainLeftEdge - sideWallX + OVERLAP;
  const ctCenterX = (sideWallX + (mainLeftEdge + OVERLAP)) / 2;
  const ctFrontZ = mainBackZ + length;
  const ctCenterZ = (mainBackZ + ctFrontZ) / 2;

  // Base cabinet: back face flush against the side wall (no gap), front
  // face recessed 0.08 under the countertop overhang -- the same margin
  // the countertop already overhangs the main run's cabinets by.
  const cabDepth = ctDepth - 0.08;
  const cabFrontX = mainLeftEdge - 0.08;
  const cabCenterX = cabFrontX - cabDepth / 2;
  const cabLength = length - 0.16;
  const cabCenterZ = ctCenterZ;

  const doorCount = Math.max(2, Math.round(cabLength / 0.95));
  const doorWidth = cabLength / doorCount - 0.1;
  const doorZs = Array.from({ length: doorCount }, (_, i) => cabCenterZ - cabLength / 2 + cabLength / doorCount * (i + 0.5));

  // Upper cabinet + backsplash, mounted flush against the side wall the
  // same way the base cabinet is -- both continue the main run's wall
  // treatment around the corner instead of stopping at the main run.
  const upperDepth = 0.3;
  const upperCenterX = sideWallX + upperDepth / 2;
  const upperFrontX = sideWallX + upperDepth;
  const bsThickness = 0.1;
  const bsCenterX = sideWallX + bsThickness / 2;

  return (
    <group>
      <SolidBox args={[cabDepth, 0.85, cabLength]} position={[cabCenterX, -0.425, cabCenterZ]} color={cabinetColor} roughness={0.55} map={cabinetTexture} />
      {doorZs.map((dz, i) => (
        <ReturnLegDoor key={i} x={cabFrontX - 0.03} z={dz} width={doorWidth} color={cabinetColor === DOOR_COLOR ? "#2A241E" : DOOR_COLOR} />
      ))}
      <MaterialSurface
        product={countertopProduct}
        args={[ctDepth, slabHeight, length]}
        position={[ctCenterX, topY - slabHeight / 2 - Y_EPS, ctCenterZ]}
        heroFace="top"
        veinRotationDeg={veinRotation}
      />

      {withUpper && (
        <>
          <SolidBox args={[upperDepth, 0.55, cabLength]} position={[upperCenterX, 1.15, cabCenterZ]} color={cabinetColor} roughness={0.55} map={cabinetTexture} />
          {doorZs.map((dz, i) => (
            <ReturnLegDoor key={i} x={upperFrontX - 0.03} z={dz} width={doorWidth} y={1.15} height={0.45} color={cabinetColor === DOOR_COLOR ? "#2A241E" : DOOR_COLOR} />
          ))}
          <MaterialSurface product={backsplashProduct} args={[bsThickness, 0.785, cabLength]} position={[bsCenterX, 0.4825, cabCenterZ]} heroFace="sideEnd" />
          <mesh position={[upperFrontX - 0.02, 0.865, cabCenterZ]}>
            <boxGeometry args={[0.02, 0.015, cabLength - 0.1]} />
            <meshStandardMaterial color="#FFE9C2" emissive="#FFD9A0" emissiveIntensity={1.4} roughness={0.5} toneMapped={false} />
          </mesh>
        </>
      )}
    </group>
  );
};

// Pendant shade radius/bulb size trimmed down (0.13/0.1 -> 0.1/0.075) --
// at the previous steep top-down camera angle this read as a disc with a
// thin line through its center, i.e. a clock face rather than a light
// fixture. Still oversized enough to read correctly from the new
// eye-level camera.
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
  // The waterfall panel's own thickness (how chunky the slab edge reads)
  // scales the same way as the top, so both stay visually one slab.
  const waterfallThickness = 0.06 * scale;
  const leftOuterX = -1.03;
  const rightOuterX = 0.83;

  return (
    <group>
      <SolidBox args={[1.7, 0.85, 0.85]} position={[-0.1, -0.425, 0.55]} color={cabinetColor} roughness={0.55} map={cabinetTexture} />
      <CabinetDoor x={-0.1} z={0.965} width={0.72} color={cabinetColor === DOOR_COLOR ? "#2A241E" : DOOR_COLOR} />
      <MaterialSurface
        product={countertopProduct}
        args={[1.86, slabHeight, 1.0]}
        position={[-0.1, topY - slabHeight / 2, 0.55]}
        heroFace="top"
        veinRotationDeg={veinRotation}
      />
      {edgeProfile === "beveled" && <BevelEdge length={1.86} centerX={-0.1} topY={topY} frontZ={1.05} />}
      {/* waterfall edges -- the same slab continuing down the selected end(s).
          Depth and outer-face x match the top slab exactly so the two surfaces
          meet flush at the mitre line instead of leaving a visible lip/step.
          Left and right panels use identical args/y/z, mirrored in x, so
          "both" is perfectly symmetrical. */}
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
          <meshStandardMaterial color={DOOR_COLOR} roughness={0.5} />
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
  // Generated once per cabinet color and shared by every cabinet body in
  // the scene (base/upper runs, island, return leg, corner filler) -- a
  // flat meshStandardMaterial color on a large cabinet face read as
  // plastic/laminate; this bakes in a faint wood-grain streak pattern so
  // it reads as a painted/stained wood finish instead.
  const cabinetTexture = useWoodGrainTexture(cabinetColor);

  return (
    <group scale={[mirrored ? -1 : 1, 1, 1]}>
      <Floor color={floorColor} roughness={floorRoughness} />
      <BackWall color={WALL_COLOR} />
      <SideWall color={WALL_COLOR} x={-2.7} />
      {/* Solid corner post where the back wall and side wall meet (x=-2.7,
          z=-1.75) -- two infinitely-thin perpendicular planes sharing an
          edge are prone to z-fighting right at the seam from some angles,
          which read as a visible gap/crack at the corner. This box just
          physically fills that corner so there's nothing for the two
          planes to fight over. */}
      <SolidBox args={[0.08, 3.05, 0.08]} position={[-2.7, 0.675, -1.75]} color={WALL_COLOR} roughness={0.92} />
      <Ceiling />
      {/* Window and fridge removed per feedback -- side wall now renders
          as a plain solid wall with no opening, and the side-wall floor
          space that the fridge occupied is left empty. */}

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
          {/* Perpendicular return leg, built as a proper T-join off the main
              run's own left edge and the side wall (see ReturnLeg) instead of
              a rotated copy of WallRun with hand-tuned offsets -- that
              approach kept drifting out of sync and leaving gaps at either
              the inside corner or the side wall. */}
          <ReturnLeg
            sideWallX={-2.7}
            mainLeftEdge={0.1 - (3.8 + 0.16) / 2}
            mainBackZ={-1.05 - 0.35}
            length={2.0}
            cabinetColor={cabinetColor}
            cabinetTexture={cabinetTexture}
            countertopProduct={countertopProduct}
            backsplashProduct={backsplashProduct}
            thicknessMm={thicknessMm}
            veinRotation={veinRotation}
          />
          {/* Corner filler for the upper cabinets: the main run's upper
              cabinet only spans its own width (down to x=-1.8) and the
              return leg's only spans its own length (back to z=-1.32), so the
              wall-and-ceiling rectangle behind the inside corner between them
              was left bare -- visible as a plain, unclad wall panel from a
              side angle. This block occupies exactly that rectangle, flush
              against the side wall and sharing the main run's own upper
              cabinet depth/height, so it reads as one continuous run turning
              the corner. */}
          <SolidBox args={[0.9, 0.55, 0.43]} position={[-2.25, 1.15, -1.535]} color={cabinetColor} roughness={0.55} map={cabinetTexture} />
          {/* Corner filler for the backsplash: the main run's backsplash
              only spans X down to -1.88 (its own countertop's left edge)
              and the return leg's only spans X from -2.70 to -2.60 (its
              own thin panel flush against the side wall) -- neither
              covers the X:[-2.60,-1.88] strip behind the inside corner,
              which showed up as a gap/white strip of bare wall visible
              between the two backsplash panels. This block spans the full
              wall-to-wall corner rectangle (matching the upper-cabinet
              corner filler's X/Z footprint) at the same backsplash
              height/thickness as both walls' own panels. */}
          <MaterialSurface product={backsplashProduct} args={[0.82, 0.785, 0.43]} position={[-2.29, 0.4825, -1.535]} heroFace="sideEnd" />
        </>
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
