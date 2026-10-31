/**
 * 3D view of the example site: low-poly machines built from primitives (no external models).
 * Layout in metres from shared/floorplan.ts (3D x = plan x, 3D z = plan y). Colours from shared/viz-tokens.ts.
 * Low GPU cost: one shared box and cylinder geometry, shared materials, no shadow maps, render on demand.
 * Status = stack light + floor ring, never a colour over the whole machine. All data is example data.
 */
import { Canvas, useThree, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Html, OrbitControls } from "@react-three/drei";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitImpl } from "three-stdlib";
import { DOORS, EQUIPMENT, FLOOR, FLOW, LOADING_BAY, PROPS, WALKWAYS, WALLS, ZONES, type MachineType, type Placed, type ZoneId } from "../../../shared/floorplan";
import { LABEL, LIGHTING_3D, MATERIALS_3D, PLAN, STATUS, ZONE, type DashStatus } from "../viz";
import { DEFAULT_FRAMING, getFraming, onFramingCommand, setFraming, type PlanMachine, type PlanMode } from "./floor/model";
import { MachineTip } from "./floor/parts";

/* ---------------- shared geometry + materials ---------------- */
const BOX = new THREE.BoxGeometry(1, 1, 1);
const CYL = new THREE.CylinderGeometry(0.5, 0.5, 1, 12);
const PLANE = new THREE.PlaneGeometry(1, 1);
type MatKey = "body" | "trim" | "dark" | "glass" | "weldScreen" | "fence" | "fixture" | "camera" | "screen" | "steel" | "granite" | "robot" | "wood" | "carton" | "rack" | "beam" | "belt" | "green" | "red" | "wallSide" | "wallTop" | "doorPost" | "shutter" | "mesh" | "lampOff";
const SPEC: Record<MatKey, THREE.MeshStandardMaterialParameters> = {
  body: MATERIALS_3D.machineBody, trim: MATERIALS_3D.machineTrim, dark: MATERIALS_3D.machineDark,
  glass: { ...MATERIALS_3D.glass, depthWrite: false }, weldScreen: { ...MATERIALS_3D.weldScreen, depthWrite: false, side: THREE.DoubleSide },
  fence: MATERIALS_3D.fence, fixture: MATERIALS_3D.fixture, camera: MATERIALS_3D.camera,
  screen: { color: "#1b2a3a", emissive: "#6fb3e6", emissiveIntensity: 0.55, roughness: 0.3 },
  steel: { color: "#a9adb2", roughness: 0.4, metalness: 0.6 }, granite: { color: "#5d6168", roughness: 0.7 },
  robot: { color: "#e98a1f", roughness: 0.5, metalness: 0.1 }, wood: { color: "#c9a46a", roughness: 0.9 },
  carton: { color: "#d9b98a", roughness: 0.95 }, rack: { color: "#2f5d8a", roughness: 0.6, metalness: 0.3 },
  beam: { color: "#e07a1f", roughness: 0.6, metalness: 0.3 }, belt: { color: "#3a3f46", roughness: 0.8 },
  green: { color: "#5f7f6a", roughness: 0.6, metalness: 0.2 }, red: { color: "#d03b3b", roughness: 0.5 },
  wallSide: { color: MATERIALS_3D.wall.color, roughness: MATERIALS_3D.wall.roughness }, wallTop: { color: MATERIALS_3D.wall.topColor, roughness: 0.8 },
  doorPost: { color: PLAN.walkway, roughness: 0.6 }, shutter: MATERIALS_3D.dockDoor,
  mesh: { color: "#2a2f36", transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide }, lampOff: { color: "#d8d8d4", roughness: 0.5 },
};
const cache = new Map<string, THREE.Material>();
function material(key: MatKey, variant: "" | "faded" | "ghost") {
  const id = key + variant;
  let m = cache.get(id);
  if (!m) {
    const s = { ...SPEC[key] } as THREE.MeshStandardMaterialParameters;
    if (variant) { s.transparent = true; s.opacity = (s.opacity ?? 1) * (variant === "ghost" ? 0.22 : MATERIALS_3D.notSetUp.bodyOpacity); s.depthWrite = false; }
    m = new THREE.MeshStandardMaterial(s); cache.set(id, m);
  }
  return m;
}
function flat(color: string, opacity = 1, emissive?: string, ei = 0) {
  const id = `flat${color}${opacity}${emissive}${ei}`;
  let m = cache.get(id);
  if (!m) { m = new THREE.MeshStandardMaterial({ color, roughness: 0.9, transparent: opacity < 1, opacity, depthWrite: opacity >= 1, emissive: emissive ?? "#000", emissiveIntensity: ei }); cache.set(id, m); }
  return m;
}
const Variant = createContext<"" | "faded" | "ghost">("");
type V3 = [number, number, number];
/** Box: centre p, size s. */
function B({ p, s, m, r }: { p: V3; s: V3; m: MatKey; r?: V3 }) {
  const v = useContext(Variant);
  return <mesh geometry={BOX} material={material(m, v)} position={p} scale={s} rotation={r} />;
}
/** Cylinder: centre p, radius, length, axis. */
function C({ p, r, l, m, axis = "y" }: { p: V3; r: number; l: number; m: MatKey; axis?: "x" | "y" | "z" }) {
  const v = useContext(Variant);
  const rot: V3 = axis === "x" ? [0, 0, Math.PI / 2] : axis === "z" ? [Math.PI / 2, 0, 0] : [0, 0, 0];
  return <mesh geometry={CYL} material={material(m, v)} position={p} rotation={rot} scale={[r * 2, l, r * 2]} />;
}

