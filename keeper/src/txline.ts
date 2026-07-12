import * as anchor from '@coral-xyz/anchor'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  createAssociatedTokenAccountIdempotent,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token'
import { PublicKey, SystemProgram, Keypair } from '@solana/web3.js'
import axios, { AxiosInstance } from 'axios'
import nacl from 'tweetnacl'
import fs from 'node:fs'
import path from 'node:path'
import {
  CFG,
  API_BASE,
  SERVICE_LEVEL_ID,
  DURATION_WEEKS,
  SELECTED_LEAGUES,
  PATHS,
} from './config.js'

/** Guest JWT from the matching network host. Short-lived; renew on 401. */
export async function guestJwt(): Promise<string> {
  const res = await axios.post(`${CFG.apiOrigin}/auth/guest/start`)
  return res.data.token
}

/** Submits the on-chain free-tier `subscribe` transaction. Returns the tx signature. */
export async function subscribeOnChain(
  program: anchor.Program,
  provider: anchor.AnchorProvider,
): Promise<string> {
  const programId = program.programId

  const [tokenTreasuryPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('token_treasury_v2')],
    programId,
  )
  const tokenTreasuryVault = getAssociatedTokenAddressSync(
    CFG.txlTokenMint,
    tokenTreasuryPda,
    true,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  )
  const [pricingMatrixPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('pricing_matrix')],
    programId,
  )
  const userTokenAccount = getAssociatedTokenAddressSync(
    CFG.txlTokenMint,
    provider.wallet.publicKey,
    false,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  )

  // Free tier still expects the user's TxL ATA to exist on-chain.
  const payer = (provider.wallet as anchor.Wallet & { payer?: Keypair }).payer
  if (!payer) throw new Error('Local keypair payer required for subscribe')
  await createAssociatedTokenAccountIdempotent(
    provider.connection,
    payer,
    CFG.txlTokenMint,
    provider.wallet.publicKey,
    { commitment: 'confirmed' },
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  )

  const txSig = await program.methods
    .subscribe(SERVICE_LEVEL_ID, DURATION_WEEKS)
    .accounts({
      user: provider.wallet.publicKey,
      pricingMatrix: pricingMatrixPda,
      tokenMint: CFG.txlTokenMint,
      userTokenAccount,
      tokenTreasuryVault,
      tokenTreasuryPda,
      tokenProgram: TOKEN_2022_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc()

  return txSig
}

/** Exchanges a confirmed subscribe tx + fresh JWT for an API token. */
export async function activate(
  txSig: string,
  jwt: string,
  kp: Keypair,
): Promise<string> {
  const messageString = `${txSig}:${SELECTED_LEAGUES.join(',')}:${jwt}`
  const message = new TextEncoder().encode(messageString)
  const signatureBytes = nacl.sign.detached(message, kp.secretKey)
  const walletSignature = Buffer.from(signatureBytes).toString('base64')

  const res = await axios.post(
    `${API_BASE}/token/activate`,
    { txSig, walletSignature, leagues: SELECTED_LEAGUES },
    { headers: { Authorization: `Bearer ${jwt}` } },
  )
  return res.data.token || res.data
}

export interface Credentials {
  txSig: string
  apiToken: string
  jwt: string
  wallet: string
  network: string
}

export function loadCredentials(): Credentials | null {
  const p = path.resolve(PATHS.credentials)
  if (!fs.existsSync(p)) return null
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

export function saveCredentials(c: Credentials): void {
  const p = path.resolve(PATHS.credentials)
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, JSON.stringify(c, null, 2))
}

/** Authenticated axios client for the TxLINE data API. */
export function apiClient(jwt: string, apiToken: string): AxiosInstance {
  return axios.create({
    timeout: 30000,
    baseURL: CFG.apiOrigin,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
      'X-Api-Token': apiToken,
    },
  })
}

/* ---------- Data endpoints ---------- */

export async function fixturesSnapshot(client: AxiosInstance, competitionId?: number) {
  const res = await client.get('/api/fixtures/snapshot', {
    params: competitionId ? { competitionId } : undefined,
  })
  return res.data as any[]
}

export async function scoresSnapshot(client: AxiosInstance, fixtureId: number) {
  const res = await client.get(`/api/scores/snapshot/${fixtureId}`)
  return res.data as any[]
}

/** Parse SSE blocks returned by some TxLINE score endpoints (including historical). */
export function parseSseScorePayload(raw: string): any[] {
  const out: any[] = []
  for (const block of raw.split(/\r?\n\r?\n/)) {
    const dataLine = block.split(/\r?\n/).find((l) => l.startsWith('data:'))
    if (!dataLine) continue
    const json = dataLine.slice(5).trim().replace(/^ /, '')
    try {
      out.push(JSON.parse(json))
    } catch {
      /* skip heartbeat / malformed */
    }
  }
  return out
}

export async function scoresHistorical(client: AxiosInstance, fixtureId: number) {
  const res = await client.get(`/api/scores/historical/${fixtureId}`, {
    responseType: 'text',
    headers: { Accept: 'text/event-stream' },
    transformResponse: [(d) => d],
  })
  if (Array.isArray(res.data)) return res.data as any[]
  if (typeof res.data === 'string') return parseSseScorePayload(res.data)
  return []
}

/** Fetches a Merkle validation proof for a given score record + stat keys. */
export async function statValidation(
  client: AxiosInstance,
  params: { fixtureId: number; seq: number; statKey: number; statKey2?: number },
) {
  const res = await client.get('/api/scores/stat-validation', { params })
  return res.data as any
}
