import type { ReactNode } from "react";
import { useDemo } from "../demo";
import { Btn } from "./Btn";
import { clock } from "../data";
import { DeployBadge } from "./ui";
import { useDeploy } from "../deploy";

type Nav = "Site" | "Machines" | "Insights" | "Settings";

const ICONS: Record<Nav, ReactNode> = {
  Site: <path d="M3 21V9l6 4V9l6 4V5l6 4v12z" />,
  Machines: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></>,
  Insights: <path d="M12 3a6 6 0 0 0-4 10.5V17h8v-3.5A6 6 0 0 0 12 3zM9 21h6" />,
  Settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" /></>,
};
export function Ic({ children, className = "h-[18px] w-[18px]" }: { children: ReactNode; className?: string }) {
  return <svg className={`shrink-0 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{children}</svg>;
}
export const PlusIc = () => <Ic className="h-4 w-4"><path d="M12 5v14M5 12h14" /></Ic>;
export const CamIc = ({ className = "h-[18px] w-[18px]" }: { className?: string }) => <Ic className={className}><rect x="3" y="7" width="18" height="12" rx="2" /><circle cx="12" cy="13" r="3.5" /><path d="M8 7l1.5-3h5L16 7" /></Ic>;

export function ExPill() {
  return <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-medium text-warning">Example data</span>;
}
function Who() {
  return <div title="Site manager (example user)" className="grid h-8 w-8 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent-strong">SM</div>;
}

/** Desktop web-app shell (top bar + side nav + content + right panel), as in design/screens. */
export function DesktopApp({ active, children, panel, insightsCount, tick = 0 }: { active: Nav; children: ReactNode; panel: ReactNode; insightsCount?: number; tick?: number }) {
  const { go } = useDemo();
  const [where] = useDeploy();
  return (
    <div className="flex h-full flex-col overflow-hidden bg-surface-2">
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-bg px-5">
        <b className="text-[15px] font-semibold tracking-tight">Example Factory Ltd</b>
        <div className="flex items-center gap-2 rounded-[8px] border border-border px-3 py-1.5 text-sm">Unit 1 <small className="text-muted">▾</small></div>
        <div className="flex-1" />
        <span className="tnum text-sm text-muted">Fri 30 Oct · {clock(tick, false)} GMT</span>
        <DeployBadge where={where} />
        <ExPill />
        <Who />
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-[176px_minmax(0,1fr)_330px] 2xl:grid-cols-[200px_minmax(0,1fr)_360px]">
        <nav className="flex flex-col gap-1 border-r border-border bg-bg px-3 py-4">
          {(Object.keys(ICONS) as Nav[]).map((n) => (
            <a key={n} className={`flex items-center gap-2.5 rounded-[8px] px-3 py-2 text-sm ${n === active ? "bg-accent-soft font-semibold text-accent-strong" : "font-medium text-muted"}`}>
              <Ic>{ICONS[n]}</Ic>{n}
              {n === "Insights" && insightsCount ? <span className="ml-auto rounded-full bg-fault-dot px-1.5 text-xs text-white">{insightsCount}</span> : null}
            </a>
          ))}
          <div className="flex-1" />
          <div className="mb-2.5 rounded-[10px] bg-surface-2 p-3 text-xs text-muted">One camera per machine. Each camera reads the screen or gauge that is already on the machine.</div>
          <Btn variant="primary" size="block" onClick={() => go(4)}><PlusIc /> Add device</Btn>
        </nav>
        <section className="no-scrollbar min-w-0 overflow-y-auto px-6 py-5">{children}</section>
        <aside className="no-scrollbar flex flex-col gap-3.5 overflow-y-auto border-l border-border bg-bg p-5">{panel}</aside>
      </div>
    </div>
  );
}

/** Mobile app shell: header + scroll body + tab bar. */
export function MobileApp({ active, children }: { active: Nav; children: ReactNode }) {
  const [where] = useDeploy();
  return (
    <div className="absolute inset-0 flex flex-col bg-bg">
      <header className="flex h-[52px] shrink-0 items-center gap-2 border-b border-border px-4">
        <b className="min-w-0 truncate text-[15px] font-semibold tracking-tight">Example Factory Ltd</b><div className="flex-1" /><DeployBadge where={where} short /><ExPill /><Who />
      </header>
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4">{children}</div>
      <nav className="grid h-16 shrink-0 grid-cols-4 items-center border-t border-border bg-bg text-center text-sm">
        {(Object.keys(ICONS) as Nav[]).map((n) => (
          <span key={n} className={`relative py-2 ${n === active ? "font-semibold text-text" : "text-muted"}`}>
            {n === active && <span className="absolute -top-[10px] left-1/2 h-[3px] w-14 -translate-x-1/2 rounded bg-accent" />}{n}
          </span>
        ))}
      </nav>
    </div>
  );
}

export function Seg({ items, value, onChange }: { items: { label: string; tier?: string }[]; value: number; onChange?: (i: number) => void }) {
  return (
    <span className="inline-flex rounded-full border border-border-strong bg-bg p-[3px] text-sm" role="tablist">
      {items.map((it, i) => (
        <button key={it.label} type="button" role="tab" aria-selected={i === value} onClick={() => onChange?.(i)}
          aria-disabled={!onChange && i !== value ? true : undefined} title={!onChange && i !== value ? "Not available in this demo" : undefined}
          className={`whitespace-nowrap rounded-full ${i === value ? "border-[1.5px] border-accent bg-accent-soft px-3 py-[3.5px] font-semibold text-accent-strong" : `px-3.5 py-[5px] text-muted ${onChange ? "hover:bg-surface-2" : "cursor-not-allowed"}`}`}>
          {it.label}{it.tier && <small className="ml-1 text-[10px] opacity-80">{it.tier}</small>}
        </button>
      ))}
    </span>
  );
}

export function Pill({ kind, children }: { kind: "running" | "idle" | "alarm" | "inactive"; children?: ReactNode }) {
  const c = {
    running: "bg-running-soft text-running", idle: "bg-idle-soft text-idle", alarm: "bg-fault-soft text-fault",
    inactive: "bg-inactive-soft text-inactive border border-dashed border-inactive-dot",
  }[kind];
  const icon = { running: "●", idle: "❚❚", alarm: "✕", inactive: "○" }[kind];
  const word = { running: "Running", idle: "Idle", alarm: "Alarm", inactive: "Inactive · no sensor yet" }[kind];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-[3px] text-xs font-semibold ${c}`}>
      <span aria-hidden className={kind === "idle" ? "text-[7px] tracking-[-1.5px]" : "text-[8px]"}>{icon}</span>{children ?? word}
    </span>
  );
}

