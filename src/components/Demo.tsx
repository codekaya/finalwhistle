import { useCallback, useEffect, useRef, useState } from 'react'
import {
  FIXTURE,
  FULL_TIME_MINUTE,
  LANES,
  MATCH_EVENTS,
  PROOF_FIELDS,
  RACE_DURATION_MS,
  type Lane,
} from '../data'
import { Reveal, SectionHead, toneBg, toneChip, toneText } from './ui'

type Phase = 'idle' | 'match' | 'race' | 'done'
const MATCH_MS = 5200

/* ---- Proof verification card ---- */
function ProofCard({ show, verified }: { show: boolean; verified: boolean }) {
  return (
    <div
      className={`overflow-hidden rounded-xl border bg-bg transition-all duration-500 ${
        show ? 'opacity-100' : 'pointer-events-none max-h-0 opacity-0'
      } ${verified ? 'border-accent/40' : 'border-line'}`}
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <span className="mono text-[10.5px] uppercase tracking-[0.16em] text-muted">
          TxLINE validation proof
        </span>
        <span
          className={`rounded-md border px-2 py-0.5 mono text-[10px] uppercase tracking-wider transition-colors duration-300 ${
            verified ? toneChip('ok') : 'border-warn/40 bg-warn/10 text-warn'
          }`}
        >
          {verified ? 'signature ✓' : 'verifying…'}
        </span>
      </div>
      <div className="p-4">
        <pre className="mono text-[11.5px] leading-relaxed">
          <span className="text-faint">{'{'}</span>
          {PROOF_FIELDS.map((f) => (
            <div key={f.k} className="pl-3">
              <span className="text-muted">{f.k}</span>
              <span className="text-faint">: </span>
              <span className={f.sig && verified ? 'text-accent' : 'text-ink'}>{f.v}</span>
              <span className="text-faint">,</span>
            </div>
          ))}
          <span className="text-faint">{'}'}</span>
        </pre>
      </div>
    </div>
  )
}

/* ---- One racing lane ---- */
function LaneTrack({ lane, elapsed, phase }: { lane: Lane; elapsed: number; phase: Phase }) {
  const isUs = lane.id === 'finalwhistle'
  const steps = lane.steps
  const lastAt = steps[steps.length - 1].at
  const active = phase === 'race' || phase === 'done'
  const visible = active ? steps.filter((s) => elapsed >= s.at) : []
  const current = visible[visible.length - 1]
  const finished = phase === 'done' || (phase === 'race' && elapsed >= lastAt)
  const progress = !active ? 0 : Math.min(1, elapsed / lastAt)

  return (
    <div
      className={`rounded-xl border p-4 transition-colors duration-300 ${
        isUs ? 'border-accent/40 bg-accent/[0.04]' : 'border-line bg-surface'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 shrink-0 rounded-full ${isUs ? 'bg-accent' : toneBg(lane.finalTone)}`} />
            <h4 className="truncate text-[14px] font-semibold">{lane.name}</h4>
          </div>
          <p className="mono mt-0.5 text-[10.5px] text-faint">{lane.method}</p>
        </div>
        {finished ? (
          <span
            className={`shrink-0 rounded-md border px-2 py-1 mono text-[10px] font-medium tnum ${toneChip(lane.finalTone)}`}
          >
            {lane.finalChip}
          </span>
        ) : active ? (
          <span className="pulse mono shrink-0 text-[10px] uppercase tracking-wider text-muted">running</span>
        ) : (
          <span className="mono shrink-0 text-[10px] uppercase tracking-wider text-faint">idle</span>
        )}
      </div>

      {/* progress bar */}
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-bg">
        <div
          className={`h-full rounded-full ${toneBg(lane.finalTone)} transition-[width] duration-300 ease-out`}
          style={{ width: `${progress * 100}%`, opacity: lane.finalTone === 'ok' ? 1 : 0.6 }}
        />
      </div>

      {/* current status line */}
      <div className="mt-3 min-h-[34px] rounded-lg border border-line/60 bg-bg/60 px-3 py-2">
        {current ? (
          <div className="flex items-start gap-2">
            <span className={`mono shrink-0 text-[10.5px] tnum ${toneText(current.tone)}`}>{current.t}</span>
            <span className="text-[11.5px] leading-snug text-muted">{current.label}</span>
          </div>
        ) : (
          <span className="text-[11.5px] text-faint">
            {phase === 'idle' ? 'Awaiting kick-off' : 'Settlement starts at full time'}
          </span>
        )}
      </div>
    </div>
  )
}

