# Layout notes: suggested moves for `shared/floorplan.ts`

Factory Build owns `shared/floorplan.ts` and its positions. These are only suggestions. Nothing here has been written to that file.
All values use floorplan.ts's own coordinates: metres, origin at the NW outer corner, +x east, +y south.
x,y is the footprint centre and rotation is in degrees clockwise (0 = front faces south).

You can see the result in `plan-layout-suggested-desktop.png`. It was rendered with the component's preview-only
`layoutOverride` prop, so you can try these moves without editing floorplan.ts.

## Why
Today's layout is a grid: a 2×2 block of CNCs and presses and welders in rows. Real shops group machines by flow.
A CNC cell is a U that one operator can walk round, welders sit against a wall behind screens, and parts move
from assembly to packing on a conveyor. Using different angles also makes the 3D view look less like a spreadsheet.

## 1. CNC U-cell (machining zone 8.8–22.4 × 0.8–10.8)
4 mills at 5.2 × 3.6 m cannot form a U inside 13.6 × 10 m (I checked every arrangement for overlaps).
**Suggestion: mill footprint 4.6 × 3.2 m.** That is still realistic for a VMC with its enclosure and chip conveyor.
The U opens east and south onto the cross walkways, with a 2.8 m operator aisle inside.

| id | x | y | w × d | rotation | role |
|---|---|---|---|---|---|
| cnc2 | 10.8 | 5.8 | 4.6 × 3.2 | 270 (faces east) | back of the U |
| cnc1 | 15.1 | 2.8 | 4.6 × 3.2 | 0 (faces south) | north leg |
| cnc4 | 19.9 | 2.8 | 4.6 × 3.2 | 0 | north leg |
| cnc3 | 15.1 | 8.8 | 4.6 × 3.2 | 180 (faces north) | south leg, next to the main walkway, so the demo's camera machine is easy to see |

There is a free slot at about (19.9, 8.8) for a deburr bench or tool cart (a `bench` prop).
If you would rather keep 5.2 × 3.6, the U only fits if the north-cross walkway (x 22.4–23.6) moves 1.2 m east.

## 2. Welding bays against the north wall, presses by the walkway
Welding needs screens and extraction on a wall. Presses take heavy blanks, so they belong next to the forklift aisle.

| id | x | y | rotation |
|---|---|---|---|
| weld1 | 27.4 | 2.6 | 0 |
| weld2 | 34.6 | 2.6 | 0 |
| press1 | 27.4 | 8.4 | 0 |
| press2 | 34.6 | 8.4 | 0 |

These moves stay inside Build's zones. The presses still sit in the `welding` zone. If you want them honest,
rename that zone "Press & weld" (`short: "Press/weld"`) rather than adding a zone.

## 3. Band saw along the stock rack
`saw`: x 6.6, y 7.2, rotation 90. It is 2.4 × 5.6 on the floor, running north–south. Bar stock flows from the
rack (north) through the saw to the walkway (south), and the zone gets a second angle.

## 4. Conveyor from assembly to packing
Packing (x ≤ 8.8) and assembly (x ≥ 20.4) do not touch, because the QC room sits between them. The shortest
believable link is a conveyor along the south edge of the main walkway:
- `conveyor`: x 13.5, y 13.6, w 16.6, d 0.8, rotation 180 (it flows west)
- This leaves 2.0 m of clear walkway. Draw a lift-gate section where it crosses the south-cross walkway (x 19.2–20.4).
- Move `qc-door` to the QC room's east wall (x 19.2, y 16.0–17.6, axis y) so the conveyor does not block it.
  The matching `WALLS` gap moves with it.

## 5. Small touches that help both views
- Robot cell and washer at rotation 180 are fine: they face north towards the walkway.
- A second pallet next to the saw outfeed, and a QC inspection table next to the CMM, would make each zone read
  as a process. (Optional `PROPS`.)
- Keep `FLOW` in step with the conveyor: goods-in → saw → CNC cell → (press/weld) → assembly → conveyor → packing.