export function Conf({ v }: { v: number }) {
  const bg = v >= 0.9 ? "bg-cam-high" : v >= 0.7 ? "bg-cam-mid" : "bg-cam-low";
  return <span className={`rounded-[3px] px-[5px] py-[3px] font-mono text-[10px] font-medium leading-none text-white ${bg}`}>{v.toFixed(2)}{v < 0.9 && v >= 0.7 ? " ▲" : v < 0.7 ? " ✕" : ""}</span>;
}

export function Reading({ label, value, conf, small }: { label: string; value: string; conf?: number; small?: boolean }) {
  return (
    <div className={`rounded-[10px] border border-border-strong ${small ? "px-2.5 py-[7px]" : "px-3 py-2.5"}`}>
      <div className="flex items-center justify-between gap-1 text-xs text-muted">{label}{conf !== undefined && <Conf v={conf} />}</div>
      <div className={`reading mt-0.5 font-semibold ${small ? "text-lg" : "text-xl"}`}>{value}</div>
    </div>
  );
}

/** Sticky page header for the Site and Machines views: title, view switch, stats, filter row.
 * It sticks to the top of the scrolling main column (under the app top bar and the demo step bar).
 * z-30: above the plan, its controls and the 3D canvas labels; below the plan tooltips and the detail card (z-40). */
export function StickyHead({ children, compact = false }: { children: ReactNode; compact?: boolean }) {
  return (
    <div data-sticky-head className={`sticky z-30 border-b border-border bg-bg shadow-[0_6px_12px_-10px_rgba(16,24,40,0.35)] ${compact ? "-top-4 -mx-4 -mt-4 mb-3 px-4 pb-2 pt-2.5" : "-top-5 -mx-6 -mt-5 mb-4 px-6 pb-3 pt-4"}`}>
      {children}
    </div>
  );
}
