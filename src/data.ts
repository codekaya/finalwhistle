export interface MatchEvent {
  minute: number
  label: string
  score: [number, number]
}

// FIFA World Cup Final 2022 — the canonical rulebook edge case:
// Argentina lifted the trophy, but the 90-minute result was a draw.
export const FIXTURE = {
  id: 'FIX-2022-WC-FINAL',
  home: 'Argentina',
  away: 'France',
  competition: 'FIFA World Cup Final · Historical replay via TxLINE',
  market: 'Full-time result (90 minutes)',
  rulebook: 'Settles on the score at 90\u2032 + stoppage. Extra time and penalties do not count.',
  escrowUsdc: 200_000,
}

export const MATCH_EVENTS: MatchEvent[] = [
  { minute: 1, label: 'Kick-off', score: [0, 0] },
  { minute: 23, label: 'GOAL — Messi (pen)', score: [1, 0] },
  { minute: 36, label: 'GOAL — Di María', score: [2, 0] },
  { minute: 80, label: 'GOAL — Mbappé (pen)', score: [2, 1] },
  { minute: 81, label: 'GOAL — Mbappé', score: [2, 2] },
  { minute: 97, label: 'FULL TIME — 2 : 2', score: [2, 2] },
]

export const FULL_TIME_MINUTE = 97

export interface LaneStep {
  /** ms after full time (real time in the demo) when this step activates */
  at: number
  /** simulated elapsed time label shown to the viewer */
  t: string
  label: string
  tone: 'ok' | 'warn' | 'bad' | 'idle'
}

export interface Lane {
  id: string
  name: string
  method: string
  finalChip: string
  finalTone: 'ok' | 'warn' | 'bad'
  steps: LaneStep[]
}

export const LANES: Lane[] = [
  {
    id: 'finalwhistle',
    name: 'FinalWhistle',
    method: 'Signed proof, verified by code on Solana',
    finalChip: 'SETTLED · T+4.2s',
    finalTone: 'ok',
    steps: [
      { at: 300, t: 'T+0.3s', label: 'Keeper detects full time on TxLINE score stream', tone: 'ok' },
      { at: 1100, t: 'T+1.1s', label: 'Score validation proof fetched from TxLINE', tone: 'ok' },
      { at: 2400, t: 'T+2.4s', label: 'ed25519 signature verified on-chain — source: TxOdds', tone: 'ok' },
      { at: 3300, t: 'T+3.3s', label: 'Rulebook check: 90\u2032 result = DRAW', tone: 'ok' },
      { at: 4200, t: 'T+4.2s', label: 'Escrow released — DRAW holders paid 200,000 USDC', tone: 'ok' },
    ],
  },
  {
    id: 'vote',
    name: 'Optimistic oracle',
    method: 'Propose → challenge window → token-holder vote',
    finalChip: 'STILL DISPUTED · T+48h',
    finalTone: 'bad',
    steps: [
      { at: 1500, t: 'T+6min', label: 'Someone proposes "Draw" and posts a bond', tone: 'warn' },
      { at: 3200, t: 'T+2h', label: 'Challenge window open — liquidity locked, everyone waits', tone: 'warn' },
      { at: 5000, t: 'T+2h 04m', label: 'DISPUTED — "Argentina won the trophy, how is this a draw?"', tone: 'bad' },
      { at: 6800, t: 'T+26h', label: 'Escalated to token-holder vote. Whales hold the swing votes', tone: 'bad' },
      { at: 8400, t: 'T+48h', label: 'Still voting. Funds still locked', tone: 'bad' },
    ],
  },
  {
    id: 'ops',
    name: 'Manual ops desk',
    method: 'A person checks the result and clicks a button',
    finalChip: 'SETTLED · T+6h (trust us)',
    finalTone: 'warn',
    steps: [
      { at: 1800, t: 'T+15min', label: 'Match added to the settlement queue', tone: 'warn' },
      { at: 3800, t: 'T+2h', label: 'Waiting for an operator to pick it up', tone: 'warn' },
      { at: 5800, t: 'T+4h 30m', label: 'Operator cross-checks sources, fills in the result form', tone: 'warn' },
      { at: 7600, t: 'T+6h', label: 'Settled manually. You trusted them — you had no choice', tone: 'warn' },
    ],
  },
]

export const RACE_DURATION_MS = 9000

export const PROOF_SAMPLE = `{
  "fixtureId": "FIX-2022-WC-FINAL",
  "state": "FULL_TIME",
  "score": { "home": 2, "away": 2 },
  "clock": "90'+8",
  "source": "TxOdds",
  "sourcePubkey": "9ExbZjAapQ...JgcKaA",
  "ts": "T+0.9s",
  "sig": "3hQfNz8vKp...e2Wm7R"
}`
