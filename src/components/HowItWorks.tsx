import { SDK_CODE, STEPS } from '../data'
import { Reveal, SectionHead } from './ui'

/* Lightweight token highlighter for the SDK snippet */
function highlight(code: string) {
  const keywords = /\b(import|from|const|await|new|return)\b/g
  const strings = /("[^"]*")/g
  return code.split('\n').map((line, i) => {
    const parts: (string | { t: 'kw' | 'str' | 'com'; v: string })[] = []
    if (line.trim().startsWith('//')) {
      parts.push({ t: 'com', v: line })
    } else {
      // naive: mark strings first, then keywords, render segment by segment
      let rest = line
      const tokens: { start: number; end: number; t: 'kw' | 'str' }[] = []
      let m: RegExpExecArray | null
      strings.lastIndex = 0
      while ((m = strings.exec(rest))) tokens.push({ start: m.index, end: m.index + m[0].length, t: 'str' })
      keywords.lastIndex = 0
      while ((m = keywords.exec(rest))) {
        const overlap = tokens.some((t) => m!.index >= t.start && m!.index < t.end)
        if (!overlap) tokens.push({ start: m.index, end: m.index + m[0].length, t: 'kw' })
      }
      tokens.sort((a, b) => a.start - b.start)
      let cursor = 0
      for (const t of tokens) {
        if (t.start > cursor) parts.push(rest.slice(cursor, t.start))
        parts.push({ t: t.t, v: rest.slice(t.start, t.end) })
        cursor = t.end
      }
      if (cursor < rest.length) parts.push(rest.slice(cursor))
    }
    return (
      <div key={i} className="table-row">
        <span className="table-cell select-none pr-4 text-right text-faint/50">{i + 1}</span>
        <span className="table-cell whitespace-pre-wrap">
          {parts.map((p, j) =>
            typeof p === 'string' ? (
              <span key={j} className="text-ink/90">{p}</span>
            ) : (
              <span
                key={j}
                className={p.t === 'kw' ? 'text-accent' : p.t === 'str' ? 'text-warn' : 'text-faint italic'}
              >
                {p.v}
              </span>
            ),
          )}
        </span>
      </div>
    )
  })
}

export default function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
      <SectionHead
        index="03"
        kicker="How it works"
        title="Six steps, zero humans"
        sub="From market creation to payout, every step is either code or a signature. The only trust in the system is named, accountable, and cryptographically bound to what it says."
      />

      {/* Stepped flow */}
      <div className="relative">
        <div className="absolute left-[15px] top-2 bottom-2 hidden w-px bg-line md:block" aria-hidden />
        <ol className="flex flex-col gap-3">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i * 70}>
              <div className="group relative flex gap-5 rounded-xl border border-line bg-surface p-5 transition-colors duration-200 hover:border-line-2 md:pl-14">
                <span className="mono absolute left-1 top-5 hidden h-8 w-8 items-center justify-center rounded-full border border-line bg-bg text-[12px] font-medium text-accent tnum md:flex">
                  {s.n}
                </span>
                <span className="mono shrink-0 text-[13px] font-medium text-accent tnum md:hidden">{s.n}</span>
                <div>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-muted">{s.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>

      {/* SDK + honest scope / business */}
      <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
        <Reveal>
          <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-bg">
            <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-danger/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-warn/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-accent/60" />
              </div>
              <span className="mono text-[11px] text-faint">settle-a-market.ts</span>
            </div>
            <div className="flex-1 overflow-x-auto p-4">
              <code className="mono table text-[12px] leading-[1.7]">{highlight(SDK_CODE)}</code>
            </div>
            <p className="border-t border-line px-4 py-2.5 text-[12px] text-muted">
              Twenty lines and payouts run themselves — <span className="text-ink">Stripe for event settlement.</span>
            </p>
          </div>
        </Reveal>

        <div className="grid gap-5">
          <Reveal delay={80}>
            <div className="rounded-2xl border border-line bg-surface p-6">
              <h3 className="mb-2 flex items-center gap-2 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Honest scope
              </h3>
              <p className="text-[13.5px] leading-relaxed text-muted">
                We don't claim to have solved the oracle problem — nobody has. We claim that for objective,
                officially-sourced events, an accountable first-party source beats an anonymous vote on
                speed, cost, and accuracy. If a source signs a wrong score, the signature is
                non-repudiable evidence — and the verifier takes <span className="text-ink">N-of-M sources</span> from
                day one. TxLINE is source #1, not the ceiling.
              </p>
            </div>
          </Reveal>
          <Reveal delay={140}>
            <div className="rounded-2xl border border-line bg-surface p-6">
              <h3 className="mb-2 flex items-center gap-2 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" /> The business
              </h3>
              <p className="text-[13.5px] leading-relaxed text-muted">
                Basis points on every settlement. The wedge is the long tail: builders who want event
                markets but can't run ops teams or oracle committees. The World Cup is the launch
                vertical; TxLINE covers <span className="text-ink">1,000+ leagues</span>, and the engine
                settles anything with a signed official source — sports, elections, weather, macro prints.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
