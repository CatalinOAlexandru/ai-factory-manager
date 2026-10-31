import { Btn } from "../components/Btn";
import { useEffect, useState } from "react";
import { useDemo, useTick } from "../demo";
import { Check, Chevron, Screen, StepBar } from "../components/ui";
import { CameraFrame, ConfList } from "../components/camera";

export default function Step4() {
  const { stage } = useDemo();
  if (stage === 0) return <DeviceForm />;
  if (stage === 1) return <Pairing />;
  if (stage === 2) return <CameraView />;
  return <Filled />;
}

function Field({ label, value, mono, chevron, note }: { label: string; value: string; mono?: boolean; chevron?: boolean; note?: string }) {
  return (
    <div className="mt-3.5">
      <div className="label">{label}</div>
      <div className="field mt-1.5 flex items-center justify-between">
        <span className={mono ? "font-mono text-[13.5px]" : ""}>{value}</span>
        {chevron && <Chevron className="text-muted" />}
      </div>
      {note && <div className="mt-1 text-xs text-muted">{note}</div>}
    </div>
  );
}

function DeviceForm() {
  const { next } = useDemo();
  return (
    <Screen footer={<Btn size="block" pulse onClick={next}>Pair camera</Btn>}>
      <StepBar step={4} />
      <h2 className="mt-4 text-[24px] font-semibold leading-tight">Add a device</h2>
      <p className="mt-1 text-[13.5px] text-muted">We filled this in from your layout. Check it, then pair.</p>
      <Field label="Device" value="PanelPal camera" chevron />
      <Field label="Device ID" value="CAM-07" mono note="Printed on the back of the camera." />
      <Field label="This camera is for" value="CNC mill 3 · Machining" chevron />
      <Field label="Point it at" value="Control screen (HMI)" chevron />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Read every" value="2 s" chevron />
        <Field label="Power" value="USB-C" chevron />
      </div>
      <div className="mt-4 rounded-[10px] bg-surface-2 p-3 text-[13px] text-muted">Fill the frame with the screen and avoid glare from windows.</div>
    </Screen>
  );
}

const PAIR_STEPS = ["Turn on the camera", "Found CAM-07 nearby", "Connected over Bluetooth", "Finding the screen"];

