import { guestJwt, apiClient, loadCredentials, scoresSnapshot } from './txline.js'

function parseSsePayload(raw: string): any[] {
  const out: any[] = []
  for (const block of raw.split(/\r?\n\r?\n/)) {
    const dataLine = block.split(/\r?\n/).find((l) => l.startsWith('data:'))
    if (!dataLine) continue
    const json = dataLine.slice(5).trim().replace(/^ /, '')
    try {
      out.push(JSON.parse(json))
    } catch {
      /* skip */
    }
  }
  return out
}

async function main() {
  const creds = loadCredentials()!
  const jwt = await guestJwt()
  const client = apiClient(jwt, creds.apiToken)
  const fixtureId = 18209181

  const snap = await scoresSnapshot(client, fixtureId)
  console.log('snapshot type', typeof snap, Array.isArray(snap) ? snap.length : 'n/a')
  if (Array.isArray(snap) && snap.length) console.log('snapshot last', JSON.stringify(snap[snap.length - 1], null, 2))

  const histRes = await client.get(`/api/scores/historical/${fixtureId}`, {
    responseType: 'text',
    headers: { Accept: 'text/event-stream' },
  })
  const records = parseSsePayload(histRes.data as string)
  console.log('historical parsed', records.length)
  const finals = records.filter((r) => (r.Action ?? r.action ?? '').toLowerCase() === 'game_finalised')
  console.log('game_finalised count', finals.length)
  if (finals.length) console.log('final', JSON.stringify(finals[finals.length - 1], null, 2))
  else console.log('last record', JSON.stringify(records[records.length - 1], null, 2))
}

main().catch(console.error)
