// All data in this file is EXAMPLE DATA for the demo.
import { MACHINE_LAYOUT, zoneById, type MachineType, type ZoneId } from "../../shared/floorplan";

export const SITE = {
  company: "Example Factory Ltd",
  siteName: "Example Factory · Unit 1",
  description:
    "Contract machine shop making aluminium brackets for cars.\n12 machines in one unit: CNC mills, presses, welders, a robot.",
  measures: [
    { label: "Downtime", on: true },
    { label: "Cycle counts", on: true },
    { label: "Scrap", on: true },
    { label: "Temperatures", on: true },
    { label: "Energy", on: false },
  ],
};

export interface Machine {
  id: string;
  name: string;
  short: string;
  /** Area on the floor plan (from shared/floorplan.ts). */
  zone: ZoneId;
  /** Short area name for tiles, e.g. "Machining". */
  area: string;
  /** Machine type from the shared floor plan (cnc-mill, press, welder, bandsaw, washer, robot-cell, cmm). */
  type: MachineType;
  reads: string[];
  /** Final-state example readings */
  primary: { label: string; value: string };
  secondary: { label: string; value: string };
  status: "running" | "idle" | "alarm";
  utilisation: number;
}

type Row = Omit<Machine, "zone" | "area" | "type">;
const ROWS: Row[] = [
  { id: "cnc1", name: "CNC mill 1", short: "CNC 1", reads: ["Spindle speed and load", "Part count and cycle time", "Alarm messages"], primary: { label: "Spindle", value: "7,200 rpm" }, secondary: { label: "Parts", value: "288" }, status: "running", utilisation: 84 },
  { id: "cnc2", name: "CNC mill 2", short: "CNC 2", reads: ["Spindle speed and load", "Part count and cycle time", "Alarm messages"], primary: { label: "Coolant", value: "Low" }, secondary: { label: "Parts", value: "241" }, status: "alarm", utilisation: 71 },
  { id: "cnc3", name: "CNC mill 3", short: "CNC 3", reads: ["Spindle speed and load", "Part count and cycle time", "Alarm messages"], primary: { label: "Spindle", value: "8,000 rpm" }, secondary: { label: "Parts", value: "312" }, status: "running", utilisation: 87 },
  { id: "cnc4", name: "CNC mill 4", short: "CNC 4", reads: ["Spindle speed and load", "Part count and cycle time", "Alarm messages"], primary: { label: "Spindle", value: "6,500 rpm" }, secondary: { label: "Parts", value: "265" }, status: "running", utilisation: 79 },
  { id: "saw", name: "Band saw", short: "Saw", reads: ["Blade speed", "Cut count"], primary: { label: "Blade", value: "62 m/min" }, secondary: { label: "Cuts", value: "540" }, status: "running", utilisation: 66 },
  { id: "wash", name: "Parts washer", short: "Wash", reads: ["Tank temperature", "Cycle state"], primary: { label: "Tank", value: "58 °C" }, secondary: { label: "Cycles", value: "37" }, status: "idle", utilisation: 41 },
  { id: "press1", name: "Press 1", short: "Press 1", reads: ["Stroke count", "Tonnage", "Die temperature"], primary: { label: "Strokes", value: "1,904" }, secondary: { label: "Tonnage", value: "142 t" }, status: "running", utilisation: 82 },
  { id: "press2", name: "Press 2", short: "Press 2", reads: ["Stroke count", "Tonnage", "Die temperature"], primary: { label: "Strokes", value: "1,766" }, secondary: { label: "Tonnage", value: "138 t" }, status: "running", utilisation: 77 },
  { id: "weld1", name: "Welder 1", short: "Weld 1", reads: ["Weld current", "Arc-on time"], primary: { label: "Current", value: "185 A" }, secondary: { label: "Arc-on", value: "61 %" }, status: "running", utilisation: 73 },
  { id: "weld2", name: "Welder 2", short: "Weld 2", reads: ["Weld current", "Arc-on time"], primary: { label: "Current", value: "0 A" }, secondary: { label: "Arc-on", value: "38 %" }, status: "idle", utilisation: 52 },
  { id: "robot", name: "Robot cell", short: "Robot", reads: ["Program state", "Cycle count", "Fault codes"], primary: { label: "Cycles", value: "1,120" }, secondary: { label: "State", value: "Auto" }, status: "running", utilisation: 88 },
  { id: "cmm", name: "Measuring machine (CMM)", short: "CMM", reads: ["Parts measured", "Pass / fail"], primary: { label: "Measured", value: "96" }, secondary: { label: "Pass", value: "98 %" }, status: "running", utilisation: 58 },
];

