#!/usr/bin/env python3
"""PanelPal light tokens v1 (30 Oct 2026). Writes tokens.css, theme.tailwind.css, tokens.json, contrast-report.md."""
import json, os
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

FONT = {
 "font-display": '"Source Serif 4", "Source Serif Pro", Georgia, "Times New Roman", serif',
 "font-sans": '"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
 "font-mono": '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
}
# (value, source note)
COLOR = {
 # neutrals
 "bg": ("#ffffff", "p-03..p-08 page and phone screen"),
 "surface": ("#ffffff", "cards inside phone screens, p-05"),
 "surface-2": ("#f3f3f2", "between #ededec panel and #f7f7f7, p-04/p-07"),
 "surface-3": ("#ededec", "grey panels: camera preview, notice box, p-03/p-04/p-07"),
 "border": ("#d8d8d4", "card and phone outlines, p-04/p-05"),
 "border-strong": ("#c1c3bc", "input and chip outlines, img-001"),
 "text": ("#161616", "body text, p-03/p-07 (#161515, #0b0b0b)"),
 "muted": ("#5f5f5d", "secondary text, p-05/p-06 (#605f5e, #646463)"),
 "faint": ("#6a6a68", "hints and captions; PDF #7c7c7c/#868685 darkened to pass 4.5:1"),
 # brand
 "accent": ("#2874d2", "brand blue, PDF #2a78d6 (img-001..006) nudged 1 step darker so white text and blue text on white pass 4.5:1"),
 "accent-strong": ("#1d5fae", "hover/pressed and blue text on soft fill (derived)"),
 "accent-soft": ("#e5effa", "primary button fill, selected chip, AI review box, img-001..006"),
 "accent-ink": ("#ffffff", "text on solid accent"),
 # status: base = text/icon colour (AA on white and surface-2); dot = PDF colour; soft = chip fill
 "running": ("#0b7a0b", "darkened from PDF green #0ca30c for text"),
 "running-dot": ("#0ca30c", "img-001/img-006 status dot and ticks"),
 "running-soft": ("#dbf1db", "Running chip fill, img-003"),
 "idle": ("#6141c9", "NEW: PDF has no idle state; violet so it is not the brand blue"),
 "idle-dot": ("#7c5ce6", "NEW"),
 "idle-soft": ("#eee9fc", "NEW"),
 "warning": ("#8a5a00", "darkened from PDF amber #fab219 for text"),
 "warning-dot": ("#fab219", "img-004 'Check tool wear' bar and dot"),
 "warning-soft": ("#fdf3dc", "light amber fill, from #fde1a6"),
 "fault": ("#b42d2d", "darkened from PDF red #d03b3b for text"),
 "fault-dot": ("#d03b3b", "img-004/img-006 red bar, dot, flag"),
 "fault-soft": ("#fbf0f0", "flagged row fill, img-006"),
 "offline": ("#5f5f5d", "no signal; grey, always with dashed outline + 'No signal' word"),
 "offline-dot": ("#8e8b8b", "p-08 grey"),
 "offline-soft": ("#ededec", "p-08 grey chip"),
 "inactive": ("#6b6b69", "machine not set up yet; text"),
 "inactive-dot": ("#c1c3bc", "light grey outline, img-002 untouched tiles"),
 "inactive-soft": ("#f3f3f2", "inactive tile fill"),
 "info": ("#1d5fae", "same as accent-strong"),
 # charts
 "chart-line": ("#2874d2", "p-05 spindle load line"),
 "chart-line-2": ("#0c6992", "second series (camera teal-blue)"),
 "chart-limit": ("#d03b3b", "dashed alert limit, p-08"),
 "chart-band": ("#e5effa", "normal range band"),
 "chart-grid": ("#e8e8e6", "grid lines"),
 "chart-axis": ("#6a6a68", "axis labels (= faint)"),
 # camera view (img-010): boxes drawn on a dark photo
 "cam-box": ("#2f8fd0", "value outline, img-010 (light blue stroke)"),
 "cam-high": ("#0c6992", "label fill, confidence >= 0.90, img-010"),
 "cam-mid": ("#9a6500", "label fill, confidence 0.70-0.89 (derived amber)"),
 "cam-low": ("#b42d2d", "label fill, confidence < 0.70 (derived red)"),
 "cam-label-ink": ("#ffffff", "text on label fills"),
 "cam-live": ("#e5372a", "LIVE dot, img-010"),
 "cam-scrim": ("#1f2328", "LIVE pill background, img-010"),
 # floor plan (p-04)
 "plan-bg": ("#ededec", "plan canvas"),
 "plan-wall": ("#5f5f5d", "plan walls"),
 "plan-machine": ("#ffffff", "machine shape fill"),
 "plan-machine-stroke": ("#a6a6a6", "machine shape stroke"),
 "focus": ("#2874d2", "focus ring"),
 # legacy aliases so the dark-theme demo keeps compiling (map to light values; remove later)
 "zone-fill": ("#f3f3f2","legacy alias"), "zone-stroke": ("#c1c3bc","legacy alias"),
 "machine-fill": ("#ffffff","legacy alias"), "grid-line": ("#ededec","legacy alias"),
 "chart-baseline": ("#2874d2","legacy alias"), "chart-anomaly": ("#fbf0f0","legacy alias"),
 "paper": ("#ffffff","legacy alias"), "paper-2": ("#f3f3f2","legacy alias"), "paper-border": ("#d8d8d4","legacy alias"),
 "ink": ("#161616","legacy alias"), "ink-muted": ("#5f5f5d","legacy alias"),
 "running-on-light": ("#0b7a0b","legacy alias"), "idle-on-light": ("#6141c9","legacy alias"),
 "warning-on-light": ("#8a5a00","legacy alias"), "fault-on-light": ("#b42d2d","legacy alias"), "offline-on-light": ("#5f5f5d","legacy alias"),
}
RADIUS = {"radius-sm": "4px", "radius-control": "8px", "radius-card": "10px", "radius-lg": "16px", "radius-phone": "28px", "radius-pill": "999px"}
SPACING = {"spacing-page": "24px", "spacing-card": "16px", "spacing-sidebar": "232px"}
SPACE = {f"space-{i}": v for i, v in enumerate(["0px","4px","8px","12px","16px","24px","32px","48px","64px","96px"])}
TYPE = {"type-xs":"12px","type-sm":"13px","type-base":"15px","type-lg":"17px","type-xl":"20px","type-2xl":"24px","type-3xl":"32px","type-4xl":"44px","type-5xl":"60px"}
LEADING = {"leading-tight":"1.15","leading-snug":"1.3","leading-normal":"1.5","leading-relaxed":"1.6"}
WEIGHT = {"font-weight-regular":"400","font-weight-medium":"500","font-weight-semibold":"600"}
SHADOW = {
 "shadow-card": "0 1px 2px #0000000d",
 "shadow-raised": "0 4px 16px #00000014, 0 1px 2px #0000000f",
 "shadow-phone": "0 12px 32px #00000017",
 "shadow-focus": "0 0 0 2px #ffffff, 0 0 0 4px #2874d2",
}

