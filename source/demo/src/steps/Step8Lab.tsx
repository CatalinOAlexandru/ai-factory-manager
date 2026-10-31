import { Btn, usePulse } from "../components/Btn";
import { useState } from "react";
import { useDemo, useTick } from "../demo";
import { BottomNav, Screen, StepBar } from "../components/ui";
import { CamIc, Pill } from "../components/appchrome";

type LabState = "running" | "warm" | "lid" | "nosignal";

function A() {
  const { next } = useDemo();
  return (
    <Screen footer={<Btn size="block" pulse onClick={next}>Set it up</Btn>}>
      <StepBar step={1} of={2} />
      <h2 className="mt-4 text-[22px] font-semibold">What do you want to monitor?</h2>
      <div className="mt-3 grid grid-cols-2 rounded-full border border-border-strong p-[3px] text-sm">
        <span className="py-1.5 text-center text-muted">Whole site</span>
        <span className="rounded-full border-[1.5px] border-accent bg-accent-soft py-1 text-center font-semibold text-accent-strong">Single device</span>
      </div>
      <div className="label mt-4">Describe it</div>
      <textarea readOnly className="field mt-1.5 h-[104px] resize-none" value={"One benchtop centrifuge in our QC lab. Log speed, temperature and time for every run, and tell me when a run finishes or gets too warm."} />
      <div className="label mt-4">Photo of the device <span className="font-normal text-muted">(optional)</span></div>
      <div className="mt-1.5 flex items-center gap-3">
        <img src="img/lab-centrifuge-device.jpg" width={330} height={234} alt="Photo of the device: a white refrigerated benchtop centrifuge" className="h-[78px] w-[110px] rounded-[10px] border border-border bg-surface-2 object-cover" />
        <div className="text-sm"><div className="font-semibold text-running">✓ Recognised</div><div className="text-muted">Refrigerated benchtop centrifuge</div></div>
      </div>
      <div className="mt-4 rounded-[10px] bg-surface-2 p-3 text-sm">No layout needed for one device. We go straight to the camera.</div>
    </Screen>
  );
}

