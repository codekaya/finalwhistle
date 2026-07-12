import { ENDPOINTS } from '../data'
import { HAS_LIVE, LIVE } from '../live'
import { Reveal, SectionHead } from './ui'

export default function Stack() {
  const endpoints = HAS_LIVE
    ? LIVE.endpointsUsed.map((e) => {
        const [method, path] = e.split(' ')
        return { name: `${method} ${path}`, use: 'Used by FinalWhistle keeper in this build' }
      })
    : ENDPOINTS.map((e) => ({ name: e.name, use: e.use }))

  return (
    <section id="stack" className="border-t border-line bg-bg-2">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
        <SectionHead
          index="04"
          kicker="Under the hood"
          title="Built on TxLINE, anchored on Solana"
          sub={
            HAS_LIVE
              ? `TxLINE devnet data for fixture ${LIVE.fixture.id}. Subscription tx on Solana; score proof verified via ${LIVE.onChain.method} against Merkle roots.`
              : "TxLINE is TxOdds' on-chain sports data service: first-party data, signed at the source, with validation proofs anchored on Solana."
          }
        />

        {HAS_LIVE && (
          <Reveal className="mb-6">
            <div className="flex flex-wrap gap-3 rounded-xl border border-accent/30 bg-accent/[0.04] px-4 py-3 text-[12.5px]">
              <span className="mono text-accent">fixture {LIVE.fixture.id}</span>
              <span className="text-faint">·</span>
              <a href={LIVE.subscriptionExplorer} className="mono text-muted underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
                subscription tx
              </a>
              <span className="text-faint">·</span>
              <span className="mono text-muted">verified={String(LIVE.onChain.verified)}</span>
              <span className="text-faint">·</span>
              <span className="mono text-muted">T+{(LIVE.timing.totalMs / 1000).toFixed(1)}s</span>
            </div>
          </Reveal>
        )}

        <Reveal>
          <div className="overflow-hidden rounded-2xl border border-line">
            {endpoints.map((e, i) => (
              <div
                key={e.name}
                className={`group grid grid-cols-1 gap-1 px-5 py-4 transition-colors duration-150 hover:bg-surface-2 sm:grid-cols-[minmax(180px,240px)_1fr] sm:items-center sm:gap-6 ${
                  i !== endpoints.length - 1 ? 'border-b border-line' : ''
                } ${i % 2 === 0 ? 'bg-surface' : 'bg-surface/40'}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                  <span className="mono text-[13px] font-medium text-accent">{e.name}</span>
                </div>
                <span className="text-[13.5px] text-muted">{e.use}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