def block(indent="  "):
    L=[]
    L.append(f"{indent}/* font */")
    L += [f"{indent}--{k}: {v};" for k,v in FONT.items()]
    L.append(f"{indent}/* color: sampled from PDF renders, see DESIGN-SYSTEM.md */")
    L += [f"{indent}--color-{k}: {v[0]};" for k,v in COLOR.items()]
    for name,d in [("radius",RADIUS),("spacing",SPACING),("space",SPACE),("type",TYPE),("leading",LEADING),("font-weight",WEIGHT),("shadow",SHADOW)]:
        L.append(f"{indent}/* {name} */"); L += [f"{indent}--{k}: {v};" for k,v in d.items()]
    return "\n".join(L)

HEAD = """/* PanelPal light tokens v1, 30 Oct 2026. Generated by design/scripts/build_tokens.py. Do not edit by hand.
   Fonts (free, OFL), put in <head>:
   <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
   or CSS: @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500&family=JetBrains+Mono:wght@400;500&display=swap");
*/
"""
css = HEAD + ":root {\n  color-scheme: light;\n" + block() + "\n}\n"
css += """
/* Numbers that update (readings) use tabular figures so they do not jump. */
.tabular, .reading { font-variant-numeric: tabular-nums; }
:focus-visible { outline: 2px solid var(--color-focus); outline-offset: 2px; }
"""
open(f"{D}/tokens.css","w").write(css)
tw = HEAD + "/* Tailwind v4: paste this @theme block into src/theme.css (replaces the dark v1 block). Names match the old dark theme, so most classes keep working. */\n@theme {\n" + block() + "\n}\n"
open(f"{D}/theme.tailwind.css","w").write(tw)
json.dump({"font":FONT,"color":{k:{"value":v[0],"source":v[1]} for k,v in COLOR.items()},"radius":RADIUS,"spacing":SPACING,"space":SPACE,"type":TYPE,"leading":LEADING,"weight":WEIGHT,"shadow":SHADOW},open(f"{D}/tokens.json","w"),indent=1)

