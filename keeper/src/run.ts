import { AxiosInstance } from 'axios'
import fs from 'node:fs'
import path from 'node:path'
import { NETWORK, CFG, PATHS } from './config.js'
import { loadOrCreateKeypair, makeConnection } from './wallet.js'
import { makeProvider, loadProgram } from './solana.js'
import {
  guestJwt,
  activate,
  apiClient,
  loadCredentials,
  saveCredentials,
  fixturesSnapshot,
  scoresHistorical,
  scoresSnapshot,
  statValidation,
} from './txline.js'
import { validateSingleStat, validateTwoStat, statValue } from './validate.js'

/** Recent finalised World Cup fixtures (see TxLINE Schedule), newest first. */
const CANDIDATE_FIXTURES = [
  18209181, // France vs Morocco — Quarter-final, Jul 9
  18202783, // Switzerland vs Colombia — Jul 7
  18202701, // Argentina vs Egypt — Jul 7
  18198205, // Portugal vs Spain — Jul 6
  18192996, // Mexico vs England — Jul 6
  18187298, // Brazil vs Norway — Jul 5
  18188721, // Paraguay vs France — Jul 4
  18185036, // Canada vs Morocco — Jul 4
]

/** Devnet fixture snapshot is sparse — names from TxLINE World Cup schedule. */
const FIXTURE_NAMES: Record<number, { p1: string; p2: string; p1Home: boolean; label: string }> = {
  18209181: { p1: 'France', p2: 'Morocco', p1Home: true, label: 'World Cup · Quarter-finals' },
  18202783: { p1: 'Switzerland', p2: 'Colombia', p1Home: true, label: 'World Cup · Round of 16' },
  18202701: { p1: 'Argentina', p2: 'Egypt', p1Home: true, label: 'World Cup · Round of 16' },
  18198205: { p1: 'Portugal', p2: 'Spain', p1Home: true, label: 'World Cup · Round of 16' },
  18192996: { p1: 'Mexico', p2: 'England', p1Home: true, label: 'World Cup · Round of 16' },
  18187298: { p1: 'Brazil', p2: 'Norway', p1Home: true, label: 'World Cup · Round of 16' },
  18188721: { p1: 'Paraguay', p2: 'France', p1Home: true, label: 'World Cup · Round of 16' },
  18185036: { p1: 'Canada', p2: 'Morocco', p1Home: true, label: 'World Cup · Round of 16' },
}

const FINALISED_PHASES = new Set([5, 10, 13, 15]) // F, FET, FPE, Abandoned

function isFinalised(rec: any): boolean {
  const action = (rec.action ?? rec.Action ?? '').toString().toLowerCase()
  if (action === 'game_finalised') return true
  const status = rec.statusId ?? rec.StatusId
  if (status === 100) return true
  const phase = rec.gameState ?? rec.GameState ?? rec.period ?? rec.Period
  return typeof phase === 'number' && FINALISED_PHASES.has(phase)
}

function seqOf(rec: any): number {
  return rec.Seq ?? rec.seq
}

function goalsFromRecord(rec: any): { p1: number; p2: number } | null {
  const stats = rec.Stats ?? rec.stats
  if (stats && typeof stats['1'] === 'number' && typeof stats['2'] === 'number') {
    return { p1: stats['1'], p2: stats['2'] }
  }
  const score = rec.Score ?? rec.score
  const p1 = score?.Participant1?.Total?.Goals
  const p2 = score?.Participant2?.Total?.Goals
  if (typeof p1 === 'number' && typeof p2 === 'number') return { p1, p2 }
  return null
}