/** Machines with their area and type from the shared floor plan. */
export const MACHINES: Machine[] = ROWS.map((r) => {
  const L = MACHINE_LAYOUT[r.id];
  return { ...r, zone: L.zone, area: zoneById(L.zone).short, type: L.type };
});

export const TARGET_ID = "cnc3";
export const TARGET = MACHINES.find((m) => m.id === TARGET_ID)!;

/** Demo clock: Fri 30 Oct 2026, starts 10:42:00 Europe/London (GMT). */
export const CLOCK_START = { h: 10, m: 42, s: 0 };
export function clock(tick: number, withSeconds = true) {
  const total = CLOCK_START.h * 3600 + CLOCK_START.m * 60 + CLOCK_START.s + tick;
  const h = Math.floor(total / 3600) % 24, m = Math.floor(total / 60) % 60, s = total % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return withSeconds ? `${p(h)}:${p(m)}:${p(s)}` : `${p(h)}:${p(m)}`;
}

/** Deterministic example signal for CNC mill 3. Same tick -> same value. */
export function cncReading(tick: number) {
  const load = 42 + Math.round(2.2 * Math.sin(tick / 3.1) + 1.3 * Math.sin(tick / 1.7));
  const rpm = 8000 + (Math.round(Math.sin(tick / 5) * 2) * 10);
  const parts = 312 + Math.floor(tick / 6);
  return { load, rpm, parts, spindleTemp: (31.4 + 0.4 * Math.sin(tick / 9)).toFixed(1) };
}

/** 60-point history for "Spindle load, last hour" with a stop (as on design screen 6). */
export const LOAD_HISTORY: number[] = Array.from({ length: 60 }, (_, i) => {
  if (i >= 35 && i <= 40) return i === 35 || i === 40 ? 20 : 2;
  return Math.round(41 + 2 * Math.sin(i / 4) + (i > 20 && i < 30 ? 2 : 0));
});

export const INSIGHTS = [
  { tone: "warn", tag: "Check tool wear", title: "CNC mill 3 load is up 18%", body: "vs its usual on program O1042 since Tuesday. Likely a worn tool (T4).", action: "Create task", done: "Task created" },
  { tone: "bad", tag: "Unlogged downtime", title: "Coolant low on CNC 2, 4 times", body: "Shown on its screen this week but never logged as downtime (~2.5 h).", action: "Log as downtime", done: "Logged: 2 h 30 min" },
  { tone: "accent", tag: "Scheduling", title: "Welder 2 idle 40 min per shift", body: "Three days running. Staggering the handover could recover ~2 h a week.", action: "Plan handover", done: "Added to shift notes" },
] as const;

/** Example live values for every machine, on the script timer. Same tick -> same value. */
export function liveValues(tick: number): Record<string, { primary: string; secondary: string }> {
  const out: Record<string, { primary: string; secondary: string }> = {};
  const n = (v: number) => v.toLocaleString("en-GB");
  MACHINES.forEach((m, i) => {
    let p = m.primary.value, s = m.secondary.value;
    const w = Math.sin(tick / 3 + i);
    if (m.status === "running") {
      if (m.id === "cnc3") { const r = cncReading(tick); p = `${n(r.rpm)} rpm`; s = String(r.parts); }
      else if (/rpm$/.test(p)) p = `${n(parseInt(p.replace(/,/g, "")) + Math.round(w * 2) * 10)} rpm`;
      else if (m.type === "press") { p = n(parseInt(p.replace(/,/g, "")) + Math.floor(tick / 2)); }
      else if (m.type === "welder") p = `${185 + Math.round(w * 4)} A`;
      else if (m.type === "bandsaw") s = String(540 + Math.floor(tick / 8));
      else if (m.type === "robot-cell") p = n(1120 + Math.floor(tick / 5));
      else if (m.type === "cmm") p = String(96 + Math.floor(tick / 20));
      if (m.secondary.label === "Parts" && m.id !== "cnc3") s = String(parseInt(m.secondary.value) + Math.floor(tick / 7));
    }
    out[m.id] = { primary: p, secondary: s };
  });
  return out;
}
