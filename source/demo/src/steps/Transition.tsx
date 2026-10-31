import { useDemo } from "../demo";
import { Btn, usePulse } from "../components/Btn";
import { Check, Chevron } from "../components/ui";

/** Break page between Demo 1 (the whole site) and Demo 2 (one device). Last stage of step 7. */
const DONE = ["Describe the site", "Check the layout", "Add a camera", "Log live", "All 12 machines live"];
const NEXT = ["Describe one device", "Point one camera", "Read one screen"];

export function Transition() {
  const { next } = useDemo();
  return (
    <div className="no-scrollbar h-full overflow-y-auto bg-bg">
      <div className="pp-fadein mx-auto flex min-h-full max-w-[720px] flex-col justify-center px-5 py-8 lg:px-8">
        <div className="text-xs font-semibold uppercase tracking-wide text-faint">Demo 1 of 2 · finished</div>
        <h1 className="font-display mt-2 text-[30px] leading-tight lg:text-[40px]">Demo 1 complete: the whole site</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">Every machine on the floor is live on one screen, with no engineer and no wiring.</p>

        <ul className="mt-5 grid grid-cols-2 gap-2" aria-label="Demo 1 summary">
          {DONE.map((d) => (
            <li key={d} className="flex items-center gap-2 rounded-[10px] border border-border bg-surface px-3 py-2 text-[13px] sm:text-sm">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-running-soft text-running"><Check className="h-3.5 w-3.5" /></span>{d}
            </li>
          ))}
        </ul>

        <div className="mt-6 rounded-[16px] border-[1.5px] border-accent bg-accent-soft p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-accent-strong">Demo 2 of 2</div>
          <h2 className="font-display mt-1 text-[22px] leading-tight lg:text-[26px]">Next, Demo 2: one device, one camera, one screen.</h2>
          <p className="mt-1.5 text-sm text-text">A lab with one benchtop centrifuge. No layout step: it goes straight to the camera.</p>
          <ol className="mt-3 flex flex-wrap gap-2 text-sm">
            {NEXT.map((n, i) => (
              <li key={n} className="flex items-center gap-1.5 rounded-full border border-border bg-bg px-3 py-1">
                <span className="tnum grid h-5 w-5 place-items-center rounded-full border-[1.5px] border-accent text-[11px] font-semibold text-accent-strong">{i + 1}</span>{n}
              </li>
            ))}
          </ol>
        </div>

        {/* Sticky on small screens so the highlighted button is always in view. */}
        <div className="sticky bottom-0 mt-6 flex justify-end bg-bg py-3 sm:static sm:py-0">
          <Btn pulse onClick={next} className="w-full sm:w-auto">Start Demo 2 <Chevron dir="right" /></Btn>
        </div>
      </div>
    </div>
  );
}

/**
 * Closing page: last stage of the last step. Links are relative to the demo folder, so they work on
 * the GitHub dev path (/ai-factory-manager/demo/ -> /ai-factory-manager/) and at a domain root (/demo/ -> /).
 * "#join" is the site's existing "Book a demo" section. No form and no data collection here.
 */
export const SITE_HOME = "../";
export const SITE_BOOK = "../#join";

export function Closing() {
  const { go } = useDemo();
  const hl = usePulse(true);
  return (
    <div className="no-scrollbar h-full overflow-y-auto bg-bg">
      <div className="pp-fadein mx-auto flex min-h-full max-w-[640px] flex-col items-center justify-center px-5 py-8 text-center lg:px-8">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-running-soft text-running"><Check className="h-6 w-6" /></span>
        <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-faint">Demo 2 of 2 · finished</div>
        <h1 className="font-display mt-2 text-[30px] leading-tight lg:text-[40px]">You’ve completed the PanelPal demo</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">A whole site, then one device. The same camera reads the screen that is already there.</p>
        <div className="mt-6 flex w-full flex-col items-center gap-3 sm:w-auto">
          <a href={SITE_BOOK} className={`btn-primary w-full sm:w-auto ${hl}`}>Book a demo with us <Chevron dir="right" /></a>
          <a href={SITE_HOME} className="text-sm font-semibold text-accent-strong underline underline-offset-4 hover:text-accent">Back to the PanelPal website</a>
          <button type="button" onClick={() => go(1)} className="mt-1 text-xs text-muted underline underline-offset-4 hover:text-text">Restart demo</button>
        </div>
        <p className="mt-6 text-xs text-faint">All data in this demo is example data.</p>
      </div>
    </div>
  );
}

/**
 * Break page between step 6 (one machine set up) and step 7 (the full site). Last stage of step 6.
 * The preview is a still of step 7's own desktop view (2D plan), captured from this demo: no new data.
 */
export function SetupDone() {
  const { next } = useDemo();
  return (
    <div className="no-scrollbar h-full overflow-y-auto bg-bg">
      <div className="pp-fadein mx-auto flex min-h-full max-w-[960px] flex-col justify-center px-5 py-8 lg:px-8">
        <div className="text-xs font-semibold uppercase tracking-wide text-faint">One machine · finished</div>
        <h1 className="font-display mt-2 text-[30px] leading-tight lg:text-[40px]">Setup demo complete</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">We now move from a demo with one machine to the full demo with many machines: the same site, with all 12 machines live.</p>
        <figure className="mt-5">
          <div className="overflow-hidden rounded-[14px] border border-border bg-surface-2 shadow-raised">
            <div className="flex items-center gap-1.5 border-b border-border bg-bg px-3 py-2" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-border-strong" /><span className="h-2.5 w-2.5 rounded-full bg-border-strong" /><span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
              <span className="ml-2 truncate text-[11px] text-muted">Site view · Example Factory Ltd · Unit 1</span>
            </div>
            <img src="img/final-site-preview.jpg" alt="Preview of the fully set-up site view: a 2D plan of the factory with all 12 machines live, 9 running, 2 idle and 1 alarm. Example data."
              className="block w-full" />
          </div>
          <figcaption className="mt-1.5 text-xs text-muted">Preview of the full site view. Example data.</figcaption>
        </figure>
        <div className="sticky bottom-0 mt-6 flex justify-end bg-bg py-3 sm:static sm:py-0">
          <Btn pulse onClick={next} className="w-full sm:w-auto">See the full site <Chevron dir="right" /></Btn>
        </div>
      </div>
    </div>
  );
}
