import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { NETWORK, CFG } from './config.js'
import { loadOrCreateKeypair, makeConnection } from './wallet.js'
import { makeProvider, loadProgram } from './solana.js'
import {
  guestJwt,
  subscribeOnChain,
  activate,
  saveCredentials,
  loadCredentials,
} from './txline.js'

/**
 * One-time (per 4-week subscription) setup:
 *   1. subscribe on-chain to the free World Cup tier
 *   2. activate an API token
 *   3. cache credentials for the keeper to reuse
 */
async function main() {
  console.log(`[activate] network=${NETWORK}`)
  const kp = loadOrCreateKeypair()
  console.log(`[activate] wallet=${kp.publicKey.toBase58()}`)

  const connection = makeConnection()
  const balance = await connection.getBalance(kp.publicKey)
  console.log(`[activate] balance=${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`)
  if (balance < 0.02 * LAMPORTS_PER_SOL) {
    console.error(
      `[activate] wallet needs devnet SOL. Fund ${kp.publicKey.toBase58()} ` +
        `(https://faucet.solana.com) and re-run.`,
    )
    process.exit(1)
  }

  const provider = makeProvider(connection, kp)
  const program = await loadProgram(provider)

  const existing = loadCredentials()
  let txSig = existing?.txSig

  if (!txSig) {
    console.log('[activate] submitting on-chain subscribe(serviceLevel, weeks)…')
    txSig = await subscribeOnChain(program, provider)
    console.log(`[activate] subscribed: ${txSig}`)
    console.log(`[activate] explorer: https://explorer.solana.com/tx/${txSig}?cluster=${NETWORK}`)
  } else {
    console.log(`[activate] reusing existing subscription tx: ${txSig}`)
  }

  const jwt = await guestJwt()
  const apiToken = await activate(txSig, jwt, kp)
  console.log('[activate] API token activated')

  saveCredentials({
    txSig,
    apiToken,
    jwt,
    wallet: kp.publicKey.toBase58(),
    network: NETWORK,
  })
  console.log('[activate] credentials saved → secrets/credentials.json')
}

main().catch((e) => {
  const detail = e?.response?.data ? JSON.stringify(e.response.data) : e.message
  console.error('[activate] FAILED:', detail)
  process.exit(1)
})
