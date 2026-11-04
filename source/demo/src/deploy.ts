import { useSyncExternalStore } from "react";

/** Where the customer's data lives. Chosen on step 1; shown in the app header on every dashboard screen.
 * 4 Nov (Catalin): on-prem is the default, because customers keep production numbers private. */
export type Deploy = "onprem" | "cloud";

const KEY = "pp-deploy";
let value: Deploy = "onprem";
try { const v = window.sessionStorage.getItem(KEY); if (v === "onprem" || v === "cloud") value = v; } catch { /* storage blocked: keep the default */ }
const subs = new Set<() => void>();

export function setDeploy(v: Deploy) {
  value = v;
  try { window.sessionStorage.setItem(KEY, v); } catch { /* storage blocked */ }
  subs.forEach((f) => f());
}

export function useDeploy(): [Deploy, (v: Deploy) => void] {
  const v = useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => value, () => value);
  return [v, setDeploy];
}
