/**
 * PanelPal demo: shared factory floor plan. EXAMPLE DATA.
 * Owner of the positions: the demo build. Factory Design reads this file for the 2D visual.
 * The 2D plan, the 3D scene and the machine tiles all read from this file.
 *
 * Coordinate system (all values in metres):
 *  - Origin (0, 0) = north-west outer corner of the building. +x = east (right), +y = south (down on the plan).
 *  - 2D: use an SVG viewBox of "0 0 40 25.6" (1 SVG unit = 1 m). 3D: scene x = x, scene z = y, y up.
 *  - Rect = { x, y, w, d }: x, y = north-west corner; w along x, d along y.
 *  - Machine / equipment: x, y = CENTRE of the footprint; w, d = footprint before rotation;
 *    rotation = degrees clockwise on the plan. 0 = the front (door, operator side) faces south (+y).
 */

export const FLOOR = { width: 40, depth: 25.6, wallThickness: 0.3, wallHeight: 4.5, unit: "m" } as const;

export type ZoneId = "goods-in" | "machining" | "welding" | "assembly-qa" | "packing-dispatch" | "office-qc" | "utilities";
export type MachineType = "cnc-mill" | "cnc-lathe" | "welder" | "press" | "conveyor" | "compressor" | "bandsaw" | "washer" | "cmm" | "robot-cell";

export interface Rect { x: number; y: number; w: number; d: number }
export interface Zone extends Rect { id: ZoneId; name: string; short: string; order: number | null }
export interface Placed { id: string; type: MachineType; zone: ZoneId; x: number; y: number; w: number; d: number; rotation: number }

/** Process flow order: 1 goods-in -> 2 machining -> 3 welding -> 4 assembly/QA -> 5 packing/dispatch. */
export const ZONES: Zone[] = [
  { id: "goods-in", name: "Goods-in / raw stock", short: "Goods-in", order: 1, x: 0.8, y: 0.8, w: 7.2, d: 10.0 },
  { id: "machining", name: "Machining cell", short: "Machining", order: 2, x: 8.8, y: 0.8, w: 13.6, d: 10.0 },
  { id: "welding", name: "Press & weld", short: "Press/weld", order: 3, x: 23.6, y: 0.8, w: 15.6, d: 10.0 },
  { id: "assembly-qa", name: "Assembly / QA", short: "Assembly / QA", order: 4, x: 20.4, y: 14.4, w: 14.0, d: 10.4 },
  { id: "packing-dispatch", name: "Packing / dispatch", short: "Packing", order: 5, x: 0.8, y: 14.4, w: 8.0, d: 10.4 },
  { id: "office-qc", name: "Office / QC room", short: "Office / QC", order: null, x: 9.6, y: 14.4, w: 9.6, d: 10.4 },
  { id: "utilities", name: "Utilities", short: "Utilities", order: null, x: 35.2, y: 14.4, w: 4.4, d: 10.4 },
];

/** Walkways (yellow floor markings on both long edges). */
export const WALKWAYS: (Rect & { id: string; name: string })[] = [
  { id: "main", name: "Main walkway", x: 0.3, y: 11.2, w: 39.4, d: 2.8 },
  { id: "north-cross", name: "Cross walkway", x: 22.4, y: 0.3, w: 1.2, d: 10.9 },
  { id: "south-cross", name: "Cross walkway", x: 19.2, y: 14.0, w: 1.2, d: 11.3 },
];

/** Wall segments as centre lines: [x1, y1, x2, y2]. Outer walls have a gap for the loading door (west wall). */
export const WALLS: { id: string; kind: "outer" | "room"; line: [number, number, number, number] }[] = [
  { id: "north", kind: "outer", line: [0, 0.15, 40, 0.15] },
  { id: "south", kind: "outer", line: [0, 25.45, 40, 25.45] },
  { id: "east", kind: "outer", line: [39.85, 0, 39.85, 25.6] },
  { id: "west-n", kind: "outer", line: [0.15, 0, 0.15, 11.0] },
  { id: "west-s", kind: "outer", line: [0.15, 14.2, 0.15, 25.6] },
  // Office / QC room (door gap on its east wall, y 16.0-17.6, onto the south cross walkway)
  { id: "qc-north", kind: "room", line: [9.6, 14.4, 19.2, 14.4] },
  { id: "qc-west", kind: "room", line: [9.6, 14.4, 9.6, 25.45] },
  { id: "qc-east-a", kind: "room", line: [19.2, 14.4, 19.2, 16.0] },
  { id: "qc-east-b", kind: "room", line: [19.2, 17.6, 19.2, 25.45] },
];

/** Doors. The loading door is a roller door in the west wall, on the main walkway. */
export const DOORS: { id: string; name: string; kind: "roller" | "personnel"; wall: string; x: number; y: number; width: number; axis: "x" | "y" }[] = [
  { id: "loading", name: "Loading door", kind: "roller", wall: "west", x: 0.15, y: 11.0, width: 3.2, axis: "y" },
  { id: "qc-door", name: "Office / QC door", kind: "personnel", wall: "qc-east", x: 19.2, y: 16.0, width: 1.6, axis: "y" },
];

/** Loading bay: the floor area in front of the roller door, inside the building. */
export const LOADING_BAY: Rect & { name: string } = { name: "Loading bay", x: 0.3, y: 11.0, w: 3.0, d: 3.2 };

