# Generates sensor-added.html and final-factory.html. All data is EXAMPLE DATA (mirrors demo/src/data.ts).
M=[("cnc1","CNC mill 1","Bay A",5,5,18,13,("Spindle","7,200 rpm"),("Parts","288"),"running",84),
("cnc2","CNC mill 2","Bay A",27,5,18,13,("Coolant","Low"),("Parts","241"),"alarm",71),
("cnc3","CNC mill 3","Bay A",5,24,18,13,("Spindle","8,000 rpm"),("Parts","312"),"running",87),
("cnc4","CNC mill 4","Bay A",27,24,18,13,("Spindle","6,500 rpm"),("Parts","265"),"running",79),
("saw","Band saw","Bay A",5,44,18,9,("Blade","62 m/min"),("Cuts","540"),"running",66),
("wash","Parts washer","Bay A",27,42,14,14,("Tank","58 °C"),("Cycles","37"),"idle",41),
("press1","Press 1","Bay B",55,5,17,15,("Strokes","1,904"),("Tonnage","142 t"),"running",82),
("press2","Press 2","Bay B",77,5,17,15,("Strokes","1,766"),("Tonnage","138 t"),"running",77),
("weld1","Welder 1","Bay B",55,25,17,11,("Current","185 A"),("Arc-on","61 %"),"running",73),
("weld2","Welder 2","Bay B",77,25,17,11,("Current","0 A"),("Arc-on","38 %"),"idle",52),
("robot","Robot cell","Bay B",55,42,19,16,("Cycles","1,120"),("State","Auto"),"running",88),
("cmm","Measuring machine (CMM)","Bay B",80,42,14,16,("Measured","96"),("Pass","98 %"),"running",58)]
SHORT={"cmm":"CMM","wash":"Washer"}
LBL={"running":"Running","idle":"Idle","alarm":"Alarm"}
I={k:f'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">{v}</svg>' for k,v in {
"site":'<path d="M3 21V9l6 4V9l6 4V5l6 4v12z"/>',
"mach":'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
"ins":'<path d="M12 3a6 6 0 0 0-4 10.5V17h8v-3.5A6 6 0 0 0 12 3zM9 21h6"/>',
"set":'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
"cam":'<rect x="3" y="7" width="18" height="12" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 7l1.5-3h5L16 7"/>',
"plus":'<path d="M12 5v14M5 12h14"/>'}.items()}
def banner(): return '<div class="banner"><b>Concept demo · example data.</b> All machines, names and numbers are examples.</div>'
def top(): return f'''<header class="top"><img class="logo" src="img/lockup-horizontal-light.svg" alt="PanelPal">
<div class="site">Example Factory Ltd · Unit 1 <small>▾</small></div><div class="sp"></div>
<span class="clock">Fri 30 Oct · 10:42 GMT</span><span class="pill ex">Example data</span><div class="who">SM</div></header>'''
def side(active,alerts=0):
    items=[("site","Site"),("mach","Machines"),("ins","Insights"),("set","Settings")]
    a="".join(f'<a class="{"on" if n==active else ""}">{I[k]}{n}{f"<span class=c>{alerts}</span>" if n=="Insights" and alerts else ""}</a>' for k,n in items)
    return f'<nav class="side">{a}<div class="sp"></div><div class="help">One camera per machine. Each camera reads the screen or gauge that is already on the machine.</div><span class="btn full">{I["plus"]} Add device</span></nav>'
