import { useMemo, useState } from "react";
import { MACHINES, TARGET, cncReading } from "../data";
import { useDemo, useTick } from "../demo";
import { CameraFrame } from "../components/camera";
import { LoadChart } from "../components/chart";
import { CamIc, DesktopApp, ExPill, MobileApp, Pill, PlusIc, Reading, Seg, StickyHead } from "../components/appchrome";
import { Btn } from "../components/Btn";
import { DashFilterRow, FloorDashboard, planMachines, useDashFilter } from "../components/plan";

const OTHERS = MACHINES.filter((m) => m.id !== TARGET.id);
const SEG = [{ label: "Machine tiles" }, { label: "2D plan", tier: "Pro" }, { label: "3D view", tier: "Business" }];
const SEG_M = [{ label: "Tiles" }, { label: "2D plan" }, { label: "3D view" }];

function Toast({ onView }: { onView?: () => void }) {
  return (
    <div className="pp-fade mb-4 flex items-start gap-3 rounded-[10px] border border-l-4 border-border border-l-running-dot bg-bg px-4 py-3 text-sm shadow-card">
      <span className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full bg-running-soft font-bold text-running" aria-hidden>✓</span>
      <span className="flex-1"><b className="font-semibold">Camera <span className="font-mono">CAM-07</span> is live on CNC mill 3.</b> <span className="text-muted">It reads 4 values from the machine screen every 2 s.</span></span>
      {onView && <Btn variant="primary" size="sm" pulse className="shrink-0" onClick={onView}>View camera</Btn>}
    </div>
  );
}

function AddBtn({ full }: { full?: boolean }) {
  const { go } = useDemo();
  return <Btn variant="primary" size="sm" className={full ? "w-full" : ""} onClick={() => go(4)}><PlusIc /> Add device</Btn>;
}

/** Desktop: web app, as design/screens/sensor-added-desktop.png. */
export function Desktop() {
  const { next, go } = useDemo();
  const t = useTick(1000);
  const r = cncReading(t);
  const [view, setView] = useState(0);
  const [sel, setSel] = useState<string | null>(null);
  const plan = useMemo(() => planMachines("sensorAdded", t), [t]);
  const filter = useDashFilter();
  return (
    <DesktopApp active="Machines" tick={0} panel={<Panel tick={t} />}>
      <StickyHead>
      <div className={`flex flex-wrap items-end gap-4 ${view > 0 ? "mb-3" : ""}`}>
        <div className="min-w-0 flex-1">
          <div className="text-sm text-muted">Example Factory Ltd · Unit 1</div>
          <h1 className="text-2xl font-semibold tracking-tight">Machines</h1>
          <div className="mt-1 text-sm text-muted">1 of 12 machines live · 11 have no sensor yet</div>
        </div>
        <Seg items={SEG} value={view} onChange={setView} />
        <Btn variant="primary" onClick={() => go(4)}><PlusIc /> Add device</Btn>
      </div>
      {view > 0 && <DashFilterRow mode="sensorAdded" machines={plan} filter={filter} />}
      </StickyHead>
      <Toast onView={next} />
      {view > 0 && (
        <FloorDashboard className="pp-fade" machines={plan} mode="sensorAdded" view={view === 1 ? "2d" : "3d"} selectedId={sel} onSelect={setSel}
          onAddDevice={() => go(4)} onOpenMachine={() => next()} filter={filter} />
      )}
      {view === 0 && <div className="grid grid-cols-3 gap-3 2xl:grid-cols-4">
        {MACHINES.map((m) => m.id === TARGET.id ? (
          <div key={m.id} className="flex min-h-[132px] flex-col gap-1 rounded-[10px] border-[1.5px] border-running-dot bg-bg px-3.5 py-3 shadow-[0_0_0_3px_var(--color-running-soft)]">
            <div className="flex items-start gap-2"><span className="flex-1 text-sm font-semibold">CNC mill 3</span><Pill kind="running" /></div>
            <div className="text-xs text-muted">Machining · <span className="font-mono">CAM-07</span></div>
            <div className="reading text-xl font-semibold">{r.rpm.toLocaleString("en-GB")} rpm</div>
            <div className="-mt-1 text-xs font-medium text-muted">Spindle · confidence <span className="font-mono">0.97</span></div>
            <div className="mt-auto flex items-center justify-between text-xs"><span>Parts today <span className="reading">{r.parts}</span></span><span className="rounded-[3px] bg-cam-high px-1.5 py-0.5 font-mono text-[10px] text-white">LIVE</span></div>
          </div>
        ) : (
          <div key={m.id} className="relative flex min-h-[132px] flex-col gap-1.5 rounded-[10px] border border-dashed border-inactive-dot bg-inactive-soft px-3.5 py-3">
            <span className="absolute right-3 top-3 text-inactive opacity-60"><CamIc className="h-4 w-4" /></span>
            <div className="pr-6 text-sm font-semibold text-inactive">{m.name}</div>
            <div className="text-xs text-muted">{m.area}</div>
            <div className="mt-auto flex flex-col items-start gap-2"><span className="text-[11px]"><Pill kind="inactive" /></span><AddBtn /></div>
          </div>
        ))}
      </div>}
    </DesktopApp>
  );
}