/** Renews the guest JWT; reuses the cached API token unless activation is rejected. */
async function freshClient(): Promise<{ client: AxiosInstance; jwt: string; apiToken: string; txSig: string }> {
  const creds = loadCredentials()
  if (!creds) throw new Error('No credentials. Run `npm run activate` first.')

  const jwt = await guestJwt()
  let apiToken = creds.apiToken
  let client = apiClient(jwt, apiToken)

  // Probe with a lightweight endpoint; renew JWT on 401, re-activate only if token is invalid.
  try {
    await client.get('/api/fixtures/snapshot', { timeout: 15000 })
  } catch (err: any) {
    const status = err?.response?.status
    const body = JSON.stringify(err?.response?.data ?? '')
    if (status === 401) {
      const freshJwt = await guestJwt()
      client = apiClient(freshJwt, apiToken)
      await client.get('/api/fixtures/snapshot', { timeout: 15000 })
      return { client, jwt: freshJwt, apiToken, txSig: creds.txSig }
    }
    if (status === 403 && !body.includes('already been used')) {
      const kp = loadOrCreateKeypair()
      apiToken = await activate(creds.txSig, jwt, kp)
      client = apiClient(jwt, apiToken)
    }
  }

  saveCredentials({ ...creds, jwt, apiToken })
  return { client, jwt, apiToken, txSig: creds.txSig }
}

async function findFinalisedFixture(client: AxiosInstance): Promise<{ fixtureId: number; records: any[]; final: any }> {
  const forced = process.env.FIXTURE_ID ? [Number(process.env.FIXTURE_ID)] : CANDIDATE_FIXTURES
  for (const fixtureId of forced) {
    try {
      let records = await scoresHistorical(client, fixtureId)
      if (!records?.length) records = await scoresSnapshot(client, fixtureId)
      if (!records?.length) continue
      const final = [...records].reverse().find(isFinalised)
      if (final && Number.isInteger(seqOf(final))) {
        console.log(`[keeper] using fixture ${fixtureId} — ${records.length} records, final seq=${seqOf(final)}`)
        return { fixtureId, records, final }
      }
      console.log(`[keeper] fixture ${fixtureId}: ${records.length} records, no finalised record yet`)
    } catch (err: any) {
      console.log(`[keeper] fixture ${fixtureId} unavailable: ${err?.response?.status ?? err.message}`)
    }
  }
  throw new Error('No finalised World Cup fixture available in the historical window. Set FIXTURE_ID.')
}

function scoreFromRecord(rec: any, p1Home = true): { home: number; away: number } | null {
  const g = goalsFromRecord(rec)
  if (!g) return null
  return p1Home ? { home: g.p1, away: g.p2 } : { home: g.p2, away: g.p1 }
}

