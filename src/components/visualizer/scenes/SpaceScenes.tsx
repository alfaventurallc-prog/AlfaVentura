import * as THREE from "three";
import { MaterialSurface, SolidBox } from "../MaterialSurface";
import { BackWall, Ceiling, Floor, SideWall, useWoodGrainTexture } from "./roomParts";
import { BevelEdge, DoorRow, PendantLight, Plant, PULL_COLOR, RECESS_COLOR, STEEL, WALL_COLOR } from "./KitchenScene";
import type { ThicknessMm, EdgeProfile } from "@/data/kitchenCatalog";
import { thicknessScale } from "@/data/kitchenCatalog";
import type { WaterfallOption } from "@/lib/visualizerUrlState";
import type { VisualizerProduct } from "../../../../types";

/**
 * The non-kitchen rooms. They share the kitchen's room shell (floor, back
 * wall at z=-1.75, side wall at x=-2.7, ceiling at y=2.2, floor at y=-0.85)
 * and its four material slots:
 * - cabinet = vanity / media unit / desk and credenza finish
 * - countertop = vanity top / tabletops / reception counter
 * - backsplash = the full-height quartz wall (wall panel, TV wall, cladding)
 * - floor = the floor
 */
export interface SpaceSceneProps {
  cabinetColor: string;
  countertopProduct: VisualizerProduct | null;
  backsplashProduct: VisualizerProduct | null;
  floorColor: string;
  floorRoughness: number;
  floorTextureUrl?: string | null;
  waterfall: WaterfallOption;
  thicknessMm: ThicknessMm;
  veinRotation: 0 | 90;
  edgeProfile: EdgeProfile;
}

const FLOOR_Y = -0.85;
const CHROME = "#D5D8DA";
const BLACK_METAL = "#1B1C1E";

const RoomShell = ({ floorColor, floorRoughness, floorTextureUrl }: Pick<SpaceSceneProps, "floorColor" | "floorRoughness" | "floorTextureUrl">) => (
  <>
    <Floor color={floorColor} roughness={floorRoughness} textureUrl={floorTextureUrl} />
    <BackWall color={WALL_COLOR} />
    <SideWall color={WALL_COLOR} x={-2.7} />
    <SolidBox args={[0.08, 3.05, 0.08]} position={[-2.7, 0.675, -1.75]} color={WALL_COLOR} roughness={0.92} />
    <Ceiling />
  </>
);

/** Warm LED strip (e.g. under a floating vanity or console). */
const GlowStrip = ({ position, args }: { position: [number, number, number]; args: [number, number, number] }) => (
  <mesh position={position}>
    <boxGeometry args={args} />
    <meshStandardMaterial color="#FFE9C2" emissive="#FFD9A0" emissiveIntensity={1.3} toneMapped={false} />
  </mesh>
);

/** Full-height quartz panel on the back wall, centred on `x`. */
const FeatureWall = ({ product, x, width, veinRotation }: { product: VisualizerProduct | null; x: number; width: number; veinRotation: 0 | 90 }) => (
  <MaterialSurface product={product} args={[width, 3.05, 0.03]} position={[x, 0.675, -1.735]} heroFace="front" veinRotationDeg={veinRotation} />
);

