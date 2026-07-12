import { useEffect, useRef, useState } from 'react'
import { FEED_POOL, type FeedItem } from '../data'
import { HAS_LIVE, liveFeedSeed } from '../live'

interface Row extends FeedItem {
  id: number
  born: number
}

let counter = 0

function fmtUsdc(n: number) {
  return n.toLocaleString('en-US')
}

export default function LiveFeed() {
  const [rows, setRows] = useState<Row[]>([])
  const [total, setTotal] = useState(2_412_800)
  const [count, setCount] = useState(3184)
  const idx = useRef(0)

  useEffect(() => {
    const live = liveFeedSeed()
    const pool: FeedItem[] = live
      ? [{ fixture: live.fixture, market: live.market, usdc: live.usdc, settleMs: live.settleMs }, ...FEED_POOL]
      : FEED_POOL

    // seed a few
    const seed: Row[] = Array.from({ length: 4 }).map(() => {
      const item = pool[idx.current++ % pool.length]
      return { ...item, id: counter++, born: performance.now() }
    })
    setRows(seed)

    const timer = setInterval(() => {
      const item = pool[idx.current++ % pool.length]
      const row: Row = { ...item, id: counter++, born: performance.now() }
      setRows((prev) => [row, ...prev].slice(0, 6))
      setTotal((t) => t + item.usdc)
      setCount((c) => c + 1)
    }, 2200)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-surface/70 backdrop-blur-sm">
      {/* header */}
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="pulse absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <span className="mono text-[11px] uppercase tracking-[0.16em] text-muted">
            settlement feed · live
          </span>
        </div>
        <span className="mono text-[11px] text-faint">devnet</span>
      </div>

      {/* rows */}
      <div className="mask-y flex h-[300px] flex-col gap-1.5 overflow-hidden p-3">
        {rows.map((r, i) => (
          <div
            key={r.id}
            className={`flex items-center justify-between rounded-lg border border-line/60 bg-bg/60 px-3 py-2.5 ${
              i === 0 ? 'feed-row-enter flash' : ''
            }`}
            style={{ opacity: 1 - i * 0.13 }}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="mono text-[12px] font-medium text-ink">{r.fixture}</span>
                <span className="h-1 w-1 rounded-full bg-faint" />
                <span className="truncate text-[12px] text-muted">{r.market}</span>
              </div>
              <span className="mono text-[10.5px] text-faint tnum">
                proof ✓ · {fmtUsdc(r.usdc)} USDC
              </span>
            </div>
            <span className="ml-3 shrink-0 rounded-md border border-accent/40 bg-accent/10 px-2 py-1 mono text-[10.5px] font-medium text-accent tnum">
              T+{(r.settleMs / 1000).toFixed(1)}s
            </span>
          </div>
        ))}
      </div>

      {/* footer stats */}
      <div className="grid grid-cols-2 gap-px border-t border-line bg-line">
        <div className="bg-surface px-4 py-3">
          <div className="mono text-[10px] uppercase tracking-wider text-faint">settled today</div>
          <div className="mono text-[15px] font-semibold text-ink tnum">{count.toLocaleString('en-US')}</div>
        </div>
        <div className="bg-surface px-4 py-3">
          <div className="mono text-[10px] uppercase tracking-wider text-faint">volume paid out</div>
          <div className="mono text-[15px] font-semibold text-accent tnum">
            ${fmtUsdc(Math.round(total))}
          </div>
        </div>
      </div>

      <p className="border-t border-line px-4 py-2 text-center text-[10.5px] text-faint">
        {HAS_LIVE
          ? `TxLINE fixture ${liveFeedSeed()?.fixtureId} · on-chain proof verified`
          : 'Illustrative feed · run keeper for live TxLINE data'}
      </p>
    </div>
  )
}
