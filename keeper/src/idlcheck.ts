import * as anchor from '@coral-xyz/anchor'
import { Keypair } from '@solana/web3.js'
import { CFG } from './config.js'
import { makeConnection } from './wallet.js'
import { makeProvider, loadProgram } from './solana.js'

async function main() {
  const connection = makeConnection()
  const provider = makeProvider(connection, Keypair.generate())
  console.log(`[idl] fetching on-chain IDL for ${CFG.programId.toBase58()}…`)
  const program = await loadProgram(provider)
  const methods = Object.keys((program as any).methods ?? {})
  console.log(`[idl] OK — instructions: ${methods.join(', ')}`)
  const raw = await anchor.Program.fetchIdl(CFG.programId, provider)
  console.log(`[idl] account types: ${(raw as any)?.accounts?.map((a: any) => a.name).join(', ')}`)
}

main().catch((e) => {
  console.error('[idl] FAILED:', e.message)
  process.exit(1)
})
