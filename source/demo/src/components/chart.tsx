import { LOAD_HISTORY } from "../data";

/** "Spindle load, last hour" line chart. extra = live points appended after the history (deterministic). */
export function LoadChart({ extra = [], height = 64, limit = false }: { extra?: number[]; height?: number; limit?: boolean }) {
  const data = [...LOAD_HISTORY, ...extra].slice(-60);
  const W = 300, H = 60, max = 100;
  const x = (i: number) => (i / (data.length - 1)) * W;
  const y = (v: number) => H - 4 - (v / max) * (H - 8);
  const pts = data.map((v, i) => `${x(i).toFixed(1)},${Math.max(2, Math.min(H - 2, y(v))).toFixed(1)}`).join(" ");
  const stop = data.findIndex((v) => v < 10);
  const stopEnd = stop >= 0 ? stop + data.slice(stop).findIndex((v) => v >= 10) : -1;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="block w-full" style={{ height }} role="img" aria-label="Line chart of spindle load in the last hour. The load is near 42 %, with one stop.">
      {[15, 30, 45].map((g) => <line key={g} x1="0" x2={W} y1={g} y2={g} stroke="var(--color-chart-grid)" strokeWidth="0.6" />)}
      {stop >= 0 && <rect x={x(stop - 1)} y="0" width={x(Math.max(stopEnd, stop + 1)) - x(stop - 1)} height={H} fill="var(--color-fault-soft)" opacity="0.9" />}
      {limit && <line x1="0" x2={W} y1={y(85)} y2={y(85)} stroke="var(--color-chart-limit)" strokeDasharray="3 3" strokeWidth="0.8" />}
      <polyline points={pts} fill="none" stroke="var(--color-chart-line)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}
