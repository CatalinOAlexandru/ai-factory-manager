import { Btn, usePulse } from "../components/Btn";
import { useState } from "react";
import { clock, cncReading } from "../data";
import { useTick } from "../demo";
import { CameraFrame } from "../components/camera";
import { LoadChart } from "../components/chart";
import { CamIc, MobileApp, Pill, Reading } from "../components/appchrome";

type Row = { t: string; text: string; dot: "g" | "r" | "n" };
const OLD: Row[] = [
  { t: "10:31", text: "Alarm cleared: door open", dot: "g" },
  { t: "10:24", text: "Alarm: door open", dot: "r" },
];

/** Live log rows for tick t (newest first). Deterministic: same tick, same rows. */
export function liveRows(t: number, n = 5): Row[] {
  const rows: Row[] = [];
  for (let k = t; k >= 0 && rows.length < n; k--) {
    const r = cncReading(k);
    if (k > 0 && k % 6 === 0) rows.push({ t: clock(k), text: `Cycle done · part ${r.parts}`, dot: "n" });
    rows.push({ t: clock(k), text: `Load ${r.load} % · ${r.rpm.toLocaleString("en-GB")} rpm`, dot: "n" });
  }
  return rows.slice(0, n);
}

export default function Step6() {
  const t = useTick(1000);
  const r = cncReading(t);
  const extra = Array.from({ length: Math.floor(t / 2) }, (_, i) => cncReading(i * 2).load);
  const [sheet, setSheet] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  // Guided path (script: "Try Camera feed and Recalibrate"): Camera feed, then Recalibrate, then Next.
  const [seen, setSeen] = useState({ feed: false, cal: false });
  const feedHl = usePulse(!seen.feed), calHl = usePulse(sheet && !seen.cal);
  const flash = (s: string) => { setToast(s); setTimeout(() => setToast(null), 2600); };

  return (
    <>
      <MobileApp active="Machines">
        <div className="text-sm text-muted">‹ Machining</div>
        <div className="mt-1 flex items-center gap-2">
          <h1 className="flex-1 text-[24px] font-semibold tracking-tight">CNC mill 3</h1>
          <button onClick={() => { setSheet(true); setSeen((s) => ({ ...s, feed: true })); }} className={`btn-secondary btn-sm rounded-full ${feedHl}`}><CamIc /> Camera feed</button>
        </div>
        <div className="mt-1.5 flex items-center gap-2 text-sm text-muted"><Pill kind="running" /> <span>updated <span className="tnum">{t % 2 === 0 ? 1 : 2}</span> s ago</span></div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Reading label="Spindle speed" value={`${r.rpm.toLocaleString("en-GB")} rpm`} />
          <Reading label="Spindle load" value={`${r.load} %`} />
          <Reading label="Parts today" value={String(r.parts)} />
          <Reading label="Uptime today" value="87 %" />
        </div>
        <div className="mt-4 flex items-baseline justify-between"><b className="text-sm font-semibold">Spindle load, last hour</b><span className="text-[11px] text-muted">Example data</span></div>
        <div className="mt-1 border-y border-chart-grid"><LoadChart extra={extra} height={92} limit /></div>
        <div className="mt-1 flex justify-between text-xs text-chart-axis"><span>60 min ago</span><span>limit 85 % ┄</span><span>now</span></div>
        <div className="mt-4 text-sm font-semibold">Latest readings</div>
        <div className="mt-1.5 grid gap-1.5 text-[13px]" aria-live="polite">
          {[...liveRows(t, 4), ...OLD].map((row, i) => (
            <div key={`${row.t}-${row.text}`} className={`grid grid-cols-[64px_14px_1fr] items-center ${i === 0 ? "pp-fadein" : ""}`}>
              <span className="tnum text-muted">{row.t}</span>
              <span className={`h-[7px] w-[7px] rounded-full ${row.dot === "g" ? "bg-running-dot" : row.dot === "r" ? "bg-fault-dot" : "bg-inactive-dot"}`} />
              <span>{row.text}</span>
            </div>
          ))}
        </div>
      </MobileApp>

      {sheet && (
        <div className="absolute inset-0 z-20 flex flex-col justify-end bg-black/40" onClick={() => setSheet(false)}>
          <div className="pp-fadein rounded-t-[18px] bg-bg p-4 pb-5" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Camera feed">
            <div className="mx-auto mb-3 h-1 w-10 rounded bg-border-strong" />
            <div className="mb-2 flex items-center"><b className="flex-1 text-base font-semibold">Camera feed · <span className="font-mono">CAM-07</span></b><Btn variant="secondary" size="sm" onClick={() => setSheet(false)}>Close</Btn></div>
            <CameraFrame />
            <p className="mt-2 text-xs text-muted">Each value has one box. Feed rate is ✕ unsure, so it is not logged.</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button className="btn-secondary btn-block" onClick={() => flash("Misread reported. We will check the value.")}>Report a misread</button>
              <button className={`btn-primary btn-block ${calHl}`} onClick={() => { setSeen((s) => ({ ...s, cal: true })); flash("Recalibrated. The boxes match the screen."); }}>Recalibrate</button>
            </div>
          </div>
        </div>
      )}
      {toast && <div role="status" className="pp-fadein absolute inset-x-4 top-16 z-30 rounded-[10px] bg-text px-4 py-3 text-sm text-bg shadow-raised">✓ {toast}</div>}
    </>
  );
}
