/**
 * PanelPal visual tokens for the floor plan: ONE source for the 2D plan (design/plan2d/FloorPlan2D.tsx)
 * and the 3D scene (demo Scene3D). Values come from design/tokens.css (light theme).
 * Plain hex strings, so three.js can use them directly. No dependencies.
 * Owner: Factory Design. All data shown with these styles is example data.
*/
import type { ZoneId } from "./floorplan";

/* ---------- Status ---------- */
export type VizStatus = "running" | "idle" | "warning" | "fault" | "offline" | "inactive" | "notSetUp";
/** Statuses as they appear in data (data.ts uses running | idle | alarm). */
export type DataStatus = "running" | "idle" | "alarm" | "warning" | "fault" | "offline" | "inactive";

export interface StatusStyle {
  /** Word shown next to the icon (UK English). */
  word: string;
  /** Text glyph icon (shape differs per status so colour is never the only cue). */
  icon: string;
  /** Text colour on white, AA contrast (tokens: --color-<s>). */
  text: string;
  /** Dot / ring / outline colour (tokens: --color-<s>-dot). */
  dot: string;
  /** Soft fill for badges and machine tint (tokens: --color-<s>-soft). */
  soft: string;
  /** 3D: emissive colour + intensity for the status ring on the floor round the machine. */
  emissive: string;
  emissiveIntensity: number;
  /** Ring is pulsed (fault only). */
  pulse?: boolean;
  /** Outline is dashed (not set up / inactive). */
  dashed?: boolean;
}

export const STATUS: Record<VizStatus, StatusStyle> = {
  running:  { word: "Running",    icon: "●",  text: "#0b7a0b", dot: "#0ca30c", soft: "#dbf1db", emissive: "#0ca30c", emissiveIntensity: 0.55 },
  idle:     { word: "Idle",       icon: "❚❚", text: "#6141c9", dot: "#7c5ce6", soft: "#eee9fc", emissive: "#7c5ce6", emissiveIntensity: 0.45 },
  warning:  { word: "Check",      icon: "▲",  text: "#8a5a00", dot: "#fab219", soft: "#fdf3dc", emissive: "#fab219", emissiveIntensity: 0.6 },
  fault:    { word: "Alarm",      icon: "✕",  text: "#b42d2d", dot: "#d03b3b", soft: "#fbf0f0", emissive: "#d03b3b", emissiveIntensity: 0.8, pulse: true },
  offline:  { word: "No signal",  icon: "◌",  text: "#5f5f5d", dot: "#8e8b8b", soft: "#ededec", emissive: "#8e8b8b", emissiveIntensity: 0.15 },
  inactive: { word: "Inactive",   icon: "○",  text: "#6b6b69", dot: "#c1c3bc", soft: "#f3f3f2", emissive: "#000000", emissiveIntensity: 0, dashed: true },
  notSetUp: { word: "Not set up", icon: "○",  text: "#6b6b69", dot: "#c1c3bc", soft: "#f3f3f2", emissive: "#000000", emissiveIntensity: 0, dashed: true },
};

/** Map a data status (data.ts: "alarm") to the visual status. */
export function toVizStatus(s: DataStatus): VizStatus {
  return s === "alarm" ? "fault" : s;
}

/* ---------- Zones ---------- */
export type ZoneKind = ZoneId;

/** Light floor tints (2D fill = 3D floor decal colour). Label colour is the zone's ink. */
export const ZONE: Record<ZoneKind, { fill: string; edge: string; ink: string; label: string }> = {
  "goods-in":         { fill: "#eef2f6", edge: "#c9d3de", ink: "#4a5a6b", label: "Goods in" },
  machining:          { fill: "#eaf1fb", edge: "#bcd3ee", ink: "#1d5fae", label: "Machining" },
  welding:            { fill: "#fbf1e4", edge: "#ebcfa6", ink: "#8a5a00", label: "Welding" },
  "assembly-qa":      { fill: "#e9f5ec", edge: "#b9dcc2", ink: "#0b7a0b", label: "Assembly & QA" },
  "packing-dispatch": { fill: "#f2eefb", edge: "#d3c8ef", ink: "#6141c9", label: "Packing & dispatch" },
  "office-qc":        { fill: "#f6f6f4", edge: "#d8d8d4", ink: "#5f5f5d", label: "Office & QC lab" },
  utilities:          { fill: "#efefed", edge: "#c1c3bc", ink: "#5f5f5d", label: "Utilities" },
};

/* ---------- Building and floor ---------- */
export const PLAN = {
  /** Outside the building (yard). */
  ground: "#e4e4e1",
  /** Factory floor (sealed concrete). tokens: --color-surface-2 */
  floor: "#f3f3f2",
  /** Wall poché (cut walls), tokens: --color-plan-wall darkened for poché. */
  wall: "#4a4b4d",
  wallEdge: "#2f3033",
  /** Door leaf + swing arc. */
  door: "#5f5f5d",
  /** Safety yellow walkway paint (lines and hatch). */
  walkway: "#f2b705",
  walkwayHatch: "#f7d35a",
  walkwayFill: "#fdf6d8",
  /** Loading bay apron outside dock doors. */
  apron: "#dcdcd8",
  dockBumper: "#1f2328",
  /** Machine body (light enamel) and its outline. tokens: --color-plan-machine, -stroke */
  machine: "#ffffff",
  machineEdge: "#8e8f8c",
  machineDetail: "#c9cac6",
  machineDark: "#2a2f36",
  glass: "#cfe3f5",
  weldScreen: "#e9a23b",
  fence: "#f2b705",
  fixture: "#e6e6e3",
  fixtureEdge: "#b3b4b0",
  accent: "#2874d2",
  camera: "#2f8fd0",
  selected: "#2874d2",
  focus: "#2874d2",
  shadow: "rgba(15, 23, 32, 0.16)",
  text: "#161616",
  muted: "#5f5f5d",
  faint: "#6a6a68",
} as const;