function Pairing() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const ids = [700, 1500, 2400].map((ms, i) => setTimeout(() => setP(i + 1), ms));
    return () => ids.forEach(clearTimeout);
  }, []);
  return (
    <Screen>
      <StepBar step={4} />
      <h2 className="mt-4 text-[24px] font-semibold leading-tight">Pair a camera</h2>
      <p className="mt-1 text-[13.5px] text-muted">{p < 2 ? "Hold your phone near CAM-07." : "CAM-07 connected over Bluetooth"}</p>
      {p < 3 ? (
        <div className="relative mx-auto mt-8 grid h-44 w-44 place-items-center">
          {[0, 1, 2].map((i) => <span key={i} className="pp-ripple absolute inset-6 rounded-full border-2 border-accent" style={{ animationDelay: `${i * 0.5}s` }} />)}
          <div className="relative grid h-20 w-20 place-items-center rounded-[16px] border border-border bg-bg shadow-raised">
            <img src="img/img-011.jpg" alt="Example PanelPal camera case" className="h-16 w-16 rounded-[10px] object-cover" />
          </div>
        </div>
      ) : (
        <div className="mt-5"><CameraFrame boxes={false} scanning /></div>
      )}
      <ul className="mt-6 space-y-3">
        {PAIR_STEPS.map((t, i) => (
          <li key={t} className="flex items-center gap-3 text-[15px]">
            <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${i < p ? "bg-accent text-accent-ink" : i === p ? "border-2 border-accent" : "border border-border-strong"}`}>
              {i < p ? <Check className="h-3.5 w-3.5" /> : i === p ? <span className="pp-pulse h-2 w-2 rounded-full bg-accent" /> : null}
            </span>
            <span className={i > p ? "text-muted" : i === p ? "font-semibold" : ""}>{t}{i === p ? "…" : ""}</span>
          </li>
        ))}
      </ul>
    </Screen>
  );
}

function CameraView() {
  const { next } = useDemo();
  return (
    <Screen footer={<Btn size="block" pulse onClick={next}>Fill in data</Btn>}>
      <StepBar step={4} />
      <h2 className="mt-4 text-[22px] font-semibold leading-tight">What the camera sees</h2>
      <p className="mt-1 flex items-center gap-1.5 text-[13.5px] text-running"><span aria-hidden>●</span><span className="font-semibold">Screen found</span><span className="text-muted">· hold steady</span></p>
      <div className="mt-3"><CameraFrame /></div>
      <p className="mt-1 text-xs text-muted">Example image of a generic machine screen. The camera boxes each value once.</p>
      <div className="mt-4 flex items-baseline justify-between">
        <div className="label">Values found</div>
        <div className="text-xs text-muted">Confidence</div>
      </div>
      <div className="mt-1.5"><ConfList /></div>
      <p className="mt-2 text-xs text-muted">▲ check: confirm the value. ✕ unsure: we will not log it until you confirm it.</p>
    </Screen>
  );
}

const LOG = [
  { name: "Spindle speed (rpm)", val: "8,000 rpm", on: true },
  { name: "Spindle load (%)", val: "42 %", on: true },
  { name: "Parts today", val: "312", on: true },
  { name: "Alarm message", val: "None", on: true },
  { name: "Feed rate", val: "1,250 mm/min · unsure", on: false },
];

function Filled() {
  const { next } = useDemo();
  const t = useTick(180);
  const shown = Math.min(t, 8);
  return (
    <Screen footer={<Btn size="block" pulse onClick={next}>Calibrate and start logging</Btn>}>
      <StepBar step={4} />
      <h2 className="mt-4 text-[22px] font-semibold leading-tight">What is CNC mill 3?</h2>
      <div className="label mt-4">Machine type</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {["CNC mill", "Lathe", "Press", "Other"].map((x, i) => <span key={x} className={`chip ${i === 0 ? "chip-on" : ""}`}>{x}</span>)}
      </div>
      <div className="label mt-4">Model number <span className="font-normal text-muted">(optional)</span></div>
      <div className={`field mt-1.5 flex items-center justify-between ${shown >= 1 ? "pp-flash" : ""}`}>
        <span className="font-mono text-[13.5px]">{shown >= 1 ? "MX-500" : ""}</span><span className="text-[13px] text-muted">Scan plate</span>
      </div>
      {shown >= 2 && <div className="pp-fade mt-1.5 flex items-center gap-1.5 text-[13px]"><Check className="text-running-dot" />Matched: manual and screen layout</div>}
      <div className="label mt-4">What's on the screen? <span className="font-normal text-muted">(optional)</span></div>
      <div className={`field mt-1.5 text-[13.5px] ${shown >= 3 ? "pp-flash" : ""}`}>{shown >= 3 ? "Main page: spindle speed, load and part count. Alarms show at the top." : "\u00a0"}</div>
      <div className="label mt-4">We'll log these values</div>
      <ul className="mt-2 space-y-2">
        {LOG.map((l, i) => {
          const vis = shown >= 4 + Math.min(i, 3);
          return (
            <li key={l.name} className="flex items-center gap-2.5 text-[14px]">
              <span className={`grid h-5 w-5 place-items-center rounded-[4px] ${l.on ? "border-[1.5px] border-accent bg-accent-soft text-accent-strong" : "border border-border-strong"}`}>{l.on && <Check className="h-3.5 w-3.5" />}</span>
              <span className={`flex-1 ${l.on ? "" : "text-muted"}`}>{l.name}</span>
              {vis && <span className={`pp-fade reading text-[12.5px] ${l.on ? "text-muted" : "text-cam-low"}`}>{l.val}</span>}
            </li>
          );
        })}
      </ul>
      <div className="label mt-4">Alert me when</div>
      <div className={`mt-1.5 rounded-[10px] border border-border p-3 text-[13.5px] ${shown >= 8 ? "pp-flash" : ""}`}>
        <div className="flex justify-between"><span>Spindle load is above</span><span className="reading font-semibold">85 % for 2 min</span></div>
        <div className="mt-1.5 flex justify-between"><span>An alarm shows</span><span className="font-semibold">Any alarm</span></div>
      </div>
    </Screen>
  );
}
