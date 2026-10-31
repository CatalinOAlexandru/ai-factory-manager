import { useMemo, useState } from "react";
import { MACHINES, cncReading } from "../data";
import { useDemo, useTick } from "../demo";
import { DashFilterRow, FloorDashboard, planMachines, useDashFilter } from "../components/plan";
import { DesktopApp, ExPill, MobileApp, Pill, Seg, StickyHead } from "../components/appchrome";

type Tone = "warn" | "bad" | "accent";
const CARDS: { tone: Tone; tag: string; machine: string; title: string; body: string; cause: string; action: string; done: string }[] = [
  { tone: "warn", tag: "Check tool wear", machine: "CNC mill 3", title: "CNC mill 3 load is up 18%", body: "vs its usual on program O1042 since Tuesday.", cause: "A worn tool (T4)", action: "Create task", done: "Task created for the next tool change" },
  { tone: "bad", tag: "Unlogged downtime", machine: "CNC mill 2", title: "Coolant low on CNC 2, 4 times", body: "Shown on its screen this week but never logged as downtime (~2.5 h).", cause: "Coolant top-up not on the shift checklist", action: "Log as downtime", done: "Logged: 2 h 30 min downtime" },
  { tone: "accent", tag: "Scheduling", machine: "Welder 2", title: "Welder 2 idle 40 min per shift", body: "Three days running, at shift handover.", cause: "Handover overlaps with the welder’s break", action: "Plan handover", done: "Added to the shift notes" },
];
const BAR: Record<Tone, string> = { warn: "border-l-warning-dot", bad: "border-l-fault-dot", accent: "border-l-accent" };
const DOT: Record<Tone, string> = { warn: "bg-warning-dot", bad: "bg-fault-dot", accent: "bg-accent" };
const SEG = [{ label: "Machine tiles" }, { label: "2D plan", tier: "Pro" }, { label: "3D view", tier: "Business" }];
const SEG_M = [{ label: "Tiles" }, { label: "2D plan" }, { label: "3D view" }];
const KIND = { running: "running", idle: "idle", alarm: "alarm" } as const;

function useValues(t: number) {
  const r = cncReading(t);
  const v: Record<string, string> = { cnc3: `${r.rpm.toLocaleString("en-GB")} rpm` };
  return { v, parts: r.parts };
}

function Cards() {
  const [state, setState] = useState<Record<number, "done" | "gone">>({});
  const live = CARDS.map((c, i) => ({ c, i })).filter(({ i }) => state[i] !== "gone");
  return (
    <div className="grid gap-2.5">
      {live.map(({ c, i }) => (
        <div key={c.tag} className={`pp-fadein rounded-[10px] border border-l-4 border-border-strong bg-bg px-3.5 py-3 ${BAR[c.tone]}`}>
          <div className="flex items-center gap-1.5 text-xs text-muted"><span className={`h-[7px] w-[7px] rounded-full ${DOT[c.tone]}`} />{c.tag} · {c.machine}</div>
          <div className="mb-0.5 mt-1 text-[15px] font-semibold">{c.title}</div>
          <div className="text-sm text-muted">{c.body}</div>
          <div className="mt-1.5 text-xs"><b className="font-semibold">Likely cause:</b> {c.cause}</div>
          <div className="mt-2.5 flex items-center gap-3 text-sm">
            {state[i] === "done" ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-running"><span aria-hidden>✓</span>{c.done}</span>
            ) : (
              <>
                <button onClick={() => setState((s) => ({ ...s, [i]: "done" }))} className="btn-primary btn-sm rounded-full text-sm">{c.action}</button>
                <button onClick={() => setState((s) => ({ ...s, [i]: "gone" }))} className="btn-secondary btn-sm rounded-full text-sm">Dismiss</button>
              </>
            )}
          </div>
        </div>
      ))}
      {live.length === 0 && <div className="rounded-[10px] bg-surface-2 p-3 text-sm text-muted">No open suggestions. New ones come from next week’s readings.</div>}
    </div>
  );
}

