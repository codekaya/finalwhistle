import { FAILURES, LATENCY } from '../data'
import { Reveal, SectionHead, toneBg, toneChip, toneText } from './ui'

function LatencyChart() {
  return (
    <div className="rounded-2xl border border-line bg-surface/50 p-6 sm:p-8">
      <div className="mb-6 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold">Time to settle a finished match</h3>
        <span className="mono text-[11px] uppercase tracking-wider text-faint">log scale</span>
      </div>
      <div className="flex flex-col gap-5">
        {LATENCY.map((b, i) => (
          <div key={b.name}>
            <div className="mb-1.5 flex items-baseline justify-between gap-4">
              <span className={`text-[13.5px] font-medium ${b.tone === 'ok' ? 'text-ink' : 'text-muted'}`}>
                {b.name}
              </span>
              <span className={`mono text-[12px] font-medium tnum ${toneText(b.tone)}`}>{b.label}</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-bg">
              <div
                className={`bar-grow h-full origin-left rounded-full ${toneBg(b.tone)}`}
                style={{
                  width: `${Math.max(4, b.fill * 100)}%`,
                  opacity: b.tone === 'ok' ? 1 : 0.7,
                  animationDelay: `${150 + i * 110}ms`,
                }}
              />
            </div>
            <p className="mt-1.5 text-[12px] leading-snug text-faint">{b.detail}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Problem() {
  return (
    <section id="problem" className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
      <SectionHead
        index="01"
        kicker="The problem"
        title={
          <>
            Settlement looks trivial.
            <br />
            It's the sector's weakest link.
          </>
        }
        sub={`"Did X happen? Pay the winners." Simple — until VAR overturns a goal ten minutes later, a match is abandoned, or a market never defined whether extra time counts. Here is how a $45B/month industry answers "who gets the money" today.`}
      />

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <Reveal>
          <LatencyChart />
        </Reveal>

        <div className="grid gap-4">
          {FAILURES.map((f, i) => (
            <Reveal key={f.name} delay={i * 90}>
              <article className="group rounded-xl border border-line bg-surface p-5 transition-colors duration-200 hover:border-line-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold leading-tight">{f.name}</h3>
                    <span className="mono text-[11px] uppercase tracking-wider text-faint">{f.who}</span>
                  </div>
                  <span
                    className={`shrink-0 rounded-md border px-2 py-0.5 mono text-[10px] uppercase tracking-wider ${toneChip(f.tone)}`}
                  >
                    {f.tone === 'bad' ? 'broken' : 'fragile'}
                  </span>
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-muted">{f.how}</p>
                <ul className="mt-4 grid gap-2 border-t border-line pt-4 sm:grid-cols-3">
                  {f.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-[12px] leading-snug text-muted">
                      <span className={`mt-1 h-1 w-1 shrink-0 rounded-full ${toneBg(f.tone)}`} aria-hidden />
                      {p}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal delay={120}>
        <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-accent/25 bg-gradient-to-br from-accent/[0.07] to-transparent p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8">
          <span className="kicker shrink-0">Our position</span>
          <p className="max-w-3xl text-[15px] leading-relaxed sm:text-base">
            A football score is not an opinion — it's an objective fact with an official, first-party
            source. Putting it to a token vote is putting <em className="text-accent not-italic">"what time is it?"</em> to a
            referendum: slower, costlier, and less accurate. Objective events need a named, accountable
            source cryptographically bound to its data — and code that verifies it.
          </p>
        </div>
      </Reveal>
    </section>
  )
}
