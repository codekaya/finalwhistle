import LiveFeed from './LiveFeed'

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="grid-lines absolute inset-0" aria-hidden />
      <div className="hero-glow absolute inset-0" aria-hidden />
      <div
        className="absolute inset-x-0 top-0 h-px scanline"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-8 lg:pb-28 lg:pt-24">
        {/* Left — copy */}
        <div>
          <div className="reveal in mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 py-1.5 pl-2 pr-3.5 backdrop-blur">
            <span className="rounded-full bg-accent/15 px-2 py-0.5 mono text-[10.5px] font-medium text-accent">
              SOLANA
            </span>
            <span className="mono text-[11px] text-muted">powered by TxLINE validation proofs</span>
          </div>

          <h1 className="reveal in text-[2.6rem] font-bold leading-[1.02] tracking-[-0.02em] sm:text-6xl">
            The whistle blows.
            <br />
            The market{' '}
            <span className="relative whitespace-nowrap text-accent">
              settles itself
              <svg
                className="absolute -bottom-1.5 left-0 w-full"
                height="8"
                viewBox="0 0 300 8"
                fill="none"
                aria-hidden
              >
                <path
                  d="M1 5.5C60 2 120 2 180 4C220 5.2 260 6 299 3.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.5"
                />
              </svg>
            </span>
            .
          </h1>

          <p className="reveal in mt-7 max-w-xl text-[16px] leading-relaxed text-muted sm:text-[17px]">
            Prediction markets traded <span className="text-ink">$44.8B last month</span> — then decided
            who gets paid with token votes that drag on for days, or an ops team clicking buttons in a
            back room. FinalWhistle verifies cryptographically signed match data on-chain and releases
            escrow in <span className="text-ink">about five seconds</span>. No votes. No humans. No
            dispute windows.
          </p>

          <div className="reveal in mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#demo"
              className="ring-focus group flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-[#04120a] transition-transform duration-150 hover:-translate-y-px"
            >
              Run the settlement race
              <span className="transition-transform duration-150 group-hover:translate-x-0.5">→</span>
            </a>
            <a
              href="#problem"
              className="ring-focus rounded-lg border border-line bg-surface px-5 py-3 text-sm font-semibold transition-colors duration-150 hover:border-line-2 hover:bg-surface-2"
            >
              Why it's broken today
            </a>
          </div>

          <p className="reveal in mono mt-9 text-[12px] uppercase tracking-[0.14em] text-faint">
            Proof, not promise.
          </p>
        </div>

        {/* Right — live feed */}
        <div className="reveal in" style={{ transitionDelay: '120ms' }}>
          <LiveFeed />
        </div>
      </div>
    </section>
  )
}