def tabs(active): return '<div class="tabs m-only">'+"".join(f'<span class="{"on" if t==active else ""}">{t}</span>' for t in ["Site","Machines","Insights","Settings"])+'</div>'
def plan(mode):
    s=['<svg viewBox="0 0 100 64" font-family="Inter" >',
       '<rect x="1" y="1" width="98" height="62" fill="#fff" stroke="#5f5f5d" stroke-width=".6"/>',
       '<line x1="50" y1="1" x2="50" y2="40" stroke="#5f5f5d" stroke-width=".6"/><line x1="50" y1="48" x2="50" y2="63" stroke="#5f5f5d" stroke-width=".6"/>',
       '<text x="3" y="61" font-size="2.2" fill="#6b6b69">Bay A</text><text x="96" y="61" font-size="2.2" fill="#6b6b69" text-anchor="end">Bay B</text>']
    col={"running":("#dbf1db","#0ca30c"),"idle":("#efeafb","#7a5af5"),"alarm":("#fbe3e3","#d03b3b")}
    for id_,nm,bay,x,y,w,h,p,q,st,u in M:
        lab=SHORT.get(id_,nm)
        if mode=="final" or id_=="cnc3":
            f,k=col[st]; sw=".45"
            s.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="1" fill="{f}" stroke="{k}" stroke-width="{sw}"/>')
            s.append(f'<text x="{x+1.4}" y="{y+3.4}" font-size="2.3" font-weight="600" fill="#0b0b0b">{lab}</text>')
            s.append(f'<text x="{x+1.4}" y="{y+h-1.6}" font-size="2.6" font-weight="600" fill="#0b0b0b">{p[1]}</text>')
            s.append(f'<circle cx="{x+w-1.8}" cy="{y+2.4}" r=".9" fill="#2874d2"/>')
        else:
            s.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="1" fill="#f3f3f2" stroke="#c1c3bc" stroke-width=".5" stroke-dasharray="1.2 .8"/>')
            s.append(f'<text x="{x+1.4}" y="{y+3.4}" font-size="2.3" font-weight="600" fill="#8a8a87">{lab}</text>')
            s.append(f'<text x="{x+1.4}" y="{y+h-1.6}" font-size="2" fill="#8a8a87">No sensor yet</text>')
    s.append('</svg>'); return '<div class="plan">'+"".join(s)+'</div>'
def chart():
    pts=[]
    import math
    for i in range(60):
        v=2 if 35<i<40 else (20 if i in(35,40) else 41+2*math.sin(i/4)+(2 if 20<i<30 else 0))
        pts.append(f"{i*300/59:.1f},{70-v*1.2:.1f}")
    return f'''<div class="chart"><div class="row xs"><b>Spindle load, last hour</b><span class="sp"></span><span class="muted">Example data</span></div>
<svg viewBox="0 0 300 74" height="74"><line x1="0" y1="10" x2="300" y2="10" stroke="#ededec"/><line x1="0" y1="40" x2="300" y2="40" stroke="#ededec"/><line x1="0" y1="70" x2="300" y2="70" stroke="#d8d7d1"/>
<rect x="178" y="0" width="25" height="70" fill="#fbe3e3"/><polyline points="{" ".join(pts)}" fill="none" stroke="#2874d2" stroke-width="1.8"/></svg>
<div class="axis"><span>09:42</span><span>10:12</span><span>10:42</span></div></div>'''
READS=[("Spindle speed","8,000 rpm","0.97",""),("Spindle load","42 %","0.96",""),("Parts today","312","0.98",""),("Alarm","None","▲ 0.88 check","mid")]
def reads(): return '<div class="reads">'+"".join(f'<div class="rd"><div class="l">{l}<span class="conf {c2}">{c}</span></div><div class="n">{n}</div></div>' for l,n,c,c2 in READS)+'</div>'
def livepanel():
    return f'''<aside class="panel"><div class="row"><div><div class="crumb">Bay A · Camera CAM-07</div><h2>CNC mill 3</h2></div><span class="sp"></span><span class="pill running"><i></i>Running</span></div>
<div style="border-radius:10px;overflow:hidden;aspect-ratio:16/10;background:#111"><img src="img/cnc-hmi-camera-view.png" style="width:100%;height:100%;object-fit:cover;display:block" alt="Camera view of the CNC mill 3 operator screen. Spindle speed, spindle load, parts today and alarm are each boxed with a confidence score. Example data."></div>
<div class="row xs muted">Readings from the machine screen<span class="sp"></span>Confidence</div>
{reads()}
{chart()}
<div class="log"><b class="sm">Run log</b><div><span>10:42</span><i class="dot g"></i>Camera added. Reading 4 values every 2 s.</div><div><span>10:41</span><i class="dot"></i>Values matched to machine screen</div><div><span>10:38</span><i class="dot"></i>Camera paired: CAM-07</div></div>
<div class="row" style="margin-top:auto"><span class="btn ghost sm">Report a misread</span><span class="btn ghost sm">Recalibrate</span><span class="sp"></span><span class="btn sm">Edit readings</span></div></aside>'''
def page(title,body): return f'''<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>{title} · PanelPal concept</title><link rel="icon" href="img/favicon.svg"><link rel="stylesheet" href="app.css"></head><body>{body}</body></html>'''