async function main() {
  const t0 = Date.now()
  console.log(`[keeper] network=${NETWORK}`)

  const { client, txSig } = await freshClient()

  // 1. Ingest fixtures (market identity) + locate a finalised match.
  const { fixtureId, records, final } = await findFinalisedFixture(client)
  const seq = seqOf(final)
  const tDetect = Date.now()

  // 2. Fetch the on-chain-anchored validation proof for the final goal counts.
  //    statKey 1 = Participant 1 total goals, statKey 2 = Participant 2 total goals.
  const validation = await statValidation(client, { fixtureId, seq, statKey: 1, statKey2: 2 })
  const tProof = Date.now()

  const homeGoals = statValue(validation.statToProve)
  const awayGoals = statValue(validation.statToProve2)
  console.log(`[keeper] proven goals from feed: home=${homeGoals} away=${awayGoals}`)

  // 3. Verify the proof on-chain via the TxLINE program (read-only simulation).
  const setupProvider = makeProvider(makeConnection(), loadOrCreateKeypair())
  const program = await loadProgram(setupProvider)

  const margin = (homeGoals ?? 0) - (awayGoals ?? 0)
  const outcome = margin > 0 ? 'HOME' : margin < 0 ? 'AWAY' : 'DRAW'
  const comparison = margin > 0 ? 'greaterThan' : margin < 0 ? 'lessThan' : 'equalTo'

  const homeProven = await validateSingleStat(program, validation, {
    threshold: homeGoals ?? 0,
    comparison: 'equalTo',
  })
  const outcomeProven = await validateTwoStat(program, validation, 'subtract', {
    threshold: 0,
    comparison,
  })
  const tVerify = Date.now()
  console.log(`[keeper] on-chain homeGoals==${homeGoals}: ${homeProven}`)
  console.log(`[keeper] on-chain outcome ${outcome} (margin ${comparison} 0): ${outcomeProven}`)

  // 4. Build fixture metadata + a match timeline for the frontend.
  const fixtures = await fixturesSnapshot(client).catch(() => [] as any[])
  const meta = fixtures.find((f) => (f.FixtureId ?? f.fixtureId) === fixtureId)
  const known = FIXTURE_NAMES[fixtureId]
  const p1 = meta?.Participant1 ?? meta?.participant1 ?? known?.p1 ?? 'Participant 1'
  const p2 = meta?.Participant2 ?? meta?.participant2 ?? known?.p2 ?? 'Participant 2'
  const p1Home = meta?.Participant1IsHome ?? known?.p1Home ?? true
  const home = p1Home ? p1 : p2
  const away = p1Home ? p2 : p1

  const timeline = records
    .map((r) => ({
      seq: seqOf(r),
      ts: r.ts ?? r.Ts,
      score: scoreFromRecord(r, p1Home),
      action: r.action ?? r.Action,
      phase: r.gameState ?? r.GameState,
      statusId: r.statusId ?? r.StatusId,
    }))
    .filter((r) => Number.isInteger(r.seq))

  const targetTs = Number(validation.summary.updateStats.minTimestamp)
  const epochDay = Math.floor(targetTs / 86400000)

  const output = {
    generatedAt: new Date().toISOString(),
    network: NETWORK,
    programId: CFG.programId.toBase58(),
    apiOrigin: CFG.apiOrigin,
    subscriptionTx: txSig,
    subscriptionExplorer: `https://explorer.solana.com/tx/${txSig}?cluster=${NETWORK}`,
    fixture: {
      id: fixtureId,
      home,
      away,
      participant1: p1,
      participant2: p2,
      participant1IsHome: p1Home,
      startTime: meta?.StartTime ?? meta?.startTime ?? null,
      competition: known?.label ?? 'FIFA World Cup 2026',
    },
    finalScore: {
      home: p1Home ? homeGoals : awayGoals,
      away: p1Home ? awayGoals : homeGoals,
      participant1Goals: homeGoals,
      participant2Goals: awayGoals,
    },
    outcome, // relative to participant1/2
    proof: {
      seq,
      targetTs,
      epochDay,
      fixtureId: validation.summary?.fixtureId,
      eventStatRoot: validation.eventStatRoot,
      eventStatsSubTreeRoot: validation.summary?.eventStatsSubTreeRoot,
      mainTreeProofDepth: validation.mainTreeProof?.length,
      subTreeProofDepth: validation.subTreeProof?.length,
      statProofDepth: validation.statProof?.length,
    },
    onChain: {
      method: 'validateStat',
      dailyScoresRootSeed: 'daily_scores_roots',
      homeGoalsProven: homeProven,
      outcomeProven,
      verified: homeProven && outcomeProven,
    },
    timing: {
      detectMs: tDetect - t0,
      proofFetchMs: tProof - tDetect,
      onChainVerifyMs: tVerify - tProof,
      totalMs: tVerify - t0,
    },
    endpointsUsed: [
      'POST /auth/guest/start',
      'POST /api/token/activate',
      'GET /api/fixtures/snapshot',
      'GET /api/scores/historical/{fixtureId}',
      'GET /api/scores/stat-validation',
      'program.validateStat (on-chain view)',
    ],
    timeline,
  }

  const outPath = path.resolve(PATHS.out)
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2))
  console.log(`[keeper] wrote ${outPath}`)
  console.log(`[keeper] SETTLED ${home} vs ${away} → ${outcome} in ${output.timing.totalMs}ms (verified=${output.onChain.verified})`)
}

main().catch((e) => {
  const detail = e?.response?.data ? JSON.stringify(e.response.data) : (e.stack || e.message)
  console.error('[keeper] FAILED:', detail)
  process.exit(1)
})