function B() {
  const { next } = useDemo();
  const rows = [["Speed (rpm)", ""], ["Temperature (°C)", "alert above 8 °C"], ["Time remaining", ""], ["Run status", "notify when done"]];
  return (
    <Screen footer={<Btn size="block" pulse onClick={next}>Start logging</Btn>}>
      <StepBar step={2} of={2} />
      <h2 className="mt-4 text-[22px] font-semibold">Align the camera</h2>
      <p className="mt-1 text-sm"><span className="text-running" aria-hidden>●</span> <span className="font-mono">CAM-02</span> connected over Bluetooth</p>
      <div className="mt-3 rounded-[12px] border border-border bg-surface-2 p-3">
        <div className="mb-2 text-xs font-semibold"><span className="text-fault" aria-hidden>●</span> LIVE</div>
        <div className="mx-auto max-w-[240px] rounded-[8px] border-2 border-text bg-bg p-2 font-mono text-[13px]">
          {[["RPM 4500", "Speed", 0.98], ["TEMP 4.0°C", "Temp", 0.95], ["TIME 09:58", "Time left", 0.93], ["RUNNING", "Status", 0.91]].map(([v, l, c]) => (
            <div key={l as string} className="mb-1 flex items-center gap-2 last:mb-0">
              <span className="flex-1 rounded-[3px] border border-dashed border-cam-box px-1.5 py-0.5">{v}</span>
              <span className="rounded-full border border-cam-box bg-accent-soft px-2 text-[11px] text-accent-strong">{l} <span className="opacity-80">{(c as number).toFixed(2)}</span></span>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-[8px] bg-running-soft px-3 py-1.5 text-sm font-semibold text-running">✓ 4 values found · hold steady</div>
      </div>
      <div className="label mt-4">Values to log</div>
      <div className="mt-1.5 grid gap-1.5 text-sm">
        {rows.map(([n, note]) => <div key={n} className="flex items-center gap-2"><span className="grid h-4 w-4 place-items-center rounded-[3px] bg-accent text-[10px] text-accent-ink">✓</span><span className="flex-1">{n}</span><span className="text-xs text-muted">{note}</span></div>)}
      </div>
    </Screen>
  );
}

function C() {
  const [st, setSt] = useState<LabState>("running");
  // Guided path (script: "Tap the four states"): highlight the states not tapped yet, then Next.
  const [tried, setTried] = useState<LabState[]>(["running"]);
  // One highlight at a time: the first state not tapped yet (order of the chips).
  const firstUntried = (["warm", "lid", "nosignal"] as LabState[]).find((k) => !tried.includes(k));
  const chipHl = usePulse(!!firstUntried);
  const t = useTick(1000);
  const spinning = st === "running" || st === "warm";
  const temp = st === "warm" ? (8.6 + 0.1 * (t % 4)).toFixed(1) : (4.1 + (t % 3 === 0 ? 0 : 0.1)).toFixed(1);
  const left = Math.max(0, 6 * 60 + 12 - t);
  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-3">
        <div className="text-sm text-muted">‹ QC lab</div>
        <div className="mt-1 flex items-center"><h2 className="flex-1 text-[24px] font-semibold">Centrifuge 1</h2><span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border-strong px-3 text-sm font-semibold"><CamIc /> Camera feed</span></div>
        <div className="mt-1.5 flex items-center gap-2 text-sm text-muted">
          {st === "nosignal" ? <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-offline-dot bg-offline-soft px-2.5 py-[3px] text-xs font-semibold text-offline">⊘ No signal</span>
            : st === "lid" ? <Pill kind="idle">Lid open</Pill> : st === "warm" ? <Pill kind="alarm">Too warm</Pill> : <Pill kind="running" />}
          <span>run 7 · {Math.floor(left / 60)} min left</span>
        </div>
        <div className={`mt-3 flex items-center gap-3 rounded-[12px] bg-surface-2 p-3 ${st === "nosignal" ? "opacity-50" : ""}`}>
          <svg viewBox="0 0 100 100" className="h-[120px] w-[120px] shrink-0" style={{ animation: spinning ? "spin 1.2s linear infinite" : undefined }}>
            <circle cx="50" cy="50" r="46" fill="#fff" stroke="var(--color-border-strong)" />
            {[0, 60, 120, 180, 240, 300].map((a) => <rect key={a} x="45" y="12" width="10" height="26" rx="5" transform={`rotate(${a} 50 50)`} fill={st === "warm" ? "var(--color-fault-dot)" : "var(--color-accent)"} opacity="0.8" />)}
            <circle cx="50" cy="50" r="7" fill="var(--color-surface-3)" />
          </svg>
          <div className="text-sm">
            <div className="text-xs text-muted">Live device view</div>
            <div className="mt-1 text-xs text-muted">Speed</div><div className="reading text-lg font-semibold">{st === "nosignal" ? "—" : spinning ? "4,500 rpm" : "0 rpm"}</div>
            <div className="text-xs text-muted">Temperature</div><div className={`reading text-lg font-semibold ${st === "warm" ? "text-fault" : ""}`}>{st === "nosignal" ? "—" : `${temp} °C`}</div>
            <div className="text-xs text-muted">Time left</div><div className="reading text-lg font-semibold">{st === "nosignal" ? "—" : `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`}</div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {([["running", "Running"], ["warm", "Too warm"], ["lid", "Lid open"], ["nosignal", "No signal"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => { setSt(k); setTried((x) => (x.includes(k) ? x : [...x, k])); }} className={`chip ${st === k ? "chip-on" : ""} ${k === firstUntried ? chipHl : ""}`}>{l}</button>
          ))}
        </div>
        <div className="mt-4 text-sm font-semibold">Temperature, this run</div>
        <svg viewBox="0 0 300 70" className="mt-1 block h-[70px] w-full">
          <line x1="0" x2="300" y1="16" y2="16" stroke="var(--color-chart-limit)" strokeDasharray="4 3" /><text x="298" y="12" fontSize="9" textAnchor="end" fill="var(--color-chart-axis)">limit 8 °C</text>
          <polyline fill="none" stroke="var(--color-chart-line)" strokeWidth="1.6" points={Array.from({ length: 30 }, (_, i) => `${i * 10.3},${st === "warm" && i > 22 ? 40 - (i - 22) * 4 : 44 + Math.sin((i + t) / 3)}`).join(" ")} />
        </svg>
        <div className="flex justify-between text-xs text-chart-axis"><span>run start</span><span>now</span></div>
      </div>
      <BottomNav active="Live" />
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}

function D() {
  const runs = [["Run 7", "10:42", "4,500", "4.0–4.3 °C", false], ["Run 6", "10:18", "4,500", "4.0–4.2 °C", false], ["Run 5", "09:51", "3,000", "4.1–9.2 °C", true], ["Run 4", "09:20", "4,500", "4.0–4.4 °C", false], ["Run 3", "08:55", "4,500", "3.9–4.2 °C", false]] as const;
  const [exp, setExp] = useState(false);
  const expHl = usePulse(!exp); // script: "Export is the paid upgrade"
  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-3">
        <div className="pp-fadein flex items-start gap-3 rounded-[10px] border border-border bg-surface-2 p-3 text-sm">
          <span className="grid h-6 w-6 place-items-center rounded-[6px] bg-accent-soft text-accent-strong">✓</span>
          <div className="flex-1"><b className="font-semibold">Run 7 finished</b><div className="text-xs text-muted">10 min at 4,500 rpm · max 4.3 °C</div></div><span className="text-xs text-muted">now</span>
        </div>
        <h2 className="mt-4 text-[22px] font-semibold">Run log</h2>
        <div className="text-sm text-muted">Today · 7 runs · 1 flagged</div>
        <table className="mt-3 w-full text-[13px]">
          <thead><tr className="text-left text-xs text-muted"><th className="py-1 font-medium">Run</th><th className="font-medium">Start</th><th className="font-medium">Max rpm</th><th className="font-medium">Temp range</th><th /></tr></thead>
          <tbody className="tnum">
            {runs.map(([r, s, m, tr, f]) => (
              <tr key={r} className={`border-t border-border ${f ? "bg-fault-soft" : ""}`}>
                <td className="py-2">{r}</td><td>{s}</td><td>{m}</td><td className={f ? "font-semibold text-fault" : ""}>{tr}</td>
                <td className="text-right">{f ? <span className="text-fault" aria-label="Flagged">▲</span> : <span className="text-running" aria-label="OK">✓</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 rounded-[10px] border border-l-4 border-border-strong border-l-fault-dot p-3">
          <div className="text-xs text-muted"><span className="text-fault-dot" aria-hidden>●</span> Flagged run</div>
          <div className="font-semibold">Run 5 warmed to 9.2 °C</div>
          <div className="text-sm text-muted">Above your 8 °C limit for 3 min. Check the lid seal and cooling.</div>
        </div>
        <button onClick={() => setExp(true)} className={`btn-primary btn-block mt-4 ${expHl}`}>{exp ? "Example only · export is not live" : "Export run log (PDF or CSV)"}</button>
        <p className="mt-1.5 text-center text-xs text-muted">Signed audit trail on the Business tier</p>
      </div>
      <BottomNav active="Runs" />
    </div>
  );
}

export default function Step8() {
  const { stage } = useDemo();
  return [<A key="a" />, <B key="b" />, <C key="c" />, <D key="d" />][stage];
}
