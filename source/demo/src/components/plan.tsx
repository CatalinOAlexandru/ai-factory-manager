/**
 * Interactive floor-plan dashboard (Build's wrapper). One component for the 2D plan and the 3D view:
 * pan and zoom, tooltip, legend + filter, machine detail, 2D/3D toggle. The 2D visual is Factory Design's
 * FloorPlan2D (visual only). Both views read the layout from shared/floorplan.ts and colours from
 * shared/viz-tokens.ts. Framing (centre + zoom) is shared, so the toggle keeps it. All data is example data.
 */
import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, Component, type ReactNode } from "react";
import { ZONES, type ZoneId } from "../../../shared/floorplan";
import { DASH_STATUSES, type DashStatus } from "../viz";
import { FloorPlan2D, PLAN_FRAME, type PlanMachineState } from "./floor/visual";
import { clampZoom, getFraming, onFramingCommand, pushFraming, setFraming, DEFAULT_FRAMING, type PlanMachine, type PlanMode } from "./floor/model";
import { Btn } from "./Btn";
import { LegendFilter, MachineDetail, MachineTip } from "./floor/parts";

export type { PlanMachine, PlanMode } from "./floor/model";
export { planMachines } from "./floor/model";

const Scene3D = lazy(() => import("./Scene3D"));

/* ---- FD plan geometry (margins, portrait when compact, plan<->svg mapping) from FloorPlan2D ---- */
const { content, toSvg, fromSvg } = PLAN_FRAME;

const toState = (m: PlanMachine): PlanMachineState => ({
  id: m.id, name: m.label, short: m.short,
  status: m.status === "fault" ? "alarm" : m.status === "idle" ? "idle" : "running",
  liveValue: m.status && m.status !== "notSetUp" ? m.primary.value : undefined,
  hasSensor: m.status !== "notSetUp",
});

const canHover = () => typeof window !== "undefined" && window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;

