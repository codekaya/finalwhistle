import { CFG } from './config.js'
import { guestJwt, activate, loadCredentials, saveCredentials } from './txline.js'
import { loadOrCreateKeypair } from './wallet.js'

/* ---------- SSE parsing (per TxLINE Streaming Data guide) ---------- */
type SseMessage = { id?: string; event?: string; data: string; retry?: number }

function parseSseBlock(block: string): SseMessage | null {
  const message: SseMessage = { data: '' }
  for (const rawLine of block.split(/\r?\n/)) {
    if (!rawLine || rawLine.startsWith(':')) continue
    const i = rawLine.indexOf(':')
    const field = i === -1 ? rawLine : rawLine.slice(0, i)
    const value = i === -1 ? '' : rawLine.slice(i + 1).replace(/^ /, '')
    if (field === 'data') message.data += `${value}\n`
    if (field === 'event') message.event = value
    if (field === 'id') message.id = value
    if (field === 'retry') message.retry = Number(value)
  }
  message.data = message.data.replace(/\n$/, '')
  return message.data || message.event || message.id ? message : null
}

async function* readSseMessages(response: Response): AsyncGenerator<SseMessage> {
  if (!response.body) throw new Error('Stream response has no body')
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      let sep = buffer.match(/\r?\n\r?\n/)
      while (sep?.index !== undefined) {
        const block = buffer.slice(0, sep.index)
        buffer = buffer.slice(sep.index + sep[0].length)
        const m = parseSseBlock(block)
        if (m) yield m
        sep = buffer.match(/\r?\n\r?\n/)
      }
    }
  } finally {
    reader.releaseLock()
  }
}

function parseSseData(data: string) {
  try {
    return JSON.parse(data)
  } catch {
    return data
  }
}

async function main() {
  const creds = loadCredentials()
  if (!creds) throw new Error('No credentials. Run `npm run activate` first.')

  const jwt = await guestJwt()
  const apiToken = await activate(creds.txSig, jwt, loadOrCreateKeypair()).catch(() => creds.apiToken)
  saveCredentials({ ...creds, jwt, apiToken })

  const url = `${CFG.apiOrigin}/api/scores/stream`
  console.log(`[stream] connecting to ${url}`)
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${jwt}`,
      'X-Api-Token': apiToken,
      Accept: 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  })
  if (!res.ok) throw new Error(`Stream failed: ${res.status}`)
  console.log('[stream] open — waiting for live score events (Ctrl+C to stop)…')

  for await (const message of readSseMessages(res)) {
    const data = parseSseData(message.data)
    console.log(`[stream] ${message.event ?? 'message'}`, typeof data === 'string' ? data : JSON.stringify(data))
  }
}

main().catch((e) => {
  console.error('[stream] FAILED:', e?.response?.data ? JSON.stringify(e.response.data) : e.message)
  process.exit(1)
})
