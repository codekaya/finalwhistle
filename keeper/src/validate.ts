import * as anchor from '@coral-xyz/anchor'
import BN from 'bn.js'
import { PublicKey, ComputeBudgetProgram } from '@solana/web3.js'

export function toBytes32(value: string | number[] | Uint8Array): number[] {
  const bytes = Array.isArray(value)
    ? Uint8Array.from(value)
    : value instanceof Uint8Array
      ? value
      : value.startsWith('0x')
        ? Buffer.from(value.slice(2), 'hex')
        : Buffer.from(value, 'base64')
  if (bytes.length !== 32) throw new Error(`Expected 32 bytes, received ${bytes.length}`)
  return Array.from(bytes)
}

export function toProofNodes(
  nodes: Array<{ hash: string | number[] | Uint8Array; isRightSibling: boolean }>,
) {
  return nodes.map((n) => ({ hash: toBytes32(n.hash), isRightSibling: n.isRightSibling }))
}

function deriveDailyScoresPda(programId: PublicKey, targetTsMs: number): { pda: PublicKey; epochDay: number } {
  const epochDay = Math.floor(targetTsMs / 86400000)
  if (epochDay > 0xffff) throw new Error('Proof timestamp outside u16 epoch-day range')
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('daily_scores_roots'), new BN(epochDay).toArrayLike(Buffer, 'le', 2)],
    programId,
  )
  return { pda, epochDay }
}

type Comparison = 'greaterThan' | 'lessThan' | 'equalTo'

function buildFixtureSummary(v: any) {
  return {
    fixtureId: new BN(v.summary.fixtureId),
    updateStats: {
      updateCount: v.summary.updateStats.updateCount,
      minTimestamp: new BN(v.summary.updateStats.minTimestamp),
      maxTimestamp: new BN(v.summary.updateStats.maxTimestamp),
    },
    eventsSubTreeRoot: toBytes32(v.summary.eventStatsSubTreeRoot),
  }
}

/**
 * Runs the TxLINE program's `validateStat` as a read-only simulation (.view()).
 * Returns whether the on-chain Merkle proof + predicate hold. This is the
 * trustless core: the score is proven against the on-chain root, not asserted.
 */
export async function validateSingleStat(
  program: anchor.Program,
  validation: any,
  predicate: { threshold: number; comparison: Comparison },
): Promise<boolean> {
  const targetTs = Number(validation.summary.updateStats.minTimestamp)
  const { pda } = deriveDailyScoresPda(program.programId, targetTs)

  const fixtureSummary = buildFixtureSummary(validation)
  const fixtureProof = toProofNodes(validation.subTreeProof)
  const mainTreeProof = toProofNodes(validation.mainTreeProof)
  const stat1 = {
    statToProve: validation.statToProve,
    eventStatRoot: toBytes32(validation.eventStatRoot),
    statProof: toProofNodes(validation.statProof),
  }
  const computeIx = ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 })

  try {
    const sim = await program.methods
      .validateStat(
        new BN(targetTs),
        fixtureSummary,
        fixtureProof,
        mainTreeProof,
        { threshold: predicate.threshold, comparison: { [predicate.comparison]: {} } },
        stat1,
        null,
        null,
      )
      .accounts({ dailyScoresMerkleRoots: pda })
      .preInstructions([computeIx])
      .simulate()
    return !sim.raw?.err
  } catch {
    return false
  }
}

/**
 * Two-stat validation: proves (stat1 op stat2) against a predicate on-chain.
 * Used to prove the final match margin (home goals − away goals).
 */
export async function validateTwoStat(
  program: anchor.Program,
  validation: any,
  op: 'subtract' | 'add',
  predicate: { threshold: number; comparison: Comparison },
): Promise<boolean> {
  const targetTs = Number(validation.summary.updateStats.minTimestamp)
  const { pda } = deriveDailyScoresPda(program.programId, targetTs)

  const fixtureSummary = buildFixtureSummary(validation)
  const fixtureProof = toProofNodes(validation.subTreeProof)
  const mainTreeProof = toProofNodes(validation.mainTreeProof)
  const stat1 = {
    statToProve: validation.statToProve,
    eventStatRoot: toBytes32(validation.eventStatRoot),
    statProof: toProofNodes(validation.statProof),
  }
  const stat2 = {
    statToProve: validation.statToProve2,
    eventStatRoot: toBytes32(validation.eventStatRoot),
    statProof: toProofNodes(validation.statProof2),
  }
  const computeIx = ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 })

  try {
    const sim = await program.methods
      .validateStat(
        new BN(targetTs),
        fixtureSummary,
        fixtureProof,
        mainTreeProof,
        { threshold: predicate.threshold, comparison: { [predicate.comparison]: {} } },
        stat1,
        stat2,
        { [op]: {} },
      )
      .accounts({ dailyScoresMerkleRoots: pda })
      .preInstructions([computeIx])
      .simulate()
    return !sim.raw?.err
  } catch {
    return false
  }
}

export function statValue(statToProve: any): number | null {
  if (statToProve == null) return null
  if (typeof statToProve === 'number') return statToProve
  if (typeof statToProve.value === 'number') return statToProve.value
  const v = statToProve.value ?? statToProve.Value ?? statToProve.stat
  return typeof v === 'number' ? v : null
}
