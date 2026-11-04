// "Security standards" section. Injected by build-site.mjs before "Book a demo".
// 4 Nov (Catalin): show the security standards customers ask for.
// PanelPal is not certified yet, so every standard shows its honest status. Do not change a status to
// "Certified" until the certificate exists: certification marks (Cyber Essentials, ISO) are for holders only.

const STANDARDS = [
  { code: "CE+", name: "Cyber Essentials Plus", what: "The UK government-backed baseline, tested by an independent assessor. Many UK and public-sector buyers ask for it.", status: "First target", tone: "next" },
  { code: "27001", name: "ISO/IEC 27001", what: "The international standard for how a company manages information security. Manufacturers often ask for it when they check a supplier.", status: "Working towards", tone: "next" },
  { code: "62443", name: "IEC 62443", what: "Security for industrial automation and control systems. It guides how we design the camera, the on-site box and their network.", status: "Guides our design", tone: "run" },
  { code: "GDPR", name: "UK GDPR and Data Protection Act 2018", what: "The law for personal data in the UK. The cameras read machine screens, not people.", status: "Required by law", tone: "run" },
  { code: "CRA", name: "EU Cyber Resilience Act", what: "Security rules for connected products sold in the EU. Reporting duties start in September 2026, and the full rules apply from December 2027.", status: "Preparing for EU sales", tone: "later" },
  { code: "SOC 2", name: "SOC 2 Type II", what: "An independent report on security controls over time. US customers usually ask for it.", status: "For US customers", tone: "later" },
];

const PRACTICES = [
  ["Encrypted", "Readings are encrypted on your network and in storage."],
  ["Signed updates", "The camera and the on-site box accept only updates that we sign."],
  ["Least access", "Each person sees only the sites and machines that you give them."],
  ["Audit trail", "Every sign-in, setting change and export is logged."],
  ["Tested", "Independent penetration tests before launch, then every year."],
  ["Report a problem", "Found a security issue? Email contact@panelpal.co.uk."],
];

const shield = (code) => `<svg viewBox="0 0 64 72" aria-hidden="true"><path d="M32 3 L59 13 V35 C59 52 47 63 32 69 C17 63 5 52 5 35 V13 Z" fill="#e5effa" stroke="#2874d2" stroke-width="3"/><path d="M32 10 L52 17.5 V35 C52 48 43 56.5 32 61.5 C21 56.5 12 48 12 35 V17.5 Z" fill="#fff"/><text x="32" y="${code.length > 4 ? 41 : 42}" font-family="Inter, system-ui, sans-serif" font-size="${code.length > 4 ? 11.5 : code.length > 3 ? 13 : 15}" font-weight="700" fill="#1d5fae" text-anchor="middle">${code}</text></svg>`;

export const SECURITY_SECTION_HTML = `<section id="security"><div class="wrap">
  <div class="sec-head"><p class="eyebrow">Security standards</p><h2 class="h2">Built for the standards your auditors ask for.</h2><p>PanelPal is new, so we are not certified yet. These are the standards we build to, with the status of each one.</p></div>
  <ul class="sx">
${STANDARDS.map((s) => `    <li class="card">${shield(s.code)}<div><span class="sx-st ${s.tone}">${s.status}</span><h3>${s.name}</h3><p>${s.what}</p></div></li>`).join("\n")}
  </ul>
  <h3 class="sx-h">Good practice we build in</h3>
  <ul class="sx-p">
${PRACTICES.map(([b, t]) => `    <li><b>${b}</b><span>${t.replace("contact@panelpal.co.uk", '<a href="mailto:contact@panelpal.co.uk">contact@panelpal.co.uk</a>')}</span></li>`).join("\n")}
  </ul>
  <p class="note">Ask us about security in your demo. We will tell you where each standard is up to.</p>
</div></section>

`;

export const SECURITY_SECTION_CSS = `.sx{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.sx li{display:flex;gap:16px;align-items:flex-start;padding:22px 22px 24px;margin:0}
.sx svg{width:54px;height:61px;flex:none}
.sx h3{font-size:var(--type-lg);margin:8px 0 6px;line-height:1.25}
.sx p{margin:0;color:var(--color-muted);font-size:var(--type-sm);line-height:var(--leading-relaxed)}
.sx-st{display:inline-block;font-size:var(--type-xs);font-weight:600;border-radius:var(--radius-pill);padding:2px 10px;white-space:nowrap}
.sx-st.run{background:var(--color-running-soft);color:var(--color-running)}
.sx-st.next{background:var(--color-accent-soft);color:var(--color-accent-strong)}
.sx-st.later{background:var(--color-surface-2);color:var(--color-muted)}
.sx-h{font-size:var(--type-lg);margin:40px 0 14px}
.sx-p{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,1fr);gap:14px 20px}
.sx-p li{margin:0;padding:16px 18px;border-radius:var(--radius-card);background:var(--color-surface-2)}
.sx-p b{display:block;margin-bottom:4px;font-size:var(--type-sm)}
.sx-p span{font-size:var(--type-sm);color:var(--color-muted)}
@media (max-width:1000px){.sx,.sx-p{grid-template-columns:1fr 1fr}}
@media (max-width:760px){.sx,.sx-p{grid-template-columns:1fr}}`;