function Stats({ compact }: { compact?: boolean }) {
  const s = [["Running", "9", "bg-running-dot"], ["Idle", "2", "bg-idle-dot"], ["Alarm", "1", "bg-fault-dot"], ["Average utilisation", "71%", ""]];
  if (compact) return (
    <div className="mb-2 flex flex-wrap items-center gap-1.5 text-xs" aria-label="Machine status summary">
      {s.map(([l, n, d]) => (
        <span key={l} className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 px-2 py-0.5">
          {d && <span className={`h-1.5 w-1.5 rounded-full ${d}`} />}<span className="text-muted">{l === "Average utilisation" ? "Use" : l}</span><b className="reading font-semibold">{n}</b>
        </span>
      ))}
    </div>
  );
  return (
    <div className="mb-3 grid grid-cols-4 gap-3">
      {s.map(([l, n, d]) => (
        <div key={l} className="rounded-[10px] border border-border bg-bg px-3.5 py-2">
          <div className="flex items-center gap-1.5 text-xs text-muted">{d && <span className={`h-2 w-2 rounded-full ${d}`} />}{l}</div>
          <div className="reading text-2xl font-semibold">{n}</div>
        </div>
      ))}
    </div>
  );
}

function Tiles({ values, parts, cols, stack = false }: { values: Record<string, string>; parts: number; cols: string; stack?: boolean }) {
  return (
    <div className={`grid gap-2.5 ${cols}`}>
      {MACHINES.map((m) => (
        <div key={m.id} className={`flex min-h-[112px] flex-col gap-1 rounded-[10px] border border-l-4 border-border bg-bg px-3 py-2.5 ${m.status === "alarm" ? "border-l-fault-dot" : m.status === "idle" ? "border-l-idle-dot" : "border-l-running-dot"}`}>
          <div className={stack ? "flex flex-col items-start gap-1" : "flex flex-wrap items-start gap-1"}><span className="min-w-0 grow break-words text-sm font-semibold leading-snug">{m.id === "cmm" ? "CMM" : m.name}</span><Pill kind={KIND[m.status]} /></div>
          <div className="text-xs text-muted">{m.area}</div>
          <div className="reading text-lg font-semibold leading-tight">{values[m.id] ?? m.primary.value}<small className="block text-xs font-medium text-muted">{m.primary.label} · {m.secondary.label} {m.id === "cnc3" ? parts : m.secondary.value}</small></div>
          <div className="mt-auto"><div className="h-1 overflow-hidden rounded bg-surface-3"><b className="block h-full bg-accent" style={{ width: `${m.utilisation}%` }} /></div><div className="mt-1 text-[11px] text-muted">Utilisation today {m.utilisation}%</div></div>
        </div>
      ))}
    </div>
  );
}

function LiveList({ values }: { values: Record<string, string> }) {
  return (
    <>
      <div><div className="text-xs text-muted">Live now</div><h2 className="text-lg font-semibold">All 12 machines</h2></div>
      <div className="divide-y divide-border rounded-[10px] border border-border">
        {MACHINES.map((m) => (
          <div key={m.id} className="flex items-center gap-2 px-3 py-2 text-sm">
            <span className="min-w-0 flex-1 break-words">{m.id === "cmm" ? "CMM" : m.name}</span>
            <span className="reading font-semibold">{values[m.id] ?? m.primary.value}</span>
            <Pill kind={KIND[m.status]} />
          </div>
        ))}
      </div>
      <p className="text-xs text-muted">The AI reads all 12 machine screens and writes suggestions once a week. Press Next.</p>
    </>
  );
}

