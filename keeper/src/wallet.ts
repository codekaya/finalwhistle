import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js'
import fs from 'node:fs'
import path from 'node:path'
import { CFG, PATHS } from './config.js'

export function loadOrCreateKeypair(): Keypair {
  const p = path.resolve(PATHS.keypair)
  if (fs.existsSync(p)) {
    const secret = JSON.parse(fs.readFileSync(p, 'utf8'))
    return Keypair.fromSecretKey(Uint8Array.from(secret))
  }
  const kp = Keypair.generate()
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, JSON.stringify(Array.from(kp.secretKey)))
  console.log(`[wallet] generated new keypair → ${p}`)
  console.log(`[wallet] pubkey: ${kp.publicKey.toBase58()}`)
  return kp
}

export function makeConnection(): Connection {
  return new Connection(CFG.rpcUrl, 'confirmed')
}

/** Ensures the wallet has at least `minSol` on devnet, requesting an airdrop if needed. */
export async function ensureFunded(
  connection: Connection,
  kp: Keypair,
  minSol = 0.5,
): Promise<number> {
  let balance = await connection.getBalance(kp.publicKey)
  const min = minSol * LAMPORTS_PER_SOL
  if (balance >= min) {
    console.log(`[wallet] balance ${(balance / LAMPORTS_PER_SOL).toFixed(3)} SOL — funded`)
    return balance
  }

  console.log(`[wallet] balance low (${balance / LAMPORTS_PER_SOL} SOL), requesting airdrop…`)
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const sig = await connection.requestAirdrop(kp.publicKey, 1 * LAMPORTS_PER_SOL)
      const latest = await connection.getLatestBlockhash()
      await connection.confirmTransaction({ signature: sig, ...latest }, 'confirmed')
      balance = await connection.getBalance(kp.publicKey)
      console.log(`[wallet] airdrop ok → ${(balance / LAMPORTS_PER_SOL).toFixed(3)} SOL`)
      if (balance >= min) return balance
    } catch (err) {
      console.warn(`[wallet] airdrop attempt ${attempt} failed: ${(err as Error).message}`)
      await new Promise((r) => setTimeout(r, 2000 * attempt))
    }
  }

  if (balance < min) {
    throw new Error(
      `Wallet ${kp.publicKey.toBase58()} is underfunded (${balance / LAMPORTS_PER_SOL} SOL). ` +
        `Devnet airdrop is rate-limited — fund it manually via https://faucet.solana.com and re-run.`,
    )
  }
  return balance
}