# ---------- (a) sensor added ----------
def tile_sa(m):
    id_,nm,bay,*_ ,p,q,st,u=m
    if id_=="cnc3":
        return f'''<div class="tile live"><div class="row"><span class="nm">{nm}</span><span class="sp"></span><span class="pill running"><i></i>Running</span></div><div class="bay">{bay} · CAM-07</div>
<div class="v">8,000 rpm<small>Spindle · confidence 0.97</small></div><div class="foot"><span class="xs muted">Parts today 312</span><span class="conf">LIVE</span></div></div>'''
    return f'''<div class="tile off"><span class="ghost-ic">{I["cam"]}</span><span class="nm">{nm}</span><div class="bay">{bay}</div>
<div class="foot"><span class="pill inactive"><i></i>Inactive · no sensor yet</span></div><span class="btn sm" style="align-self:flex-start">{I["plus"]} Add device</span></div>'''
def sensor_added():
    others=[m for m in M if m[0]!="cnc3"]
    body=banner()+top()+'<div class="shell">'+side("Machines")+f'''<div class="main"><section class="content">
<div class="hrow"><div><div class="crumb">Example Factory Ltd · Unit 1</div><h1>Machines</h1><div class="sm muted" style="margin-top:4px">1 of 12 machines live · 11 have no sensor yet</div></div><span class="sp"></span>
<span class="seg d-only"><span class="on">Machine tiles</span><span>2D plan <small>Pro</small></span><span>3D view <small>Business</small></span></span><span class="btn primary d-only">{I["plus"]} Add device</span></div>
<div class="toast"><span class="tick">✓</span><div><b>Camera CAM-07 is live on CNC mill 3.</b> <span class="t">It reads 4 values from the machine screen every 2 s.</span></div><span class="sp"></span><span class="btn ghost sm d-only">View camera</span></div>
<div class="d-only"><div class="tiles">{"".join(tile_sa(m) for m in M)}</div></div>
<div class="m-only">
<div class="tile live" style="margin-bottom:12px"><div class="row"><span class="nm">CNC mill 3</span><span class="sp"></span><span class="pill running"><i></i>Running</span></div><div class="bay">Bay A · CAM-07 · read 2 s ago</div>
{reads()}<div class="row" style="margin-top:4px"><span class="pill ex">Example data</span><span class="sp"></span><span class="btn sm">Open machine</span></div></div>
<div class="row" style="margin:14px 0 8px"><b class="sm">Other machines</b><span class="sp"></span><span class="xs muted">11 inactive</span></div>
<div class="mlist">{"".join(f'<div class="mrow"><div><div class="nm">{m[1]}</div><div class="xs muted">{m[2]} · Inactive · no sensor yet</div></div><span class="sp"></span><span class="btn sm">{I["plus"]} Add device</span></div>' for m in others)}</div>
</div></section>
<div class="d-only">{livepanel()}</div></div></div>'''+tabs("Machines")
    open("sensor-added.html","w").write(page("Sensor added",body))

