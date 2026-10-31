# 3D materials: one palette for 2D and 3D

All values live in **`shared/viz-tokens.ts`**, derived from `design/tokens.css`. Import them rather than copying hexes.
```ts
import { STATUS, ZONE, PLAN, MATERIALS_3D, LIGHTING_3D, toVizStatus } from "../../shared/viz-tokens";
```

- **Status:** `STATUS[toVizStatus(m.status)]`.
  - Use `.dot` for the emissive status ring under each machine, `.intensity` for emissive strength, and `.soft` for the floor halo decal.
  - `fault` pulses (`pulse: true`). `inactive` and `notSetUp` are dashed in 2D, so in 3D use `MATERIALS_3D.notSetUp` (opacity 0.55, desaturated) and no ring glow.
- **Floor and zones:** `MATERIALS_3D.floor` is a matte concrete. Zones are flat decals using `ZONE[id].fill` plus a thin `ZONE[id].edge` outline, about 2 mm above the floor to avoid z-fighting.
  - Walkways use `PLAN.walkway` yellow edge lines and a `walkwayFill` base. The cross walkways get the same hatch as 2D, so a canvas texture or decal is fine.
- **Walls:** `MATERIALS_3D.wall` uses `PLAN.wall`. Cut them away at `height: 1.2` (not `FLOOR.wallHeight`) in the default view so the 2D poché and the 3D wall top read the same. Doors use `MATERIALS_3D.door` and `dockDoor`.
- **Machines:** `machineBody` (white satin, roughness 0.55, metalness 0.1), `machineTrim` (grey edge) and `machineDark` (pendants, bases). Use `glass` for CNC windows, `weldScreen` for orange welding curtains and `fence` for the yellow robot-cell guard.
  - Silhouette kinds match your 3D types: cnc-mill, cnc-lathe, welder, press, conveyor, compressor, bandsaw, washer, cmm, plus robot-cell.
- **Selected / highlight:** `MATERIALS_3D.selected` is the accent blue outline/ring (same as the 2D `--pp-selected`). `highlight` is the lighter blue, dashed in 2D.
- **Camera marker:** `MATERIALS_3D.camera`, a small blue box on the machine's front-right corner, shown where `hasSensor` is true.
- **Lighting:** `LIGHTING_3D` covers ambient 0.55, hemisphere sky/ground, one key light with soft shadows and a contact-shadow plane, ACES Filmic tone mapping, and a camera at fov 35 / elevation 52° / azimuth 35°.
  - Looking straight down (elevation 90°), the scene should match `plan-final-desktop.png`.
- **Labels and chips:** render them as HTML overlays (drei `<Html>`) using `LABEL.badge` / `LABEL.chip`, so 2D and 3D chips look identical: white pill, 1 px `#d8d8d4` border, mono value, and a status pill with icon and word. Mark every value "Example data" in the surrounding UI.