function webglOk() {
  try { const c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"))); } catch { return false; }
}
class Boundary extends Component<{ fallback: ReactNode; children: ReactNode }, { err: boolean }> {
  state = { err: false };
  static getDerivedStateFromError() { return { err: true }; }
  render() { return this.state.err ? this.props.fallback : this.props.children; }
}

interface Shared {
  machines: PlanMachine[]; mode: PlanMode; compact: boolean;
  selectedId: string | null; onSelect: (id: string) => void;
  hoverId: string | null; setHover: (id: string | null) => void;
  statuses: DashStatus[]; zones: ZoneId[] | undefined; tipId: string | null;
}

/* ------------------------------ 2D: pan + zoom around FD's visual ------------------------------ */
const CTRL = 46;
function Plan2DView(p: Shared) {
  const rot = p.compact;
  const [cw, ch] = content(rot);
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  // Zoom 1 = fit: the whole site shows in the box (contain). Zoom 1 to 4 is relative to that fit.
  // The bottom band (CTRL px) stays clear for the hint and the zoom buttons, so the whole site shows above them.
  const fit = size.w && size.h ? Math.min(1, ((size.h - CTRL) * cw) / (size.w * ch)) : 1;
  const fitR = useRef(fit); fitR.current = fit;
  const sizeR = useRef(size); sizeR.current = size;
  const fromFraming = () => { const f = getFraming(); const [sx, sy] = toSvg(f.cx, f.cy, rot); return clampV({ zoom: f.zoom, sx, sy }); };
  const clampV = (v: { zoom: number; sx: number; sy: number }) => {
    const zoom = clampZoom(v.zoom), { w, h } = sizeR.current, k = fitR.current * zoom;
    // half of the visible area in svg units; when it is larger than the plan, centre the plan
    const hw = w ? (w / 2) * (cw / (w * k)) : cw / (2 * zoom), hh = w ? ((h - CTRL) / 2) * (cw / (w * k)) : ch / (2 * zoom);
    const ax = (half: number, len: number, c: number) => (half >= len / 2 ? len / 2 : Math.min(len - half, Math.max(half, c)));
    return { zoom, sx: ax(hw, cw, v.sx), sy: ax(hh, ch, v.sy) };
  };
  const [v, setV] = useState(fromFraming);
  const vr = useRef(v); vr.current = v;
  const apply = (nv: { zoom: number; sx: number; sy: number }) => {
    const c = clampV(nv); setV(c);
    const [cx, cy] = fromSvg(c.sx, c.sy, rot); setFraming({ cx, cy, zoom: c.zoom });
  };
  useEffect(() => onFramingCommand(() => setV(fromFraming())), [rot]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    const el = box.current!; const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el); return () => ro.disconnect();
  }, []);
  // Recompute the fit when the box changes size (resize, header height): keep the zoom and re-clamp.
  useEffect(() => { if (size.w) setV(fromFraming()); }, [size.w, size.h]); // eslint-disable-line react-hooks/exhaustive-deps
  const pps = size.w ? (size.w * fit * v.zoom) / cw : 0;

  // No wheel or pinch capture: the wheel and one-finger swipes always scroll the page.
  // Zoom only with the +, − and Reset buttons. Drag pans: mouse always, touch only when zoomed in.
  const zoomed = v.zoom > 1.001, atMax = v.zoom >= 3.999;
  const zoomBy = (f: number) => apply({ zoom: clampZoom(vr.current.zoom * f), sx: vr.current.sx, sy: vr.current.sy });
  const reset = () => pushFraming({ cx: DEFAULT_FRAMING.cx, cy: DEFAULT_FRAMING.cy, zoom: DEFAULT_FRAMING.zoom });
  const [grabbing, setGrabbing] = useState(false);
  const drag = useRef<null | { x: number; y: number; v: typeof v; moved: boolean; id: number }>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest?.("[data-plan-controls]")) return;
    if (e.pointerType === "mouse" ? e.button !== 0 : !zoomed) return;
    drag.current = { x: e.clientX, y: e.clientY, v, moved: false, id: e.pointerId };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current; if (!d || d.id !== e.pointerId || !pps) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (!d.moved) {
      if (Math.hypot(dx, dy) < 5) return;
      d.moved = true; setGrabbing(true);
      try { box.current?.setPointerCapture(e.pointerId); } catch { /* not capturable */ }
    }
    apply({ zoom: d.v.zoom, sx: d.v.sx - dx / pps, sy: d.v.sy - dy / pps });
  };
  const endDrag = (e: React.PointerEvent) => {
    const d = drag.current; if (!d || d.id !== e.pointerId) return;
    setGrabbing(false);
    try { box.current?.releasePointerCapture(e.pointerId); } catch { /* already released */ }
    if (d.moved) setTimeout(() => { if (drag.current === d) drag.current = null; }, 0); else drag.current = null;
  };

  // tooltip anchor = top centre of the machine's shape, in box px
  const [tip, setTip] = useState<null | { x: number; y: number; below: boolean }>(null);
  useLayoutEffect(() => {
    if (!p.tipId || !box.current) { setTip(null); return; }
    const el = box.current.querySelector(`[data-machine-id="${p.tipId}"] .pp-sil`) as SVGGraphicsElement | null;
    if (!el) { setTip(null); return; }
    const r = el.getBoundingClientRect(), b = box.current.getBoundingClientRect();
    const x = Math.min(b.width - 8, Math.max(8, r.left + r.width / 2 - b.left)), top = r.top - b.top, bottom = r.bottom - b.top;
    const below = top < 110;
    setTip({ x, y: below ? Math.min(bottom + 6, b.height - 4) : Math.max(top - 6, 4), below });
  }, [p.tipId, v, size.w, p.selectedId]);
  const tipM = p.machines.find((m) => m.id === p.tipId);

  const left = size.w / 2 - v.sx * pps, top = (size.h - CTRL) / 2 - v.sy * pps;
  const states = useMemo(() => p.machines.map(toState), [p.machines]);
  return (
    <div ref={box} className="pp-viewport relative h-full w-full overflow-hidden bg-[#e4e4e1]" data-zoom={v.zoom.toFixed(3)}
      style={{ touchAction: zoomed ? "none" : "pan-y", cursor: grabbing ? "grabbing" : zoomed ? "grab" : undefined }}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag}
      onClickCapture={(e) => { if (drag.current?.moved) { e.stopPropagation(); e.preventDefault(); drag.current = null; } }}>
      {pps > 0 && (
        <div className="absolute" style={{ left, top, width: cw * pps, height: ch * pps }}>
          <FloorPlan2D machines={states} mode={p.mode} compact={p.compact} selectedId={p.selectedId} onSelect={p.onSelect}
            onHover={(id) => { if (canHover()) p.setHover(id); }}
            visibleStatuses={p.mode === "layout" ? undefined : p.statuses} visibleZones={p.zones} highlightId={p.hoverId} showFlow />
        </div>
      )}
      {tip && tipM && (
        <div className="pointer-events-none absolute z-40" style={{ left: tip.x, top: tip.y, transform: `translate(-50%, ${tip.below ? "0" : "-100%"})` }}>
          <MachineTip m={tipM} />
        </div>
      )}
      <div className="pointer-events-none absolute bottom-2 left-2 z-10 max-w-[calc(100%-150px)] rounded-full bg-bg/90 px-2 py-0.5 text-[11px] leading-tight text-muted">Drag to move · use + / − to zoom</div>
      <div data-plan-controls role="group" aria-label="Zoom" className="absolute bottom-2 right-2 z-10 flex gap-1 rounded-[10px] border border-border-strong bg-bg/95 p-1 shadow-sm">
        <Btn size="icon" className="!h-8 !w-8 !p-0 text-lg leading-none" aria-label="Zoom out" title="Zoom out" disabled={!zoomed} onClick={() => zoomBy(1 / 1.35)}>−</Btn>
        <Btn size="icon" className="!h-8 !w-8 !p-0 text-lg leading-none" aria-label="Zoom in" title="Zoom in" disabled={atMax} onClick={() => zoomBy(1.35)}>+</Btn>
        <Btn size="icon" className="!h-8 !px-2 !py-0 text-xs" aria-label="Reset view to fit" title="Reset view to fit" disabled={!zoomed} onClick={reset}>Reset</Btn>
      </div>
    </div>
  );
}