# ---------- (b) final factory ----------
INS=[("warn","Check tool wear","CNC mill 3","CNC mill 3 load is up 18%","vs its usual on program O1042 since Tuesday.","A worn tool (T4)","Create task"),
("bad","Unlogged downtime","CNC mill 2","Coolant low on CNC 2, 4 times","Shown on its screen this week but never logged as downtime (~2.5 h).","Coolant top-up not on the shift checklist","Log as downtime"),
("accent","Scheduling","Welder 2","Welder 2 idle 40 min per shift","Three days running, at shift handover.","Handover overlaps with the welder’s break","Plan handover")]
def ins_cards(): return "".join(f'''<div class="ins {t}"><div class="tg"><i></i>{tg} · {mc}</div><div class="tt">{tt}</div><div class="bd">{bd}</div><div class="cause"><b>Likely cause:</b> {c}</div><div class="act"><span class="btn">{a}</span><span class="muted">Dismiss</span></div></div>''' for t,tg,mc,tt,bd,c,a in INS)
def tile_f(m):
    id_,nm,bay,*_ ,p,q,st,u=m
    return f'''<div class="tile {st}"><div class="row"><span class="nm">{SHORT.get(id_,nm)}</span><span class="sp"></span><span class="pill {st}"><i></i>{LBL[st]}</span></div><div class="bay">{bay}</div>
<div class="v">{p[1]}<small>{p[0]} · {q[0]} {q[1]}</small></div><div class="foot" style="display:block"><div class="util"><b style="width:{u}%"></b></div><div class="xs muted" style="margin-top:4px">Utilisation today {u}%</div></div></div>'''
def stats(): return '''<div class="stats"><div class="stat"><div class="l"><i class="sd" style="background:var(--color-running-dot)"></i>Running</div><div class="n">9</div></div>
<div class="stat"><div class="l"><i class="sd" style="background:var(--color-idle-dot)"></i>Idle</div><div class="n">2</div></div>
<div class="stat"><div class="l"><i class="sd" style="background:var(--color-fault-dot)"></i>Alarm</div><div class="n">1</div></div>
<div class="stat"><div class="l">Average utilisation</div><div class="n">71%</div></div></div>'''
def final():
    body=banner()+top()+'<div class="shell">'+side("Site",3)+f'''<div class="main"><section class="content">
<div class="hrow"><div><div class="crumb">Example Factory Ltd · Unit 1</div><h1>Site view</h1><div class="sm muted" style="margin-top:4px">12 of 12 machines live · 12 cameras · last read 2 s ago</div></div><span class="sp"></span>
<span class="seg d-only"><span>Machine tiles</span><span class="on">2D plan <small>Pro</small></span><span>3D view <small>Business</small></span></span></div>
{stats()}
<div class="d-only">{plan("final")}<div class="row xs muted" style="margin-top:8px"><span class="pill running"><i></i>Running</span><span class="pill idle"><i></i>Idle</span><span class="pill alarm"><i></i>Alarm</span><span style="display:inline-flex;align-items:center;gap:4px"><i class="dot" style="background:#2874d2"></i>Camera</span><span class="sp"></span>Example data · Fri 30 Oct, 10:42 GMT</div></div>
<div class="m-only"><div class="row" style="margin:4px 0 8px"><b class="sm">AI suggestions</b><span class="sp"></span><span class="xs muted">3 new · Example data</span></div><div style="display:grid;gap:10px;margin-bottom:16px">{ins_cards()}</div>
<div class="row" style="margin:4px 0 8px"><b class="sm">Machines</b><span class="sp"></span><span class="xs muted">All live</span></div><div class="tiles">{"".join(tile_f(m) for m in M)}</div></div>
</section>
<aside class="panel d-only"><div class="row"><div><div class="crumb">Insights · this week</div><h2>AI suggestions</h2></div><span class="sp"></span><span class="pill ex">Example data</span></div>
<div class="xs muted">From the readings on all 12 machine screens. Each card has one action.</div>
{ins_cards()}
<div class="ask" style="margin-top:auto">Ask about your site…<span class="sp"></span><b>↑</b></div></aside></div></div>'''+tabs("Site")
    open("final-factory.html","w").write(page("Final factory",body))
sensor_added(); final()
