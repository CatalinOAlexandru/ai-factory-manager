import { useMemo, useState } from "react";
import { MACHINES, TARGET_ID } from "../data";
import { useDemo } from "../demo";
import { Check, Screen, StepBar } from "../components/ui";
import { FloorDashboard, planMachines } from "../components/plan";
import { Btn } from "../components/Btn";

const TABS = ["Machines", "2D plan", "3D view"] as const;
const TIER = ["Free · machine tiles · tap a machine", "Pro · top-down plan · tap a machine, use + / − to zoom", "Business · 3D view · drag sideways to turn, use + / − to zoom"];
const SUB: Record<string, string> = { "cnc-mill": "Vertical mill · camera on the HMI", press: "Hydraulic press · camera on the panel", welder: "MIG welder · camera on the display", bandsaw: "Band saw · camera on the panel", washer: "Parts washer · camera on the panel", "robot-cell": "Robot cell · camera on the teach pendant", cmm: "CMM · camera on the PC screen" };

export default function Step3() {
  const { stage, setStage, next } = useDemo();
  const [sel, setSel] = useState(TARGET_ID);
  const [ok, setOk] = useState<string[]>([]);
  const m = MACHINES.find((x) => x.id === sel)!;
  const plan = useMemo(() => planMachines("layout", 0), []);
  const confirm = () => {
    const nextOk = ok.includes(sel) ? ok : [...ok, sel];
    setOk(nextOk);
    const nxt = MACHINES.find((x) => !nextOk.includes(x.id));
    if (nxt && sel !== TARGET_ID) setSel(nxt.id);
  };
  return (
    <Screen footer={<Btn key={stage} size="block" pulse onClick={() => (stage < 2 ? setStage(stage + 1) : next())}>{stage < 2 ? `Next: ${TABS[stage + 1]}` : "Next: add a camera"}</Btn>}>
      <StepBar step={3} />
      <h2 className="mt-4 text-[24px] font-semibold leading-tight">Your proposed layout</h2>
      <p className="mt-1 text-[13.5px] text-muted">{TIER[stage]}</p>
      <div role="tablist" className="mt-3 grid grid-cols-3 rounded-[10px] bg-surface-2 p-1 text-sm">
        {TABS.map((t, i) => (
          <button key={t} role="tab" aria-selected={stage === i} onClick={() => setStage(i)}
            className={`rounded-[8px] py-1.5 ${stage === i ? "bg-bg font-semibold shadow-card ring-1 ring-border" : "text-muted"}`}>{t}</button>
        ))}
      </div>

      <div className="mt-3">
        {stage === 0 && (
          <div className="grid grid-cols-3 gap-2">
            {MACHINES.map((x) => (
              <button key={x.id} onClick={() => setSel(x.id)}
                className={`relative rounded-[10px] border px-2 py-2.5 text-left ${sel === x.id ? "border-accent bg-accent-soft ring-1 ring-accent" : "border-border bg-bg"}`}>
                <div className="text-[13px] font-semibold">{x.short}</div>
                <div className="text-[11px] text-muted">{x.area}</div>
                {ok.includes(x.id) && <span className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-accent text-accent-ink"><Check className="h-2.5 w-2.5" /></span>}
              </button>
            ))}
          </div>
        )}
        {stage > 0 && (
          <FloorDashboard className="pp-fade" machines={plan} mode="layout" view={stage === 1 ? "2d" : "3d"} compact detail="none"
            selectedId={sel} onSelect={(id) => id && setSel(id)} />
        )}
      </div>

      <div className="mt-3 rounded-[16px] border border-border bg-bg p-4 shadow-raised">
        <div className="mx-auto -mt-1 mb-2 h-1 w-10 rounded-full bg-border" aria-hidden />
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[17px] font-semibold">{m.name}</div>
            <div className="text-[13px] text-muted">{SUB[m.type]}</div>
          </div>
          {ok.includes(m.id) && <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent-strong"><Check className="h-3.5 w-3.5" />Checked</span>}
        </div>
        <div className="mt-3 text-[13px] font-semibold">We'll read from its screen</div>
        <ul className="mt-1.5 space-y-1">
          {m.reads.map((r) => (
            <li key={r} className="flex items-center gap-2 text-[14px]"><Check className="h-3.5 w-3.5 text-accent-strong" />{r}</li>
          ))}
        </ul>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Btn variant="secondary" disabled>Edit</Btn>
          <Btn variant="primary" onClick={confirm}>Looks right</Btn>
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-muted">Tap any machine to check it · {ok.length} of 12 checked</p>
    </Screen>
  );
}
