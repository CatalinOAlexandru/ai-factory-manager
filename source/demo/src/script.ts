// The rehearsed demo script. Each step has stages; Next moves stage by stage, then to the next step.
export interface StepDef {
  n: number;
  key: string;
  title: string;
  short: string;
  /** interstitial: a full-width break page between demos. It is the last stage of its step, so step numbers do not change. */
  stages: { name: string; say: string; autoMs?: number; interstitial?: boolean }[];
  optional?: boolean;
}

export const STEPS: StepDef[] = [
  { n: 1, key: "describe", title: "Describe your site", short: "Describe", stages: [
    { name: "Description", say: "The only typing is one short description. It is pre-filled here. Choose where the data lives: on-prem keeps it in your building, cloud is the simplest. Photos are optional. Tap Generate." },
  ] },
  { n: 2, key: "generate", title: "Dashboard generation", short: "Generate", stages: [
    { name: "Generating", say: "The AI reads the description, finds 12 machines, picks what to track and plans camera spots. In the real app this runs in the background.", autoMs: 6200 },
    { name: "Dashboard", say: "The generated dashboard: 12 machines in five areas, each with the values the AI will read. No camera is set up yet." },
  ] },
  { n: 3, key: "layout", title: "Layout check", short: "Layout", stages: [
    { name: "Machine tiles", say: "Free tier: every machine as a tile. Tap a machine to see what the AI will read. Looks right ticks it off." },
    { name: "2D plan", say: "Pro tier: a top-down plan built from the photos, with machine shapes and camera spots." },
    { name: "3D view", say: "Business tier: a rotatable 3D model of the same floor. Drag to rotate, use + / − to zoom." },
  ] },
  { n: 4, key: "add-device", title: "Add device", short: "Add device", stages: [
    { name: "Device details", say: "All fields are pre-filled from the layout: CNC mill 3, Machining cell. Tap Pair camera." },
    { name: "Pairing", say: "The camera pairs over Bluetooth, then finds the machine screen.", autoMs: 4200 },
    { name: "Camera view", say: "What the camera sees. Each value is boxed once and given a confidence score. Low scores ask for a check." },
    { name: "Fill in data", say: "Fill in data copies the reading into the device: model number, values to log and alert limits." },
  ] },
  { n: 5, key: "sensor-added", title: "Sensor added", short: "Added", stages: [
    { name: "Site view", say: "The new camera is on CNC mill 3, and its values are live. The other 11 machines are not set up yet, so they show grey with no numbers." },
  ] },
  { n: 6, key: "machine", title: "Machine view, logging live", short: "Live", stages: [
    { name: "Logging", say: "The camera reads the ticked values every few seconds. The chart and the log update live. Try Camera feed and Recalibrate." },
    { name: "Setup demo complete", say: "That was one machine, set up from start to finish. Now the full demo: the same site with every machine live.", interstitial: true },
  ] },
  { n: 7, key: "final", title: "Final factory, all live", short: "All live", stages: [
    { name: "All machines live", say: "Twelve cameras later: every machine is live on one screen, with no engineer and no wiring." },
    { name: "AI suggestions", say: "This is what the subscription pays for. Each card names the machine, the likely cause and one action." },
    { name: "Demo 1 complete", say: "That is the whole site: every machine, live on one screen. Demo 2 is smaller: one device, one camera, one screen.", interstitial: true },
  ] },
  { n: 8, key: "lab", title: "Second example: one lab centrifuge", short: "Lab", optional: true, stages: [
    { name: "A · Describe", say: "A lab wants one device. It skips the layout step: describe it, and say Single device." },
    { name: "B · Point camera", say: "The vision model finds four values on the display. Set the alert limit in the same step." },
    { name: "C · Live view", say: "A centrifuge template the AI picked. Tap the four states to see it adapt." },
    { name: "D · Run log", say: "Every run is logged. A flagged run explains itself. Export is the paid upgrade." },
    { name: "Demo complete", say: "That is the PanelPal demo. Book a demo with us to see it on your own screens.", interstitial: true },
  ] },
];
