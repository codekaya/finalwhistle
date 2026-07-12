import * as anchor from '@coral-xyz/anchor'
import { Connection, Keypair } from '@solana/web3.js'
import fs from 'node:fs'
import path from 'node:path'
import { CFG, PATHS } from './config.js'

/** Builds an AnchorProvider backed by a local Keypair (no browser wallet). */
export function makeProvider(connection: Connection, kp: Keypair): anchor.AnchorProvider {
  const wallet = new anchor.Wallet(kp)
  const provider = new anchor.AnchorProvider(connection, wallet, { commitment: 'confirmed' })
  anchor.setProvider(provider)
  return provider
}

/**
 * Loads the TxLINE program. Prefers a cached local IDL; otherwise fetches the
 * IDL published on-chain by the program (anchor idl) and caches it.
 */
export async function loadProgram(
  provider: anchor.AnchorProvider,
): Promise<anchor.Program> {
  const idlPath = path.resolve(PATHS.idl)
  let idl: anchor.Idl | null = null

  if (fs.existsSync(idlPath)) {
    idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'))
  } else {
    console.log('[solana] no cached IDL, fetching from chain…')
    idl = await anchor.Program.fetchIdl(CFG.programId, provider)
    if (!idl) {
      throw new Error(
        `Could not fetch on-chain IDL for ${CFG.programId.toBase58()}. ` +
          `Provide a local IDL at ${PATHS.idl} (from the TxLINE devnet examples repo).`,
      )
    }
    fs.mkdirSync(path.dirname(idlPath), { recursive: true })
    fs.writeFileSync(idlPath, JSON.stringify(idl, null, 2))
    console.log(`[solana] cached IDL → ${idlPath}`)
  }

  // anchor 0.30 reads the program id from idl.address
  if (!(idl as any).address) (idl as any).address = CFG.programId.toBase58()
  const program = new anchor.Program(idl, provider)
  if (!program.programId.equals(CFG.programId)) {
    throw new Error(
      `IDL program ${program.programId.toBase58()} != configured ${CFG.programId.toBase58()}`,
    )
  }
  return program
}
