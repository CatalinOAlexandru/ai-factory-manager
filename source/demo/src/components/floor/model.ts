import { MACHINES, TARGET_ID, liveValues, type Machine } from "../../data";
import { MACHINE_LAYOUT, type MachineType, type ZoneId, type Placed } from "../../../../shared/floorplan";
import type { DashStatus } from "../../viz";

export type PlanMode = "layout" | "sensorAdded" | "final";

/** One machine as the plan views see it (2D visual, 3D scene, tooltip, detail). */
export interface PlanMachine {
  id: string; name: string; label: string; short: string;
  type: MachineType; zone: ZoneId; area: string;
  /** null = no status (layout check). */
  status: DashStatus | null;
  live: boolean;
  primary: { label: string; value: string };
  secondary: { label: string; value: string };
  utilisation: number;
  reads: string[];
  place: Placed;
}

export const displayName = (m: Machine) => (m.id === "wash" ? "Washer" : m.id === "cmm" ? "CMM" : m.name);

export function planMachines(mode: PlanMode, tick: number, liveIds: string[] = [TARGET_ID]): PlanMachine[] {
  const v = liveValues(tick);
  return MACHINES.map((m) => {
    const live = mode === "final" || (mode === "sensorAdded" && liveIds.includes(m.id));
    const status: DashStatus | null = mode === "layout" ? null : !live ? "notSetUp" : mode === "sensorAdded" ? "running" : m.status === "alarm" ? "fault" : m.status === "idle" ? "idle" : "running";
    return {
      id: m.id, name: m.name, label: displayName(m), short: m.short, type: m.type, zone: m.zone, area: m.area,
      status, live,
      primary: { label: m.primary.label, value: v[m.id].primary },
      secondary: { label: m.secondary.label, value: v[m.id].secondary },
      utilisation: m.utilisation, reads: m.reads, place: MACHINE_LAYOUT[m.id],
    };
  });
}

/** Shared camera framing for the 2D and 3D views (metres + zoom), kept across the 2D/3D toggle. */
export interface Framing { cx: number; cy: number; zoom: number; azimuth: number; polar: number }
/** azimuth is relative to the view default (south on desktop, east on phones, to match the 2D plan). polar 0.66 rad = 52° elevation (viz-tokens). */
export const DEFAULT_FRAMING: Framing = { cx: 20, cy: 12.8, zoom: 1, azimuth: 0, polar: 0.66 };
let framing: Framing = { ...DEFAULT_FRAMING };
export const getFraming = () => framing;
export const setFraming = (f: Partial<Framing>) => { framing = { ...framing, ...f }; };

const listeners = new Set<() => void>();
/** Subscribe to framing commands (zoom buttons, reset). Returns an unsubscribe function. */
export const onFramingCommand = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
/** Change the framing and tell the open view to apply it. */
export const pushFraming = (f: Partial<Framing>) => { setFraming(f); listeners.forEach((l) => l()); };
export const clampZoom = (z: number) => Math.min(4, Math.max(1, z));