/* ---------------- machine models (local: centred, w along x, d along z, front = +z) ---------------- */
function StackLight({ p, status }: { p: V3; status: DashStatus | null }) {
  const col = status && status !== "notSetUp" ? STATUS[status] : null;
  return (
    <group position={p}>
      <C p={[0, 0.25, 0]} r={0.03} l={0.5} m="steel" />
      <mesh geometry={CYL} position={[0, 0.62, 0]} scale={[0.2, 0.26, 0.2]} material={col ? flat(col.dot, 1, col.emissive, col.emissiveIntensity * 1.6) : material("lampOff", "")} />
      <C p={[0, 0.78, 0]} r={0.1} l={0.05} m="dark" />
    </group>
  );
}
function Cam({ p, live }: { p: V3; live: boolean }) {
  return (
    <group position={p}>
      <mesh geometry={BOX} scale={[0.16, 0.2, 0.14]} material={live ? material("camera", "") : flat("#ffffff", 1, PLAN.camera, 0.15)} />
      <C p={[0, -0.16, 0]} r={0.025} l={0.14} m="dark" />
    </group>
  );
}

function Model({ type, w, d }: { type: MachineType; w: number; d: number }): ReactNode {
  switch (type) {
    case "cnc-mill": {
      const bx = w * 0.06, bw = w * 0.72, bd = d * 0.78, bz = -d * 0.06, fz = bz + bd / 2;
      return <>
        <B p={[bx, 0.1, bz]} s={[bw + 0.1, 0.2, bd + 0.1]} m="dark" />
        <B p={[bx, 1.25, bz]} s={[bw, 2.1, bd]} m="body" />
        <B p={[bx, 2.36, bz]} s={[bw + 0.06, 0.12, bd + 0.06]} m="trim" />
        <B p={[bx - bw * 0.06, 1.3, fz + 0.03]} s={[bw * 0.62, 1.55, 0.06]} m="trim" />
        <B p={[bx - bw * 0.06, 1.4, fz + 0.07]} s={[bw * 0.48, 0.9, 0.02]} m="glass" />
        <B p={[bx + bw * 0.2, 1.35, fz + 0.09]} s={[0.05, 0.5, 0.05]} m="dark" />
        <B p={[bx, 0.45, fz + 0.04]} s={[bw * 0.9, 0.5, 0.04]} m="dark" />
        {/* chip conveyor at the left, rising to a bin */}
        <B p={[-w / 2 + w * 0.08, 0.55, -d * 0.12]} s={[w * 0.14, 0.9, d * 0.42]} m="trim" />
        <B p={[-w / 2 + w * 0.08, 0.3, d * 0.2]} s={[w * 0.14, 0.6, d * 0.22]} m="steel" />
        {/* coolant tank at the back */}
        <B p={[bx + bw * 0.2, 0.3, -d / 2 + 0.12]} s={[bw * 0.4, 0.5, 0.22]} m="trim" />
        {/* control panel on a swing arm at the front right */}
        <B p={[bx + bw / 2 + 0.05, 2.0, fz - 0.1]} s={[0.1, 0.1, 0.4]} m="steel" />
        <C p={[bx + bw / 2 + 0.05, 1.9, fz + 0.1]} r={0.04} l={0.25} m="steel" />
        <B p={[bx + bw / 2 + 0.05, 1.45, fz + 0.18]} s={[0.55, 0.8, 0.12]} m="dark" />
        <B p={[bx + bw / 2 + 0.05, 1.58, fz + 0.245]} s={[0.4, 0.32, 0.01]} m="screen" />
      </>;
    }
    case "cnc-lathe": {
      const bw = w * 0.84, bd = d * 0.7;
      return <>
        <B p={[0, 0.15, 0]} s={[bw + 0.1, 0.3, bd + 0.1]} m="dark" />
        <B p={[0, 1.1, 0]} s={[bw, 1.6, bd]} m="body" />
        <B p={[-bw * 0.1, 1.15, bd / 2 + 0.03]} s={[bw * 0.55, 1.0, 0.04]} m="glass" />
        <B p={[bw / 2 - 0.35, 1.3, bd / 2 + 0.1]} s={[0.5, 0.75, 0.12]} m="dark" />
        <B p={[bw / 2 - 0.35, 1.42, bd / 2 + 0.165]} s={[0.36, 0.3, 0.01]} m="screen" />
      </>;
    }
    case "press": {
      const fw = w * 0.62, fd = d * 0.6, z = -d * 0.08;
      return <>
        <B p={[0, 0.45, z]} s={[fw, 0.9, fd]} m="green" />
        <B p={[0, 0.95, z]} s={[fw * 0.8, 0.1, fd * 0.8]} m="steel" />
        {[-1, 1].map((sx) => [-1, 1].map((sz) => <B key={`${sx}${sz}`} p={[sx * (fw / 2 - 0.2), 2.1, z + sz * (fd / 2 - 0.2)]} s={[0.4, 2.4, 0.4]} m="green" />))}
        <B p={[0, 3.55, z]} s={[fw + 0.1, 0.9, fd + 0.1]} m="green" />
        <B p={[0, 2.35, z]} s={[fw * 0.6, 0.5, fd * 0.6]} m="steel" />
        <C p={[0, 2.95, z]} r={0.18} l={0.7} m="steel" />
        <B p={[fw * 0.25, 4.15, z - fd * 0.15]} s={[fw * 0.4, 0.3, fd * 0.4]} m="dark" />
        {/* light curtain posts + two-hand station at the front */}
        {[-1, 1].map((sx) => <B key={sx} p={[sx * fw * 0.36, 0.9, z + fd / 2 + 0.15]} s={[0.08, 1.8, 0.08]} m="fence" />)}
        <C p={[0, 0.5, d / 2 - 0.15]} r={0.05} l={1.0} m="steel" />
        <B p={[0, 1.05, d / 2 - 0.15]} s={[1.0, 0.18, 0.28]} m="dark" />
        {[-0.3, 0.3].map((x) => <C key={x} p={[x, 1.16, d / 2 - 0.15]} r={0.06} l={0.05} m="red" />)}
      </>;
    }
    case "welder": {
      const h = 1.9;
      return <>
        {/* weld screens on three sides, open at the front */}
        <B p={[0, h / 2 + 0.1, -d / 2 + 0.03]} s={[w, h, 0.03]} m="weldScreen" />
        {[-1, 1].map((sx) => <B key={sx} p={[sx * (w / 2 - 0.03), h / 2 + 0.1, -d * 0.04]} s={[0.03, h, d * 0.88]} m="weldScreen" />)}
        <B p={[0, h + 0.12, -d / 2 + 0.03]} s={[w, 0.05, 0.05]} m="steel" />
        {[-1, 1].map((sx) => <B key={`r${sx}`} p={[sx * (w / 2 - 0.03), h + 0.12, -d * 0.04]} s={[0.05, 0.05, d * 0.88]} m="steel" />)}
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => <B key={`p${sx}${sz}`} p={[sx * (w / 2 - 0.03), (h + 0.15) / 2, sz < 0 ? -d / 2 + 0.03 : d * 0.4]} s={[0.05, h + 0.15, 0.05]} m="steel" />)}
        {/* weld table with a fixture */}
        <B p={[0, 0.88, -d * 0.06]} s={[w * 0.42, 0.08, d * 0.32]} m="dark" />
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => <B key={`l${sx}${sz}`} p={[sx * w * 0.19, 0.42, -d * 0.06 + sz * d * 0.13]} s={[0.07, 0.84, 0.07]} m="dark" />)}
        <B p={[0, 1.0, -d * 0.06]} s={[w * 0.25, 0.16, 0.2]} m="steel" />
        {/* welder cart: power source, wire feeder, gas bottle */}
        <B p={[-w * 0.32, 0.45, -d * 0.25]} s={[0.6, 0.7, 0.9]} m="body" />
        <B p={[-w * 0.32, 0.52, -d * 0.25 + 0.455]} s={[0.36, 0.14, 0.01]} m="screen" />
        <B p={[-w * 0.32, 0.97, -d * 0.25]} s={[0.45, 0.32, 0.6]} m="trim" />
        <C p={[-w * 0.32 - 0.4, 0.75, -d * 0.25 - 0.2]} r={0.12} l={1.4} m="green" />
        {/* fume extraction arm */}
        <C p={[w * 0.33, 1.2, -d * 0.3]} r={0.07} l={2.4} m="steel" />
        <B p={[w * 0.16, 2.25, -d * 0.18]} s={[1.2, 0.14, 0.14]} m="steel" r={[0, 0.5, -0.35]} />
      </>;
    }
    case "robot-cell": {
      const fh = 2.0, g = Math.min(1.4, w * 0.25);
      const posts: V3[] = [[-w / 2, 0, -d / 2], [0, 0, -d / 2], [w / 2, 0, -d / 2], [-w / 2, 0, 0], [w / 2, 0, 0], [-w / 2, 0, d / 2], [w / 2, 0, d / 2], [-g / 2, 0, d / 2], [g / 2, 0, d / 2]];
      return <>
        {posts.map(([x, , z], i) => <B key={i} p={[x, fh / 2, z]} s={[0.07, fh, 0.07]} m="fence" />)}
        <B p={[0, fh / 2 + 0.1, -d / 2]} s={[w, fh - 0.2, 0.02]} m="mesh" />
        {[-1, 1].map((sx) => <B key={sx} p={[sx * w / 2, fh / 2 + 0.1, 0]} s={[0.02, fh - 0.2, d]} m="mesh" />)}
        {[-1, 1].map((sx) => <B key={`f${sx}`} p={[sx * (w / 2 + g / 2) / 2, fh / 2 + 0.1, d / 2]} s={[(w - g) / 2, fh - 0.2, 0.02]} m="mesh" />)}
        {/* robot arm */}
        <group position={[-w * 0.1, 0, -d * 0.05]}>
          <C p={[0, 0.2, 0]} r={0.4} l={0.4} m="dark" />
          <C p={[0, 0.55, 0]} r={0.3} l={0.3} m="robot" />
          <B p={[0.2, 1.25, 0.1]} s={[0.26, 1.4, 0.3]} m="robot" r={[0.25, 0, -0.3]} />
          <B p={[0.75, 1.9, 0.35]} s={[1.3, 0.22, 0.24]} m="robot" r={[0, -0.4, -0.35]} />
          <C p={[1.3, 1.62, 0.6]} r={0.08} l={0.35} m="dark" />
        </group>
        {/* turntable with a part, controller cabinet with its screen */}
        <C p={[w * 0.26, 0.45, d * 0.16]} r={Math.min(w, d) * 0.15} l={0.12} m="steel" />
        <C p={[w * 0.26, 0.2, d * 0.16]} r={0.15} l={0.4} m="dark" />
        <B p={[w * 0.26, 0.62, d * 0.16]} s={[0.4, 0.22, 0.3]} m="trim" />
        <B p={[-w / 2 + w * 0.12, 0.85, d / 2 - 0.55]} s={[0.7, 1.7, 0.6]} m="dark" />
        <B p={[-w / 2 + w * 0.12, 1.3, d / 2 - 0.245]} s={[0.4, 0.28, 0.01]} m="screen" />
      </>;
    }
    case "bandsaw": {
      const n = Math.max(4, Math.round(w / 0.5));
      return <>
        {/* infeed + outfeed roller tables */}
        {[-1, 1].map((sz) => <B key={sz} p={[0, 0.8, sz * d * 0.16]} s={[w, 0.08, 0.06]} m="steel" />)}
        {Array.from({ length: n }, (_, i) => <C key={i} p={[-w / 2 + 0.2 + (i * (w - 0.4)) / (n - 1), 0.85, 0]} r={0.05} l={d * 0.32} m="steel" axis="z" />)}
        {[-0.45, -0.25, 0.25, 0.45].map((f) => <B key={f} p={[f * w, 0.4, 0]} s={[0.06, 0.8, d * 0.3]} m="dark" />)}
        {/* saw base and head with two wheels */}
        <B p={[0, 0.45, 0]} s={[w * 0.3, 0.9, d * 0.8]} m="body" />
        <B p={[0, 1.45, -d * 0.12]} s={[w * 0.32, 0.55, d * 0.42]} m="body" r={[0.12, 0, 0]} />
        {[-1, 1].map((sx) => <C key={sx} p={[sx * w * 0.09, 1.45, -d * 0.12 + d * 0.22]} r={0.24} l={0.06} m="trim" axis="z" />)}
        <B p={[w * 0.21, 1.1, d * 0.3]} s={[0.3, 0.5, 0.2]} m="dark" />
        <B p={[w * 0.21, 1.15, d * 0.3 + 0.105]} s={[0.2, 0.14, 0.01]} m="screen" />
      </>;
    }
    case "washer":
      return <>
        <B p={[0, 0.8, 0]} s={[w * 0.9, 1.6, d * 0.8]} m="body" />
        <B p={[0, 1.65, -d * 0.05]} s={[w * 0.6, 0.12, d * 0.6]} m="trim" r={[-0.15, 0, 0]} />
        <B p={[0, 0.85, d * 0.4 + 0.02]} s={[w * 0.4, 0.9, 0.04]} m="trim" />
        <C p={[0, 2.1, -d * 0.3]} r={0.14} l={1.0} m="steel" />
        <B p={[w * 0.3, 1.2, d * 0.4 + 0.06]} s={[0.5, 0.6, 0.12]} m="dark" />
        <B p={[w * 0.3, 1.28, d * 0.4 + 0.125]} s={[0.34, 0.2, 0.01]} m="screen" />
      </>;
    case "cmm":
      return <>
        <B p={[0, 0.3, -d * 0.05]} s={[w * 0.8, 0.6, d * 0.6]} m="dark" />
        <B p={[0, 0.8, -d * 0.05]} s={[w * 0.9, 0.4, d * 0.75]} m="granite" />
        {[-1, 1].map((sx) => <B key={sx} p={[sx * w * 0.4, 1.6, -d * 0.12]} s={[0.18, 1.2, 0.3]} m="body" />)}
        <B p={[0, 2.25, -d * 0.12]} s={[w * 0.86, 0.22, 0.32]} m="body" />
        <B p={[w * 0.05, 1.85, -d * 0.12 + 0.2]} s={[0.22, 0.9, 0.16]} m="trim" />
        <C p={[w * 0.05, 1.3, -d * 0.12 + 0.2]} r={0.03} l={0.2} m="steel" />
        <B p={[-w * 0.15, 1.08, d * 0.02]} s={[0.4, 0.16, 0.3]} m="steel" />
        {/* PC desk with a monitor */}
        <B p={[w * 0.3, 0.75, d / 2 - 0.3]} s={[1.2, 0.05, 0.5]} m="fixture" />
        <B p={[w * 0.3, 0.37, d / 2 - 0.3]} s={[1.1, 0.74, 0.04]} m="trim" />
        <B p={[w * 0.3, 1.05, d / 2 - 0.42]} s={[0.55, 0.35, 0.04]} m="dark" />
        <B p={[w * 0.3, 1.05, d / 2 - 0.4]} s={[0.48, 0.28, 0.01]} m="screen" />
      </>;
    case "conveyor": {
      const n = Math.floor(w / 0.25);
      return <>
        {Array.from({ length: n }, (_, i) => <C key={i} p={[-w / 2 + 0.15 + i * ((w - 0.3) / (n - 1)), 0.82, 0]} r={0.045} l={d * 0.8} m="steel" axis="z" />)}
        {[-1, 1].map((sz) => <B key={sz} p={[0, 0.85, sz * d * 0.42]} s={[w, 0.14, 0.05]} m="trim" />)}
        {(() => { const k = Math.max(2, Math.round(w / 1.6)); return Array.from({ length: k + 1 }, (_, i) => [-1, 1].map((sz) => (
          <B key={`${i}${sz}`} p={[-w / 2 + 0.15 + (i * (w - 0.3)) / k, 0.4, sz * d * 0.42]} s={[0.06, 0.8, 0.06]} m="dark" />))); })()}
        <B p={[w * 0.1, 0.98, 0]} s={[0.6, 0.25, 0.5]} m="carton" />
      </>;
    }
    case "compressor":
      return <>
        {[-1, 1].map((sx) => <B key={sx} p={[sx * w * 0.32, 0.12, 0]} s={[0.12, 0.24, d * 0.5]} m="dark" />)}
        <C p={[0, 0.62, 0]} r={Math.min(0.5, d * 0.25)} l={w * 0.9} m="body" axis="x" />
        <B p={[w * 0.05, 1.35, 0]} s={[w * 0.6, 0.7, d * 0.45]} m="trim" />
        <C p={[-w * 0.1, 1.35, d * 0.23]} r={0.22} l={0.03} m="dark" axis="z" />
        <C p={[w * 0.4, 0.62, d * 0.3]} r={0.05} l={0.4} m="steel" axis="z" />
      </>;
  }
}

