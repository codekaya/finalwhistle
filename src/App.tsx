import Race from './Race'

const STATS = [
  { value: '$44.8B', label: 'prediction market volume, June 2026' },
  { value: '+75%', label: 'month-over-month, driven by the World Cup' },
  { value: '2h–days', label: 'to settle via optimistic oracle disputes' },
  { value: '~5s', label: 'FinalWhistle settlement, proof-verified' },
]

const COMPETITORS = [
  {
    name: 'Optimistic oracles (UMA / Polymarket)',
    how: 'Someone proposes a result and posts a bond. A 2-hour challenge window opens. Any dispute escalates to a token-holder vote.',
    failures: [
      'Days of locked liquidity during disputes',
      'Votes publicly swung by large token holders',
      'Built for subjective questions — overkill for a scoreboard',
    ],
    tone: 'bad' as const,
  },
  {
    name: 'Manual ops desks (BetDEX / Monaco)',
    how: 'An operations team watches results and settles each market by hand. Their own docs say markets are "settled by the BetDEX Operations team".',
    failures: [
      'Hours of delay, human error, no audit trail',
      'Does not scale to thousands of concurrent markets',
      'You simply trust them — the thing crypto exists to remove',
    ],
    tone: 'warn' as const,
  },
  {
    name: 'In-house resolution (centralized books)',
    how: 'The venue that holds your money also decides who won. Judge, jury, and counterparty in one.',
    failures: [
      'Structural conflict of interest',
      'Opaque rules, unilateral gray-zone calls',
      'Account limits for winners — the house always edits',
    ],
    tone: 'bad' as const,
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Market created with a rulebook',
    body: 'A builder opens a market through our SDK. The market pins a machine-readable rulebook: which fixture, which result window (90\u2032 or extra time), how VAR corrections and abandonments resolve. Ambiguity dies here, not after the whistle.',
  },
  {
    n: '02',
    title: 'USDC locked in escrow',
    body: 'Positions are funded into a Solana escrow owned by the program — not by us, not by the market creator.',
  },
  {
    n: '03',
    title: 'Keeper watches the TxLINE stream',
    body: 'Our keeper agent consumes TxLINE\u2019s live score stream (SSE). No polling, no humans on shift. It runs the same on devnet and mainnet.',
  },
  {
    n: '04',
    title: 'Final whistle → proof fetched',
    body: 'At full time the keeper pulls the score validation proof — the result signed at the source by TxOdds, anchored on Solana.',
  },
  {
    n: '05',
    title: 'Program verifies on-chain',
    body: 'The Solana program checks the ed25519 signature against the known source key and evaluates the rulebook. Code decides. No proposal, no challenge window, no vote.',
  },
  {
    n: '06',
    title: 'Escrow released in seconds',
    body: 'Winners are paid ~5 seconds after full time. The settlement transaction and the proof it verified are public, forever.',
  },
]

const ENDPOINTS = [
  { name: 'Fixtures', use: 'Market creation: fixture identity, kick-off times, tournament structure' },
  { name: 'Scores stream (SSE)', use: 'Keeper trigger: live match state, full-time detection' },
  { name: 'Validation proofs', use: 'The core: signed fixture/score proofs verified by our on-chain program' },
  { name: 'Historical replay', use: 'Deterministic demos and integration tests against completed matches' },
  { name: 'On-chain subscribe + token activation', use: 'Access provisioning on Solana devnet/mainnet' },
]

