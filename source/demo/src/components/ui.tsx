import type { ReactNode } from "react";

export type Status = "running" | "idle" | "warning" | "fault" | "offline" | "inactive";

const STATUS: Record<Status, { word: string; icon: string; text: string; soft: string; dot: string }> = {
  running: { word: "Running", icon: "●", text: "text-running", soft: "bg-running-soft", dot: "bg-running-dot" },
  idle: { word: "Idle", icon: "❚❚", text: "text-idle", soft: "bg-idle-soft", dot: "bg-idle-dot" },
  warning: { word: "Warning", icon: "▲", text: "text-warning", soft: "bg-warning-soft", dot: "bg-warning-dot" },
  fault: { word: "Alarm", icon: "✕", text: "text-fault", soft: "bg-fault-soft", dot: "bg-fault-dot" },
  offline: { word: "No signal", icon: "◌", text: "text-offline", soft: "bg-offline-soft", dot: "bg-offline-dot" },
  inactive: { word: "Inactive · no sensor yet", icon: "○", text: "text-inactive", soft: "bg-inactive-soft", dot: "bg-inactive-dot" },
};

/** Every status = icon + word + colour (design system rule). */
export function StatusBadge({ status, word, small }: { status: Status; word?: string; small?: boolean }) {
  const s = STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full ${s.soft} ${s.text} ${small ? "px-1.5 py-0 text-[11px]" : "px-2 py-0.5 text-xs"} font-semibold whitespace-nowrap ${status === "offline" ? "border border-dashed border-offline-dot" : ""}`}>
      <span aria-hidden className={status === "idle" ? "text-[8px] tracking-[-2px]" : "text-[9px]"}>{s.icon}</span>
      {word ?? s.word}
    </span>
  );
}

export function StepBar({ step, of = 4, label }: { step: number; of?: number; label?: string }) {
  return (
    <div>
      <div className="text-[13px] text-faint">{label ?? `Step ${step} of ${of}`}</div>
      <div className="mt-1.5 flex gap-1.5">
        {Array.from({ length: of }, (_, i) => (
          <div key={i} className={`h-[3px] flex-1 rounded-full transition-colors duration-500 ${i < step ? "bg-accent" : "bg-border"}`} />
        ))}
      </div>
    </div>
  );
}

export function Check({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={`h-4 w-4 ${className}`} aria-hidden fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10.5l4 4 8-9" /></svg>
  );
}

export function CamIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-4 w-4 ${className}`} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><rect x="2.5" y="6" width="13" height="12" rx="2" /><path d="M15.5 10.5l6-3.5v10l-6-3.5z" /></svg>
  );
}

export function Chevron({ dir = "down", className = "" }: { dir?: "down" | "right" | "left"; className?: string }) {
  const r = dir === "down" ? 0 : dir === "right" ? -90 : 90;
  return (
    <svg viewBox="0 0 20 20" className={`h-4 w-4 ${className}`} style={{ transform: `rotate(${r}deg)` }} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 7.5l5 5 5-5" /></svg>
  );
}

export function Logo({ className = "h-6" }: { className?: string }) {
  return <img src="brand/logo-light.svg" alt="PanelPal" className={className} />;
}


export function Banner() {
  return (
    <div role="note" className="sticky top-0 z-50 flex items-center justify-center gap-2 border-b border-warning-dot/60 bg-warning-soft px-3 py-1.5 text-center text-[12.5px] font-semibold text-warning">
      <span aria-hidden>▲</span> Demo · example data
      <span className="hidden font-normal text-muted sm:inline">· all names and numbers are made up</span>
    </div>
  );
}

/** Phone frame (desktop). On small screens the app fills the viewport instead. */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto flex h-full w-[390px] max-w-full flex-col overflow-hidden rounded-[44px] border border-border bg-bg shadow-phone md:p-[10px] md:ring-1 md:ring-border">
      <div className="relative flex h-full flex-col overflow-hidden rounded-[34px] border border-border bg-bg">
        <div className="mx-auto mt-2.5 h-6 w-24 shrink-0 rounded-full bg-surface-3" aria-hidden />
        <div className="relative min-h-0 flex-1">{children}</div>
        <div className="mx-auto mb-2 mt-1 h-1 w-28 shrink-0 rounded-full bg-border" aria-hidden />
      </div>
    </div>
  );
}

export function BottomNav({ active }: { active: "Site" | "Machines" | "Insights" | "Settings" | "Live" | "Runs" }) {
  const items = active === "Live" || active === "Runs" ? ["Live", "Runs", "Insights", "Settings"] : ["Site", "Machines", "Insights", "Settings"];
  return (
    <nav className="grid shrink-0 grid-cols-4 border-t border-border bg-bg text-center text-[13px]">
      {items.map((it) => (
        <div key={it} className={`relative py-3 ${it === active ? "font-semibold text-text" : "text-muted"}`}>
          {it === active && <span className="absolute left-1/2 top-0 h-[3px] w-12 -translate-x-1/2 rounded-b bg-accent" />}
          {it}
        </div>
      ))}
    </nav>
  );
}

/** Scrollable app screen body with optional sticky footer. */
export function Screen({ children, footer, className = "" }: { children: ReactNode; footer?: ReactNode; className?: string }) {
  return (
    <div className="absolute inset-0 flex flex-col">
      <div className={`no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-3 ${className}`}>{children}</div>
      {footer && <div className="shrink-0 bg-bg px-5 pb-3 pt-2">{footer}</div>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[10px] border border-border bg-surface ${className}`}>{children}</div>;
}

export function ExampleTag({ className = "" }: { className?: string }) {
  return <span className={`text-[11px] text-faint ${className}`}>Example data</span>;
}

export function LockIc({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return <svg viewBox="0 0 20 20" className={`shrink-0 ${className}`} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="9" width="12" height="8.5" rx="2" /><path d="M7 9V6.5a3 3 0 0 1 6 0V9" /></svg>;
}
export function CloudIc({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return <svg viewBox="0 0 20 20" className={`shrink-0 ${className}`} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M6 15.5a3.5 3.5 0 0 1 .3-7 5 5 0 0 1 9.5 1A3 3 0 0 1 15 15.5z" /></svg>;
}
export function BoxIc({ className = "h-5 w-5" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" className={`shrink-0 ${className}`} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><rect x="3" y="8" width="18" height="9" rx="2.5" /><path d="M6.5 11.5h6M6.5 13.8h6" strokeLinecap="round" /><circle cx="17.3" cy="13" r="1" fill="currentColor" /></svg>;
}

/** Header badge: where the data lives (step 1 choice). Short text on small screens. */
export function DeployBadge({ where, short = false }: { where: "onprem" | "cloud"; short?: boolean }) {
  const on = where === "onprem";
  return (
    <span title={on ? "On-prem: the data stays on a PanelPal computer in your building" : "Cloud: PanelPal runs the server for you"}
      className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${on ? "bg-running-soft text-running" : "bg-accent-soft text-accent-strong"}`}>
      {on ? <LockIc /> : <CloudIc />}{on ? (short ? "On-prem" : "On-prem · data stays on site") : "Cloud"}
    </span>
  );
}