/** Height of each model, for the label and the stack light. */
const H: Record<MachineType, number> = { "cnc-mill": 2.45, "cnc-lathe": 1.9, press: 4.3, welder: 2.1, "robot-cell": 2.2, bandsaw: 1.9, washer: 1.75, cmm: 2.4, conveyor: 1.1, compressor: 1.7 };
const LIGHT_AT: Partial<Record<MachineType, (w: number, d: number) => V3>> = {
  "cnc-mill": (w, d) => [w * 0.06 + w * 0.3, 2.42, -d * 0.3], press: (w, d) => [w * 0.25, 4.0, d * 0.05],
  welder: (w, d) => [-w * 0.32, 1.13, -d * 0.4], "robot-cell": (w, d) => [-w / 2 + w * 0.12, 1.7, d / 2 - 0.65],
  bandsaw: (w, d) => [w * 0.21, 1.35, d * 0.25], washer: (w, d) => [w * 0.35, 1.6, -d * 0.2], cmm: (w, d) => [w * 0.4, 2.36, -d * 0.12],
};
const CAM_AT: Partial<Record<MachineType, (w: number, d: number) => V3>> = {
  "cnc-mill": (w, d) => [w * 0.06 + w * 0.36 + 0.05, 1.18, d * 0.33 + 0.55], press: (_w, d) => [0.75, 1.25, d / 2 + 0.05],
  welder: (w, d) => [-w * 0.32, 0.75, -d * 0.25 + 0.8], "robot-cell": (w, d) => [-w / 2 + w * 0.12, 1.05, d / 2 + 0.15],
  bandsaw: (w, d) => [w * 0.21, 0.85, d * 0.3 + 0.4], washer: (w, d) => [w * 0.3, 0.9, d * 0.4 + 0.4], cmm: (w, d) => [w * 0.3 + 0.45, 0.9, d / 2 - 0.05],
};

