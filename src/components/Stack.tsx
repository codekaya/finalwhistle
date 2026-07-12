import { ENDPOINTS } from '../data'
import { Reveal, SectionHead } from './ui'

export default function Stack() {
  return (
    <section id="stack" className="border-t border-line bg-bg-2">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
        <SectionHead
          index="04"
          kicker="Under the hood"
          title="Built on TxLINE, anchored on Solana"
          sub="TxLINE is TxOdds' on-chain sports data service: first-party data, signed at the source, with validation proofs anchored on Solana. These are the endpoints FinalWhistle runs on."
        />

        <Reveal>
          <div className="overflow-hidden rounded-2xl border border-line">
            {ENDPOINTS.map((e, i) => (
              <div
                key={e.name}
                className={`group grid grid-cols-1 gap-1 px-5 py-4 transition-colors duration-150 hover:bg-surface-2 sm:grid-cols-[minmax(180px,240px)_1fr] sm:items-center sm:gap-6 ${
                  i !== ENDPOINTS.length - 1 ? 'border-b border-line' : ''
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
