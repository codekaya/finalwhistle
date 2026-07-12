import { Reveal } from './ui'

export default function Closer() {
  return (
    <section className="relative overflow-hidden">
      <div className="grid-lines absolute inset-0 opacity-60" aria-hidden />
      <div className="hero-glow absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-4xl px-5 py-24 text-center sm:py-32">
        <Reveal>
          <p className="kicker mb-5">The pitch, in one line</p>
          <h2 className="mx-auto max-w-3xl text-3xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            Everyone's building casinos.
            <br />
            We built the machine that{' '}
            <span className="text-accent">pays them out</span> — every time, in five seconds.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-muted">
            With a proof instead of a promise. Starting with the biggest liquidity event in prediction
            market history.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#demo"
              className="ring-focus group flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-[#04120a] transition-transform duration-150 hover:-translate-y-px"
            >
              Watch it settle
              <span className="transition-transform duration-150 group-hover:translate-x-0.5">→</span>
            </a>
            <a
              href="#top"
              className="ring-focus rounded-lg border border-line bg-surface px-6 py-3 text-sm font-semibold transition-colors duration-150 hover:border-line-2 hover:bg-surface-2"
            >
              Back to top
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
          <span className="text-[13px] text-muted">
            FinalWhistle — TxOdds World Cup Hackathon · Superteam Malaysia
          </span>
        </div>
        <span className="mono text-[11px] uppercase tracking-[0.14em] text-faint">
          Proof, not promise.
        </span>
      </div>
    </footer>
  )
}
