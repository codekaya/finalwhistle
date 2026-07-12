import { NETWORK, CFG } from './config.js'
import { loadOrCreateKeypair, makeConnection, ensureFunded } from './wallet.js'
import { makeProvider, loadProgram } from './solana.js'

async function main() {
  console.log(`[setup] network=${NETWORK} rpc=${CFG.rpcUrl}`)
  const kp = loadOrCreateKeypair()
  console.log(`[setup] wallet=${kp.publicKey.toBase58()}`)

  const connection = makeConnection()
  await ensureFunded(connection, kp, 0.3)

  const provider = makeProvider(connection, kp)
  const program = await loadProgram(provider)
  console.log(`[setup] program loaded: ${program.programId.toBase58()}`)
  const methods = Object.keys((program as any).methods ?? {})
  console.log(`[setup] instructions: ${methods.join(', ')}`)
}

main().catch((e) => {
  console.error('[setup] FAILED:', e.message)
  process.exit(1)
})
