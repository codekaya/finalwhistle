import { useCallback, useEffect, useRef, useState } from 'react'
import {
  FIXTURE,
  FULL_TIME_MINUTE,
  LANES,
  MATCH_EVENTS,
  PROOF_SAMPLE,
  RACE_DURATION_MS,
  type Lane,
} from './data'

type Phase = 'idle' | 'match' | 'race' | 'done'

const MATCH_MS = 6000

function toneDot(tone: string) {
  if (tone === 'ok') return 'bg-accent'
  if (tone === 'warn') return 'bg-warn'
  if (tone === 'bad') return 'bg-danger'
  return 'bg-line'
}

function chipClasses(tone: 'ok' | 'warn' | 'bad') {
  if (tone === 'ok') return 'bg-accent-dim text-accent border-accent/30'
  if (tone === 'warn') return 'bg-warn/10 text-warn border-warn/30'
  return 'bg-danger/10 text-danger border-danger/30'
}

function LaneCard({ lane, elapsed, phase }: { lane: Lane; elapsed: number; phase: Phase }) {
  const visible = phase === 'race' || phase === 'done' ? lane.steps.filter((s) => elapsed >= s.at) : []
  const finished = phase === 'done' || (phase === 'race' && elapsed >= lane.steps[lane.steps.length - 1].at)
  const isUs = lane.id === 'finalwhistle'

  return (
    <div
      className={`flex min-h-[280px] flex-col rounded-xl border p-5 ${
        isUs ? 'border-accent/40 bg-surface' : 'border-line bg-surface'
      }`}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <h4 className="font-semibold">{lane.name}</h4>
        {finished ? (
          <span
            className={`rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium tnum ${chipClasses(lane.finalTone)} ${
              isUs ? 'flash-settle' : ''
            }`}
          >
            {lane.finalChip}
          </span>
        ) : phase !== 'idle' ? (
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted">
            <span className={`pulse-dot h-1.5 w-1.5 rounded-full ${isUs ? 'bg-accent' : 'bg-warn'}`} />
            {phase === 'race' ? 'settling' : 'match in play'}
          </span>
        ) : null}
      </div>
      <p className="mb-4 text-xs text-muted">{lane.method}</p>

      <ol className="flex flex-1 flex-col gap-2.5">
        {phase === 'idle' && (
          <li className="text-xs text-muted/70">Waiting for kick-off…</li>
        )}
        {phase === 'match' && (
          <li className="text-xs text-muted/70">Settlement starts at the final whistle.</li>
        )}
        {visible.map((s) => (
          <li key={s.at} className="rise flex items-start gap-2.5">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${toneDot(s.tone)}`} />
            <div>
              <span className="mr-2 font-mono text-[11px] text-muted tnum">{s.t}</span>
              <span className="text-[13px] leading-snug">{s.label}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default function Race() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [matchElapsed, setMatchElapsed] = useState(0)
  const raf = useRef<number | null>(null)

  const stop = useCallback(() => {
    if (raf.current !== null) cancelAnimationFrame(raf.current)
    raf.current = null
  }, [])

  useEffect(() => stop, [stop])

  const start = useCallback(() => {
    stop()
    setPhase('match')
    setElapsed(0)
    setMatchElapsed(0)
    const t0 = performance.now()
    const tick = (now: number) => {
      const dt = now - t0
      if (dt < MATCH_MS) {
        setMatchElapsed(dt)
        raf.current = requestAnimationFrame(tick)
      } else if (dt < MATCH_MS + RACE_DURATION_MS) {
        setMatchElapsed(MATCH_MS)
        setPhase('race')
        setElapsed(dt - MATCH_MS)
        raf.current = requestAnimationFrame(tick)
      } else {
        setElapsed(RACE_DURATION_MS)
        setPhase('done')
      }
    }
    raf.current = requestAnimationFrame(tick)
  }, [stop])

  const minute = Math.min(FULL_TIME_MINUTE, Math.round((matchElapsed / MATCH_MS) * FULL_TIME_MINUTE))
  const currentEvents = MATCH_EVENTS.filter((e) => e.minute <= minute)
  const score = currentEvents.length ? currentEvents[currentEvents.length - 1].score : [0, 0]
  const fullTime = phase === 'race' || phase === 'done'

  return (
    <div className="rounded-2xl border border-line bg-surface-2/60 p-4 sm:p-6">
      {/* Scoreboard */}
      <div className="mb-6 rounded-xl border border-line bg-bg p-5">
        <div className="mb-1 flex items-center justify-between gap-3">
          <p className="text-xs text-muted">{FIXTURE.competition}</p>
          <span className="font-mono text-xs text-muted tnum">
            {phase === 'idle' ? '—' : fullTime ? "FT · 90'+8" : `${minute}'`}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-3 text-lg font-semibold sm:text-2xl">
            <span>{FIXTURE.home}</span>
            <span className="font-mono text-accent tnum">{score[0]} : {score[1]}</span>
            <span>{FIXTURE.away}</span>
          </div>
          <button
            type="button"
            onClick={start}
            className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-bg transition-colors duration-150 hover:bg-accent/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            {phase === 'idle' ? 'Run the settlement race' : 'Replay'}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {currentEvents
            .filter((e) => e.label.startsWith('GOAL') || e.label.startsWith('FULL'))
            .map((e) => (
              <span key={e.minute} className="rise font-mono text-[11px] text-muted tnum">
                {e.minute}&prime; {e.label.replace('GOAL — ', '')}
              </span>
            ))}
        </div>
        <div className="mt-4 grid gap-2 text-xs text-muted sm:grid-cols-2">
          <p>
            <span className="text-ink">Market:</span> {FIXTURE.market} · escrow{' '}
            <span className="font-mono text-ink tnum">{FIXTURE.escrowUsdc.toLocaleString('en-US')} USDC</span>
          </p>
          <p>
            <span className="text-ink">Rulebook:</span> {FIXTURE.rulebook}
          </p>
        </div>
      </div>

      {/* Lanes */}
      <div className="grid gap-4 lg:grid-cols-3">
        {LANES.map((lane) => (
          <LaneCard key={lane.id} lane={lane} elapsed={elapsed} phase={phase} />
        ))}
      </div>

      {/* Proof panel appears once FinalWhistle has verified */}
      {(phase === 'done' || (phase === 'race' && elapsed >= 2400)) && (
        <div className="rise mt-4 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-xl border border-accent/30 bg-bg p-5">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-accent">
              TxLINE score validation proof
            </p>
            <pre className="overflow-x-auto font-mono text-[11.5px] leading-relaxed text-muted">
              {PROOF_SAMPLE}
            </pre>
          </div>
          <div className="rounded-xl border border-line bg-bg p-5 text-sm leading-relaxed text-muted">
            <p className="mb-2 font-semibold text-ink">Why this settles a market the other two fight over</p>
            <p>
              Argentina lifted the trophy — but this market, by its rulebook, settles on the{' '}
              <span className="text-ink">90-minute result: a draw</span>. FinalWhistle resolved that
              ambiguity at market <em>creation</em>, in a machine-readable rulebook, so there is nothing
              left to argue about at the whistle. The optimistic oracle lane is still in a dispute over
              exactly this question — with everyone's money locked while token holders vote.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