/** Status ring on the floor round the footprint (dashed when not set up). */
function Ring({ w, d, status, selected }: { w: number; d: number; status: DashStatus | null; selected: boolean }) {
  const pad = MATERIALS_3D.statusRing.innerPad, t = selected ? MATERIALS_3D.selected.ringWidth : MATERIALS_3D.statusRing.width, y = 0.012;
  const col = selected ? PLAN.selected : status ? STATUS[status].dot : null;
  if (!col) return null;
  const mat = flat(col, 1, status && !selected ? STATUS[status].emissive : PLAN.selected, status && !selected ? STATUS[status].emissiveIntensity * 0.6 : 0.3);
  const W = w + 2 * pad, D = d + 2 * pad;
  const dashed = !selected && status === "notSetUp";
  const sides: [number, number, number, number][] = [[0, -D / 2, W, t], [0, D / 2, W, t], [-W / 2, 0, t, D], [W / 2, 0, t, D]];
  if (!dashed) return <>{sides.map(([x, z, sw, sd], i) => <mesh key={i} geometry={BOX} material={mat} position={[x, y, z]} scale={[sw, 0.01, sd]} />)}</>;
  const dash = MATERIALS_3D.notSetUp.dashSize * 1.4, gap = MATERIALS_3D.notSetUp.gapSize * 1.4, out: ReactNode[] = [];
  sides.forEach(([x, z, sw, sd], i) => {
    const horiz = sw > sd, len = horiz ? sw : sd, n = Math.floor(len / (dash + gap));
    for (let k = 0; k < n; k++) {
      const o = -len / 2 + (k + 0.5) * (len / n);
      out.push(<mesh key={`${i}-${k}`} geometry={BOX} material={mat} position={horiz ? [x + o, y, z] : [x, y, z + o]} scale={horiz ? [dash, 0.01, t] : [t, 0.01, dash]} />);
    }
  });
  return <>{out}</>;
}