/** A slab top with optional waterfall ends on its -X/+X sides, down to the floor. */
const SlabTop = ({
  product,
  x,
  z,
  topY,
  width,
  depth,
  thicknessMm,
  veinRotation,
  edgeProfile,
  waterfall = "none",
}: {
  product: VisualizerProduct | null;
  x: number;
  z: number;
  topY: number;
  width: number;
  depth: number;
  thicknessMm: ThicknessMm;
  veinRotation: 0 | 90;
  edgeProfile: EdgeProfile;
  waterfall?: WaterfallOption;
}) => {
  const scale = thicknessScale(thicknessMm);
  const slab = 0.045 * scale;
  const side = 0.045 * scale;
  const legH = topY - slab - FLOOR_Y;
  return (
    <group>
      <MaterialSurface product={product} args={[width, slab, depth]} position={[x, topY - slab / 2, z]} heroFace="top" veinRotationDeg={veinRotation} />
      {edgeProfile === "beveled" && <BevelEdge position={[x, topY - 0.012, z + depth / 2 - 0.012]} length={width} axis="x" />}
      {(waterfall === "left" || waterfall === "both") && (
        <MaterialSurface product={product} args={[side, legH, depth]} position={[x - width / 2 + side / 2, FLOOR_Y + legH / 2, z]} heroFace="side" />
      )}
      {(waterfall === "right" || waterfall === "both") && (
        <MaterialSurface product={product} args={[side, legH, depth]} position={[x + width / 2 - side / 2, FLOOR_Y + legH / 2, z]} heroFace="sideEnd" />
      )}
    </group>
  );
};

/** A taller potted plant for room corners. */
const FloorPlant = ({ x, z, scale = 2.6 }: { x: number; z: number; scale?: number }) => (
  <group position={[x, FLOOR_Y, z]} scale={scale}>
    <Plant x={0} z={0} topY={0} />
  </group>
);

/* ------------------------------------------------------------------ */
/* Bathroom                                                            */
/* ------------------------------------------------------------------ */

const VesselBasin = ({ x, z, topY }: { x: number; z: number; topY: number }) => (
  <group position={[x, topY, z]}>
    <mesh position={[0, 0.065, 0]} castShadow>
      <cylinderGeometry args={[0.2, 0.15, 0.13, 32]} />
      <meshStandardMaterial color="#F7F6F2" roughness={0.18} />
    </mesh>
    <mesh position={[0, 0.131, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.18, 32]} />
      <meshStandardMaterial color="#E4E2DC" roughness={0.25} />
    </mesh>
  </group>
);

/** Wall-mounted spout coming out of the quartz wall panel above a basin. */
const WallSpout = ({ x, y }: { x: number; y: number }) => (
  <group position={[x, y, -1.72]}>
    <SolidBox args={[0.06, 0.06, 0.012]} position={[0, 0, 0.006]} color={BLACK_METAL} roughness={0.3} metalness={0.6} />
    <SolidBox args={[0.022, 0.022, 0.2]} position={[0, 0, 0.1]} color={BLACK_METAL} roughness={0.3} metalness={0.6} />
  </group>
);

const RoundMirror = ({ x, y }: { x: number; y: number }) => (
  <group position={[x, y, -1.705]}>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.31, 0.31, 0.012, 48]} />
      <meshStandardMaterial color="#DCE3E6" roughness={0.04} metalness={1} />
    </mesh>
    <mesh>
      <torusGeometry args={[0.315, 0.012, 12, 64]} />
      <meshStandardMaterial color={PULL_COLOR} roughness={0.3} metalness={0.8} />
    </mesh>
  </group>
);

const Sconce = ({ x, y, z = -1.7 }: { x: number; y: number; z?: number }) => (
  <group position={[x, y, z]}>
    <SolidBox args={[0.05, 0.05, 0.03]} position={[0, 0, 0.015]} color={PULL_COLOR} roughness={0.3} metalness={0.8} />
    <mesh position={[0, 0, 0.09]}>
      <sphereGeometry args={[0.06, 20, 20]} />
      <meshStandardMaterial color="#FFF3DD" emissive="#FFDCA8" emissiveIntensity={1.1} toneMapped={false} />
    </mesh>
  </group>
);

