/**
 * PanelPal 2D floor plan: visual layer only (no pan/zoom, tooltip, legend or filters; Build's wrapper adds those).
 * Top-down view of the same scene as Scene3D: geometry from shared/floorplan.ts, colours from shared/viz-tokens.ts.
 * Only dependency: React. Styles: ./plan2d.css (class-driven; colours come in as CSS variables from viz-tokens).
 * All data is example data.
 */
import { useMemo, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import * as FP from "../../shared/floorplan";
import { STATUS, ZONE, PLAN, LABEL, toVizStatus, type DataStatus, type VizStatus } from "../../shared/viz-tokens";

export type PlanMode = "layout" | "sensorAdded" | "final";

export interface PlanMachineState {
  id: string;
  name: string;
  /** Short name for compact mode (e.g. "CNC 3"). Falls back to name. */
  short?: string;
  status: DataStatus;
  /** Live value chip, e.g. "8,000 rpm". */
  liveValue?: string;
  hasSensor: boolean;
}

export interface FloorPlan2DProps {
  machines: PlanMachineState[];
  mode: PlanMode;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** Pointer in client (viewport) px, for Build's tooltip. Called with null on leave/blur. */
  onHover?: (id: string | null, pointer: { x: number; y: number }) => void;
  /** Machines whose (visual) status is not listed are dimmed. Omit = all visible. */
  visibleStatuses?: VizStatus[];
  /** Zones not listed are faded (and their machines dimmed). Omit = all visible. */
  visibleZones?: FP.ZoneId[];
  /** Soft highlight (e.g. hover in a list), separate from selection. */
  highlightId?: string | null;
  /** Phone layout: rotates the plan to portrait, hides minor labels, bigger hit targets. */
  compact?: boolean;
  /** Override the orientation (default: portrait when compact). */
  portrait?: boolean;
  /** Draw process-flow arrows on the walkway (default: layout mode only). */
  showFlow?: boolean;
  /** Optional position overrides keyed by machine / equipment id (for trying layout-notes.md without editing floorplan.ts). */
  layoutOverride?: Record<string, Partial<Pick<FP.Placed, "x" | "y" | "w" | "d" | "rotation" | "zone">>>;
  className?: string;
  ariaLabel?: string;
}

type Pt = [number, number];
const W = FP.FLOOR.width, D = FP.FLOOR.depth;
/** Margin round the building (plan metres): apron outside the west loading door (l), legend strip below (b).
 *  Same in both orientations; Build's plan.tsx mirrors these (or import PLAN_FRAME below). In portrait the
 *  legend sits in the top strip beside the loading door. */
const M = { l: 2.6, t: 0.8, r: 0.8, b: 3.0 };
/** Geometry helpers for wrappers (pan/zoom, hit-testing): content size in svg units and plan<->svg mapping. */
export const PLAN_FRAME = {
  M, VW: M.l + FP.FLOOR.width + M.r, VH: M.t + FP.FLOOR.depth + M.b,
  content: (rot: boolean): [number, number] => (rot ? [PLAN_FRAME.VH, PLAN_FRAME.VW] : [PLAN_FRAME.VW, PLAN_FRAME.VH]),
  toSvg: (x: number, y: number, rot: boolean): [number, number] => (rot ? [PLAN_FRAME.VH - (y + M.t), x + M.l] : [x + M.l, y + M.t]),
  fromSvg: (sx: number, sy: number, rot: boolean): [number, number] => (rot ? [sy - M.l, PLAN_FRAME.VH - M.t - sx] : [sx - M.l, sy - M.t]),
};

/* ---------- helpers ---------- */
function aabb(m: { x: number; y: number; w: number; d: number; rotation: number }) {
  const r = (m.rotation * Math.PI) / 180, c = Math.abs(Math.cos(r)), s = Math.abs(Math.sin(r));
  const hw = (m.w / 2) * c + (m.d / 2) * s, hd = (m.w / 2) * s + (m.d / 2) * c;
  return { x0: m.x - hw, y0: m.y - hd, x1: m.x + hw, y1: m.y + hd };
}
/** Rough text width for Inter semibold (no DOM measuring, so it also works in SSR / static export). */
const tw = (text: string, size: number, k = 0.6) =>
  [...text].reduce((a, ch) => a + (/[A-Z]/.test(ch) ? (/[MW]/.test(ch) ? 0.9 : 0.72) : /[0-9]/.test(ch) ? 0.62 : ch === " " ? 0.3 : /[il.,:'|]/.test(ch) ? 0.3 : /[mw]/.test(ch) ? 0.85 : 0.56), 0) * size * (k / 0.6);

/* ---------- machine silhouettes (local coords: centred, w along x, d along y, front = +y) ---------- */
function Silhouette({ kind, w, d }: { kind: FP.MachineType; w: number; d: number }): ReactNode {
  const x0 = -w / 2, y0 = -d / 2;
  const body = (pad = 0, rx = 0.25, cls = "pp-body") => <rect className={cls} x={x0 + pad} y={y0 + pad} width={w - 2 * pad} height={d - 2 * pad} rx={rx} />;
  switch (kind) {
    case "cnc-mill": {
      const ew = w * 0.78;
      return <>
        {/* chip conveyor at the back-left */}
        <rect className="pp-detail" x={x0} y={y0 + d * 0.08} width={w * 0.2} height={d * 0.32} rx={0.08} />
        {[0, 1, 2, 3].map((i) => <line key={i} className="pp-line" x1={x0 + 0.08} x2={x0 + w * 0.2 - 0.08} y1={y0 + d * (0.13 + i * 0.07)} y2={y0 + d * (0.13 + i * 0.07)} />)}
        <rect className="pp-body" x={x0 + w * 0.14} y={y0} width={ew} height={d} rx={0.3} />
        {/* column + spindle head at the back */}
        <rect className="pp-detail" x={-w * 0.13 + w * 0.04} y={y0 + 0.18} width={w * 0.3} height={d * 0.3} rx={0.12} />
        <circle className="pp-dark" cx={w * 0.04 + 0.02} cy={y0 + 0.18 + d * 0.15} r={Math.min(w, d) * 0.07} />
        {/* front window (glass doors) */}
        <rect className="pp-glass" x={x0 + w * 0.22} y={y0 + d * 0.52} width={ew * 0.62} height={d * 0.36} rx={0.12} />
        <line className="pp-line" x1={x0 + w * 0.22 + ew * 0.31} x2={x0 + w * 0.22 + ew * 0.31} y1={y0 + d * 0.52} y2={y0 + d * 0.88} />
        {/* table + vice */}
        <rect className="pp-detail" x={x0 + w * 0.3} y={y0 + d * 0.6} width={ew * 0.46} height={d * 0.12} rx={0.05} />
        {/* control pendant (the screen the camera reads) */}
        <rect className="pp-dark" x={x0 + w * 0.82} y={y0 + d * 0.58} width={w * 0.13} height={d * 0.32} rx={0.06} />
        <rect className="pp-screen" x={x0 + w * 0.835} y={y0 + d * 0.62} width={w * 0.1} height={d * 0.12} rx={0.03} />
      </>;
    }
    case "cnc-lathe":
      return <>
        {body(0, 0.3)}
        <circle className="pp-dark" cx={x0 + w * 0.18} cy={0} r={d * 0.22} />
        <rect className="pp-detail" x={x0 + w * 0.28} y={-d * 0.08} width={w * 0.5} height={d * 0.16} />
        <rect className="pp-glass" x={x0 + w * 0.12} y={y0 + d * 0.62} width={w * 0.6} height={d * 0.28} rx={0.1} />
        <rect className="pp-dark" x={x0 + w * 0.8} y={y0 + d * 0.55} width={w * 0.14} height={d * 0.35} rx={0.06} />
      </>;
    case "press": {
      const p = Math.min(w, d) * 0.2;
      return <>
        {/* bolster + bed */}
        {body(0, 0.2)}
        <rect className="pp-detail" x={x0 + p} y={y0 + p} width={w - 2 * p} height={d - 2 * p} rx={0.1} />
        {/* die area, hatched */}
        <rect className="pp-hatch" x={x0 + p * 1.6} y={y0 + p * 1.5} width={w - 3.2 * p} height={d - 3 * p} />
        {/* four uprights */}
        {[[x0, y0], [x0 + w - p, y0], [x0, y0 + d - p], [x0 + w - p, y0 + d - p]].map(([a, b], i) => <rect key={i} className="pp-dark" x={a} y={b} width={p} height={p} rx={0.06} />)}
        {/* light curtain posts + two-hand control station at the front */}
        <rect className="pp-dark" x={-0.55} y={y0 + d + 0.12} width={1.1} height={0.32} rx={0.08} />
        <circle className="pp-stop" cx={-0.3} cy={y0 + d + 0.28} r={0.09} /><circle className="pp-stop" cx={0.3} cy={y0 + d + 0.28} r={0.09} />
      </>;
    }
    case "welder": {
      const t = 0.14;
      return <>
        {/* floor of the bay */}
        <rect className="pp-bay" x={x0} y={y0} width={w} height={d} />
        {/* weld screens on three sides (open at the front) */}
        <path className="pp-screenwall" d={`M${x0 + t / 2} ${y0 + d * 0.92} V${y0 + t / 2} H${x0 + w - t / 2} V${y0 + d * 0.92}`} strokeWidth={t} />
        {/* weld table with fixture */}
        <rect className="pp-body" x={-w * 0.22} y={y0 + d * 0.28} width={w * 0.44} height={d * 0.32} rx={0.06} />
        <rect className="pp-hatch" x={-w * 0.18} y={y0 + d * 0.32} width={w * 0.36} height={d * 0.24} />
        {/* power source with its display, and the torch lead */}
        <rect className="pp-dark" x={x0 + w * 0.08} y={y0 + d * 0.12} width={w * 0.18} height={d * 0.22} rx={0.06} />
        <rect className="pp-screen" x={x0 + w * 0.11} y={y0 + d * 0.15} width={w * 0.12} height={d * 0.07} rx={0.02} />
        <path className="pp-lead" d={`M${x0 + w * 0.26} ${y0 + d * 0.24} C ${x0 + w * 0.36} ${y0 + d * 0.2}, ${-w * 0.1} ${y0 + d * 0.66}, ${-w * 0.02} ${y0 + d * 0.5}`} />
        {/* fume extraction arm */}
        <circle className="pp-detail" cx={x0 + w * 0.82} cy={y0 + d * 0.18} r={Math.min(w, d) * 0.07} />
        <line className="pp-arm" x1={x0 + w * 0.82} y1={y0 + d * 0.18} x2={w * 0.12} y2={y0 + d * 0.36} />
      </>;
    }
    case "robot-cell": {
      const g = Math.min(1.4, w * 0.25);
      return <>
        <rect className="pp-bay" x={x0} y={y0} width={w} height={d} />
        {/* safety fence, gate gap on the front */}
        <path className="pp-fence" d={`M${-g / 2} ${y0 + d} H${x0} V${y0} H${x0 + w} V${y0 + d} H${g / 2}`} />
        <path className="pp-fence-mesh" d={`M${-g / 2} ${y0 + d} H${x0} V${y0} H${x0 + w} V${y0 + d} H${g / 2}`} />
        {/* robot base + two-link arm */}
        <circle className="pp-dark" cx={-w * 0.1} cy={-d * 0.05} r={Math.min(w, d) * 0.11} />
        <path className="pp-robot-arm" d={`M${-w * 0.1} ${-d * 0.05} L${w * 0.08} ${-d * 0.24} L${w * 0.24} ${-d * 0.02}`} />
        <circle className="pp-accent-dot" cx={w * 0.24} cy={-d * 0.02} r={0.14} />
        {/* turntable / fixture */}
        <circle className="pp-body" cx={w * 0.26} cy={d * 0.16} r={Math.min(w, d) * 0.15} />
        <line className="pp-line" x1={w * 0.26 - Math.min(w, d) * 0.15} x2={w * 0.26 + Math.min(w, d) * 0.15} y1={d * 0.16} y2={d * 0.16} />
        {/* controller cabinet + teach pendant outside the fence */}
        <rect className="pp-dark" x={x0 + w * 0.05} y={y0 + d * 0.62} width={w * 0.13} height={d * 0.26} rx={0.06} />
        <rect className="pp-screen" x={x0 + w * 0.075} y={y0 + d * 0.66} width={w * 0.08} height={d * 0.08} rx={0.02} />
      </>;
    }
    case "bandsaw":
      return <>
        {/* infeed / outfeed roller tables */}
        <rect className="pp-detail" x={x0} y={-d * 0.16} width={w} height={d * 0.32} rx={0.05} />
        {Array.from({ length: Math.max(4, Math.round(w / 0.45)) }, (_, i) => {
          const x = x0 + 0.2 + (i * (w - 0.4)) / Math.max(3, Math.round(w / 0.45) - 1);
          return <line key={i} className="pp-line" x1={x} x2={x} y1={-d * 0.16} y2={d * 0.16} />;
        })}
        {/* saw frame with two wheels and the blade */}
        <rect className="pp-body" x={-w * 0.16} y={y0} width={w * 0.32} height={d} rx={0.2} />
        <circle className="pp-detail" cx={-w * 0.09} cy={y0 + d * 0.3} r={d * 0.2} />
        <circle className="pp-detail" cx={w * 0.09} cy={y0 + d * 0.3} r={d * 0.2} />
        <line className="pp-blade" x1={-w * 0.09} x2={w * 0.09} y1={y0 + d * 0.5} y2={y0 + d * 0.5} />
        <rect className="pp-dark" x={w * 0.17} y={y0 + d * 0.62} width={w * 0.08} height={d * 0.3} rx={0.05} />
      </>;
    case "washer":
      return <>
        {body(0, 0.3)}
        {/* load and unload hatches + drum */}
        <rect className="pp-detail" x={x0 + w * 0.06} y={y0 + d * 0.2} width={w * 0.2} height={d * 0.6} rx={0.1} />
        <rect className="pp-detail" x={x0 + w * 0.74} y={y0 + d * 0.2} width={w * 0.2} height={d * 0.6} rx={0.1} />
        <circle className="pp-glass" cx={0} cy={-d * 0.04} r={Math.min(w, d) * 0.26} />
        <circle className="pp-line-c" cx={0} cy={-d * 0.04} r={Math.min(w, d) * 0.17} />
        {/* exhaust stack */}
        <circle className="pp-dark" cx={x0 + w * 0.5} cy={y0 + d * 0.12} r={Math.min(w, d) * 0.06} />
        <rect className="pp-dark" x={x0 + w * 0.36} y={y0 + d * 0.8} width={w * 0.28} height={d * 0.12} rx={0.04} />
      </>;
    case "cmm":
      return <>
        {/* granite table */}
        <rect className="pp-granite" x={x0} y={y0 + d * 0.1} width={w} height={d * 0.8} rx={0.1} />
        {/* bridge across + probe */}
        <rect className="pp-body" x={x0 - 0.05} y={-d * 0.1} width={w + 0.1} height={d * 0.16} rx={0.05} />
        <rect className="pp-detail" x={-w * 0.08} y={-d * 0.16} width={w * 0.16} height={d * 0.28} rx={0.04} />
        <circle className="pp-accent-dot" cx={0} cy={-d * 0.02} r={0.1} />
        {/* part on the table */}
        <rect className="pp-detail" x={w * 0.16} y={d * 0.14} width={w * 0.18} height={d * 0.14} rx={0.04} />
        {/* PC desk at the front */}
        <rect className="pp-dark" x={x0 + w * 0.06} y={y0 + d * 0.92} width={w * 0.3} height={d * 0.08} rx={0.03} />
      </>;
    case "conveyor":
      return <>
        <rect className="pp-detail" x={x0} y={y0} width={w} height={d} rx={0.08} />
        <rect className="pp-belt" x={x0 + 0.06} y={y0 + d * 0.15} width={w - 0.12} height={d * 0.7} />
        {Array.from({ length: Math.max(2, Math.floor(w / 0.6)) }, (_, i) => {
          const x = x0 + 0.3 + i * 0.6;
          return <path key={i} className="pp-chevron" d={`M${x} ${-d * 0.2} L${x + 0.2} 0 L${x} ${d * 0.2}`} />;
        })}
      </>;
    case "compressor":
      return <>
        {body(0, 0.2)}
        <circle className="pp-detail" cx={-w * 0.18} cy={0} r={Math.min(w, d) * 0.32} />
        {[0, 60, 120].map((a) => <line key={a} className="pp-line" x1={-w * 0.18} y1={0} x2={-w * 0.18 + Math.cos((a * Math.PI) / 180) * Math.min(w, d) * 0.3} y2={Math.sin((a * Math.PI) / 180) * Math.min(w, d) * 0.3} transform={`rotate(0)`} />)}
        <circle className="pp-dark" cx={-w * 0.18} cy={0} r={Math.min(w, d) * 0.06} />
        <rect className="pp-dark" x={w * 0.22} y={y0 + d * 0.62} width={w * 0.18} height={d * 0.26} rx={0.05} />
        <circle className="pp-tank" cx={w * 0.3} cy={-d * 0.12} r={Math.min(w, d) * 0.22} />
      </>;
  }
}

function Prop({ kind, x, y, w, d }: { kind: "rack" | "pallet" | "bench" | "desk"; x: number; y: number; w: number; d: number }) {
  if (kind === "rack") {
    const n = Math.max(2, Math.round(w / 1.4));
    return <g className="pp-prop">
      <rect className="pp-prop-body" x={x} y={y} width={w} height={d} />
      {Array.from({ length: n - 1 }, (_, i) => <line key={i} className="pp-prop-line" x1={x + ((i + 1) * w) / n} x2={x + ((i + 1) * w) / n} y1={y} y2={y + d} />)}
      <line className="pp-prop-line" x1={x} x2={x + w} y1={y + d / 2} y2={y + d / 2} />
      {Array.from({ length: n }, (_, i) => <rect key={i} className="pp-stock" x={x + (i * w) / n + 0.12} y={y + 0.12} width={w / n - 0.24} height={d / 2 - 0.24} />)}
    </g>;
  }
  if (kind === "pallet") return <g className="pp-prop">
    <rect className="pp-pallet" x={x} y={y} width={w} height={d} />
    {[0.25, 0.5, 0.75].map((f) => <line key={f} className="pp-prop-line" x1={x} x2={x + w} y1={y + d * f} y2={y + d * f} />)}
    <rect className="pp-box" x={x + 0.12} y={y + 0.1} width={w - 0.24} height={d - 0.2} rx={0.04} />
  </g>;
  if (kind === "bench") return <g className="pp-prop">
    <rect className="pp-prop-body" x={x} y={y} width={w} height={d} rx={0.06} />
    <line className="pp-prop-line" x1={x} x2={x + w} y1={y + d * 0.3} y2={y + d * 0.3} />
    {Array.from({ length: Math.max(1, Math.floor(w / 1.8)) }, (_, i) => <circle key={i} className="pp-stool" cx={x + 0.9 + i * 1.8} cy={y + d + 0.45} r={0.26} />)}
  </g>;
  return <g className="pp-prop">
    <rect className="pp-prop-body" x={x} y={y} width={w} height={d} rx={0.06} />
    <rect className="pp-screen-off" x={x + 0.3} y={y + 0.2} width={0.7} height={0.12} />
    <circle className="pp-stool" cx={x + 0.8} cy={y - 0.45} r={0.3} />
    {w > 3.4 && <><rect className="pp-screen-off" x={x + w - 1.0} y={y + 0.2} width={0.7} height={0.12} /><circle className="pp-stool" cx={x + w - 0.8} cy={y - 0.45} r={0.3} /></>}
  </g>;
}

/** Status icon drawn as shapes (no font glyphs), centred on (cx, cy), size = font size. Same shapes as the 3D HTML chips. */
function StatusIcon({ st, cx, cy, size, color }: { st: VizStatus; cx: number; cy: number; size: number; color: string }) {
  const r = size * 0.36, sw = size * 0.16;
  switch (st) {
    case "running": return <circle cx={cx} cy={cy} r={r} fill={color} />;
    case "idle": return <g fill={color}><rect x={cx - r * 0.85} y={cy - r} width={r * 0.6} height={r * 2} rx={r * 0.12} /><rect x={cx + r * 0.25} y={cy - r} width={r * 0.6} height={r * 2} rx={r * 0.12} /></g>;
    case "warning": return <path d={`M${cx} ${cy - r * 1.1} L${cx + r * 1.15} ${cy + r * 0.9} H${cx - r * 1.15}Z`} fill={color} />;
    case "fault": return <path d={`M${cx - r * 0.8} ${cy - r * 0.8} L${cx + r * 0.8} ${cy + r * 0.8} M${cx + r * 0.8} ${cy - r * 0.8} L${cx - r * 0.8} ${cy + r * 0.8}`} stroke={color} strokeWidth={sw * 1.3} strokeLinecap="round" />;
    case "offline": return <circle cx={cx} cy={cy} r={r * 0.9} fill="none" stroke={color} strokeWidth={sw} strokeDasharray={`${sw * 1.2} ${sw}`} />;
    default: return <circle cx={cx} cy={cy} r={r * 0.85} fill="none" stroke={color} strokeWidth={sw} />;
  }
}

/* ---------- the component ---------- */
export function FloorPlan2D({
  machines, mode, selectedId, onSelect, onHover, visibleStatuses, visibleZones, highlightId,
  compact = false, portrait, showFlow, layoutOverride, className, ariaLabel = "Top-down floor plan of the example site. Example data.",
}: FloorPlan2DProps) {
  const rot = portrait ?? compact;
  const VW = M.l + W + M.r, VH = M.t + D + M.b;
  /** plan metres -> svg user units (rotated 90° clockwise in portrait). */
  const T = (x: number, y: number): Pt => (rot ? [VH - (y + M.t), x + M.l] : [x + M.l, y + M.t]);
  const viewBox = rot ? `0 0 ${VH} ${VW}` : `0 0 ${VW} ${VH}`;
  const geo = rot ? `translate(${VH - M.t} ${M.l}) rotate(90)` : `translate(${M.l} ${M.t})`;
  /** px per metre at the target width (1200 desktop / 390 phone) -> converts px type sizes to metres. */
  const ppm = rot ? 390 / VH : compact ? 390 / VW : 1180 / VW;
  const px = (n: number) => n / ppm;
  const flow = showFlow ?? mode === "layout";

  const byId = useMemo(() => new Map(machines.map((m) => [m.id, m])), [machines]);
  const cssVars = {
    "--pp-ground": PLAN.ground, "--pp-floor": PLAN.floor, "--pp-wall": PLAN.wall, "--pp-wall-edge": PLAN.wallEdge, "--pp-door": PLAN.door,
    "--pp-walkway": PLAN.walkway, "--pp-walkway-fill": PLAN.walkwayFill, "--pp-walkway-hatch": PLAN.walkwayHatch, "--pp-apron": PLAN.apron,
    "--pp-machine": PLAN.machine, "--pp-machine-edge": PLAN.machineEdge, "--pp-machine-detail": PLAN.machineDetail, "--pp-machine-dark": PLAN.machineDark,
    "--pp-glass": PLAN.glass, "--pp-weld-screen": PLAN.weldScreen, "--pp-fence": PLAN.fence, "--pp-fixture": PLAN.fixture, "--pp-fixture-edge": PLAN.fixtureEdge,
    "--pp-accent": PLAN.accent, "--pp-camera": PLAN.camera, "--pp-selected": PLAN.selected, "--pp-text": PLAN.text, "--pp-muted": PLAN.muted,
    "--pp-font-sans": LABEL.fontSans, "--pp-font-mono": LABEL.fontMono,
  } as CSSProperties;

  const statusOf = (id: string): VizStatus | null => {
    const s = byId.get(id);
    if (mode === "layout" || !s) return null;
    if (!s.hasSensor) return "notSetUp";
    return toVizStatus(s.status);
  };

  const ptr = (e: PointerEvent) => ({ x: e.clientX, y: e.clientY });
  const key = (id: string) => (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect?.(id); }
  };

  const placed = useMemo(() => Object.values(FP.MACHINE_LAYOUT).map((m) => ({ ...m, ...layoutOverride?.[m.id] })), [layoutOverride]);
  const equipment = useMemo(() => FP.EQUIPMENT.map((e) => ({ ...e, ...layoutOverride?.[e.id] })), [layoutOverride]);

  return (
    <svg viewBox={viewBox} className={`pp-plan ${compact ? "is-compact" : ""} is-${mode} ${className ?? ""}`} style={cssVars}
      role="group" aria-label={ariaLabel} preserveAspectRatio="xMidYMid meet">
      <defs>
        <pattern id="pp-hatch" width="0.35" height="0.35" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="0.35" className="pp-hatch-line" />
        </pattern>
        <pattern id="pp-zebra" width="0.6" height="0.6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="0.18" height="0.6" fill={PLAN.walkwayHatch} opacity="0.45" />
        </pattern>
        <pattern id="pp-bay-stripe" width="0.8" height="0.8" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <rect width="0.4" height="0.8" fill={PLAN.walkway} opacity="0.9" />
          <rect x="0.4" width="0.4" height="0.8" fill="#1f2328" opacity="0.85" />
        </pattern>
        <pattern id="pp-mesh" width="0.22" height="0.22" patternUnits="userSpaceOnUse">
          <path d="M0 0L0.22 0.22M0.22 0L0 0.22" stroke={PLAN.fence} strokeWidth="0.025" />
        </pattern>
        <filter id="pp-shadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0.05" dy="0.14" stdDeviation="0.14" floodColor="#0f1720" floodOpacity="0.2" />
        </filter>
        <filter id="pp-card-shadow" x="-10%" y="-20%" width="120%" height="160%">
          <feDropShadow dx="0" dy={px(1)} stdDeviation={px(1.5)} floodColor="#0f1720" floodOpacity="0.16" />
        </filter>
        <marker id="pp-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill={PLAN.accent} />
        </marker>
      </defs>

      <rect className="pp-ground" x="0" y="0" width={rot ? VH : VW} height={rot ? VW : VH} />

      {/* ======== geometry layer (plan metres) ======== */}
      <g transform={geo}>
        {/* yard apron outside the loading door */}
        <rect className="pp-apron" x={-2.4} y={FP.LOADING_BAY.y - 1.2} width={2.4} height={FP.LOADING_BAY.d + 2.4} />
        {[FP.LOADING_BAY.y - 0.1, FP.LOADING_BAY.y + FP.LOADING_BAY.d - 0.2].map((y, i) => <rect key={i} className="pp-bumper" x={-0.45} y={y} width={0.3} height={0.3} />)}
        <rect className="pp-floor" x={0} y={0} width={W} height={D} />

        {/* zones */}
        {FP.ZONES.map((z) => {
          const off = visibleZones && !visibleZones.includes(z.id);
          return <rect key={z.id} className={`pp-zone pp-zone-${z.id} ${off ? "is-faded" : ""}`} data-zone-id={z.id}
            x={z.x} y={z.y} width={z.w} height={z.d} rx={0.15} fill={ZONE[z.id].fill} stroke={ZONE[z.id].edge} />;
        })}

        {/* walkways: pale fill, yellow edge lines on the long sides, zebra hatch on cross walkways */}
        {FP.WALKWAYS.map((w) => {
          const h = w.w >= w.d;
          return <g key={w.id} className="pp-walkway" data-walkway-id={w.id}>
            <rect className="pp-walkway-fill" x={w.x} y={w.y} width={w.w} height={w.d} />
            {!h && <rect x={w.x} y={w.y} width={w.w} height={w.d} fill="url(#pp-zebra)" />}
            {h ? <>
              <line className="pp-walkway-line" x1={w.x} x2={w.x + w.w} y1={w.y + 0.05} y2={w.y + 0.05} />
              <line className="pp-walkway-line" x1={w.x} x2={w.x + w.w} y1={w.y + w.d - 0.05} y2={w.y + w.d - 0.05} />
            </> : <>
              <line className="pp-walkway-line" y1={w.y} y2={w.y + w.d} x1={w.x + 0.05} x2={w.x + 0.05} />
              <line className="pp-walkway-line" y1={w.y} y2={w.y + w.d} x1={w.x + w.w - 0.05} x2={w.x + w.w - 0.05} />
            </>}
          </g>;
        })}

        {/* loading bay: striped edge inside the roller door */}
        <g className="pp-loading-bay">
          <rect x={FP.LOADING_BAY.x} y={FP.LOADING_BAY.y} width={FP.LOADING_BAY.w} height={FP.LOADING_BAY.d} className="pp-loading-fill" />
          <rect x={FP.LOADING_BAY.x + FP.LOADING_BAY.w - 0.25} y={FP.LOADING_BAY.y} width={0.25} height={FP.LOADING_BAY.d} fill="url(#pp-bay-stripe)" />
        </g>

        {/* process flow (layout mode) */}
        {flow && <polyline className="pp-flow" points={FP.FLOW.map((p) => p.join(",")).join(" ")} markerEnd="url(#pp-arrow)" markerMid="url(#pp-arrow)" />}

        {/* props + non-monitored equipment */}
        {FP.PROPS.map((p) => <Prop key={p.id} {...p} />)}
        {equipment.map((e) => (
          <g key={e.id} className="pp-equipment" transform={`translate(${e.x} ${e.y}) rotate(${e.rotation})`} filter="url(#pp-shadow)">
            <Silhouette kind={e.type} w={e.w} d={e.d} />
          </g>
        ))}

        {/* walls (poché) */}
        {FP.WALLS.map((w) => (
          <line key={w.id} className={`pp-wall pp-wall-${w.kind}`} x1={w.line[0]} y1={w.line[1]} x2={w.line[2]} y2={w.line[3]}
            strokeWidth={w.kind === "outer" ? FP.FLOOR.wallThickness : 0.15} />
        ))}
        {/* doors */}
        {FP.DOORS.map((d) => d.kind === "roller" ? (
          <g key={d.id} className="pp-door pp-door-roller">
            {d.axis === "y"
              ? <><line x1={d.x} x2={d.x} y1={d.y} y2={d.y + d.width} className="pp-roller" /><line x1={d.x + 0.35} x2={d.x + 0.35} y1={d.y} y2={d.y + d.width} className="pp-roller-track" /></>
              : <><line y1={d.y} y2={d.y} x1={d.x} x2={d.x + d.width} className="pp-roller" /><line y1={d.y + 0.35} y2={d.y + 0.35} x1={d.x} x2={d.x + d.width} className="pp-roller-track" /></>}
          </g>
        ) : (
          // personnel door: leaf + quarter swing arc into the room (+y for x-axis doors)
          <g key={d.id} className="pp-door pp-door-swing">
            {d.axis === "x" ? <>
              <line x1={d.x} y1={d.y} x2={d.x} y2={d.y + d.width} className="pp-leaf" />
              <path d={`M${d.x} ${d.y + d.width} A ${d.width} ${d.width} 0 0 0 ${d.x + d.width} ${d.y}`} className="pp-swing" />
            </> : <>
              <line x1={d.x} y1={d.y} x2={d.x + d.width} y2={d.y} className="pp-leaf" />
              <path d={`M${d.x + d.width} ${d.y} A ${d.width} ${d.width} 0 0 1 ${d.x} ${d.y + d.width}`} className="pp-swing" />
            </>}
          </g>
        ))}

        {/* monitored machines */}
        {placed.map((p) => {
          const s = byId.get(p.id);
          const st = statusOf(p.id);
          const sel = selectedId === p.id, hi = highlightId === p.id;
          const dim = (visibleStatuses && st && !visibleStatuses.includes(st)) || (visibleZones && !visibleZones.includes(p.zone));
          const name = s?.name ?? p.id;
          const word = st ? STATUS[st].word : "Planned camera spot";
          const aria = `${name}. ${word}${st && st !== "notSetUp" && s?.liveValue ? `, ${s.liveValue}` : ""}. Example data.`;
          const pad = 0.28, hit = compact ? 0.9 : 0.35;
          const col = st ? STATUS[st] : null;
          return (
            <g key={p.id} data-machine-id={p.id} data-status={st ?? "layout"} data-zone={p.zone}
              className={["pp-machine", `kind-${p.type}`, st ? `is-${st}` : "is-layout", sel && "is-selected", hi && "is-highlight", dim && "is-dimmed"].filter(Boolean).join(" ")}
              transform={`translate(${p.x} ${p.y}) rotate(${p.rotation})`}
              role="button" tabIndex={0} aria-label={aria} aria-pressed={sel}
              onClick={() => onSelect?.(p.id)} onKeyDown={key(p.id)}
              onPointerEnter={(e) => onHover?.(p.id, ptr(e))} onPointerMove={(e) => onHover?.(p.id, ptr(e))} onPointerLeave={(e) => onHover?.(null, ptr(e))}
              onFocus={(e) => { const r = (e.currentTarget as SVGGElement).getBoundingClientRect(); onHover?.(p.id, { x: r.left + r.width / 2, y: r.top }); }}
              onBlur={() => onHover?.(null, { x: 0, y: 0 })}>
              <rect className="pp-hit" x={-p.w / 2 - hit} y={-p.d / 2 - hit} width={p.w + 2 * hit} height={p.d + 2 * hit} rx={0.4} />
              {/* status halo + ring on the floor (same as the 3D floor ring) */}
              {col && st !== "notSetUp" && <rect className="pp-halo" x={-p.w / 2 - pad} y={-p.d / 2 - pad} width={p.w + 2 * pad} height={p.d + 2 * pad} rx={0.45} fill={col.soft} />}
              <rect className="pp-ring" x={-p.w / 2 - pad} y={-p.d / 2 - pad} width={p.w + 2 * pad} height={p.d + 2 * pad} rx={0.45}
                stroke={col ? col.dot : "transparent"} strokeDasharray={col?.dashed ? "0.35 0.22" : undefined} />
              <rect className="pp-sel" x={-p.w / 2 - pad - 0.22} y={-p.d / 2 - pad - 0.22} width={p.w + 2 * pad + 0.44} height={p.d + 2 * pad + 0.44} rx={0.6} />
              <g className="pp-sil" filter="url(#pp-shadow)"><Silhouette kind={p.type} w={p.w} d={p.d} /></g>
              {/* camera on its clip, in front of the machine screen */}
              {(mode === "layout" || s?.hasSensor) && (
                <g className={`pp-cam ${mode === "layout" ? "is-planned" : "is-live"}`} transform={`translate(${p.w * 0.36} ${p.d / 2 + 0.05})`}>
                  <rect x={-0.28} y={-0.16} width={0.56} height={0.34} rx={0.09} />
                  <circle cx={0} cy={0.01} r={0.09} />
                </g>
              )}
            </g>
          );
        })}
      </g>

      {/* ======== annotation layer (screen-aligned, never rotated) ======== */}
      <g className="pp-annotations" aria-hidden="true">
        {/* zone labels */}
        {FP.ZONES.map((z) => {
          const a = T(z.x, z.y), b2 = T(z.x + z.w, z.y + z.d);
          const x = Math.min(a[0], b2[0]) + 0.45, y = Math.min(a[1], b2[1]) + 0.35;
          const fs = px(compact ? 10 : 11);
          const label = (compact ? z.short : z.name).toUpperCase();
          const off = visibleZones && !visibleZones.includes(z.id);
          return <g key={z.id} className={`pp-zone-label ${off ? "is-faded" : ""}`}>
            {z.order && !compact && <><circle cx={x + fs * 0.62} cy={y + fs * 0.62} r={fs * 0.62} fill={ZONE[z.id].ink} />
              <text x={x + fs * 0.62} y={y + fs * 0.98} fontSize={fs * 0.9} textAnchor="middle" className="pp-zone-num">{z.order}</text></>}
            <text x={x + (z.order && !compact ? fs * 1.6 : 0)} y={y + fs} fontSize={fs} fill={ZONE[z.id].ink} className="pp-zone-text">{label}</text>
          </g>;
        })}
        {/* loading door label */}
        {!compact && (() => { const [x, y] = T(-1.2, FP.LOADING_BAY.y + FP.LOADING_BAY.d / 2); return <text x={x} y={y} fontSize={px(10)} className="pp-minor" textAnchor="middle" transform={`rotate(-90 ${x} ${y})`}>LOADING DOOR</text>; })()}
        {!compact && (() => { const q = FP.DOORS.find((d) => d.kind === "personnel"); if (!q) return null; const [x, y] = T(q.x + q.width / 2, q.y - 0.35); return <text x={x} y={y} fontSize={px(9.5)} className="pp-minor" textAnchor="middle">Door</text>; })()}
        {!compact && equipment.map((e) => { const b = aabb(e); const [x, y] = T(e.x, b.y1 + 0.2); return <text key={e.id} x={x} y={y + px(10)} fontSize={px(10)} className="pp-minor" textAnchor="middle">{e.type === "conveyor" ? "Conveyor" : e.type === "compressor" ? "Compressor" : e.id}</text>; })}

        {/* machine label cards */}
        {placed.map((p) => {
          const s = byId.get(p.id); const st = statusOf(p.id);
          const sel = selectedId === p.id, hi = highlightId === p.id;
          const dim = (visibleStatuses && st && !visibleStatuses.includes(st)) || (visibleZones && !visibleZones.includes(p.zone));
          const b = aabb(p);
          const c1 = T(b.x0, b.y0), c2 = T(b.x1, b.y1);
          const sx0 = Math.min(c1[0], c2[0]), sx1 = Math.max(c1[0], c2[0]), sy0 = Math.min(c1[1], c2[1]), sy1 = Math.max(c1[1], c2[1]);
          const cx = (sx0 + sx1) / 2;
          const longName = s?.name ?? p.id;
          const name = compact ? (s?.short ?? longName) : (longName.length > 16 && s?.short ? s.short : longName);
          const col = st ? STATUS[st] : null;
          const showChip = !!(st && st !== "notSetUp" && s?.liveValue && (!compact || sel || hi || mode === "sensorAdded"));
          const nf = px(compact ? 10.5 : 12), bf = px(compact ? 10 : 11), pad = px(compact ? 4 : 6);
          const word = col ? col.word : "";
          const badgeW = col ? (compact ? bf * 1.8 : tw(word, bf, 0.6) + bf * 2.0) : 0;
          const chipW = showChip ? tw(s!.liveValue!, bf, 0.64) + pad * 1.6 : 0;
          const row2 = compact ? 0 : badgeW + (showChip ? chipW + pad * 0.7 : 0);
          const cw = Math.max(tw(name, nf, 0.6) + (compact && col ? badgeW + pad * 0.8 : 0), row2) + pad * 2;
          const lines = compact ? (showChip ? 2 : 1) : (col ? 2 : 1);
          const ch = pad * 1.4 + nf * 1.05 + (lines > 1 ? bf * 1.9 : 0);
          // card sits on the lower part of the machine (screen space)
          const cy = Math.max(sy0 + 0.1, sy1 - ch - (compact ? 0.15 : 0.3));
          const x = cx - cw / 2;
          return (
            <g key={p.id} className={`pp-card ${st ? `is-${st}` : "is-layout"} ${sel ? "is-selected" : ""} ${hi ? "is-highlight" : ""} ${dim ? "is-dimmed" : ""}`} data-card-for={p.id}>
              <rect className="pp-card-bg" x={x} y={cy} width={cw} height={ch} rx={px(5)} filter="url(#pp-card-shadow)" />
              <text x={compact ? x + pad : cx} y={cy + pad * 0.7 + nf * 0.95} fontSize={nf} textAnchor={compact ? "start" : "middle"} className="pp-card-name">{name}</text>
              {col && compact && (
                <g className="pp-badge-icon">
                  <circle cx={x + cw - pad - bf * 0.8} cy={cy + pad * 0.7 + nf * 0.6} r={bf * 0.8} fill={col.soft} stroke={col.dot} strokeWidth={px(1.2)} strokeDasharray={col.dashed ? `${px(2)} ${px(1.5)}` : undefined} />
                  <StatusIcon st={st!} cx={x + cw - pad - bf * 0.8} cy={cy + pad * 0.7 + nf * 0.6} size={bf * 1.05} color={col.text} />
                </g>
              )}
              {col && !compact && (() => {
                const by = cy + pad * 0.7 + nf * 1.25, bx = cx - row2 / 2;
                return <>
                  <g className="pp-badge">
                    <rect x={bx} y={by} width={badgeW} height={bf * 1.65} rx={bf * 0.82} fill={col.soft} stroke={col.dot} strokeWidth={px(1)} strokeDasharray={col.dashed ? `${px(2.5)} ${px(1.5)}` : undefined} />
                    <StatusIcon st={st!} cx={bx + bf * 0.85} cy={by + bf * 0.825} size={bf} color={col.text} />
                    <text x={bx + bf * 1.45} y={by + bf * 1.18} fontSize={bf} fill={col.text} className="pp-badge-word">{word}</text>
                  </g>
                  {showChip && <g className="pp-chip">
                    <rect x={bx + badgeW + pad * 0.7} y={by} width={chipW} height={bf * 1.65} rx={px(4)} />
                    <text x={bx + badgeW + pad * 0.7 + chipW / 2} y={by + bf * 1.18} fontSize={bf} textAnchor="middle" className="pp-chip-text">{s!.liveValue}</text>
                  </g>}
                </>;
              })()}
              {compact && showChip && (
                <text x={x + pad} y={cy + pad * 0.7 + nf * 1.05 + bf * 1.45} fontSize={bf} className="pp-chip-text">{s!.liveValue}</text>
              )}
            </g>
          );
        })}

        {/* scale bar + north arrow + example tag */}
        {(() => {
          const total = rot ? VH : VW;
          const sb = 5, seg = 1, fs = px(compact ? 9.5 : 10);
          const x0 = rot ? 0.9 : M.l, y0 = rot ? 0.75 : M.t + D + 1.0;
          const nX = total - (rot ? 1.6 : 1.8), nY = y0 + 0.4;
          const nr = rot ? 0.7 : 0.6;
          // north = -y in plan; in portrait the plan is rotated 90° clockwise so north points right
          const ang = rot ? 90 : 0;
          return <g className="pp-legend-bits">
            {Array.from({ length: sb / seg }, (_, i) => <rect key={i} x={x0 + i * seg} y={y0} width={seg} height={0.22} className={i % 2 ? "pp-scale-b" : "pp-scale-a"} />)}
            <rect x={x0} y={y0} width={sb} height={0.22} className="pp-scale-frame" />
            {[0, 1, 2, 5].map((v) => <text key={v} x={x0 + v} y={y0 + 0.22 + fs * 1.15} fontSize={fs} textAnchor="middle" className="pp-minor">{v === 5 ? "5 m" : v}</text>)}
            <g transform={`translate(${nX} ${nY}) rotate(${ang})`} className="pp-north">
              <circle r={nr} className="pp-north-ring" />
              <path d={`M0 ${-nr * 0.8} L${nr * 0.42} ${nr * 0.5} L0 ${nr * 0.22} L${-nr * 0.42} ${nr * 0.5}z`} />
            </g>
            <text x={nX - nr - fs * 0.6} y={nY + fs * 0.35} fontSize={fs} textAnchor="end" className="pp-minor">N</text>
            <g className="pp-example">
              <rect x={x0 + sb + 1.2} y={y0 - fs * 0.6} width={tw("Example data", fs, 0.6) + fs * 1.2} height={fs * 1.7} rx={fs * 0.85} />
              <text x={x0 + sb + 1.2 + fs * 0.6} y={y0 + fs * 0.62} fontSize={fs}>Example data</text>
            </g>
          </g>;
        })()}
      </g>
    </svg>
  );
}

export default FloorPlan2D;
