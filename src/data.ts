/* ---------- Live settlement feed (hero) ---------- */
export interface FeedItem {
  fixture: string
  market: string
  usdc: number
  settleMs: number
}

export const FEED_POOL: FeedItem[] = [
  { fixture: 'ARG vs FRA', market: 'Full-time result', usdc: 204_500, settleMs: 4200 },
  { fixture: 'BRA vs GER', market: 'Both teams to score', usdc: 88_120, settleMs: 3800 },
  { fixture: 'ENG vs ESP', market: 'Over 2.5 goals', usdc: 141_900, settleMs: 4600 },
  { fixture: 'POR vs NED', market: 'First goal before 30\u2032', usdc: 52_300, settleMs: 5100 },
  { fixture: 'ITA vs BEL', market: 'Correct score 2-1', usdc: 30_750, settleMs: 3600 },
  { fixture: 'CRO vs URU', market: 'Winner (90\u2032)', usdc: 96_400, settleMs: 4900 },
  { fixture: 'MAR vs SEN', market: 'Clean sheet — home', usdc: 41_800, settleMs: 4100 },
  { fixture: 'USA vs MEX', market: 'Total corners over 9', usdc: 63_250, settleMs: 5300 },
  { fixture: 'JPN vs KOR', market: 'Draw at half-time', usdc: 27_600, settleMs: 3900 },
  { fixture: 'FRA vs BRA', market: 'Player to score — Mbappé', usdc: 118_000, settleMs: 4400 },
]

/* ---------- Ticker strip ---------- */
export const TICKER = [
  'PROOF VERIFIED · ARG 3-3 FRA · T+4.2s',
  '$44.8B PREDICTION MARKET VOLUME — JUNE 2026',
  'ZERO DISPUTES · ZERO OPS DESKS',
  'ed25519 SIGNATURE OK · SOURCE: TxOdds',
  '1,000+ LEAGUES SETTLE THROUGH ONE ENGINE',
  'ESCROW RELEASED · 204,500 USDC',
  '+75% MoM — WORLD CUP LIQUIDITY',
]

/* ---------- Latency comparison (problem) ---------- */
export interface LatencyBar {
  name: string
  detail: string
  /** log-scaled fill 0..1 */
  fill: number
  label: string
  tone: 'ok' | 'warn' | 'bad'
}

export const LATENCY: LatencyBar[] = [
  { name: 'FinalWhistle', detail: 'Signed proof, verified on-chain by code', fill: 0.06, label: '~5 seconds', tone: 'ok' },
  { name: 'Manual ops desk', detail: 'A person checks the result and clicks a button', fill: 0.55, label: '2–6 hours', tone: 'warn' },
  { name: 'Optimistic oracle', detail: 'Propose → challenge window → token-holder vote', fill: 1, label: '2 hours – days', tone: 'bad' },
]

/* ---------- Failure modes (problem) ---------- */
export const FAILURES = [
  {
    name: 'Optimistic oracles',
    who: 'UMA · Polymarket',
    how: 'Someone proposes a result and posts a bond. A 2-hour challenge window opens. Any dispute escalates to a token-holder vote.',
    points: [
      'Days of locked liquidity during disputes',
      'Votes publicly swung by large token holders',
      'A voting machine aimed at a scoreboard',
    ],
    tone: 'bad' as const,
  },
  {
    name: 'Manual ops desks',
    who: 'BetDEX · Monaco',
    how: 'An operations team watches results and settles each market by hand — their own docs say markets are "settled by the BetDEX Operations team".',
    points: [
      'Hours of delay, human error, no audit trail',
      'Cannot scale to thousands of concurrent markets',
      'You trust them — the thing crypto exists to remove',
    ],
    tone: 'warn' as const,
  },
  {
    name: 'In-house resolution',
    who: 'Centralized books',
    how: 'The venue that holds your money also decides who won. Judge, jury, and counterparty in one seat.',
    points: [
      'Structural conflict of interest',
      'Opaque rules, unilateral gray-zone calls',
      'Account limits for winners — the house edits reality',
    ],
    tone: 'bad' as const,
  },
]

/* ---------- Demo: match + race ---------- */
export interface MatchEvent {
  minute: number
  label: string
  score: [number, number]
}

export const FIXTURE = {
  id: 'FIX-2022-WC-FINAL',
  home: 'Argentina',
  away: 'France',
  competition: 'World Cup Final · historical replay via TxLINE',
  market: 'Full-time result (90 minutes)',
  rulebook: 'Result at 90\u2032 + stoppage. Extra time & penalties excluded.',
  escrowUsdc: 204_500,
}

export const MATCH_EVENTS: MatchEvent[] = [
  { minute: 1, label: 'Kick-off', score: [0, 0] },
  { minute: 23, label: 'Messi (pen)', score: [1, 0] },
  { minute: 36, label: 'Di María', score: [2, 0] },
  { minute: 80, label: 'Mbappé (pen)', score: [2, 1] },
  { minute: 81, label: 'Mbappé', score: [2, 2] },
  { minute: 97, label: 'Full time', score: [2, 2] },
]

export const FULL_TIME_MINUTE = 97