/* ------------------------------ fit to height ------------------------------ */
/** Height for the plan frame: from under the sticky page header (or the top of the scroll area) to the bottom of the scroll area. */
function useFitHeight(dash: React.RefObject<HTMLDivElement | null>, frame: React.RefObject<HTMLDivElement | null>) {
  const [h, setH] = useState<number | null>(null);
  useLayoutEffect(() => {
    const d = dash.current, f = frame.current; if (!d || !f) return;
    let sc: HTMLElement | null = d.parentElement;
    while (sc && !/(auto|scroll)/.test(getComputedStyle(sc).overflowY)) sc = sc.parentElement;
    if (!sc) return;
    const s = sc;
    const head = s.querySelector<HTMLElement>("[data-sticky-head]");
    const calc = () => {
      const cs = getComputedStyle(s), r = s.getBoundingClientRect();
      const bottom = r.top + s.clientTop + s.clientHeight - parseFloat(cs.paddingBottom);
      const top = (head ? r.top + s.clientTop + head.offsetHeight + 8 : r.top + s.clientTop + parseFloat(cs.paddingTop))
        + (f.getBoundingClientRect().top - d.getBoundingClientRect().top);
      const nh = Math.max(240, Math.round(bottom - top));
      setH((o) => (o === nh ? o : nh));
    };
    calc();
    const ro = new ResizeObserver(calc); ro.observe(s); if (head) ro.observe(head);
    window.addEventListener("resize", calc);
    return () => { ro.disconnect(); window.removeEventListener("resize", calc); };
  }, [dash, frame]);
  return h;
}

/* ------------------------------ filter state (can live in the sticky page header) ------------------------------ */
export interface DashFilter { statuses: DashStatus[]; setStatuses: (s: DashStatus[]) => void; zone: ZoneId | "all"; setZone: (z: ZoneId | "all") => void }
export function useDashFilter(): DashFilter {
  const [statuses, setStatuses] = useState<DashStatus[]>(DASH_STATUSES);
  const [zone, setZone] = useState<ZoneId | "all">("all");
  return { statuses, setStatuses, zone, setZone };
}
/** The legend + filter row on its own, for the sticky page header. */
export function DashFilterRow({ mode, machines, filter, compact = false }: { mode: PlanMode; machines: PlanMachine[]; filter: DashFilter; compact?: boolean }) {
  return <LegendFilter mode={mode} machines={machines} statuses={filter.statuses} setStatuses={filter.setStatuses} zone={filter.zone} setZone={filter.setZone} compact={compact} />;
}