export const BathroomScene = (props: SpaceSceneProps) => {
  const { cabinetColor, countertopProduct, backsplashProduct, thicknessMm, veinRotation, edgeProfile } = props;
  const cabinetTexture = useWoodGrainTexture(cabinetColor);

  // Floating double vanity on the back wall.
  const cx = 0.2;
  const vanityW = 2.0;
  const back = -1.72;
  const depth = 0.5;
  const front = back + depth;
  const carcassTop = 0.0;
  const carcassH = 0.44;
  const carcassY = carcassTop - carcassH / 2;
  const slab = 0.045 * thicknessScale(thicknessMm);
  const topY = carcassTop + slab;

  return (
    <group>
      <RoomShell {...props} />
      <FeatureWall product={backsplashProduct} x={cx} width={2.7} veinRotation={veinRotation} />

      {/* vanity */}
      <SolidBox args={[vanityW, carcassH, depth]} position={[cx, carcassY, back + depth / 2]} color={cabinetColor} roughness={0.55} map={cabinetTexture} />
      <DoorRow axis="x" front={front} from={cx - vanityW / 2} to={cx + vanityW / 2} y={carcassY} height={carcassH - 0.04} color={cabinetColor} map={cabinetTexture} />
      <GlowStrip position={[cx, carcassTop - carcassH - 0.004, back + depth / 2]} args={[vanityW - 0.1, 0.008, 0.03]} />
      <SlabTop
        product={countertopProduct}
        x={cx}
        z={back + depth / 2 + 0.02}
        topY={topY}
        width={vanityW + 0.06}
        depth={depth + 0.04}
        thicknessMm={thicknessMm}
        veinRotation={veinRotation}
        edgeProfile={edgeProfile}
      />
      {[-0.5, 0.5].map((dx) => (
        <group key={dx}>
          <VesselBasin x={cx + dx} z={back + 0.27} topY={topY} />
          <WallSpout x={cx + dx} y={topY + 0.3} />
          <RoundMirror x={cx + dx} y={0.95} />
        </group>
      ))}
      <Sconce x={cx} y={1.0} />
      <Sconce x={cx - 1.05} y={1.0} />
      <Sconce x={cx + 1.05} y={1.0} />
      <Plant x={cx + 0.92} z={back + 0.2} topY={topY} />

      {/* towel bar with towel */}
      <SolidBox args={[0.5, 0.02, 0.05]} position={[1.85, 0.35, -1.72]} color={BLACK_METAL} roughness={0.3} metalness={0.6} />
      <SolidBox args={[0.42, 0.62, 0.035]} position={[1.85, 0.05, -1.68]} color="#E8E0D2" roughness={0.95} />
      <FloorPlant x={2.4} z={-1.4} />

      {/* walk-in shower in the corner: quartz walls on both sides, tray, glass screen, rain head */}
      <MaterialSurface product={backsplashProduct} args={[1.3, 2.4, 0.03]} position={[-2.05, FLOOR_Y + 1.2, -1.735]} heroFace="front" veinRotationDeg={veinRotation} />
      <MaterialSurface product={backsplashProduct} args={[0.03, 2.4, 1.3]} position={[-2.685, FLOOR_Y + 1.2, -1.1]} heroFace="sideEnd" veinRotationDeg={veinRotation} />
      <MaterialSurface product={countertopProduct} args={[1.3, 0.04, 1.3]} position={[-2.05, FLOOR_Y + 0.02, -1.1]} heroFace="top" veinRotationDeg={veinRotation} />
      <SolidBox args={[0.12, 0.004, 0.12]} position={[-2.05, FLOOR_Y + 0.042, -1.1]} color={STEEL} roughness={0.3} metalness={0.8} />
      <mesh position={[-2.15, FLOOR_Y + 1.05, -0.45]}>
        <boxGeometry args={[1.1, 2.1, 0.012]} />
        <meshPhysicalMaterial color="#DDEBEE" transparent opacity={0.2} roughness={0.05} metalness={0.1} />
      </mesh>
      <SolidBox args={[1.1, 0.02, 0.02]} position={[-2.15, FLOOR_Y + 2.1, -0.45]} color={BLACK_METAL} roughness={0.3} metalness={0.6} />
      <SolidBox args={[0.02, 0.02, 0.9]} position={[-1.6, FLOOR_Y + 2.1, -0.9]} color={BLACK_METAL} roughness={0.3} metalness={0.6} />
      <SolidBox args={[0.02, 0.02, 0.4]} position={[-2.15, 1.62, -1.53]} color={BLACK_METAL} roughness={0.3} metalness={0.6} />
      <mesh position={[-2.15, 1.6, -1.32]}>
        <cylinderGeometry args={[0.13, 0.13, 0.015, 32]} />
        <meshStandardMaterial color={BLACK_METAL} roughness={0.3} metalness={0.6} />
      </mesh>
      <SolidBox args={[0.05, 0.08, 0.04]} position={[-2.66, 0.35, -1.1]} color={BLACK_METAL} roughness={0.3} metalness={0.6} />
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Living room                                                         */
/* ------------------------------------------------------------------ */

const SOFA = "#8E877A";
const CUSHION = "#A39C8E";

/** Three-seat sofa against the side wall, facing +X. */
const Sofa = ({ z }: { z: number }) => {
  const x = -2.25;
  const len = 2.2;
  return (
    <group>
      <SolidBox args={[0.9, 0.36, len]} position={[x, FLOOR_Y + 0.08 + 0.18, z]} color={SOFA} roughness={0.95} />
      <SolidBox args={[0.22, 0.5, len]} position={[x - 0.34, FLOOR_Y + 0.08 + 0.36 + 0.25 - 0.05, z]} color={SOFA} roughness={0.95} />
      {[-1, 1].map((s) => (
        <SolidBox key={s} args={[0.9, 0.56, 0.16]} position={[x, FLOOR_Y + 0.08 + 0.28, z + s * (len / 2 - 0.08)]} color={SOFA} roughness={0.95} />
      ))}
      {[-0.47, 0.47].map((dz) => (
        <SolidBox key={dz} args={[0.66, 0.12, 0.92]} position={[x + 0.08, FLOOR_Y + 0.08 + 0.36 + 0.06, z + dz]} color={CUSHION} roughness={0.95} />
      ))}
      {[-0.55, 0.55].map((dz, i) => (
        <SolidBox key={dz} args={[0.12, 0.36, 0.36]} position={[x - 0.16, FLOOR_Y + 0.65, z + dz]} color={i ? "#C9A27A" : "#D8CCB8"} roughness={0.95} />
      ))}
      {[-0.95, 0.95].map((dz) =>
        [-0.36, 0.36].map((dx) => (
          <SolidBox key={`${dz}${dx}`} args={[0.04, 0.08, 0.04]} position={[x + dx, FLOOR_Y + 0.04, z + dz]} color={BLACK_METAL} roughness={0.4} />
        ))
      )}
    </group>
  );
};

const FloorLamp = ({ x, z }: { x: number; z: number }) => (
  <group position={[x, FLOOR_Y, z]}>
    <mesh position={[0, 0.01, 0]}>
      <cylinderGeometry args={[0.15, 0.15, 0.02, 24]} />
      <meshStandardMaterial color={BLACK_METAL} roughness={0.4} metalness={0.5} />
    </mesh>
    <mesh position={[0, 0.75, 0]}>
      <cylinderGeometry args={[0.012, 0.012, 1.5, 8]} />
      <meshStandardMaterial color={BLACK_METAL} roughness={0.4} metalness={0.5} />
    </mesh>
    <mesh position={[0, 1.55, 0]}>
      <cylinderGeometry args={[0.16, 0.22, 0.28, 28, 1, true]} />
      <meshStandardMaterial color="#F2E8D6" emissive="#FFD9A0" emissiveIntensity={0.5} roughness={0.9} side={THREE.DoubleSide} />
    </mesh>
  </group>
);

const Books = ({ x, y, z }: { x: number; y: number; z: number }) => (
  <group position={[x, y, z]}>
    {[["#5B4636", 0.05], ["#C9B79A", 0.04], ["#2F3A40", 0.045]].map(([c, h], i) => (
      <SolidBox key={i} args={[0.34 - i * 0.03, Number(h), 0.24]} position={[0, 0.02 + i * 0.05, 0]} color={c as string} roughness={0.8} />
    ))}
  </group>
);

export const LivingScene = (props: SpaceSceneProps) => {
  const { cabinetColor, countertopProduct, backsplashProduct, waterfall, thicknessMm, veinRotation, edgeProfile } = props;
  const cabinetTexture = useWoodGrainTexture(cabinetColor);

  // Floating media console under the TV, on a full-height quartz TV wall.
  const cx = 0.35;
  const consoleW = 2.8;
  const back = -1.72;
  const depth = 0.45;
  const front = back + depth;
  const consoleTop = -0.2;
  const consoleH = 0.42;
  const consoleY = consoleTop - consoleH / 2;
  const slab = 0.045 * thicknessScale(thicknessMm);

  return (
    <group>
      <RoomShell {...props} />
      <FeatureWall product={backsplashProduct} x={cx} width={3.4} veinRotation={veinRotation} />

      {/* TV */}
      <SolidBox args={[1.65, 0.95, 0.04]} position={[cx, 0.85, -1.69]} color="#141516" roughness={0.3} metalness={0.3} />
      <mesh position={[cx, 0.85, -1.664]}>
        <planeGeometry args={[1.6, 0.9]} />
        <meshStandardMaterial color="#0B0D10" roughness={0.12} metalness={0.5} />
      </mesh>

      {/* media console */}
      <SolidBox args={[consoleW, consoleH, depth]} position={[cx, consoleY, back + depth / 2]} color={cabinetColor} roughness={0.55} map={cabinetTexture} />
      <DoorRow axis="x" front={front} from={cx - consoleW / 2} to={cx + consoleW / 2} y={consoleY} height={consoleH - 0.04} color={cabinetColor} map={cabinetTexture} />
      <GlowStrip position={[cx, consoleTop - consoleH - 0.004, back + depth / 2]} args={[consoleW - 0.1, 0.008, 0.03]} />
      <SlabTop
        product={countertopProduct}
        x={cx}
        z={back + depth / 2 + 0.01}
        topY={consoleTop + slab}
        width={consoleW + 0.04}
        depth={depth + 0.02}
        thicknessMm={thicknessMm}
        veinRotation={veinRotation}
        edgeProfile={edgeProfile}
      />
      <Plant x={cx - 1.15} z={back + 0.22} topY={consoleTop + slab} />
      <Books x={cx + 1.05} y={consoleTop + slab} z={back + 0.22} />

      {/* rug, sofa, quartz coffee table (waterfall ends follow the waterfall setting) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.35, FLOOR_Y + 0.004, 0.1]} receiveShadow>
        <planeGeometry args={[2.3, 2.7]} />
        <meshStandardMaterial color="#D8CEBE" roughness={1} />
      </mesh>
      <Sofa z={0.1} />
      <SlabTop
        product={countertopProduct}
        x={-1.0}
        z={0.1}
        topY={FLOOR_Y + 0.42}
        width={0.95}
        depth={0.95}
        thicknessMm={thicknessMm}
        veinRotation={veinRotation}
        edgeProfile={edgeProfile}
        waterfall={waterfall}
      />
      {waterfall !== "both" &&
        [-1, 1].flatMap((sx) =>
          [-1, 1].map((sz) =>
            (waterfall === "left" && sx === -1) || (waterfall === "right" && sx === 1) ? null : (
              <SolidBox key={`${sx}${sz}`} args={[0.03, 0.38, 0.03]} position={[-1.0 + sx * 0.42, FLOOR_Y + 0.19, 0.1 + sz * 0.42]} color={PULL_COLOR} roughness={0.3} metalness={0.8} />
            )
          )
        )}
      <Books x={-0.85} y={FLOOR_Y + 0.42} z={0.25} />

      {/* side table with a quartz top at the sofa end */}
      <mesh position={[-2.3, FLOOR_Y + 0.27, -1.35]} castShadow>
        <cylinderGeometry args={[0.04, 0.12, 0.54, 20]} />
        <meshStandardMaterial color={PULL_COLOR} roughness={0.3} metalness={0.8} />
      </mesh>
      <MaterialSurface product={countertopProduct} args={[0.5, 0.04, 0.5]} position={[-2.3, FLOOR_Y + 0.56, -1.35]} heroFace="top" veinRotationDeg={veinRotation} />
      <FloorLamp x={-2.35} z={1.55} />
      <FloorPlant x={2.45} z={-1.35} />
      <PendantLight x={-1.0} z={0.1} />
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Commercial (reception / lobby)                                      */
/* ------------------------------------------------------------------ */

const LEATHER = "#6E4F3A";

/** Lounge armchair facing +X. */
const Armchair = ({ x, z }: { x: number; z: number }) => (
  <group position={[x, FLOOR_Y, z]}>
    <SolidBox args={[0.72, 0.3, 0.72]} position={[0, 0.27, 0]} color={LEATHER} roughness={0.6} />
    <SolidBox args={[0.16, 0.42, 0.72]} position={[-0.28, 0.57, 0]} color={LEATHER} roughness={0.6} />
    {[-1, 1].map((s) => (
      <SolidBox key={s} args={[0.72, 0.2, 0.1]} position={[0, 0.5, s * 0.31]} color={LEATHER} roughness={0.6} />
    ))}
    {[-0.3, 0.3].flatMap((dx) =>
      [-0.3, 0.3].map((dz) => <SolidBox key={`${dx}${dz}`} args={[0.03, 0.12, 0.03]} position={[dx, 0.06, dz]} color={BLACK_METAL} roughness={0.4} />)
    )}
  </group>
);

const Monitor = ({ x, y, z }: { x: number; y: number; z: number }) => (
  <group position={[x, y, z]}>
    <SolidBox args={[0.2, 0.01, 0.14]} position={[0, 0.005, 0]} color={BLACK_METAL} roughness={0.4} />
    <SolidBox args={[0.03, 0.2, 0.03]} position={[0, 0.1, 0]} color={BLACK_METAL} roughness={0.4} />
    <SolidBox args={[0.55, 0.33, 0.025]} position={[0, 0.33, 0]} color={BLACK_METAL} roughness={0.35} />
  </group>
);

export const CommercialScene = (props: SpaceSceneProps) => {
  const { cabinetColor, countertopProduct, backsplashProduct, waterfall, thicknessMm, veinRotation, edgeProfile } = props;
  const cabinetTexture = useWoodGrainTexture(cabinetColor);

  // Back credenza along the clad wall.
  const cx = 0.25;
  const credW = 3.0;
  const back = -1.72;
  const credD = 0.5;
  const credTop = -0.12;
  const credH = credTop - FLOOR_Y - 0.08;
  const credY = FLOOR_Y + 0.08 + credH / 2;
  const slab = 0.045 * thicknessScale(thicknessMm);

  // Reception desk facing the visitor (+Z). Its front fascia is in the
  // cabinet finish with a recessed reveal; the counter can waterfall to the floor.
  const deskW = 2.8;
  const deskD = 0.7;
  const deskZ = 0.25;
  const deskTop = 0.22;
  const deskBodyTop = deskTop - slab;
  const deskBodyH = deskBodyTop - FLOOR_Y - 0.08;
  const deskFront = deskZ + deskD / 2;

  return (
    <group>
      <RoomShell {...props} />
      <FeatureWall product={backsplashProduct} x={cx} width={4.4} veinRotation={veinRotation} />

      {/* brass name bar on the cladding, softly backlit */}
      <GlowStrip position={[cx, 1.35, -1.715]} args={[1.5, 0.22, 0.004]} />
      <SolidBox args={[1.4, 0.16, 0.03]} position={[cx, 1.35, -1.7]} color={PULL_COLOR} roughness={0.3} metalness={0.85} />

      {/* credenza */}
      <SolidBox args={[credW - 0.1, 0.08, credD - 0.06]} position={[cx, FLOOR_Y + 0.04, back + credD / 2 - 0.03]} color={RECESS_COLOR} roughness={0.9} />
      <SolidBox args={[credW, credH, credD]} position={[cx, credY, back + credD / 2]} color={cabinetColor} roughness={0.55} map={cabinetTexture} />
      <DoorRow axis="x" front={back + credD} from={cx - credW / 2} to={cx + credW / 2} y={credY} height={credH - 0.04} color={cabinetColor} map={cabinetTexture} />
      <SlabTop
        product={countertopProduct}
        x={cx}
        z={back + credD / 2 + 0.01}
        topY={credTop + slab}
        width={credW + 0.04}
        depth={credD + 0.02}
        thicknessMm={thicknessMm}
        veinRotation={veinRotation}
        edgeProfile={edgeProfile}
      />
      <Plant x={cx - 1.2} z={back + 0.22} topY={credTop + slab} />
      <Books x={cx + 1.1} y={credTop + slab} z={back + 0.22} />

      {/* reception desk */}
      <SolidBox args={[deskW - 0.2, 0.08, deskD - 0.1]} position={[cx, FLOOR_Y + 0.04, deskZ]} color={RECESS_COLOR} roughness={0.9} />
      <SolidBox args={[deskW - 0.1, deskBodyH, deskD]} position={[cx, FLOOR_Y + 0.08 + deskBodyH / 2, deskZ]} color={cabinetColor} roughness={0.55} map={cabinetTexture} />
      {[0.33, 0.66].map((f) => (
        <SolidBox key={f} args={[deskW - 0.1, 0.012, 0.004]} position={[cx, FLOOR_Y + 0.08 + deskBodyH * f, deskFront + 0.002]} color={RECESS_COLOR} roughness={0.9} />
      ))}
      <GlowStrip position={[cx, FLOOR_Y + 0.075, deskFront - 0.06]} args={[deskW - 0.3, 0.008, 0.02]} />
      <SlabTop
        product={countertopProduct}
        x={cx}
        z={deskZ}
        topY={deskTop}
        width={deskW}
        depth={deskD + 0.08}
        thicknessMm={thicknessMm}
        veinRotation={veinRotation}
        edgeProfile={edgeProfile}
        waterfall={waterfall}
      />
      <Monitor x={cx + 0.55} y={deskTop} z={deskZ - 0.1} />
      <Plant x={cx - 0.9} z={deskZ} topY={deskTop} />
      {[-0.75, 0.25, 1.25].map((px) => (
        <PendantLight key={px} x={px} z={deskZ} />
      ))}

      {/* waiting area: two armchairs and a quartz side table */}
      <Armchair x={-2.15} z={-0.25} />
      <Armchair x={-2.15} z={1.15} />
      <mesh position={[-2.15, FLOOR_Y + 0.25, 0.45]} castShadow>
        <cylinderGeometry args={[0.04, 0.12, 0.5, 20]} />
        <meshStandardMaterial color={CHROME} roughness={0.25} metalness={0.85} />
      </mesh>
      <MaterialSurface product={countertopProduct} args={[0.5, 0.04, 0.5]} position={[-2.15, FLOOR_Y + 0.52, 0.45]} heroFace="top" veinRotationDeg={veinRotation} />
      <FloorPlant x={-2.35} z={-1.4} />
      <FloorPlant x={2.45} z={-1.35} />
    </group>
  );
};
