import { createContext, useContext, useEffect, useState } from "react";

export interface DemoApi {
  step: number;
  stage: number;
  next: () => void;
  back: () => void;
  go: (step: number, stage?: number) => void;
  setStage: (s: number) => void;
}
export const DemoCtx = createContext<DemoApi>(null as unknown as DemoApi);
export const useDemo = () => useContext(DemoCtx);

/** Deterministic ticker: 0, 1, 2 ... every `ms`. Restarts when the component mounts. */
/** "?still" in the URL hash stops all live ticks (used for the site hero screenshot). */
const STILL = typeof window !== "undefined" && /[?&]still\b/.test(window.location.hash);

export function useTick(ms = 1000, start = 0) {
  const [t, setT] = useState(start);
  useEffect(() => {
    if (STILL) return;
    const id = setInterval(() => setT((x) => x + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
  return t;
}
