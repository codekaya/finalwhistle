# FinalWhistle — TxLINE Integration

Settlement engine for prediction markets. This hackathon build ingests **live World Cup data from TxLINE on Solana devnet**, fetches cryptographic validation proofs, and verifies match outcomes on-chain via the TxLINE program's `validateStat` instruction.

## Devnet wallet (fund this)

```
A74UjfJduAoKnC8s4sLnAZszyZE39tAfKVjRr4kNobAo
```

Send **≥ 0.1 SOL** on **Solana devnet** (not mainnet). Faucet: https://faucet.solana.com

## Quick start (after funding)

```bash
# from repo root (site/)
npm run keeper:activate   # on-chain subscribe + API token activation
npm run keeper:run        # ingest TxLINE data → writes src/live-data.json
npm run dev               # http://localhost:5173

# or from keeper/ directly:
cd keeper && npm run activate && npm run run
```

Optional live stream (during a covered match):

```bash
npm run keeper:stream
```

## TxLINE endpoints used

| Endpoint | Purpose |
|----------|---------|
| `POST /auth/guest/start` | Guest JWT |
| On-chain `subscribe(1, 4)` | Free World Cup tier subscription |
| `POST /api/token/activate` | API token after subscribe tx |
| `GET /api/fixtures/snapshot` | World Cup fixture metadata |
| `GET /api/scores/historical/{fixtureId}` | Score timeline for finished matches |
| `GET /api/scores/stat-validation` | Merkle proof for goal counts |
| TxLINE program `validateStat` (view) | On-chain proof verification against `daily_scores_roots` PDA |

## Solana (devnet)

| Item | Value |
|------|-------|
| Program ID | `6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J` |
| API host | `https://txline-dev.txodds.com` |
| Service level | `1` (free World Cup tier) |

## Architecture

```
TxLINE API ──► keeper/ (Node backend) ──► src/live-data.json ──► React frontend
                    │
                    └──► Solana devnet (subscribe + validateStat)
```

1. **Subscribe** on-chain to TxLINE free tier (costs devnet SOL only).
2. **Activate** API credentials with wallet signature.
3. **Ingest** a finalised World Cup fixture from historical scores.
4. **Fetch** `stat-validation` proof for home/away goal stats.
5. **Verify** proof via `program.methods.validateStat().view()` — read-only on-chain simulation.
6. **Export** results to the frontend for the settlement race demo.

## Hackathon track

**Prediction markets and settlement** — FinalWhistle is the settlement layer: signed match data in, on-chain proof verification, payout logic out.

## TxLINE API feedback

- Free tier onboarding is clear; on-chain subscribe + activation signature is the trickiest step.
- Historical scores + stat-validation pair well for settlement demos when live matches are not running.
- `validateStat` view simulation is fast and gives a trustless "proof, not promise" story for judges.

## Environment

```bash
# optional overrides in keeper/
TXLINE_NETWORK=devnet
FIXTURE_ID=18209181   # force a specific World Cup fixture
SOLANA_RPC_URL=https://api.devnet.solana.com
```
