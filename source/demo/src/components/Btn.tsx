import { createContext, useContext, useEffect, useId, useState, type ButtonHTMLAttributes, type MouseEvent } from "react";

/**
 * Guided highlight. Each button that wants the highlight registers with the stage.
 * Only the first registered button gets the class, so one stage can never show two highlights.
 * The presenter Next button gets the highlight only when no button is registered and the stage is not loading.
 */
export const PulseCtx = createContext<{ register: (id: string) => () => void; active: string | null } | null>(null);
export const GUIDE = "guide-pulse";

/** Guided highlight for any button: registers with the stage and returns the class. Off or not first -> no class. */
export function usePulse(on: boolean) {
  const ctx = useContext(PulseCtx);
  const id = useId();
  const register = ctx?.register;
  useEffect(() => (on && register ? register(id) : undefined), [on, register, id]);
  return on && (!ctx || ctx.active === id) ? GUIDE : "";
}

/**
 * The one shared button. variant "primary" = solid blue fill, "secondary" = white with a solid blue border.
 * disabled -> grey with a dashed border, cursor not-allowed, aria-disabled="true". The click does nothing.
 * size: "block" (full width, step footer), "md", "sm".
 * pulse: a button the script expects the user to press next. A strong blue ring flashes on and off (1 s) with a small bump.
 * It stops on hover, on focus and after the press. Never on a disabled button. Static ring with reduced motion.
 */
export function Btn({ variant = "primary", size = "md", disabled, onClick, className = "", title, pulse = false, ...rest }:
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary"; size?: "block" | "md" | "sm" | "icon"; pulse?: boolean }) {
  const [pressed, setPressed] = useState(false);
  const hl = usePulse(pulse && !disabled && !pressed);
  const cls = `btn-${variant} ${size === "block" ? "btn-block" : size === "sm" ? "btn-sm" : size === "icon" ? "btn-icon" : ""} ${hl} ${className}`;
  const click = (e: MouseEvent<HTMLButtonElement>) => { if (disabled) { e.preventDefault(); return; } setPressed(true); onClick?.(e); };
  return <button type="button" {...rest} className={cls} aria-disabled={disabled ? true : undefined} onClick={click}
    title={title ?? (disabled ? "Not available in this demo" : undefined)} />;
}