export interface LaneStep {
  at: number
  t: string
  label: string
  tone: 'ok' | 'warn' | 'bad'
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
    method: 'Signed proof · verified by code on Solana',
    finalChip: 'SETTLED · T+4.2s',
    finalTone: 'ok',
    steps: [
      { at: 300, t: 'T+0.3s', label: 'Keeper detects full time on the TxLINE score stream', tone: 'ok' },
      { at: 1100, t: 'T+1.1s', label: 'Score validation proof fetched from TxLINE', tone: 'ok' },
      { at: 2400, t: 'T+2.4s', label: 'ed25519 signature verified on-chain — source: TxOdds', tone: 'ok' },
      { at: 3300, t: 'T+3.3s', label: 'Rulebook: result at 90\u2032 = DRAW', tone: 'ok' },
      { at: 4200, t: 'T+4.2s', label: 'Escrow released — DRAW holders paid 204,500 USDC', tone: 'ok' },
    ],
  },
  {
    id: 'vote',
    name: 'Optimistic oracle',
    method: 'Propose → challenge → token vote',
    finalChip: 'DISPUTED · T+48h',
    finalTone: 'bad',
    steps: [
      { at: 1500, t: 'T+6min', label: 'Someone proposes "Draw" and posts a bond', tone: 'warn' },
      { at: 3200, t: 'T+2h', label: 'Challenge window open — liquidity locked, everyone waits', tone: 'warn' },
      { at: 5000, t: 'T+2h04', label: 'DISPUTED — "Argentina won the trophy, how is this a draw?"', tone: 'bad' },
      { at: 6800, t: 'T+26h', label: 'Escalated to token-holder vote. Whales hold the swing votes', tone: 'bad' },
      { at: 8400, t: 'T+48h', label: 'Still voting. Funds still locked', tone: 'bad' },
    ],
  },
  {
    id: 'ops',
    name: 'Manual ops desk',
    method: 'A human checks and clicks',
    finalChip: 'SETTLED · T+6h',
    finalTone: 'warn',
    steps: [
      { at: 1800, t: 'T+15min', label: 'Match added to the settlement queue', tone: 'warn' },
      { at: 3800, t: 'T+2h', label: 'Waiting for an operator to pick it up', tone: 'warn' },
      { at: 5800, t: 'T+4h30', label: 'Operator cross-checks sources, fills the result form', tone: 'warn' },
      { at: 7600, t: 'T+6h', label: 'Settled by hand. You trusted them — you had no choice', tone: 'warn' },
    ],
  },
]

export const RACE_DURATION_MS = 9000

export const PROOF_FIELDS: { k: string; v: string; sig?: boolean }[] = [
  { k: 'fixtureId', v: '"FIX-2022-WC-FINAL"' },
  { k: 'state', v: '"FULL_TIME"' },
  { k: 'score', v: '{ home: 2, away: 2 }' },
  { k: 'clock', v: '"90\'+8"' },
  { k: 'source', v: '"TxOdds"' },
  { k: 'sourcePubkey', v: '"9ExbZjAapQ…JgcKaA"' },
  { k: 'sig', v: '"3hQfNz8vKp…e2Wm7R"', sig: true },
]

/* ---------- How it works ---------- */
export const STEPS = [
  {
    n: '01',
    title: 'Market opens with a rulebook',
    body: 'A builder creates a market through the SDK and pins a machine-readable rulebook — which fixture, which result window (90\u2032 or extra time), how VAR reversals and abandonments resolve. Ambiguity dies here, not at the whistle.',
  },
  {
    n: '02',
    title: 'USDC locked in escrow',
    body: 'Positions fund a Solana escrow owned by the program — not by us, not by the market creator. Nobody can touch it early.',
  },
  {
    n: '03',
    title: 'Keeper watches the stream',
    body: 'Our keeper agent consumes the TxLINE live score stream over SSE. No polling, no humans on shift. Identical on devnet and mainnet.',
  },
  {
    n: '04',
    title: 'Whistle → proof fetched',
    body: 'At full time the keeper pulls the score validation proof — the result signed at the source by TxOdds and anchored on Solana.',
  },
  {
    n: '05',
    title: 'Program verifies on-chain',
    body: 'The Solana program checks the ed25519 signature against the known source key and runs the rulebook. Code decides. No proposal, no challenge window, no vote.',
  },
  {
    n: '06',
    title: 'Escrow released in seconds',
    body: 'Winners are paid about five seconds after full time. The settlement transaction and the proof it verified are public, forever.',
  },
]

/* ---------- SDK snippet ---------- */
export const SDK_CODE = `import { FinalWhistle } from "@finalwhistle/sdk";

const fw = new FinalWhistle({ cluster: "devnet" });

// 1. Open a market with a rulebook — ambiguity resolved up front
const market = await fw.createMarket({
  fixture: "FIX-2022-WC-FINAL",
  outcomes: ["HOME", "DRAW", "AWAY"],
  resolveAt: "FULL_TIME_90",       // extra time excluded
  onVarReversal: "REPRICE",
  source: "txline",                 // signed at the source
});

// 2. Fund positions into program-owned escrow
await market.fund({ outcome: "DRAW", usdc: 204_500 });

// 3. …that's it. The keeper settles on the signed proof.
market.on("settled", (r) => console.log(r.tx, r.paidUsdc));`

/* ---------- TxLINE endpoints ---------- */
export const ENDPOINTS = [
  { name: 'Fixtures', use: 'Market creation — fixture identity, kick-off, tournament structure' },
  { name: 'Scores stream (SSE)', use: 'Keeper trigger — live match state, full-time detection' },
  { name: 'Validation proofs', use: 'The core — signed fixture/score proofs verified on-chain' },
  { name: 'Historical replay', use: 'Deterministic demos and integration tests on finished matches' },
  { name: 'Subscribe + token activation', use: 'On-chain access provisioning on Solana devnet/mainnet' },
]