/* ---------- Labels, badges, chips (2D SVG and 3D HTML overlays use the same) ---------- */
export const LABEL = {
  fontSans: '"Inter", ui-sans-serif, system-ui, sans-serif',
  fontMono: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace',
  machineName: { size: 12, weight: 600, color: "#161616", halo: "#ffffff" },
  zoneLabel: { size: 11, weight: 600, letterSpacing: "0.06em", transform: "uppercase" },
  /** Status badge: pill, soft fill, coloured icon + word in status text colour. */
  badge: { size: 11, weight: 600, padX: 6, height: 18, radius: 999, border: 1 },
  /** Live value chip: white pill, mono tabular numbers, thin border. */
  chip: { size: 11.5, weight: 600, padX: 6, height: 18, radius: 4, bg: "#ffffff", border: "#d8d8d4", text: "#161616" },
  exampleTag: { size: 11, bg: "#fdf3dc", text: "#8a5a00", word: "Example data" },
} as const;

/* ---------- 3D hints for Scene3D (three.js MeshStandardMaterial) ---------- */
export const MATERIALS_3D = {
  floor:       { color: PLAN.floor, roughness: 0.92, metalness: 0 },
  zoneDecal:   { opacity: 1, roughness: 0.95, metalness: 0, yOffset: 0.002 }, // colour = ZONE[k].fill
  walkway:     { color: PLAN.walkway, roughness: 0.6, metalness: 0, yOffset: 0.004, lineWidth: 0.1 },
  wall:        { color: "#d9d9d5", topColor: PLAN.wall, roughness: 0.85, metalness: 0, height: 1.2 /* cut-away height in m */ },
  door:        { color: "#b9bab6", roughness: 0.6, metalness: 0.2 },
  dockDoor:    { color: "#9fa3a8", roughness: 0.5, metalness: 0.4 },
  machineBody: { color: PLAN.machine, roughness: 0.55, metalness: 0.05 },
  machineTrim: { color: "#c9cac6", roughness: 0.45, metalness: 0.35 },
  machineDark: { color: PLAN.machineDark, roughness: 0.5, metalness: 0.2 },
  glass:       { color: PLAN.glass, roughness: 0.1, metalness: 0, opacity: 0.45, transparent: true },
  weldScreen:  { color: PLAN.weldScreen, roughness: 0.4, metalness: 0, opacity: 0.55, transparent: true },
  fence:       { color: PLAN.fence, roughness: 0.6, metalness: 0.3 },
  fixture:     { color: PLAN.fixture, roughness: 0.8, metalness: 0.05 },
  camera:      { color: PLAN.camera, roughness: 0.4, metalness: 0, emissive: PLAN.camera, emissiveIntensity: 0.35 },
  /** Ring on the floor round each machine: torus/flat ring, colour + emissive from STATUS. */
  statusRing:  { innerPad: 0.25, width: 0.18, yOffset: 0.006, roughness: 0.4, metalness: 0 },
  /** Not set up / inactive: body opacity, dashed ring (use LineDashedMaterial). */
  notSetUp:    { bodyOpacity: 0.55, ringColor: STATUS.notSetUp.dot, dashSize: 0.3, gapSize: 0.2 },
  /** Selected: outline (e.g. drei <Outlines>) + ring. */
  selected:    { color: PLAN.selected, thickness: 0.04, ringWidth: 0.28 },
  /** Hover / highlight: lighter outline. */
  highlight:   { color: "#5a9ae6", thickness: 0.03 },
} as const;

export const LIGHTING_3D = {
  background: PLAN.ground,
  ambient: { color: "#ffffff", intensity: 0.55 },
  hemisphere: { sky: "#ffffff", ground: "#d6d6d2", intensity: 0.6 },
  key: { color: "#ffffff", intensity: 1.15, position: [18, 30, 12] as [number, number, number], castShadow: true, shadowMapSize: 2048, shadowRadius: 6, shadowBias: -0.0004 },
  /** Soft contact shadows under machines (drei <ContactShadows>). */
  contactShadow: { opacity: 0.28, blur: 2.4, far: 4 },
  toneMapping: "ACESFilmic",
  exposure: 1.0,
  /** Default camera: three-quarter view from the south-east, looking at the floor centre. */
  camera: { fov: 35, elevationDeg: 52, azimuthDeg: 35, distanceFactor: 1.15 /* x plan diagonal */ },
} as const;

export const VIZ = { STATUS, ZONE, PLAN, LABEL, MATERIALS_3D, LIGHTING_3D } as const;
export default VIZ;
