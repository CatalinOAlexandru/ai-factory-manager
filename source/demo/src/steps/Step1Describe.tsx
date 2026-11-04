import { Btn } from "../components/Btn";
import { useState } from "react";
import { SITE } from "../data";
import { useDemo } from "../demo";
import { BoxIc, CloudIc, LockIc, Screen, StepBar } from "../components/ui";
import { useDeploy, type Deploy } from "../deploy";

export default function Step1() {
  const { next } = useDemo();
  const [text, setText] = useState(SITE.description);
  const [measures, setMeasures] = useState(SITE.measures);
  const [where, setWhere] = useDeploy();
  return (
    <Screen footer={<Btn size="block" pulse onClick={next}>Generate my dashboard</Btn>}>
      <StepBar step={1} />
      <h2 className="mt-4 text-[24px] font-semibold leading-tight tracking-[-0.01em]">Tell us about your site</h2>
      <label className="label mt-5 block" htmlFor="site-desc">What does your site do?</label>
      <textarea id="site-desc" value={text} onChange={(e) => setText(e.target.value)} rows={5}
        className="field mt-2 resize-none leading-relaxed" />
      <figure className="mt-5" data-sketch>
        <div className="label">Your input: a hand sketch of the floor</div>
        <div className="mt-2 overflow-hidden rounded-[10px] border border-border bg-surface-2">
          <img src="img/factory-sketch.jpg" width={1600} height={1200} loading="eager" decoding="async"
            alt="Hand-drawn floor sketch: band saw, CNC mills 1 to 4, welders 1 and 2, presses 1 and 2, conveyor belt, CMM, robot cell, washer and two doors."
            className="block aspect-[4/3] max-h-[240px] w-full object-contain" />
        </div>
        <figcaption className="mt-1.5 text-[12.5px] leading-snug text-muted">Hand sketch of the example floor. PanelPal uses it to generate the factory layout you see in the next steps.</figcaption>
      </figure>
      <div className="label mt-5">What do you want to measure?</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {measures.map((m, i) => (
          <button key={m.label} type="button" aria-pressed={m.on}
            onClick={() => setMeasures(measures.map((x, j) => (j === i ? { ...x, on: !x.on } : x)))}
            className={`chip ${m.on ? "chip-on" : ""}`}>{m.on && <span aria-hidden className="text-accent-strong">✓</span>}{m.label}</button>
        ))}
        <span className="chip text-muted">+ Add</span>
      </div>
      <div className="label mt-5" id="deploy-label">Where should your data live?</div>
      <div role="radiogroup" aria-labelledby="deploy-label" className="mt-2 grid grid-cols-2 gap-2">
        {OPTIONS.map((o) => {
          const on = where === o.key;
          return (
            <button key={o.key} type="button" role="radio" aria-checked={on} onClick={() => setWhere(o.key)}
              className={`relative flex flex-col items-start rounded-[10px] border p-3 text-left transition-colors ${on ? "border-[1.5px] border-accent bg-accent-soft" : "border-border-strong bg-bg hover:bg-surface-2"}`}>
              <span className="flex w-full items-center gap-1.5">
                <span className={on ? "text-accent-strong" : "text-muted"}>{o.key === "onprem" ? <BoxIc /> : <CloudIc className="h-5 w-5" />}</span>
                <b className="text-[15px] font-semibold">{o.title}</b>
                <span aria-hidden className={`ml-auto grid h-4 w-4 place-items-center rounded-full border-[1.5px] ${on ? "border-accent" : "border-border-strong"}`}>{on && <span className="h-2 w-2 rounded-full bg-accent" />}</span>
              </span>
              <span className={`mt-1 inline-block rounded-full px-2 py-px text-[11px] font-semibold ${o.key === "onprem" ? "bg-accent text-accent-ink" : "bg-surface-2 text-muted"}`}>{o.tag}</span>
              <span className="mt-1.5 block text-[12.5px] leading-snug text-muted">{o.text}</span>
            </button>
          );
        })}
      </div>
      <p className={`mt-2 flex items-start gap-1.5 rounded-[8px] px-2.5 py-2 text-[12.5px] leading-snug ${where === "onprem" ? "bg-running-soft text-running" : "bg-surface-2 text-muted"}`}>
        {where === "onprem" ? <LockIc className="mt-px h-3.5 w-3.5" /> : <CloudIc className="mt-px h-3.5 w-3.5" />}
        {where === "onprem"
          ? <span><b>Your data stays yours.</b> Readings, history and dashboards stay on your own network.</span>
          : <span><b>Simplest to start.</b> Nothing to install. You can see your site from anywhere.</span>}
      </p>
      <div className="label mt-5">Photos or floor plan <span className="font-normal text-muted">(optional)</span></div>
      <div className="mt-2 grid grid-cols-4 gap-2">
        {[["Plan", "plan"], ["Machining", "a"], ["Welding", "b"]].map(([l, k]) => (
          <div key={k} className="overflow-hidden rounded-[8px] border border-border bg-surface-2">
            <Thumb kind={k} />
            <div className="border-t border-border bg-bg py-1 text-center text-[11px] text-muted">{l}</div>
          </div>
        ))}
        <div className="grid place-items-center rounded-[8px] border border-dashed border-border-strong text-xl text-muted" aria-label="Add photo">+</div>
      </div>
      <p className="mt-3 text-[12.5px] text-muted">The AI uses the photos to find the machines and plan camera spots.</p>
    </Screen>
  );
}

const OPTIONS: { key: Deploy; title: string; tag: string; text: string }[] = [
  { key: "onprem", title: "On-prem", tag: "Most private", text: "A small PanelPal computer in your building. Nothing leaves your site." },
  { key: "cloud", title: "Cloud", tag: "Simplest", text: "We run it for you. Nothing to install." },
];

/** Small procedural thumbnails (no photos of a real site). */
function Thumb({ kind }: { kind: string }) {
  if (kind === "plan")
    return (
      <svg viewBox="0 0 40 30" className="block aspect-[4/3] w-full bg-plan-bg"><rect x="2" y="2" width="36" height="26" fill="none" stroke="#5f5f5d" strokeWidth=".8" /><line x1="20" y1="2" x2="20" y2="13" stroke="#5f5f5d" strokeWidth=".8" /><line x1="20" y1="18" x2="20" y2="28" stroke="#5f5f5d" strokeWidth=".8" />{[[5, 5], [12, 5], [5, 12], [12, 12], [23, 5], [30, 5], [23, 13], [30, 13]].map(([x, y], i) => <rect key={i} x={x} y={y} width="5.5" height="4.5" fill="#fff" stroke="#a6a6a6" strokeWidth=".4" />)}</svg>
    );
  return (
    <svg viewBox="0 0 40 30" className="block aspect-[4/3] w-full"><rect width="40" height="30" fill={kind === "a" ? "#d9dde2" : "#dfdcd6"} /><rect y="20" width="40" height="10" fill="#c3c6c9" />{[4, 15, 26].map((x, i) => <g key={i}><rect x={x} y={kind === "a" ? 10 : 8} width="9" height={kind === "a" ? 12 : 14} fill="#f6f6f4" stroke="#9aa0a6" strokeWidth=".4" /><rect x={x + 5.5} y={kind === "a" ? 12 : 10} width="2.5" height="2" fill="#2a2f36" /></g>)}</svg>
  );
}