/* ------------------------------ the dashboard ------------------------------ */
export function FloorDashboard({ machines, mode, view, onViewChange, selectedId, onSelect, compact = false, detail = "auto", onAddDevice, onOpenMachine, className = "", frameClass, filter }: {
  machines: PlanMachine[]; mode: PlanMode; view: "2d" | "3d"; onViewChange?: (v: "2d" | "3d") => void;
  selectedId: string | null; onSelect: (id: string | null) => void; compact?: boolean;
  /** "auto": side card on wide, below the plan on compact. "none": the step shows its own detail. */
  detail?: "auto" | "none"; onAddDevice?: () => void; onOpenMachine?: (id: string) => void; className?: string; frameClass?: string;
  /** Filter state owned by the page (its sticky header shows the filter row). Without it, the row shows above the plan. */
  filter?: DashFilter;
}) {
  const own = useDashFilter();
  const { statuses, setStatuses, zone, setZone } = filter ?? own;
  const [hoverId, setHover] = useState<string | null>(null);
  const zones = zone === "all" ? undefined : [zone];
  const touch = !canHover();
  const tipId = hoverId ?? (touch && (detail === "none" || compact) ? selectedId : null);
  const sel = machines.find((m) => m.id === selectedId) ?? null;
  const shared: Shared = { machines, mode, compact, selectedId, onSelect: (id) => onSelect(id), hoverId, setHover, statuses, zones, tipId };
  const [cw, ch] = content(compact);
  const gl = useMemo(() => typeof window !== "undefined" && webglOk(), []);
  const show3d = view === "3d" && gl;

  const zoomBy = (f: number) => pushFraming({ zoom: clampZoom(getFraming().zoom * f) });
  const dashRef = useRef<HTMLDivElement>(null), frameRef = useRef<HTMLDivElement>(null);
  const fitH = useFitHeight(dashRef, frameRef);
  useEffect(() => { pushFraming({ ...DEFAULT_FRAMING }); }, []); // each plan opens at the fit
  const detailCard = sel && detail === "auto" && (
    <MachineDetail m={sel} onClose={() => onSelect(null)} onAddDevice={onAddDevice}
      onOpen={onOpenMachine && sel.id === "cnc3" ? () => onOpenMachine(sel.id) : undefined} />
  );
  return (
    <div ref={dashRef} className={`pp-dash ${className}`} data-view={view} data-mode={mode}>
      {(!filter || onViewChange) && <div className="mb-2 flex items-center gap-2">
        {!filter && <div className="min-w-0 flex-1"><LegendFilter mode={mode} machines={machines} statuses={statuses} setStatuses={setStatuses} zone={zone} setZone={setZone} compact={compact} /></div>}
        {onViewChange && (
          <div className="flex shrink-0 rounded-full border border-border-strong bg-bg p-0.5 text-xs font-semibold" role="tablist" aria-label="Plan view">
            {(["2d", "3d"] as const).map((k) => (
              <button key={k} type="button" role="tab" aria-selected={view === k} onClick={() => onViewChange(k)}
                className={`h-7 rounded-full px-3 ${view === k ? "bg-accent text-white" : "text-text"}`}>{k === "2d" ? "2D plan" : "3D view"}</button>
            ))}
          </div>
        )}
      </div>}
      <div ref={frameRef} data-plan-frame className={`relative overflow-hidden rounded-[12px] border bg-[#e4e4e1] ${show3d ? "border-border" : "border-2 border-border-strong"} ${frameClass ?? ""}`}
        style={frameClass ? undefined : fitH ? { height: fitH } : { aspectRatio: `${cw} / ${ch}` }}>
        {show3d ? (
          <Boundary fallback={<Plan2DView {...shared} />}>
            <Suspense fallback={<div className="grid h-full place-items-center text-sm text-muted">Loading 3D view…</div>}>
              <Scene3D {...shared} />
            </Suspense>
          </Boundary>
        ) : <Plan2DView {...shared} />}
        {view === "3d" && !gl && <div className="absolute inset-x-2 top-2 rounded bg-bg/90 px-2 py-1 text-center text-xs text-muted">3D is not available on this device. The 2D plan is shown.</div>}
        {show3d && <div className="absolute bottom-2 right-2 z-10 flex flex-col gap-1">
          {([["+", "Zoom in", () => zoomBy(1.35)], ["−", "Zoom out", () => zoomBy(1 / 1.35)], ["⟲", "Reset view", () => pushFraming({ ...DEFAULT_FRAMING })]] as const).map(([t, l, f]) => (
            <button key={l} type="button" onClick={f} aria-label={l} title={l} className="btn-secondary grid !h-8 !w-8 !min-h-0 place-items-center !rounded-full !p-0 text-base leading-none">{t}</button>
          ))}
        </div>}
        {show3d && <div className="pointer-events-none absolute bottom-2 left-2 z-10 max-w-[70%] rounded-full bg-bg/85 px-2 py-0.5 text-[11px] text-muted">
          {touch ? "Drag to turn · two fingers to pan · use + / − to zoom" : "Drag to turn · right-drag to pan · use + / − to zoom"}
        </div>}
        {detailCard && !compact && <div className="absolute right-2 top-2 z-40 w-[272px]">{detailCard}</div>}
      </div>
      {detailCard && compact && <div className="mt-2">{detailCard}</div>}
    </div>
  );
}

export const zoneName = (id: ZoneId) => ZONES.find((z) => z.id === id)?.name ?? id;
