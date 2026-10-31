// Preview harness (not shipped). Reads example machines from the demo's data.ts (read only).
import { createRoot } from "react-dom/client";
import { useState } from "react";
import { MACHINES, TARGET_ID } from "../../demo/src/data";
import { FloorPlan2D, type PlanMode, type PlanMachineState } from "./FloorPlan2D";

const q = new URLSearchParams(location.search);
const mode = (q.get("mode") ?? "final") as PlanMode;
const compact = q.get("compact") === "1";
// Suggested moves from layout-notes.md (preview only; Build owns floorplan.ts).
const SUGGESTED = {
  cnc2: { x: 10.8, y: 5.8, w: 4.6, d: 3.2, rotation: 270 },
  cnc1: { x: 15.1, y: 2.8, w: 4.6, d: 3.2, rotation: 0 },
  cnc4: { x: 19.9, y: 2.8, w: 4.6, d: 3.2, rotation: 0 },
  cnc3: { x: 15.1, y: 8.8, w: 4.6, d: 3.2, rotation: 180 },
  weld1: { x: 27.4, y: 2.6 }, weld2: { x: 34.6, y: 2.6 },
  press1: { x: 27.4, y: 8.4 }, press2: { x: 34.6, y: 8.4 },
  saw: { x: 6.6, y: 7.2, rotation: 90 },
  conveyor: { x: 13.5, y: 13.6, w: 16.6, d: 0.8, rotation: 180 },
};
const suggested = q.get("suggested") === "1";

function machinesFor(mode: PlanMode): PlanMachineState[] {
  return MACHINES.map((m) => ({
    id: m.id, name: m.id === "cmm" ? "CMM" : m.name, short: m.short, status: m.status,
    liveValue: m.primary.value,
    hasSensor: mode === "final" || (mode === "sensorAdded" && m.id === TARGET_ID),
  }));
}

function App() {
  const [sel, setSel] = useState<string | null>(q.get("sel") ?? (mode === "final" ? null : TARGET_ID));
  const [hover, setHover] = useState<string | null>(null);
  return <div className="wrap">
    <FloorPlan2D machines={machinesFor(mode)} mode={mode} compact={compact} selectedId={sel} onSelect={setSel}
      onHover={(id) => setHover(id)} highlightId={hover} layoutOverride={suggested ? SUGGESTED : undefined} />
  </div>;
}
createRoot(document.getElementById("root")!).render(<App />);
