import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { loadOrCreateKeypair, makeConnection } from './wallet.js'

async function main() {
  const kp = loadOrCreateKeypair()
  const connection = makeConnection()
  const balance = await connection.getBalance(kp.publicKey)
  const sol = balance / LAMPORTS_PER_SOL
  console.log(`wallet: ${kp.publicKey.toBase58()}`)
  console.log(`balance: ${sol.toFixed(4)} SOL`)
  console.log(sol >= 0.05 ? 'ready — run: npm run activate' : 'needs funding — send devnet SOL to address above')
}

main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
