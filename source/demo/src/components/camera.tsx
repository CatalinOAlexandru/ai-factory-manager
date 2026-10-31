export interface CamValue { key: string; name: string; value: string; unit: string; conf: number; x: number; y: number; w: number; h: number; below?: boolean; right?: boolean; baked?: boolean }

/** Confidence bands (design system): >=0.90 high, 0.70-0.89 check, <0.70 unsure. */
export function band(conf: number) {
  if (conf >= 0.9) return { col: "var(--color-cam-high)", note: "", dashed: false, word: "High" } as const;
  if (conf >= 0.7) return { col: "var(--color-cam-mid)", note: "▲ check", dashed: false, word: "Check" } as const;
  return { col: "var(--color-cam-low)", note: "✕ unsure", dashed: true, word: "Unsure" } as const;
}

export function camValues(): CamValue[] {
  // The 4 values boxed in img/cnc-hmi-camera-clean.png (1600 x 1000, rendered by tools/camera), plus the feed
  // rate in the status strip. Only the feed box is drawn by us: the other 4 boxes are in the image.
  return [
    { key: "rpm", name: "Spindle speed", value: "8,000", unit: "rpm", conf: 0.97, x: 16, y: 29, w: 26.5, h: 10.5, baked: true },
    { key: "load", name: "Spindle load", value: "42", unit: "%", conf: 0.96, x: 51, y: 28, w: 15, h: 10.5, baked: true },
    { key: "parts", name: "Parts today", value: "312", unit: "", conf: 0.98, x: 15.8, y: 53, w: 11.6, h: 10.3, baked: true },
    { key: "alarm", name: "Alarm", value: "None", unit: "", conf: 0.88, x: 51, y: 53, w: 15.8, h: 10.3, baked: true },
    { key: "feed", name: "Feed rate", value: "1,250", unit: "mm/min", conf: 0.61, x: 14.2, y: 73, w: 12.2, h: 4, below: true },
  ];
}

/**
 * Camera view of the CNC mill 3 operator screen (Factory Design image, generic HMI, no brand).
 * The image has the 4 boxes and no text over it (no labels, no chips). We add only the low-confidence
 * feed-rate box (no label). The values and their confidence show in ConfList, below the image.
 */
export function CameraFrame({ boxes = true, scanning = false, compact = false }: { boxes?: boolean; scanning?: boolean; compact?: boolean; tick?: number }) {
  const vals = camValues().filter((v) => !v.baked);
  return (
    <div className={`relative aspect-[16/10] w-full overflow-hidden rounded-[10px] bg-[#111] ${scanning ? "pp-scan" : ""}`}>
      <img src="img/cnc-hmi-camera-clean.png" alt="Camera view of the CNC mill 3 operator screen. Spindle speed, spindle load, parts today, alarm and feed rate are each boxed. Example data." className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      {boxes && vals.map((b) => <Box key={b.key} b={b} compact={compact} />)}
    </div>
  );
}

function Box({ b }: { b: CamValue; compact?: boolean }) {
  const bd = band(b.conf);
  return (
    <div className="absolute" style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` }}>
      <div className="absolute inset-0 rounded-[3px]" style={{ border: `1.5px ${bd.dashed ? "dashed" : "solid"} ${b.conf >= 0.9 ? "var(--color-cam-box)" : bd.col}` }} />
    </div>
  );
}

export function ConfList() {
  return (
    <ul className="divide-y divide-border rounded-[10px] border border-border">
      {camValues().map((b) => {
        const bd = band(b.conf);
        return (
          <li key={b.key} className="flex items-center gap-2 px-3 py-2 text-[13.5px]">
            <span className="min-w-0 flex-1 break-words">{b.name}</span>
            <span className="reading font-semibold">{b.value}{b.unit ? ` ${b.unit}` : ""}</span>
            <span className="w-[86px] text-right font-mono text-[12px] font-medium" style={{ color: bd.col }}>
              {Math.round(b.conf * 100)}%{bd.note ? ` ${bd.note.split(" ")[0]}` : " ✓"}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