function SectionTitle({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="mb-10 max-w-2xl">
      <p className="mb-2 font-mono text-xs font-medium uppercase tracking-[0.14em] text-accent">{kicker}</p>
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      {sub && <p className="mt-3 text-[15px] leading-relaxed text-muted">{sub}</p>}
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <a href="#top" className="flex items-center gap-2 font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md px-1 -mx-1">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent" aria-hidden />
            FinalWhistle
          </a>
          <div className="flex items-center gap-1 text-sm text-muted">
            <a href="#problem" className="rounded-md px-3 py-2 transition-colors duration-150 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">Problem</a>
            <a href="#demo" className="rounded-md px-3 py-2 transition-colors duration-150 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">Demo</a>
            <a href="#how" className="rounded-md px-3 py-2 transition-colors duration-150 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">How it works</a>
            <a
              href="#demo"
              className="ml-2 rounded-lg bg-accent px-3.5 py-2 font-semibold text-bg transition-colors duration-150 hover:bg-accent/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              Watch it settle
            </a>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section id="top" className="hero-grid relative">
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-20 sm:pb-24 sm:pt-28">
          <p className="rise mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 font-mono text-xs text-muted">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
            Built on Solana · Powered by TxLINE validation proofs
          </p>
          <h1 className="rise max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl">
            Markets settle the moment
            <br />
            the whistle blows.
            <span className="text-accent"> Proof, not promise.</span>
          </h1>
          <p className="rise mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            Prediction markets traded $44.8B last month — then decided who gets paid with token votes
            and ops desks. FinalWhistle verifies cryptographically signed match data on-chain and
            releases escrow in seconds. No votes. No humans. No challenge windows.
          </p>
          <div className="rise mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#demo"
              className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-bg transition-colors duration-150 hover:bg-accent/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              Run the settlement race
            </a>
            <a
              href="#how"
              className="rounded-lg border border-line bg-surface px-5 py-3 text-sm font-semibold transition-colors duration-150 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              How it works
            </a>
          </div>

          {/* Stats */}
          <dl className="rise mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-surface p-5">
                <dt className="order-2 mt-1 block text-xs leading-snug text-muted">{s.label}</dt>
                <dd className="font-mono text-2xl font-semibold tracking-tight text-ink tnum">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Problem */}
      <section id="problem" className="border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <SectionTitle
            kicker="The problem"
            title="Settlement looks trivial. It's the sector's weakest link."
            sub={`"Did X happen? Pay the winners." Simple — until VAR overturns a goal, a match is abandoned, or a market never defined whether extra time counts. Here is how a $45B/month industry answers "who gets the money" today.`}
          />
          <div className="grid gap-4 lg:grid-cols-3">
            {COMPETITORS.map((c) => (
              <article key={c.name} className="flex flex-col rounded-xl border border-line bg-surface p-6">
                <h3 className="font-semibold leading-snug">{c.name}</h3>
                <p className="mt-3 text-[13.5px] leading-relaxed text-muted">{c.how}</p>
                <ul className="mt-5 flex flex-col gap-2.5 border-t border-line pt-5">
                  {c.failures.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13.5px] leading-snug">
                      <span
                        className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${c.tone === 'bad' ? 'bg-danger' : 'bg-warn'}`}
                        aria-hidden
                      />
                      {f}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <div className="mt-8 rounded-xl border border-accent/25 bg-accent-dim p-6">
            <p className="max-w-3xl text-[15px] leading-relaxed">
              <span className="font-semibold text-accent">Our position:</span> a football score is not an
              opinion. It is an objective fact with an official, first-party source. Putting it to a token
              vote is putting <em>"what time is it?"</em> to a referendum. Objective events need a named,
              accountable source cryptographically bound to its data — and code that verifies it.
            </p>
          </div>
        </div>
      </section>

      {/* Demo */}
      <section id="demo" className="border-t border-line bg-surface/40">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <SectionTitle
            kicker="Live demo"
            title="The settlement race"
            sub="One match, three settlement mechanisms, same starting gun. Historical replay of the 2022 World Cup Final — the most famous rulebook edge case in football: the trophy went to Argentina, but the 90-minute market settles as a draw."
          />
          <Race />
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <SectionTitle
            kicker="How it works"
            title="Six steps, zero humans"
            sub="From market creation to payout, every step is either code or a signature. The only trust in the system is named, accountable, and cryptographically bound to what it says."
          />
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="rounded-xl border border-line bg-surface p-6">
                <p className="mb-3 font-mono text-xs font-medium text-accent tnum">{s.n}</p>
                <h3 className="mb-2 font-semibold">{s.title}</h3>
                <p className="text-[13.5px] leading-relaxed text-muted">{s.body}</p>
              </li>
            ))}
          </ol>

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-line bg-surface p-6">
              <h3 className="mb-2 font-semibold">Honest scope — what we claim and what we don't</h3>
              <p className="text-[13.5px] leading-relaxed text-muted">
                We don't claim to have solved the oracle problem — nobody has. We claim that for objective,
                officially-sourced events, an accountable first-party source beats an anonymous vote on
                speed, cost, and accuracy. If the source ever signs a wrong score, the signature is
                non-repudiable evidence — and our verifier is designed for N-of-M sources from day one.
                TxLINE is source #1, not the ceiling.
              </p>
            </div>
            <div className="rounded-xl border border-line bg-surface p-6">
              <h3 className="mb-2 font-semibold">The business</h3>
              <p className="text-[13.5px] leading-relaxed text-muted">
                Basis points on every settlement. Our wedge is the long tail: thousands of builders who
                want event markets but can't run ops teams or oracle committees. Twenty lines of SDK code
                and payouts run themselves — Stripe for event settlement. The World Cup is the launch
                vertical; TxLINE covers 1,000+ leagues, and the engine settles anything with a signed
                official source.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TxLINE integration */}
      <section className="border-t border-line bg-surface/40">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <SectionTitle
            kicker="Under the hood"
            title="Built on TxLINE, anchored on Solana"
            sub="TxLINE is TxOdds' on-chain sports data service: first-party data, signed at the source, with validation proofs anchored on Solana. These are the endpoints FinalWhistle runs on."
          />
          <div className="overflow-hidden rounded-xl border border-line">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-surface">
                  <th scope="col" className="px-5 py-3 font-mono text-xs font-medium uppercase tracking-wider text-muted">Endpoint</th>
                  <th scope="col" className="px-5 py-3 font-mono text-xs font-medium uppercase tracking-wider text-muted">Role in FinalWhistle</th>
                </tr>
              </thead>
              <tbody>
                {ENDPOINTS.map((e) => (
                  <tr key={e.name} className="border-b border-line bg-bg last:border-0">
                    <td className="px-5 py-3.5 font-mono text-[13px] text-accent">{e.name}</td>
                    <td className="px-5 py-3.5 text-[13.5px] text-muted">{e.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm text-muted">
            <span className="inline-block h-2 w-2 rounded-full bg-accent" aria-hidden />
            FinalWhistle — TxOdds World Cup Hackathon · Superteam Malaysia
          </p>
          <p className="font-mono text-xs text-muted">Everyone builds casinos. We pay them out.</p>
        </div>
      </footer>
    </div>
  )
}
