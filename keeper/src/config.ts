import { PublicKey } from '@solana/web3.js'

/**
 * Network configuration for TxLINE + Solana.
 *
 * Every value below must come from the SAME network row (see
 * https://txline.txodds.com/documentation/programs/addresses). Mixing a devnet
 * subscribe transaction with the mainnet API host — or vice versa — will make
 * token activation fail even when the on-chain transaction confirms.
 */
export type Network = 'devnet' | 'mainnet'

export const NETWORK: Network = (process.env.TXLINE_NETWORK as Network) || 'devnet'

interface NetCfg {
  rpcUrl: string
  apiOrigin: string
  programId: PublicKey
  txlTokenMint: PublicKey
}

const CONFIG: Record<Network, NetCfg> = {
  mainnet: {
    rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    apiOrigin: 'https://txline.txodds.com',
    programId: new PublicKey('9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA'),
    txlTokenMint: new PublicKey('Zhw9TVKp68a1QrftncMSd6ELXKDtpVMNuMGr1jNwdeL'),
  },
  devnet: {
    rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    apiOrigin: 'https://txline-dev.txodds.com',
    programId: new PublicKey('6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J'),
    txlTokenMint: new PublicKey('4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG'),
  },
}

export const CFG = CONFIG[NETWORK]
export const API_BASE = `${CFG.apiOrigin}/api`

/** Free World Cup / International Friendlies tier. */
export const SERVICE_LEVEL_ID = Number(process.env.SERVICE_LEVEL_ID ?? 1)
export const DURATION_WEEKS = Number(process.env.DURATION_WEEKS ?? 4)
/** Empty = standard free bundle. Activation message uses `${txSig}::${jwt}`. */
export const SELECTED_LEAGUES: number[] = []

export const PATHS = {
  keypair: process.env.KEEPER_KEYPAIR || 'secrets/keeper-wallet.json',
  idl: 'idl/txoracle.json',
  credentials: 'secrets/credentials.json',
  out: '../src/live-data.json',
}