# contrast
def lum(h):
    h=h.lstrip('#'); r,g,b=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    f=lambda c: c/12.92 if c<=0.03928 else ((c+0.055)/1.055)**2.4
    return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)
def cr(a,b):
    la,lb=sorted([lum(a),lum(b)],reverse=True); return (la+0.05)/(lb+0.05)
C={k:v[0] for k,v in COLOR.items()}
rows=[]; fails=0
def check(fg,bg,need,what):
    global fails
    r=cr(C[fg],C[bg]); ok=r>=need; fails+= (not ok)
    rows.append(f"| {fg} `{C[fg]}` | {bg} `{C[bg]}` | {r:.2f} | {need} | {'PASS' if ok else 'FAIL'} | {what} |")
for bg in ["bg","surface-2","surface-3"]:
    for fg in (["accent"] if bg=="bg" else [])+["text","muted","faint","accent-strong","running","idle","warning","fault","offline","inactive"]:
        check(fg,bg,4.5,"text")
for s in ["running","idle","warning","fault","offline","inactive"]:
    check(s,f"{s}-soft",4.5,"chip text on its own fill")
check("accent-strong","accent-soft",4.5,"primary button text")
check("text","accent-soft",4.5,"primary button text (PDF style: dark text)")
check("accent-ink","accent",4.5,"white on solid blue")
for s in ["running-dot","idle-dot","fault-dot","offline-dot"]:
    check(s,"bg",3.0,"icon/dot, non-text (1.4.11)")
check("accent","bg",3.0,"focus ring / selected outline (1.4.11)")
check("border-strong","bg",1.0,"input outline: decorative; pair with label (info only)")
for c in ["cam-high","cam-mid","cam-low"]:
    check("cam-label-ink",c,4.5,"camera label text")
    check(c,"cam-scrim",1.0,"label fill vs dark photo (info only)")
check("chart-line","bg",3.0,"chart line (1.4.11)")
check("chart-limit","bg",3.0,"limit line (1.4.11)")
rep="# PanelPal contrast report (WCAG 2.2 AA)\n\nGenerated by design/scripts/build_tokens.py, 30 Oct 2026.\nText needs 4.5:1. Icons, dots, outlines and chart lines need 3:1 (SC 1.4.11).\nRule: blue text (`accent`) only on white. On grey surfaces use `accent-strong`.\nNote: warning-dot #fab219 is 1.9:1 on white. Use it only as a bar or fill next to the darker warning text and an icon. It does not carry meaning alone.\n\n| Foreground | Background | Ratio | Need | Result | Use |\n|---|---|---|---|---|---|\n"+"\n".join(rows)+f"\n\nFailures: {fails}\n"
open(f"{D}/contrast-report.md","w").write(rep)
print(rep[-3000:]); print("fails",fails)
print("warning-dot on white", round(cr(C['warning-dot'],'#ffffff'),2), "running-dot", round(cr(C['running-dot'],'#ffffff'),2), "cam-box on scrim", round(cr(C['cam-box'],C['cam-scrim']),2))