function Panel({ tick }: { tick: number }) {
  const r = cncReading(tick);
  return (
    <>
      <div className="flex items-start gap-2">
        <div className="flex-1"><div className="text-xs text-muted">Machining · Camera <span className="font-mono">CAM-07</span></div><h2 className="text-lg font-semibold">CNC mill 3</h2></div>
        <Pill kind="running" />
      </div>
      <CameraFrame boxes={false} />
      <div className="flex justify-between text-xs text-muted"><span>Readings from the machine screen</span><span>Confidence</span></div>
      <div className="grid grid-cols-2 gap-2.5">
        <Reading label="Spindle speed" value={`${r.rpm.toLocaleString("en-GB")} rpm`} conf={0.97} />
        <Reading label="Spindle load" value={`${r.load} %`} conf={0.96} />
        <Reading label="Parts today" value={String(r.parts)} conf={0.98} />
        <Reading label="Alarm" value="None" conf={0.88} />
      </div>
      <div className="border-t border-chart-grid pt-2">
        <div className="flex justify-between text-xs"><b className="font-semibold">Spindle load, last hour</b><span className="text-muted">Example data</span></div>
        <LoadChart height={70} />
        <div className="flex justify-between text-xs text-chart-axis"><span>09:42</span><span>10:12</span><span>10:42</span></div>
      </div>
      <div>
        <div className="mb-1.5 text-sm font-semibold">Run log</div>
        <RunLog />
      </div>
      <div className="flex flex-wrap gap-2">
        <Btn size="sm" disabled>Report a misread</Btn>
        <Btn size="sm" disabled>Recalibrate</Btn>
        <Btn size="sm" disabled>Edit readings</Btn>
      </div>
    </>
  );
}

function RunLog() {
  const rows = [["10:42", "Camera added. Reading 4 values every 2 s.", true], ["10:41", "Values matched to machine screen", false], ["10:38", "Camera paired: CAM-07", false]] as const;
  return (
    <div className="grid gap-1.5 text-xs">
      {rows.map(([t, s, g]) => (
        <div key={t} className="grid grid-cols-[40px_12px_1fr] items-center"><span className="tnum text-muted">{t}</span><span className={`h-[7px] w-[7px] rounded-full ${g ? "bg-running-dot" : "bg-inactive-dot"}`} /><span>{s}</span></div>
      ))}
    </div>
  );
}

/** Mobile (and the phone frame): as design/screens/sensor-added-mobile.png. */
export default function Step5() {
  const { next, go } = useDemo();
  const t = useTick(1000);
  const r = cncReading(t);
  const [view, setView] = useState(0);
  const [sel, setSel] = useState<string | null>(null);
  const plan = useMemo(() => planMachines("sensorAdded", t), [t]);
  const filter = useDashFilter();
  return (
    <MobileApp active="Machines">
      <StickyHead compact>
        <div className="flex items-baseline gap-2"><h1 className="text-lg font-semibold tracking-tight">Machines</h1><span className="min-w-0 truncate text-xs text-muted">Example Factory Ltd · Unit 1</span></div>
        <div className="mb-1.5 truncate text-xs text-muted">1 of 12 machines live · 11 have no sensor yet</div>
        <div className="flex justify-center"><Seg items={SEG_M} value={view} onChange={setView} /></div>
        {view > 0 && <div className="mt-1.5"><DashFilterRow mode="sensorAdded" machines={plan} filter={filter} compact /></div>}
      </StickyHead>
      <Toast />
      {view > 0 && (
        <FloorDashboard className="pp-fade mb-4" machines={plan} mode="sensorAdded" view={view === 1 ? "2d" : "3d"} compact selectedId={sel} onSelect={setSel}
          onAddDevice={() => go(4)} onOpenMachine={() => next()} filter={filter} />
      )}
      {view === 0 && <>
      <div className="rounded-[10px] border-[1.5px] border-running-dot p-3 shadow-[0_0_0_3px_var(--color-running-soft)]">
        <div className="flex items-center"><b className="flex-1 text-sm font-semibold">CNC mill 3</b><Pill kind="running" /></div>
        <div className="mb-2 text-xs text-muted">Machining · <span className="font-mono">CAM-07</span> · read 2 s ago</div>
        <div className="grid grid-cols-2 gap-1.5">
          <Reading small label="Spindle speed" value={`${r.rpm.toLocaleString("en-GB")} rpm`} conf={0.97} />
          <Reading small label="Spindle load" value={`${r.load} %`} conf={0.96} />
          <Reading small label="Parts today" value={String(r.parts)} conf={0.98} />
          <Reading small label="Alarm" value="None" conf={0.88} />
        </div>
        <div className="mt-2.5 flex items-center justify-between"><ExPill /><Btn variant="primary" size="sm" pulse onClick={next}>Open machine</Btn></div>
      </div>
      <div className="mb-2 mt-4 flex items-baseline justify-between"><b className="text-sm font-semibold">Other machines</b><span className="text-xs text-muted">11 inactive</span></div>
      <div className="grid gap-1.5">
        {OTHERS.map((m) => (
          <div key={m.id} className="flex items-center gap-2.5 rounded-[10px] border border-dashed border-inactive-dot bg-inactive-soft px-2.5 py-[7px]">
            <div className="min-w-0 flex-1"><div className="break-words text-sm font-semibold text-inactive">{m.name}</div><div className="text-xs text-muted">{m.area} · <span aria-hidden>○</span> Inactive · no sensor yet</div></div>
            <AddBtn />
          </div>
        ))}
      </div>
      </>}
    </MobileApp>
  );
}
