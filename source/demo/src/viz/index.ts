// One import point for the plan visuals: Factory Design's shared tokens (panelpal/shared/viz-tokens.ts).
export * from "../../../shared/viz-tokens";
import type { VizStatus } from "../../../shared/viz-tokens";
/** The four statuses the dashboards use. "notSetUp" is shown to users as "Inactive · no camera yet". */
export type DashStatus = Extract<VizStatus, "running" | "idle" | "fault" | "notSetUp">;
export const DASH_STATUSES: DashStatus[] = ["running", "idle", "fault", "notSetUp"];
export const DASH_WORD: Record<DashStatus, string> = { running: "Running", idle: "Idle", fault: "Alarm", notSetUp: "Inactive" };
