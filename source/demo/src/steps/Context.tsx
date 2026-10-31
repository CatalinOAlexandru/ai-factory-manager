import type { ReactNode } from "react";
import { useDemo } from "../demo";
import { band } from "../components/camera";

type Ctx = { kicker: string; title: string; body: ReactNode; img?: { src: string; alt: string; cap: string; contain?: boolean }; extra?: ReactNode };

const BANDS = (
  <ul className="grid gap-1.5 text-sm">
    {[0.97, 0.88, 0.61].map((c) => {
      const b = band(c);
      return (
        <li key={c} className="flex items-center gap-2">
          <span className="h-4 w-6 rounded-[3px]" style={{ border: `2px ${b.dashed ? "dashed" : "solid"} ${b.col}` }} />
          <span className="font-mono text-[12px] font-medium" style={{ color: b.col }}>{c >= 0.9 ? "≥ 0.90" : c >= 0.7 ? "0.70–0.89 ▲ check" : "< 0.70 ✕ unsure"}</span>
          <span className="text-muted">{c >= 0.9 ? "Logged" : c >= 0.7 ? "Logged. Confirm once." : "Not logged until you confirm it."}</span>
        </li>
      );
    })}
  </ul>
);

const TIERS = (
  <div className="grid grid-cols-3 gap-2">
    {[["tier-free", "Free · Machine tiles"], ["tier-pro", "Pro · 2D plan"], ["tier-business", "Business · 3D view"]].map(([f, l]) => (
      <figure key={f}><img src={`img/screens/${f}.png`} alt={`Plan card: ${l}`} className="w-full rounded-[8px] border border-border" /><figcaption className="mt-1 text-[11px] text-muted">{l} · Price to come</figcaption></figure>
    ))}
  </div>
);

function ctx(step: number, stage: number): Ctx {
  switch (step) {
    case 1: return { kicker: "Why it matters", title: "No engineer, no wiring",
      body: "Today a factory pays a controls engineer to add sensors and build a dashboard. Here the owner types one sentence. Photos are optional, but they help the AI count and name the machines.",
      img: { src: "img/screens/s1-describe.png", alt: "Screen 1, design", cap: "Screen 1 (design)", contain: true } };
    case 2: return { kicker: "How it works", title: "The AI does the engineer’s job",
      body: <ol className="list-decimal space-y-1 pl-5"><li>Find the machines in the text and photos.</li><li>Pick what to measure on each one.</li><li>Plan one camera spot per machine.</li><li>Build the dashboard from a template.</li></ol>,
      img: { src: "img/screens/s2-generating.png", alt: "Screen 2, design", cap: "Screen 2 (design)", contain: true } };
    case 3: return { kicker: "Plans", title: ["Free: machine tiles", "Pro: 2D plan", "Business: 3D view"][stage] ?? "Three views",
      body: "Three views of the same floor. Each paid plan adds one view. Tap a machine to see what the AI will read from it.", extra: TIERS };
    case 4: return { kicker: "Camera hardware", title: "The camera reads the screen that is already there",
      body: "The camera sits in front of the machine display and never touches the machine. The vision model boxes each value once and gives it a confidence score.",
      img: stage >= 2 ? { src: "img/cnc-hmi-camera-clean.png", alt: "Camera view of the CNC mill 3 screen with each value boxed", cap: "Example image of a generic machine screen (no real brand)." }
        : { src: "img/img-011.jpg", alt: "Small white camera case with a round lens window, alone and on a magnetic stand", cap: "Current case. Rendered mock-up, not a photo." },
      extra: stage >= 2 ? BANDS : undefined };
    case 6: return { kicker: "Logging", title: "Every value has a confidence",
      body: "After calibration the camera reads the ticked values every few seconds. Camera feed shows the live frame and what was read from it. Recalibrate and Report a misread are one tap away.",
      img: { src: "img/cnc-hmi-camera-clean.png", alt: "Camera view of the CNC mill 3 screen with each value boxed", cap: "Camera CAM-07 on CNC mill 3. Example image." }, extra: BANDS };
    case 8: return { kicker: "Second example", title: "One lab centrifuge",
      body: "A lab that only wants one device skips the layout step: describe it, point a camera at its display, and every run is logged. On screen C, tap the four states.",
      img: { src: "img/lab-centrifuge-camera.jpg", alt: "Small white cube camera on a round stand on a lab bench, next to a benchtop centrifuge. The wall display shows Centrifuge 1: 4,500 rpm, 4.1 °C, 06:12 left", cap: "On a lab bench. Rendered mock-up, not a photo." } };
    default: return { kicker: "", title: "", body: "" };
  }
}

export function Context() {
  const { step, stage } = useDemo();
  const c = ctx(step, stage);
  return (
    <div className="flex flex-col gap-4 p-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-faint">{c.kicker}</div>
        <h2 className="font-display mt-1 text-[24px] leading-tight">{c.title}</h2>
      </div>
      <div className="text-[15px] leading-relaxed text-text">{c.body}</div>
      {c.img && (
        <figure>
          <img src={c.img.src} alt={c.img.alt} className={`w-full rounded-[12px] border border-border ${c.img.contain ? "mx-auto max-h-[420px] w-auto object-contain" : ""}`} />
          <figcaption className="mt-1.5 text-xs text-muted">{c.img.cap}</figcaption>
        </figure>
      )}
      {c.extra}
      <div className="mt-auto border-t border-border pt-3 text-xs text-muted">All data is example data.</div>
    </div>
  );
}