/* ---------------- building ---------------- */
function FloorAndBuilding() {
  const W = FLOOR.width, D = FLOOR.depth, wh = MATERIALS_3D.wall.height;
  return <>
    <mesh geometry={PLANE} rotation={[-Math.PI / 2, 0, 0]} position={[W / 2, -0.01, D / 2]} scale={[W + 16, D + 12, 1]} material={flat(LIGHTING_3D.background)} />
    <mesh geometry={PLANE} rotation={[-Math.PI / 2, 0, 0]} position={[-1.2, -0.005, LOADING_BAY.y + LOADING_BAY.d / 2]} scale={[2.4, LOADING_BAY.d + 2.4, 1]} material={flat(PLAN.apron)} />
    <mesh geometry={PLANE} rotation={[-Math.PI / 2, 0, 0]} position={[W / 2, 0, D / 2]} scale={[W, D, 1]} material={flat(PLAN.floor)} />
    {ZONES.map((z) => <mesh key={z.id} geometry={PLANE} rotation={[-Math.PI / 2, 0, 0]} position={[z.x + z.w / 2, 0.002, z.y + z.d / 2]} scale={[z.w, z.d, 1]} material={flat(ZONE[z.id].fill)} />)}
    {WALKWAYS.map((a) => {
      const h = a.w >= a.d, lw = MATERIALS_3D.walkway.lineWidth;
      return <group key={a.id}>
        <mesh geometry={PLANE} rotation={[-Math.PI / 2, 0, 0]} position={[a.x + a.w / 2, 0.003, a.y + a.d / 2]} scale={[a.w, a.d, 1]} material={flat(PLAN.walkwayFill)} />
        {(h ? [[a.x + a.w / 2, a.y + 0.05, a.w, lw], [a.x + a.w / 2, a.y + a.d - 0.05, a.w, lw]] : [[a.x + 0.05, a.y + a.d / 2, lw, a.d], [a.x + a.w - 0.05, a.y + a.d / 2, lw, a.d]]).map(([x, z, sw, sd], i) => (
          <mesh key={i} geometry={PLANE} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.005, z]} scale={[sw, sd, 1]} material={flat(PLAN.walkway)} />))}
      </group>;
    })}
    {/* loading bay stripe + process flow on the walkway */}
    <mesh geometry={PLANE} rotation={[-Math.PI / 2, 0, 0]} position={[LOADING_BAY.x + LOADING_BAY.w / 2, 0.004, LOADING_BAY.y + LOADING_BAY.d / 2]} scale={[LOADING_BAY.w, LOADING_BAY.d, 1]} material={flat("#fdf6d8")} />
    {FLOW.slice(1).map(([x2, z2], i) => {
      const [x1, z1] = FLOW[i], len = Math.hypot(x2 - x1, z2 - z1), ang = Math.atan2(z2 - z1, x2 - x1);
      return <group key={i}>
        <mesh geometry={PLANE} rotation={[-Math.PI / 2, 0, -ang]} position={[(x1 + x2) / 2, 0.007, (z1 + z2) / 2]} scale={[len, 0.09, 1]} material={flat(PLAN.accent, 0.75)} />
        <mesh rotation={[-Math.PI / 2, 0, -ang - Math.PI / 2]} position={[x2, 0.008, z2]} material={flat(PLAN.accent, 0.85)}><circleGeometry args={[0.32, 3]} /></mesh>
      </group>;
    })}
    {/* walls, cut away at 1.2 m so the floor is visible */}
    {WALLS.map((wl) => {
      const [x1, z1, x2, z2] = wl.line, len = Math.hypot(x2 - x1, z2 - z1), t = wl.kind === "outer" ? FLOOR.wallThickness : 0.15, hh = wl.kind === "outer" ? wh : wh * 0.85;
      const horiz = Math.abs(z2 - z1) < 1e-6;
      const s: V3 = horiz ? [len + t, hh, t] : [t, hh, len + (wl.kind === "outer" ? t : 0)];
      return <group key={wl.id}>
        <mesh geometry={BOX} material={material("wallSide", "")} position={[(x1 + x2) / 2, hh / 2, (z1 + z2) / 2]} scale={s} />
        <mesh geometry={BOX} material={material("wallTop", "")} position={[(x1 + x2) / 2, hh + 0.01, (z1 + z2) / 2]} scale={[s[0], 0.02, s[2]]} />
        {wl.kind === "room" && <mesh geometry={BOX} material={material("glass", "")} position={[(x1 + x2) / 2, hh + 0.5, (z1 + z2) / 2]} scale={[s[0], 1.0, s[2] * 0.4]} />}
      </group>;
    })}
    {DOORS.map((dr) => dr.kind === "roller" ? (
      <group key={dr.id} position={[dr.x, 0, dr.y]}>
        {[0, dr.width].map((o) => <mesh key={o} geometry={BOX} material={material("doorPost", "")} position={[0, 1.6, o]} scale={[0.34, 3.2, 0.2]} />)}
        <mesh geometry={BOX} material={material("dark", "")} position={[0, 3.35, dr.width / 2]} scale={[0.5, 0.4, dr.width + 0.2]} />
        {Array.from({ length: 6 }, (_, i) => <mesh key={i} geometry={BOX} material={material("shutter", "")} position={[0, 3.05 - i * 0.16, dr.width / 2]} scale={[0.06, 0.14, dr.width]} />)}
      </group>
    ) : (
      <mesh key={dr.id} geometry={BOX} material={material("trim", "")} position={dr.axis === "y" ? [dr.x, 1.0, dr.y + dr.width / 2] : [dr.x + dr.width / 2, 1.0, dr.y]}
        scale={dr.axis === "y" ? [0.05, 2.0, dr.width * 0.95] : [dr.width * 0.95, 2.0, 0.05]} />
    ))}
    {PROPS.map((p) => <Prop key={p.id} {...p} />)}
  </>;
}
function Prop({ kind, x, y, w, d }: { kind: "rack" | "pallet" | "bench" | "desk"; x: number; y: number; w: number; d: number }) {
  const cx = x + w / 2, cz = y + d / 2;
  if (kind === "rack") {
    const n = Math.max(2, Math.round(w / 1.4));
    return <group position={[cx, 0, cz]}>
      {Array.from({ length: n + 1 }, (_, i) => [-1, 1].map((sz) => <B key={`${i}${sz}`} p={[-w / 2 + (i * w) / n, 1.1, sz * (d / 2 - 0.05)]} s={[0.08, 2.2, 0.08]} m="rack" />))}
      {[0.15, 1.0, 1.9].map((h) => [-1, 1].map((sz) => <B key={`${h}${sz}`} p={[0, h, sz * (d / 2 - 0.05)]} s={[w, 0.1, 0.06]} m="beam" />))}
      {[0.35, 1.2].map((h) => <B key={h} p={[0, h, 0]} s={[w - 0.3, 0.3, d * 0.7]} m="steel" />)}
    </group>;
  }
  if (kind === "pallet") return <group position={[cx, 0, cz]}><B p={[0, 0.07, 0]} s={[w, 0.14, d]} m="wood" /><B p={[0, 0.5, 0]} s={[w * 0.85, 0.7, d * 0.85]} m="carton" /></group>;
  return <group position={[cx, 0, cz]}>
    <B p={[0, 0.88, 0]} s={[w, 0.05, d]} m="fixture" />
    {[-1, 1].map((sx) => <B key={sx} p={[sx * (w / 2 - 0.1), 0.43, 0]} s={[0.06, 0.86, d * 0.9]} m="trim" />)}
    {kind === "desk" && <><B p={[-w / 4, 1.1, -d / 2 + 0.2]} s={[0.55, 0.35, 0.04]} m="dark" />{w > 3.4 && <B p={[w / 4, 1.1, -d / 2 + 0.2]} s={[0.55, 0.35, 0.04]} m="dark" />}</>}
    {kind === "bench" && <B p={[0, 1.6, -d / 2 + 0.05]} s={[w, 0.06, 0.06]} m="steel" />}
  </group>;
}

