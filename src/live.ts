/**
 * Live TxLINE data produced by the keeper (`npm run keeper:run` from repo root).
 * Falls back to mock constants in data.ts when the keeper has not run yet.
 */
import {
  FIXTURE as MOCK_FIXTURE,
  MATCH_EVENTS as MOCK_EVENTS,
  FULL_TIME_MINUTE as MOCK_FT,
  LANES as MOCK_LANES,
  PROOF_FIELDS as MOCK_PROOF,
  RACE_DURATION_MS,
} from './data'
import raw from './live-data.json'

export interface LiveData {
  generatedAt: string
  network: string
  programId: string
  apiOrigin: string
  subscriptionTx: string
  subscriptionExplorer: string
  fixture: {
    id: number
    home: string
    away: string
    participant1: string
    participant2: string
    participant1IsHome: boolean
    startTime: string | null
    competition: string
  }
  finalScore: {
    home: number
    away: number
    participant1Goals: number
    participant2Goals: number
  }
  outcome: 'HOME' | 'AWAY' | 'DRAW'
  proof: {
    seq: number
    targetTs: number
    epochDay: number
    fixtureId: number
    eventStatRoot: string | number[]
    eventStatsSubTreeRoot: string | number[]
    mainTreeProofDepth: number
    subTreeProofDepth: number
    statProofDepth: number
  }
  onChain: {
    method: string
    dailyScoresRootSeed: string
    homeGoalsProven: boolean
    outcomeProven: boolean
    verified: boolean
  }
  timing: {
    detectMs: number
    proofFetchMs: number
    onChainVerifyMs: number
    totalMs: number
  }
  endpointsUsed: string[]
  timeline: Array<{
    seq: number
    ts: number
    score: { home: number; away: number } | null
    action?: string
    phase?: number | string
    statusId?: number
  }>
}

const LIVE = raw as unknown as LiveData
export const HAS_LIVE = Boolean(LIVE?.fixture?.id && LIVE.onChain?.verified)

export function liveFixture() {
  if (!HAS_LIVE) {
    return {
      id: MOCK_FIXTURE.id,
      home: MOCK_FIXTURE.home,
      away: MOCK_FIXTURE.away,
      competition: MOCK_FIXTURE.competition,
      market: MOCK_FIXTURE.market,
      rulebook: MOCK_FIXTURE.rulebook,
      escrowUsdc: MOCK_FIXTURE.escrowUsdc,
      fixtureId: null as number | null,
      source: 'mock' as const,
    }
  }
  return {
    id: String(LIVE.fixture.id),
    home: LIVE.fixture.home,
    away: LIVE.fixture.away,
    competition: `${LIVE.fixture.competition} · live TxLINE historical replay`,
    market: 'Full-time result (90 minutes)',
    rulebook: 'Result at 90′ + stoppage. Extra time & penalties excluded.',
    escrowUsdc: 204_500,
    fixtureId: LIVE.fixture.id,
    source: 'txline' as const,
  }
}

/** Build animated match events from the TxLINE score timeline. */
export function liveMatchEvents() {
  if (!HAS_LIVE || !LIVE.timeline?.length) {
    return { events: MOCK_EVENTS, fullTimeMinute: MOCK_FT }
  }

  const events: { minute: number; label: string; score: [number, number] }[] = [
    { minute: 1, label: 'Kick-off', score: [0, 0] },
  ]
  let last: [number, number] = [0, 0]
  let idx = 0
  for (const row of LIVE.timeline) {
    if (!row.score) continue
    const next: [number, number] = [row.score.home, row.score.away]
    if (next[0] === last[0] && next[1] === last[1]) continue
    last = next
    idx++
    const minute = Math.min(90, 5 + idx * 8)
    events.push({ minute, label: row.action === 'game_finalised' ? 'Full time' : `Goal update (seq ${row.seq})`, score: next })
  }
  const final = LIVE.finalScore
  const ftScore: [number, number] = [final.home, final.away]
  if (events[events.length - 1]?.score[0] !== ftScore[0] || events[events.length - 1]?.score[1] !== ftScore[1]) {
    events.push({ minute: 97, label: 'Full time', score: ftScore })
  } else {
    events[events.length - 1] = { minute: 97, label: 'Full time', score: ftScore }
  }
  return { events, fullTimeMinute: 97 }
}

