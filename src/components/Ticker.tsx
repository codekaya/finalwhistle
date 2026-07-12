import { TICKER } from '../data'
import { liveTickerItems } from '../live'

export default function Ticker() {
  const live = liveTickerItems()
  const base = live.length ? [...live, ...TICKER.slice(2)] : TICKER
  const items = [...base, ...base]
  return (
    <div className="relative overflow-hidden border-y border-line bg-bg-2 py-3">
      <div className="marquee-track flex w-max items-center gap-8 whitespace-nowrap">
        {items.map((t, i) => (
          <div key={i} className="flex items-center gap-8">
            <span className="mono text-[11.5px] tracking-wide text-muted">{t}</span>
            <span className="h-1 w-1 rounded-full bg-accent/60" aria-hidden />
          </div>
        ))}
      </div>
    </div>
  )
}