/** Process flow route (polyline, metres): goods-in -> saw -> CNC cell -> press/weld -> assembly -> conveyor (west) -> packing. */
export const FLOW: [number, number][] = [[6.6, 10.2], [6.6, 11.9], [36.0, 11.9], [36.0, 12.7], [22.2, 12.7], [22.2, 13.6], [4.8, 13.6], [4.8, 14.8]];

/** The 12 monitored machines, keyed by the ids in demo/src/data.ts. */
export const MACHINE_LAYOUT: Record<string, Placed> = {
  // Band saw along the stock rack: bar stock runs north -> south through the saw to the walkway.
  saw: { id: "saw", type: "bandsaw", zone: "goods-in", x: 6.6, y: 7.2, w: 5.6, d: 2.4, rotation: 90 },
  // CNC U-cell, open to the east and south, 2.8 m operator aisle inside. CNC mill 3 is next to the main walkway.
  cnc1: { id: "cnc1", type: "cnc-mill", zone: "machining", x: 15.1, y: 2.8, w: 4.6, d: 3.2, rotation: 0 },
  cnc2: { id: "cnc2", type: "cnc-mill", zone: "machining", x: 10.8, y: 5.8, w: 4.6, d: 3.2, rotation: 270 },
  cnc3: { id: "cnc3", type: "cnc-mill", zone: "machining", x: 15.1, y: 8.8, w: 4.6, d: 3.2, rotation: 180 },
  cnc4: { id: "cnc4", type: "cnc-mill", zone: "machining", x: 19.9, y: 2.8, w: 4.6, d: 3.2, rotation: 0 },
  // Welders on the north wall (screens + extraction); presses next to the walkway for heavy blanks.
  weld1: { id: "weld1", type: "welder", zone: "welding", x: 27.4, y: 2.6, w: 5.6, d: 3.4, rotation: 0 },
  weld2: { id: "weld2", type: "welder", zone: "welding", x: 34.6, y: 2.6, w: 5.6, d: 3.4, rotation: 0 },
  press1: { id: "press1", type: "press", zone: "welding", x: 27.4, y: 8.4, w: 5.6, d: 3.6, rotation: 0 },
  press2: { id: "press2", type: "press", zone: "welding", x: 34.6, y: 8.4, w: 5.6, d: 3.6, rotation: 0 },
  robot: { id: "robot", type: "robot-cell", zone: "assembly-qa", x: 24.4, y: 18.0, w: 6.4, d: 5.2, rotation: 180 },
  wash: { id: "wash", type: "washer", zone: "assembly-qa", x: 31.0, y: 17.6, w: 4.8, d: 3.6, rotation: 180 },
  cmm: { id: "cmm", type: "cmm", zone: "office-qc", x: 13.2, y: 18.4, w: 5.2, d: 4.0, rotation: 180 },
};

/** Equipment on the plan that is NOT a monitored machine (no tile, no camera, no status). */
export const EQUIPMENT: Placed[] = [
  // Assembly -> packing along the south edge of the main walkway (flows west). 2.0 m of walkway stays clear.
  { id: "conveyor", type: "conveyor", zone: "packing-dispatch", x: 13.5, y: 13.6, w: 16.6, d: 0.8, rotation: 180 },
  { id: "compressor", type: "compressor", zone: "utilities", x: 37.4, y: 17.4, w: 2.8, d: 2.0, rotation: 90 },
];

/** Simple props (racks, pallets, benches, desks). Visual only. */
export const PROPS: (Rect & { id: string; kind: "rack" | "pallet" | "bench" | "desk"; zone: ZoneId })[] = [
  { id: "stock-rack", kind: "rack", zone: "goods-in", x: 1.6, y: 1.6, w: 5.6, d: 1.6 },
  { id: "stock-pallet", kind: "pallet", zone: "goods-in", x: 1.6, y: 4.2, w: 1.2, d: 1.0 },
  { id: "saw-outfeed-pallet", kind: "pallet", zone: "goods-in", x: 3.4, y: 8.8, w: 1.2, d: 1.0 },
  { id: "deburr-bench", kind: "bench", zone: "machining", x: 18.9, y: 8.2, w: 2.0, d: 1.2 },
  { id: "qc-table", kind: "bench", zone: "office-qc", x: 16.4, y: 19.0, w: 2.0, d: 1.0 },
  { id: "pack-pallet-1", kind: "pallet", zone: "packing-dispatch", x: 1.6, y: 19.6, w: 1.2, d: 1.0 },
  { id: "pack-pallet-2", kind: "pallet", zone: "packing-dispatch", x: 3.4, y: 19.6, w: 1.2, d: 1.0 },
  { id: "pack-bench", kind: "bench", zone: "packing-dispatch", x: 1.6, y: 22.4, w: 5.6, d: 1.2 },
  { id: "assembly-bench", kind: "bench", zone: "assembly-qa", x: 21.2, y: 22.2, w: 12.4, d: 1.4 },
  { id: "qc-desk", kind: "desk", zone: "office-qc", x: 10.4, y: 22.8, w: 4.0, d: 1.6 },
  { id: "office-desk", kind: "desk", zone: "office-qc", x: 15.2, y: 22.8, w: 3.2, d: 1.6 },
];

export const zoneById = (id: ZoneId) => ZONES.find((z) => z.id === id)!;