/* ---------------- one monitored machine ---------------- */
/** Keeps the 3D tooltip inside the view box (shifts it left/right/down when it would be cut off). */
function TipClamp({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [d, setD] = useState<[number, number]>([0, 0]);
  useEffect(() => { const id = window.setTimeout(() => {
    const el = ref.current; if (!el) return;
    let box: HTMLElement | null = el.parentElement;
    while (box && !box.querySelector(":scope > canvas, :scope > div > canvas")) box = box.parentElement;
    if (!box) return;
    const r = el.getBoundingClientRect(), b = box.getBoundingClientRect(), pad = 8;
    let dx = 0, dy = 0;
    if (r.right > b.right - pad) dx = b.right - pad - r.right;
    if (r.left + dx < b.left + pad) dx = b.left + pad - r.left;
    if (r.top < b.top + pad) dy = b.top + pad - r.top;
    setD([dx, dy]);
  }, 80); return () => window.clearTimeout(id); }, []);
  return <div ref={ref} style={{ transform: `translate(calc(-50% + ${d[0]}px), calc(-100% - 22px + ${d[1]}px))` }}>{children}</div>;
}

function MachineNode({ m, p, sel, hi, dim, compact, mode, tip, onSelect, setHover }: {
  m: PlanMachine; p: Placed; sel: boolean; hi: boolean; dim: boolean; compact: boolean; mode: PlanMode; tip: boolean;
  onSelect: (id: string) => void; setHover: (id: string | null) => void;
}) {
  const st = m.status, h = H[p.type];
  const variant = dim ? "ghost" : st === "notSetUp" ? "faded" : "";
  const light = LIGHT_AT[p.type]?.(p.w, p.d), cam = CAM_AT[p.type]?.(p.w, p.d);
  const col = st ? STATUS[st] : null;
  const click = (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); if (e.delta > 6) return; onSelect(m.id); };
  const hover = typeof window !== "undefined" && window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;
  return (
    <group position={[p.x, 0, p.y]} rotation={[0, (-p.rotation * Math.PI) / 180, 0]}>
      <group onClick={click}
        onPointerOver={(e) => { e.stopPropagation(); if (hover) { setHover(m.id); document.body.style.cursor = "pointer"; } }}
        onPointerOut={() => { if (hover) { setHover(null); document.body.style.cursor = ""; } }}>
        <Variant.Provider value={variant}><Model type={p.type} w={p.w} d={p.d} /></Variant.Provider>
        {/* invisible hit box over the footprint */}
        <mesh geometry={BOX} position={[0, h / 2, 0]} scale={[p.w, h, p.d]} visible={false} />
      </group>
      {!dim && <Ring w={p.w} d={p.d} status={st} selected={sel || hi} />}
      {light && <StackLight p={light} status={dim ? null : st} />}
      {cam && (mode === "layout" || m.live) && !dim && <Cam p={cam} live={m.live && mode !== "layout"} />}
      <Html position={[0, h + 0.5, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div className="whitespace-nowrap rounded-[5px] border bg-white/95 px-1.5 py-0.5 shadow-sm" style={{ opacity: dim ? 0.3 : 1, borderColor: sel ? PLAN.selected : LABEL.chip.border, fontFamily: LABEL.fontSans, fontSize: compact ? 10.5 : 12, lineHeight: 1.25 }}>
          <div className="flex items-center gap-1">
            <b style={{ fontWeight: 600, color: st === "notSetUp" ? PLAN.muted : PLAN.text }}>{compact ? m.short : m.label}</b>
            {col && <span className="grid h-[14px] min-w-[14px] place-items-center rounded-full px-0.5" style={{ background: col.soft, color: col.text, border: `1px ${col.dashed ? "dashed" : "solid"} ${col.dot}`, fontSize: st === "idle" ? 7 : 9 }}>{col.icon}</span>}
          </div>
          {!compact && st && st !== "notSetUp" && <div className="tnum" style={{ fontFamily: LABEL.fontMono, fontSize: 11, fontWeight: 600 }}>{m.primary.value}</div>}
        </div>
      </Html>
      {tip && (
        <Html position={[0, h + 1.0, 0]} zIndexRange={[60, 40]} style={{ pointerEvents: "none" }}>
          <TipClamp><MachineTip m={m} /></TipClamp>
        </Html>
      )}
    </group>
  );
}

/* ---------------- camera rig: shared framing, limits, touch ---------------- */
function Rig({ compact }: { compact: boolean }) {
  const ctl = useRef<OrbitImpl>(null);
  const { camera, size, gl, invalidate } = useThree();
  // Desktop: three-quarter view from the south-east (viz-tokens). Phone: from the east, to match the portrait 2D plan.
  const base = compact ? Math.PI / 2 : (LIGHTING_3D.camera.azimuthDeg * Math.PI) / 180;
  // Fit: the nearest camera distance (default angle) at which the whole site, walls and loading bay included,
  // shows in the canvas. The bottom band stays clear for the hint and the zoom buttons. Recomputed on resize.
  const fitDist = useMemo(() => {
    const cam = new THREE.PerspectiveCamera(LIGHTING_3D.camera.fov, size.width / Math.max(1, size.height), 0.5, 400);
    const cx = DEFAULT_FRAMING.cx, cz = DEFAULT_FRAMING.cy, az = DEFAULT_FRAMING.azimuth + base, po = DEFAULT_FRAMING.polar, m = 1.5;
    const pts: THREE.Vector3[] = [];
    for (const x of [-m, FLOOR.width + m]) for (const z of [-m, FLOOR.depth + m]) for (const y of [0, FLOOR.wallHeight]) pts.push(new THREE.Vector3(x, y, z));
    const v = new THREE.Vector3(), yMin = -1 + Math.min(0.5, 88 / Math.max(1, size.height));
    const fits = (d: number) => {
      cam.position.set(cx + d * Math.sin(po) * Math.sin(az), d * Math.cos(po), cz + d * Math.sin(po) * Math.cos(az));
      cam.lookAt(cx, 0, cz); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
      return pts.every((p) => { v.copy(p).project(cam); return Math.abs(v.x) <= 0.96 && v.y <= 0.96 && v.y >= yMin && v.z < 1; });
    };
    let lo = 5, hi = 400;
    for (let i = 0; i < 32; i++) { const mid = (lo + hi) / 2; if (fits(mid)) hi = mid; else lo = mid; }
    return hi;
  }, [size.width, size.height, base]);
  const place = () => {
    const f = getFraming(), c = ctl.current; if (!c) return;
    const dist = fitDist / f.zoom, az = f.azimuth + base, po = f.polar;
    c.target.set(f.cx, 0, f.cy);
    camera.position.set(f.cx + dist * Math.sin(po) * Math.sin(az), dist * Math.cos(po), f.cy + dist * Math.sin(po) * Math.cos(az));
    camera.lookAt(c.target); c.update(); invalidate();
  };
  useEffect(() => { place(); return onFramingCommand(place); }, [fitDist]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    // One-finger vertical drag scrolls the page; sideways drag turns; two fingers pan. The wheel always scrolls the page; + / − zoom.
    const id = setTimeout(() => { gl.domElement.style.touchAction = "pan-y"; }, 0);
    return () => clearTimeout(id);
  }, [gl]);
  const onChange = () => {
    const c = ctl.current; if (!c) return;
    const tx = Math.min(FLOOR.width, Math.max(0, c.target.x)), tz = Math.min(FLOOR.depth, Math.max(0, c.target.z));
    if (tx !== c.target.x || tz !== c.target.z) { const dx = tx - c.target.x, dz = tz - c.target.z; c.target.set(tx, 0, tz); camera.position.x += dx; camera.position.z += dz; }
    c.target.y = 0;
    const dist = camera.position.distanceTo(c.target);
    setFraming({ cx: c.target.x, cy: c.target.z, zoom: Math.min(4, Math.max(1, fitDist / dist)), azimuth: c.getAzimuthalAngle() - base, polar: c.getPolarAngle() });
  };
  return <OrbitControls ref={ctl} makeDefault enableZoom={false} enableDamping={false} screenSpacePanning={false} minDistance={fitDist / 4.2} maxDistance={fitDist * 1.05}
    minPolarAngle={0.05} maxPolarAngle={1.2} onChange={onChange} touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }} />;
}