function AiPanel() {
  return (
    <>
      <div className="flex items-start"><div className="flex-1"><div className="text-xs text-muted">Insights · this week</div><h2 className="text-lg font-semibold">AI suggestions</h2></div><ExPill /></div>
      <p className="-mt-1 text-xs text-muted">From the readings on all 12 machine screens. Each card has one action.</p>
      <Cards />
      <div className="mt-auto flex items-center rounded-full border border-border-strong py-2 pl-4 pr-2 text-sm text-muted">
        <span className="flex-1">Ask about your site…</span>
        <span className="grid h-7 w-7 place-items-center rounded-full bg-accent-soft text-accent-strong" aria-hidden>↑</span>
      </div>
    </>
  );
}

/** Desktop: web app, as design/screens/final-factory-desktop.png. */
export function Desktop() {
  const { stage, go } = useDemo();
  const t = useTick(1000);
  const { v, parts } = useValues(t);
  const [view, setView] = useState(1);
  const [sel, setSel] = useState<string | null>(null);
  const plan = useMemo(() => planMachines("final", t), [t]);
  const filter = useDashFilter();
  return (
    <DesktopApp active="Site" insightsCount={3} panel={stage === 0 ? <LiveList values={v} /> : <AiPanel />}>
      <StickyHead>
      <div className="mb-3 flex flex-wrap items-end gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-sm text-muted">Example Factory Ltd · Unit 1</div>
          <h1 className="text-2xl font-semibold tracking-tight">Site view</h1>
          <div className="mt-1 text-sm text-muted">12 of 12 machines live · 12 cameras · last read 2 s ago</div>
        </div>
        <Seg items={SEG} value={view} onChange={setView} />
      </div>
      <Stats />
      {view > 0 && <DashFilterRow mode="final" machines={plan} filter={filter} />}
      </StickyHead>
      {view === 0 && <Tiles values={v} parts={parts} cols="grid-cols-3 2xl:grid-cols-4" />}
      {view > 0 && (
        <FloorDashboard className="pp-fade" machines={plan} mode="final" view={view === 1 ? "2d" : "3d"} selectedId={sel} onSelect={setSel}
          onOpenMachine={() => go(6)} filter={filter} />
      )}
    </DesktopApp>
  );
}

/** Mobile: as design/screens/final-factory-mobile.png. */
export default function Step7() {
  const { stage, go } = useDemo();
  const t = useTick(1000);
  const { v, parts } = useValues(t);
  const [view, setView] = useState(0);
  const [sel, setSel] = useState<string | null>(null);
  const plan = useMemo(() => planMachines("final", t), [t]);
  const filter = useDashFilter();
  return (
    <MobileApp active="Site">
      <StickyHead compact>
        <div className="flex items-baseline gap-2"><h1 className="text-lg font-semibold tracking-tight">Site view</h1><span className="min-w-0 truncate text-xs text-muted">Example Factory Ltd · Unit 1</span></div>
        <div className="mb-1.5 truncate text-xs text-muted">12 of 12 machines live · 12 cameras · last read 2 s ago</div>
        <Stats compact />
        <div className="flex items-center gap-2"><b className="flex-1 text-sm font-semibold">Machines</b><Seg items={SEG_M} value={view} onChange={setView} /></div>
        {view > 0 && <div className="mt-1.5"><DashFilterRow mode="final" machines={plan} filter={filter} compact /></div>}
      </StickyHead>
      {stage === 1 && (
        <div className="mb-4">
          <div className="mb-2 flex items-baseline"><b className="flex-1 text-sm font-semibold">AI suggestions</b><span className="text-xs text-muted">3 new · Example data</span></div>
          <Cards />
        </div>
      )}
      {view === 0 ? <Tiles values={v} parts={parts} cols="grid-cols-2" stack /> : (
        <FloorDashboard className="pp-fade" machines={plan} mode="final" view={view === 1 ? "2d" : "3d"} compact selectedId={sel} onSelect={setSel}
          onOpenMachine={() => go(6)} filter={filter} />
      )}
    </MobileApp>
  );
}