export default function Demo() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [matchMs, setMatchMs] = useState(0)
  const raf = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current)
    }
  }, [])

  const start = useCallback(() => {
    if (raf.current !== null) cancelAnimationFrame(raf.current)
    setPhase('match')
    setElapsed(0)
    setMatchMs(0)
    const t0 = performance.now()
    const tick = (now: number) => {
      const dt = now - t0
      if (dt < MATCH_MS) {
        setMatchMs(dt)
        raf.current = requestAnimationFrame(tick)
      } else if (dt < MATCH_MS + RACE_DURATION_MS) {
        setMatchMs(MATCH_MS)
        setPhase('race')
        setElapsed(dt - MATCH_MS)
        raf.current = requestAnimationFrame(tick)
      } else {
        setElapsed(RACE_DURATION_MS)
        setPhase('done')
      }
    }
    raf.current = requestAnimationFrame(tick)
  }, [])

  const minute = Math.min(FULL_TIME_MINUTE, Math.round((matchMs / MATCH_MS) * FULL_TIME_MINUTE))
  const events = MATCH_EVENTS.filter((e) => e.minute <= minute)
  const score = events.length ? events[events.length - 1].score : [0, 0]
  const ft = phase === 'race' || phase === 'done'
  const proofShow = phase === 'done' || (phase === 'race' && elapsed >= 1100)
  const proofVerified = phase === 'done' || (phase === 'race' && elapsed >= 2400)

  return (
    <section id="demo" className="border-y border-line bg-bg-2">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
        <SectionHead
          index="02"
          kicker="Live demo"
          title="The settlement race"
          sub="One match, three settlement mechanisms, same starting gun. A historical replay of the 2022 World Cup Final — football's most famous rulebook edge case: the trophy went to Argentina, but the 90-minute market settles as a draw."
        />

        <Reveal>
          <div className="grid gap-5 lg:grid-cols-[1fr_1.05fr] lg:items-start">
            {/* Left column — scoreboard + proof */}
            <div className="flex flex-col gap-5">
              {/* Scoreboard */}
              <div className="overflow-hidden rounded-2xl border border-line bg-surface">
                <div className="flex items-center justify-between border-b border-line px-5 py-3">
                  <span className="mono text-[11px] uppercase tracking-[0.14em] text-faint">
                    {FIXTURE.competition}
                  </span>
                  <span className={`mono text-[12px] tnum ${ft ? 'text-accent' : 'text-muted'}`}>
                    {phase === 'idle' ? "0'" : ft ? "FT 90'+8" : `${minute}'`}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 px-5 py-6">
                  <div className="flex flex-1 items-center justify-between">
                    <span className="text-[15px] font-semibold sm:text-lg">{FIXTURE.home}</span>
                    <span className="mono px-4 text-2xl font-bold text-accent tnum sm:text-3xl">
                      {score[0]}<span className="px-1 text-faint">:</span>{score[1]}
                    </span>
                    <span className="text-[15px] font-semibold sm:text-lg">{FIXTURE.away}</span>
                  </div>
                </div>
                {/* event timeline */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-line px-5 py-3">
                  {events
                    .filter((e) => e.minute > 1 && e.minute < FULL_TIME_MINUTE)
                    .map((e) => (
                      <span key={e.minute} className="feed-row-enter mono text-[11px] text-muted tnum">
                        <span className="text-accent">{e.minute}'</span> {e.label}
                      </span>
                    ))}
                  {events.length <= 1 && (
                    <span className="mono text-[11px] text-faint">events appear as the match plays…</span>
                  )}
                </div>
                {/* market + rulebook */}
                <div className="grid gap-px border-t border-line bg-line sm:grid-cols-2">
                  <div className="bg-surface px-5 py-3">
                    <div className="mono text-[10px] uppercase tracking-wider text-faint">market · escrow</div>
                    <div className="mt-0.5 text-[12.5px] text-ink">
                      {FIXTURE.market} ·{' '}
                      <span className="mono text-accent tnum">{FIXTURE.escrowUsdc.toLocaleString('en-US')} USDC</span>
                    </div>
                  </div>
                  <div className="bg-surface px-5 py-3">
                    <div className="mono text-[10px] uppercase tracking-wider text-faint">rulebook</div>
                    <div className="mt-0.5 text-[12.5px] text-muted">{FIXTURE.rulebook}</div>
                  </div>
                </div>

                {/* CTA */}
                <div className="border-t border-line p-4">
                  <button
                    type="button"
                    onClick={start}
                    className="ring-focus group flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-3 text-sm font-semibold text-[#04120a] transition-transform duration-150 hover:-translate-y-px"
                  >
                    {phase === 'idle' ? 'Kick off & run the race' : phase === 'done' ? 'Replay' : 'Playing…'}
                    {phase === 'idle' && <span className="group-hover:translate-x-0.5">→</span>}
                  </button>
                </div>
              </div>

              <ProofCard show={proofShow} verified={proofVerified} />
            </div>

            {/* Right column — lanes */}
            <div className="flex flex-col gap-4">
              {LANES.map((lane) => (
                <LaneTrack key={lane.id} lane={lane} elapsed={elapsed} phase={phase} />
              ))}

              {/* verdict */}
              <div
                className={`rounded-xl border p-4 text-[12.5px] leading-relaxed transition-all duration-500 ${
                  phase === 'done'
                    ? 'border-accent/30 bg-accent/[0.05] opacity-100'
                    : 'pointer-events-none max-h-0 overflow-hidden border-transparent opacity-0'
                }`}
              >
                <span className="font-semibold text-ink">Why we settle what the others fight over: </span>
                <span className="text-muted">
                  Argentina lifted the trophy — but this market's rulebook settles on the 90-minute result:
                  a draw. FinalWhistle resolved that ambiguity at market <em>creation</em>, so there's
                  nothing left to dispute. The oracle lane is still voting on exactly this question, funds locked.
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