export function liveProofFields() {
  if (!HAS_LIVE) return MOCK_PROOF
  const s = LIVE.finalScore
  const root = LIVE.proof.eventStatRoot
  const shortRoot =
    typeof root === 'string' && root.length > 12
      ? `${root.slice(0, 8)}…${root.slice(-6)}`
      : Array.isArray(root)
        ? `${root.slice(0, 3).join(',')}…`
        : String(root)
  return [
    { k: 'fixtureId', v: String(LIVE.fixture.id) },
    { k: 'seq', v: String(LIVE.proof.seq) },
    { k: 'state', v: '"game_finalised"' },
    { k: 'score', v: `{ home: ${s.home}, away: ${s.away} }` },
    { k: 'outcome', v: `"${LIVE.outcome}"` },
    { k: 'source', v: '"TxOdds / TxLINE"' },
    { k: 'programId', v: `"${LIVE.programId.slice(0, 9)}…"` },
    { k: 'eventStatRoot', v: `"${shortRoot}"`, sig: true },
    { k: 'onChainVerified', v: String(LIVE.onChain.verified), sig: true },
  ]
}

export function liveLanes() {
  if (!HAS_LIVE) return MOCK_LANES
  const ms = LIVE.timing
  const settleMs = Math.max(3000, ms.totalMs)
  const proofMs = ms.proofFetchMs
  const verifyMs = ms.proofFetchMs + ms.onChainVerifyMs
  const outcome = LIVE.outcome
  const home = LIVE.fixture.home
  const away = LIVE.fixture.away
  const score = `${LIVE.finalScore.home}-${LIVE.finalScore.away}`

  return MOCK_LANES.map((lane) => {
    if (lane.id !== 'finalwhistle') return lane
    return {
      ...lane,
      finalChip: `SETTLED · T+${(settleMs / 1000).toFixed(1)}s`,
      steps: [
        { at: 300, t: 'T+0.3s', label: `Keeper ingested fixture ${LIVE.fixture.id} from TxLINE historical feed`, tone: 'ok' as const },
        { at: proofMs, t: `T+${(proofMs / 1000).toFixed(1)}s`, label: `stat-validation proof fetched (seq ${LIVE.proof.seq})`, tone: 'ok' as const },
        { at: verifyMs, t: `T+${(verifyMs / 1000).toFixed(1)}s`, label: `validateStat verified on Solana devnet — program ${LIVE.programId.slice(0, 6)}…`, tone: 'ok' as const },
        { at: settleMs - 400, t: `T+${((settleMs - 400) / 1000).toFixed(1)}s`, label: `Rulebook: ${home} ${score} ${away} → ${outcome}`, tone: 'ok' as const },
        { at: settleMs, t: `T+${(settleMs / 1000).toFixed(1)}s`, label: `Escrow released — ${outcome} holders paid`, tone: 'ok' as const },
      ],
    }
  })
}

export function liveRaceDurationMs() {
  if (!HAS_LIVE) return RACE_DURATION_MS
  return Math.max(6000, LIVE.timing.totalMs + 2000)
}

export function liveTickerItems(): string[] {
  if (!HAS_LIVE) return []
  const f = LIVE.fixture
  const s = LIVE.finalScore
  return [
    `PROOF VERIFIED ON-CHAIN · ${f.home} ${s.home}-${s.away} ${f.away} · T+${(LIVE.timing.totalMs / 1000).toFixed(1)}s`,
    `TXLINE FIXTURE ${LIVE.fixture.id} · SEQ ${LIVE.proof.seq}`,
    `SOLANA ${LIVE.network.toUpperCase()} · ${LIVE.programId.slice(0, 8)}…`,
    `SUBSCRIPTION TX · ${LIVE.subscriptionTx.slice(0, 8)}…`,
    LIVE.onChain.verified ? 'VALIDATESTAT ✓ · MERKLE ROOT MATCH' : 'VALIDATION PENDING',
  ]
}

export function liveFeedSeed() {
  if (!HAS_LIVE) return null
  const f = LIVE.fixture
  return {
    fixture: `${f.home.slice(0, 3).toUpperCase()} vs ${f.away.slice(0, 3).toUpperCase()}`,
    market: `Full-time result → ${LIVE.outcome}`,
    usdc: 204_500,
    settleMs: LIVE.timing.totalMs,
    verified: LIVE.onChain.verified,
    fixtureId: LIVE.fixture.id,
  }
}

export { LIVE }