export default function Scene3D({ machines, mode, compact, selectedId, onSelect, hoverId, setHover, statuses, zones, tipId }: {
  machines: PlanMachine[]; mode: PlanMode; compact: boolean; selectedId: string | null; onSelect: (id: string) => void;
  hoverId: string | null; setHover: (id: string | null) => void; statuses: DashStatus[]; zones: ZoneId[] | undefined; tipId: string | null;
}) {
  return (
    <Canvas frameloop="demand" dpr={[1, 1.75]} camera={{ fov: LIGHTING_3D.camera.fov, near: 0.5, far: 400, position: [20, 40, 50] }}
      gl={{ antialias: true, powerPreference: "low-power" }} className="pp-3d" style={{ touchAction: "pan-y" }} aria-label="3D view of the example site. Example data.">
      <color attach="background" args={[LIGHTING_3D.background]} />
      <ambientLight color={LIGHTING_3D.ambient.color} intensity={LIGHTING_3D.ambient.intensity} />
      <hemisphereLight args={[LIGHTING_3D.hemisphere.sky, LIGHTING_3D.hemisphere.ground, LIGHTING_3D.hemisphere.intensity]} />
      <directionalLight color={LIGHTING_3D.key.color} intensity={LIGHTING_3D.key.intensity} position={LIGHTING_3D.key.position} />
      <FloorAndBuilding />
      <ContactShadows position={[FLOOR.width / 2, 0.009, FLOOR.depth / 2]} scale={[FLOOR.width, FLOOR.depth]} resolution={512} frames={1}
        opacity={LIGHTING_3D.contactShadow.opacity} blur={LIGHTING_3D.contactShadow.blur} far={LIGHTING_3D.contactShadow.far} />
      {EQUIPMENT.map((e) => (
        <group key={e.id} position={[e.x, 0, e.y]} rotation={[0, (-e.rotation * Math.PI) / 180, 0]}><Model type={e.type} w={e.w} d={e.d} /></group>
      ))}
      {machines.map((m) => {
        const dim = (!!zones && !zones.includes(m.zone)) || (mode !== "layout" && !!m.status && !statuses.includes(m.status));
        return <MachineNode key={m.id} m={m} p={m.place} sel={selectedId === m.id} hi={hoverId === m.id} dim={dim} compact={compact} mode={mode}
          tip={tipId === m.id} onSelect={onSelect} setHover={setHover} />;
      })}
      <Rig compact={compact} />
    </Canvas>
  );
}
