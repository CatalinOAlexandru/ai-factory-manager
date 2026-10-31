import { Btn } from "../components/Btn";
import { ZONES } from "../../../shared/floorplan";
import { useEffect, useState } from "react";
import { MACHINES, SITE } from "../data";
import { useDemo } from "../demo";
import { Check, Screen, StepBar } from "../components/ui";

const TASKS = [
  "Read your site description",
  "Found 12 machines in 3 photos",
  "Choosing what to track on each",
  "Laying out your dashboard",
  "Planning camera positions",
];

export default function Step2() {
  const { stage } = useDemo();
  return stage === 0 ? <Generating /> : <Ready />;
}

function Generating() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    let raf = 0;
    const loop = (t: number) => {
      const k = Math.min((t - t0) / 5600, 1);
      setP(Math.round(100 * (1 - Math.pow(1 - k, 1.6))));
      if (k < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const done = Math.floor((p / 100) * TASKS.length + 0.001);
  const R = 52, C = 2 * Math.PI * R;
  return (
    <Screen>
      <StepBar step={2} />
      <h2 className="mt-4 text-[24px] font-semibold leading-tight">Building your dashboard</h2>
      <p className="mt-1 text-sm text-muted">Usually about 2 minutes</p>
      <div className="relative mx-auto mt-6 h-[150px] w-[150px]">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r={R} fill="none" stroke="var(--color-border)" strokeWidth="8" />
          <circle cx="60" cy="60" r={R} fill="none" stroke="var(--color-accent)" strokeWidth="8" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - p / 100)} />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div><div className="tnum text-[30px] font-semibold leading-none">{p}%</div><div className="mt-1 text-xs text-muted">done</div></div>
        </div>
      </div>
      <ul className="mt-7 space-y-3.5">
        {TASKS.map((t, i) => {
          const st = i < done ? "done" : i === done ? "now" : "wait";
          return (
            <li key={t} className="flex items-center gap-3 text-[15px]">
              <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${st === "done" ? "bg-accent text-accent-ink" : st === "now" ? "border-2 border-accent" : "border border-border-strong"}`}>
                {st === "done" ? <Check className="h-3.5 w-3.5" /> : st === "now" ? <span className="pp-pulse h-2 w-2 rounded-full bg-accent" /> : null}
              </span>
              <span className={st === "wait" ? "text-muted" : st === "now" ? "font-semibold" : ""}>{t}{st === "now" ? "…" : ""}</span>
            </li>
          );
        })}
      </ul>
      <div className="mt-7 rounded-[10px] bg-surface-2 p-3 text-[13.5px] text-muted">You can close the app; we'll notify you when it's ready.</div>
    </Screen>
  );
}

function Ready() {
  const { next } = useDemo();
  const areas = ZONES.filter((z) => MACHINES.some((m) => m.zone === z.id));
  return (
    <Screen footer={<Btn size="block" pulse onClick={next}>Check the layout</Btn>}>
      <StepBar step={2} />
      <div className="pp-fade mt-4 flex items-center gap-2 rounded-[10px] border border-running-dot/50 bg-running-soft px-3 py-2 text-sm font-semibold text-running">
        <Check /> Your dashboard is ready
      </div>
      <h2 className="mt-3 text-[22px] font-semibold leading-tight">{SITE.siteName}</h2>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        {[["12", "machines"], ["31", "values to read"], ["12", "camera spots"]].map(([v, l]) => (
          <div key={l} className="rounded-[10px] border border-border py-2">
            <div className="tnum text-xl font-semibold">{v}</div>
            <div className="text-[11.5px] text-muted">{l}</div>
          </div>
        ))}
      </div>
      {areas.map((z) => (
        <div key={z.id} className="mt-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">{z.name}</div>
          <ul className="mt-1.5 divide-y divide-border rounded-[10px] border border-border">
            {MACHINES.filter((m) => m.zone === z.id).map((m, i) => (
              <li key={m.id} className="pp-fade flex items-center justify-between gap-2 px-3 py-2" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="min-w-0">
                  <div className="break-words text-sm font-semibold">{m.name}</div>
                  <div className="break-words text-xs text-muted">{m.reads.join(" · ")}</div>
                </div>
                <span className="shrink-0 text-xs text-faint">{m.reads.length} values</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Screen>
  );
}
