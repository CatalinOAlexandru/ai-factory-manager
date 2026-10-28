// Shared AI chat content: CNC Lathe diagnosis. ALL EXAMPLE DATA. Not a real customer, machine log or manual.
window.ICON={
 running:'<svg viewBox="0 0 12 12"><circle cx="6" cy="6" r="5" fill="currentColor"/></svg>',
 idle:'<svg viewBox="0 0 12 12"><rect x="2" y="2" width="3" height="8" fill="currentColor"/><rect x="7" y="2" width="3" height="8" fill="currentColor"/></svg>',
 warning:'<svg viewBox="0 0 12 12"><path d="M6 1 L11.5 11 H0.5 Z" fill="currentColor"/></svg>',
 fault:'<svg viewBox="0 0 12 12"><path d="M2 2 L10 10 M10 2 L2 10" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
 offline:'<svg viewBox="0 0 12 12"><circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="2 1.6"/></svg>',
 doc:'<svg viewBox="0 0 12 12"><path d="M2.5 1h5l2 2v8h-7z" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M4 6h4M4 8h4" stroke="currentColor" stroke-width="1.1"/></svg>',
 log:'<svg viewBox="0 0 12 12"><path d="M1.5 2.5h9M1.5 6h9M1.5 9.5h6" stroke="currentColor" stroke-width="1.5"/></svg>',
 mic:'<svg viewBox="0 0 12 12"><rect x="4" y="1" width="4" height="7" rx="2" fill="currentColor"/><path d="M2.5 6a3.5 3.5 0 0 0 7 0M6 9.5V11" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>',
 power:'<svg viewBox="0 0 12 12"><path d="M7 1 2.5 7H6l-1 4 4.5-6H6z" fill="currentColor"/></svg>',
};
window.chip=(s,t)=>`<span class="chip ${s}">${ICON[s]}${t}</span>`;
// Small charts. Seeded so every render is the same.
let seed=7;const rnd=()=>(seed=(seed*9301+49297)%233280)/233280;
window.spark=(w,h,{base=.45,jumpAt=.62,jump=.18,noise=.06,band=true,line='var(--color-chart-line)',hi='var(--color-warning)'}={})=>{
 const n=60;const pts=[];for(let i=0;i<n;i++){const x=i/(n-1)*w;let v=base+(rnd()-.5)*noise+(i/n>jumpAt?jump:0);pts.push([x,h-v*h])}
 const cut=Math.floor(n*jumpAt);const p=a=>a.map(q=>q.map(z=>z.toFixed(1)).join(',')).join(' ');
 return `<svg width="100%" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="display:block">
 ${band?`<rect x="0" y="${h-(base+noise)*h}" width="${w}" height="${noise*2*h}" fill="var(--color-chart-band)"/>`:''}
 <rect x="${pts[cut][0]}" y="0" width="${w-pts[cut][0]}" height="${h}" fill="var(--color-warning-soft)"/>
 <polyline points="${p(pts.slice(0,cut+1))}" fill="none" stroke="${line}" stroke-width="1.6"/>
 <polyline points="${p(pts.slice(cut))}" fill="none" stroke="${hi}" stroke-width="1.8"/></svg>`};
// The AI answer. size: 'lg' (app) or 'sm' (site hero, mobile)
window.answer=(size='lg')=>{const lg=size==='lg',md=size==='md';const fs=lg?15:14;const sw=lg?250:md?160:300;const cols=(lg||md)?'repeat(3,1fr)':'1fr';return `
<div style="display:flex;flex-direction:column;gap:${lg?14:12}px;font-size:${fs}px;line-height:1.55">
 <div class="verdict"><div class="label" style="color:var(--color-warning);margin-bottom:6px">Likely cause</div>
  <div style="font-weight:600;font-size:${fs+1}px">The slideways are short of oil. The lathe works harder than normal to move.</div></div>
 <div><div class="label" style="margin-bottom:8px">What I found</div>
  <div style="display:grid;grid-template-columns:${cols};gap:8px">
   <div class="ev"><div style="display:flex;align-items:center;gap:6px;font-weight:600;font-size:13px">${ICON.log.replace('<svg','<svg width="13" height="13" style="color:var(--color-muted)"')}Machine log</div>
    <div class="mono" style="font-size:12px;margin:6px 0 4px;color:var(--color-warning)">WAY LUBE PRESSURE LOW</div>
    <div class="muted" style="font-size:12.5px;line-height:1.45">2 alarms this week: Mon 11:42, Tue 15:08. Both were cleared. No refill was logged.</div></div>
   <div class="ev"><div style="display:flex;align-items:center;gap:6px;font-weight:600;font-size:13px">${ICON.mic.replace('<svg','<svg width="13" height="13" style="color:var(--color-muted)"')}Microphone${lg?'<span class="mono muted" style="margin-left:auto;font-weight:500;font-size:11px">new tone</span>':''}</div>
    <div style="margin:8px 0 4px">${spark(sw,34,{base:.35,jump:.3,noise:.12})}</div>
    <div class="muted" style="font-size:12.5px;line-height:1.45">A new high tone since Mon. It is outside the normal sound for this job.</div></div>
   <div class="ev"><div style="display:flex;align-items:center;gap:6px;font-weight:600;font-size:13px">${ICON.power.replace('<svg','<svg width="13" height="13" style="color:var(--color-muted)"')}Power<span class="mono" style="margin-left:auto;font-weight:600;font-size:11px;color:var(--color-warning)">+9%</span></div>
    <div style="margin:8px 0 4px">${spark(sw,34,{base:.42,jump:.12,noise:.06})}</div>
    <div class="muted" style="font-size:12.5px;line-height:1.45">Spindle load is 9% higher on the same part (job 24-1192).</div></div>
  </div></div>
 <div><div class="label" style="margin-bottom:8px">What the manual says</div>
  <div style="background:var(--color-surface-2);border-left:3px solid var(--color-accent);padding:10px 14px;border-radius:0 6px 6px 0;font-size:${fs-1}px">“When the way lube alarm comes on, fill the tank with the specified slideway oil. Then check the lines for blockage.”
   <div style="margin-top:8px;display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span class="chip manual">${ICON.doc}Machine manual (example) · p. 42</span><span class="ex">Example</span></div></div></div>
 <div><div class="label" style="margin-bottom:6px">What to do</div>
  <ol class="steps">
   <li>Stop the lathe at the end of the current job.</li>
   <li>Fill the way-oil tank with the specified slideway oil (ISO VG 68).</li>
   <li>Do one lubrication cycle. Make sure that the alarm does not come back.</li>
  </ol>
  <div class="muted" style="margin-top:6px">Your team can do this. Call a specialist only if the alarm comes back after the refill.</div></div>
 <div style="display:flex;gap:8px;flex-wrap:wrap">
  <span class="btn primary sm">Make a job for maintenance</span><span class="btn ghost sm">Remind me after the refill</span>${lg?'<span class="btn ghost sm">Show the log</span>':''}</div>
 <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center"><span class="faint" style="font-size:12px">Sources:</span>
  <span class="chip src">${ICON.log}Machine log</span><span class="chip src">${ICON.mic}Microphone</span><span class="chip src">${ICON.power}Power meter</span><span class="chip src">${ICON.doc}Manual p. 112</span></div>
</div>`};
