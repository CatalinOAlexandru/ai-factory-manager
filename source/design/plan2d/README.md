# FloorPlan2D: PanelPal 2D floor plan (visual only)

This is a React and SVG top-down view of the same scene as Scene3D. It takes its geometry from `shared/floorplan.ts` (Build owns that file) and its colours from `shared/viz-tokens.ts` (Design owns that file, and the values come from tokens.css). React is the only dependency. Every value shown is example data.

| File | What it is |
|---|---|
| `FloorPlan2D.tsx` | The component. Named and default export `FloorPlan2D`, plus `PLAN_FRAME` geometry helpers |
| `plan2d.css` | All styling, driven by classes. Colours arrive as `--pp-*` variables set on the root `<svg>` |
| `preview.tsx` / `preview.html` / `preview.js` | Preview harness. Use `?mode=layout\|sensorAdded\|final&compact=1&sel=cnc3&suggested=1` |
| `render-plan.mjs` | `node render-plan.mjs` re-renders the PNGs (uses Build's playwright, read only) |
| `plan-*.png` | Renders: desktop at 1200 wide, mobile at 390 wide @2x, and `plan-layout-suggested-desktop.png` (layout-notes moves) |
| `layout-notes.md` | Suggested position moves for floorplan.ts (U-cell, welding on the wall, conveyor) |
| `3D-MATERIALS.md` | How Scene3D uses the same tokens |

## Drop-in (Build already does this through tools/sync-design-assets.sh → `src/plan/visual/`)
Copy `FloorPlan2D.tsx` and `plan2d.css`, then fix the two relative imports to point at `panelpal/shared/` (from `src/plan/visual/` that is `../../../shared/`):
```ts
import "../../plan/visual/plan2d.css";
import { FloorPlan2D, PLAN_FRAME, type PlanMachineState } from "../../plan/visual/FloorPlan2D";
```
`PLAN_FRAME` exports `M`, `VW`, `VH`, `content(rot)`, `toSvg(x, y, rot)` and `fromSvg(sx, sy, rot)`. These are exactly the constants plan.tsx mirrors today, so you can import them instead of copying them. Margins are unchanged: `{ l: 2.6, t: 0.8, r: 0.8, b: 3.0 }`, the same in both orientations.

## Props
```ts
<FloorPlan2D
  machines={PlanMachineState[]}        // { id, name, short?, status, liveValue?, hasSensor }
  mode="layout" | "sensorAdded" | "final"
  selectedId={string | null}
  onSelect={(id) => …}                 // click, tap, Enter or Space
  onHover={(id | null, {x, y}) => …}   // client px for your tooltip; null on leave or blur
  visibleStatuses={VizStatus[]}        // machines whose status is not listed are dimmed
  visibleZones={ZoneId[]}              // other zones fade, and their machines dim
  highlightId={string | null}          // soft highlight, separate from selection
  compact                              // phone: portrait (north points right), minor labels hidden, 0.9 m hit padding
  portrait? showFlow? layoutOverride? className? ariaLabel?
/>
```
- `status` accepts data statuses (`running | idle | alarm | warning | fault | offline | inactive`). `alarm` maps to the visual status `fault`, shown with the word "Alarm".
- The visual status is `null` in `layout` mode, which shows no badges. When `hasSensor` is false the machine shows `notSetUp`: muted and dashed, labelled "Not set up".
- `liveValue` is drawn as a mono chip, for example `8,000 rpm`.
  - Desktop: badge (icon and word) plus a chip.
  - Compact: an icon-only badge. The chip shows only on the selected or highlighted machine, or in sensorAdded mode.
- No pan or zoom happens inside the component. Wrap the `<svg>` (it fills 100% width, and its viewBox is `PLAN_FRAME.content(rot)`).

## Mapping from data.ts and the old plan.tsx
| Old (demo) | New |
|---|---|
| `mode="layout" / "setup" / "live"` | `"layout" / "sensorAdded" / "final"` |
| `selected` | `selectedId` |
| `liveIds.includes(id)` | `hasSensor` (true for every machine in final) |
| `values?.[id] ?? m.primary.value` | `liveValue` |
| `m.name`, `m.short`, `m.status` | `name` ("CMM" for cmm, "Washer" as you like), `short`, `status` |
```ts
const machines = MACHINES.map((m) => ({ id: m.id, name: m.name, short: m.short, status: m.status,
  liveValue: values?.[m.id] ?? m.primary.value, hasSensor: mode === "final" || liveIds.includes(m.id) }));
```

## DOM contract (for tests and Build's overlays)
- Each machine is a `<g class="pp-machine kind-<type> is-<status>|is-layout [is-selected] [is-highlight] [is-dimmed]">`.
- It carries `data-machine-id`, `data-status` and `data-zone`, plus `role="button"`, `tabIndex=0`, `aria-label` ("CNC mill 3, Running, 8,000 rpm") and `aria-pressed`.
- `.pp-hit` is the invisible hit rect. Annotations (`.pp-annotations`) have `pointer-events: none`.
- A fault pulses its ring. This respects `prefers-reduced-motion`.
- Silhouette kinds come from `Placed.type`: cnc-mill, cnc-lathe, welder, press, conveyor, compressor, bandsaw, washer, cmm and robot-cell.
