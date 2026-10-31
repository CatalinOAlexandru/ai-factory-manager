/** Shared parts of the plan dashboards: tooltip, status chip, legend + filter, machine detail. Used by 2D and 3D. */
import type { ReactNode } from "react";
import { ZONES, type ZoneId } from "../../../../shared/floorplan";
import { DASH_STATUSES, DASH_WORD, LABEL, PLAN, STATUS, type DashStatus } from "../../viz";
import { Btn } from "../Btn";
import type { PlanMachine, PlanMode } from "./model";

const TYPE_NAME: Record<string, string> = { "cnc-mill": "CNC mill", "cnc-lathe": "CNC lathe", welder: "MIG welder", press: "Press", bandsaw: "Band saw", washer: "Parts washer", cmm: "Measuring machine", "robot-cell": "Robot cell", conveyor: "Conveyor", compressor: "Compressor" };
export const typeName = (t: string) => TYPE_NAME[t] ?? t;

export function StatusChip({ status, small }: { status: DashStatus; small?: boolean }) {
  const s = STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full font-semibold ${small ? "px-1.5 text-[10.5px]" : "px-2 py-0.5 text-xs"}`}
      style={{ background: s.soft, color: s.text, border: `1px ${s.dashed ? "dashed" : "solid"} ${s.dot}` }}>
      <span aria-hidden style={{ fontSize: "0.8em" }}>{s.icon}</span>{status === "notSetUp" ? "No camera yet" : DASH_WORD[status]}
    </span>
  );
}

/** The one tooltip (hover on desktop, tap on touch). Same in 2D and 3D. */
export function MachineTip({ m }: { m: PlanMachine }) {
  return (
    <div className="pointer-events-none w-max max-w-[210px] rounded-[10px] border bg-bg px-2.5 py-2 text-left text-xs shadow-raised" style={{ borderColor: LABEL.chip.border, fontFamily: LABEL.fontSans }} role="tooltip">
      <div className="flex items-center gap-2"><b className="text-[13px] font-semibold text-text">{m.label}</b>{m.status && <StatusChip status={m.status} small />}</div>
      <div className="text-muted">{m.area} · {typeName(m.type)}</div>
      {m.status && m.status !== "notSetUp" ? (
        <div className="mt-1 grid grid-cols-[auto_auto] gap-x-3 tnum">
          <span className="text-muted">{m.primary.label}</span><b className="font-semibold text-text">{m.primary.value}</b>
          <span className="text-muted">{m.secondary.label}</span><b className="font-semibold text-text">{m.secondary.value}</b>
        </div>
      ) : m.status === "notSetUp" ? (
        <div className="mt-1 text-muted">No camera yet. Click or tap to add a device.</div>
      ) : (
        <div className="mt-1 text-muted">Reads: {m.reads[0]}{m.reads.length > 1 ? ` +${m.reads.length - 1}` : ""}</div>
      )}
    </div>
  );
}

export const ALL_STATUSES = DASH_STATUSES;

/** Legend that is also the status filter, plus the area filter. */
export function LegendFilter({ mode, machines, statuses, setStatuses, zone, setZone, compact }: {
  mode: PlanMode; machines: PlanMachine[]; statuses: DashStatus[]; setStatuses: (s: DashStatus[]) => void;
  zone: ZoneId | "all"; setZone: (z: ZoneId | "all") => void; compact?: boolean;
}) {
  const present = ALL_STATUSES.filter((s) => machines.some((m) => m.status === s));
  const toggle = (s: DashStatus) => setStatuses(statuses.includes(s) ? statuses.filter((x) => x !== s) : [...statuses, s]);
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      {mode !== "layout" && present.map((s) => {
        const on = statuses.includes(s), n = machines.filter((m) => m.status === s).length;
        return (
          <button key={s} type="button" aria-pressed={on} onClick={() => toggle(s)} title={on ? `Hide ${DASH_WORD[s].toLowerCase()} machines` : `Show ${DASH_WORD[s].toLowerCase()} machines`}
            className={`inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 font-semibold ${on ? "bg-bg text-text" : "bg-surface-2 text-muted line-through"}`}
            style={{ borderColor: on ? STATUS[s].dot : "var(--color-border)" }}>
            <span className="grid h-3.5 w-3.5 place-items-center rounded-full text-[8px] leading-none" style={{ background: STATUS[s].soft, color: STATUS[s].text, border: `1.5px ${STATUS[s].dashed ? "dashed" : "solid"} ${STATUS[s].dot}` }} aria-hidden>{s === "notSetUp" ? "" : STATUS[s].icon}</span>
            {DASH_WORD[s]} <span className="tnum font-normal text-muted">{n}</span>
          </button>
        );
      })}
      <label className="inline-flex h-7 items-center gap-1 rounded-full border border-border-strong bg-bg pl-2.5 pr-1 font-semibold">
        <span className="sr-only">Area</span>
        <select value={zone} onChange={(e) => setZone(e.target.value as ZoneId | "all")} className="h-6 max-w-[150px] bg-transparent pr-1 font-semibold outline-none">
          <option value="all">All areas</option>
          {ZONES.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
        </select>
      </label>
      {!compact && <span className="flex-1" />}
      <span className="inline-flex items-center gap-1 text-muted"><span className="h-2 w-2 rounded-full" style={{ background: PLAN.camera }} />Camera</span>
      <span className="inline-flex items-center gap-1 text-muted"><span className="h-2 w-4 rounded-sm border-y-2" style={{ background: PLAN.walkwayFill, borderColor: PLAN.walkway }} />Walkway</span>
      <span className="inline-flex items-center gap-1 text-muted"><span className="h-2 w-4 rounded-sm" style={{ background: `repeating-linear-gradient(90deg, ${PLAN.door} 0 3px, transparent 3px 5px)` }} />Loading door</span>
      <span className="inline-flex items-center gap-1 text-muted"><span style={{ color: PLAN.accent }}>➜</span>Process flow</span>
    </div>
  );
}

/** The one machine detail panel. Same in 2D and 3D. */
export function MachineDetail({ m, onClose, onAddDevice, onOpen, footer }: {
  m: PlanMachine; onClose?: () => void; onAddDevice?: () => void; onOpen?: () => void; footer?: ReactNode;
}) {
  return (
    <div className="pp-fade rounded-[12px] border border-border bg-bg p-3.5 shadow-raised" role="dialog" aria-label={`${m.name} details`}>
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold leading-tight">{m.name}</div>
          <div className="text-xs text-muted">{m.area} · {typeName(m.type)}</div>
        </div>
        {m.status && <StatusChip status={m.status} />}
        {onClose && <button type="button" onClick={onClose} aria-label="Close details" className="-mr-1 -mt-1 grid h-7 w-7 place-items-center rounded-full text-muted hover:bg-surface-2">✕</button>}
      </div>
      {m.status === "notSetUp" ? (
        <>
          <div className="mt-3 rounded-[10px] border border-dashed border-inactive-dot bg-inactive-soft p-3 text-sm">
            <b className="font-semibold">No camera yet</b>
            <p className="mt-0.5 text-xs text-muted">Add a camera to read its screen: {m.reads.join(", ").toLowerCase()}.</p>
          </div>
          <Btn variant="primary" size="block" className="mt-3" onClick={onAddDevice}>+ Add device</Btn>
        </>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[m.primary, m.secondary].map((r) => (
              <div key={r.label} className="rounded-[10px] bg-surface-2 px-2.5 py-2">
                <div className="text-[11px] text-muted">{r.label}</div>
                <div className="reading text-lg font-semibold leading-tight">{r.value}</div>
              </div>
            ))}
          </div>
          <div className="mt-2.5"><div className="h-1 overflow-hidden rounded bg-surface-3"><b className="block h-full bg-accent" style={{ width: `${m.utilisation}%` }} /></div><div className="mt-1 text-[11px] text-muted">Utilisation today {m.utilisation}% · example data</div></div>
          <Btn variant="primary" size="block" className="mt-3" disabled={!onOpen} onClick={onOpen}>Open machine</Btn>
          {!onOpen && <p className="mt-1 text-center text-[11px] text-muted">In this demo only CNC mill 3 has a machine page.</p>}
        </>
      )}
      {footer}
    </div>
  );
}
