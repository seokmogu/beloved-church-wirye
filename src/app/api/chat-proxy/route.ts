import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
// Bound the streaming function so a stalled upstream cannot hold the invocation open
// indefinitely (and so a long reply isn't cut at Vercel's shorter default timeout).
export const maxDuration = 30

const OPENCLAW_API_URL = process.env.OPENCLAW_API_URL || 'http://localhost:18789'
const OPENCLAW_GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || ''
const UPSTREAM_TIMEOUT_MS = 20_000
const MAX_MESSAGE_LENGTH = 2000

// Per-IP token bucket. In-memory only, so it is NOT shared across serverless instances —
// a best-effort guard against casual abuse, not a durable rate limiter. The durable fix
// (Upstash / Vercel KV) belongs in the same change that wires a real paid OpenClaw gateway.
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 20
const ipHits = new Map<string, number[]>()

function chatDisabled(): boolean {
  return process.env.NEXT_PUBLIC_CHAT_ENABLED === 'false'
}

// Same-origin gate: the first-party widget fetches a relative URL, so its Origin host
// equals the request Host. Reject a present-but-mismatched Origin (cross-site/bot POSTs);
// allow a missing Origin (non-browser clients) to avoid breaking legitimate calls.
function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin')
  if (!origin) return true
  try {
    return new URL(origin).host === req.headers.get('host')
  } catch {
    return false
  }
}

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown'
  return req.headers.get('x-real-ip') || 'unknown'
}

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW_MS
  const hits = (ipHits.get(ip) ?? []).filter((time) => time > windowStart)
  hits.push(now)
  ipHits.set(ip, hits)

  // Opportunistic cleanup so the map cannot grow unbounded.
  if (ipHits.size > 5000) {
    for (const [key, times] of ipHits) {
      if (times.every((time) => time <= windowStart)) ipHits.delete(key)
    }
  }

  return hits.length > RATE_LIMIT_MAX
}

export async function POST(req: NextRequest) {
  // Mirror the client's disable flag server-side so the endpoint is closed whenever chat
  // is turned off (previously the flag was only checked in the browser widget).
  if (chatDisabled()) {
    return NextResponse.json({ error: 'Chat disabled' }, { status: 404 })
  }

  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (rateLimited(clientIp(req))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  let body: { message?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.message || typeof body.message !== 'string') {
    return NextResponse.json({ error: 'Invalid message' }, { status: 400 })
  }

  const message = body.message.slice(0, MAX_MESSAGE_LENGTH)

  try {
    const upstream = await fetch(`${OPENCLAW_API_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(OPENCLAW_GATEWAY_TOKEN ? { Authorization: `Bearer ${OPENCLAW_GATEWAY_TOKEN}` } : {}),
      },
      body: JSON.stringify({
        model: 'openclaw/church',
        messages: [{ role: 'user', content: message }],
        stream: true,
      }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    })

    if (!upstream.ok) {
      const text = await upstream.text()
      console.error('Upstream error:', upstream.status, text)
      return NextResponse.json({ error: 'Upstream error' }, { status: upstream.status })
    }

    // Transform OpenAI SSE → text SSE for the client. The model text is JSON-encoded
    // (`data: {"t":"..."}`) so embedded newlines/whitespace survive transit; a raw
    // `data: <text>` frame would be truncated at the first newline by the SSE parser.
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstream.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }
        const decoder = new TextDecoder()
        let buffer = ''
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() ?? ''
            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed || !trimmed.startsWith('data: ')) continue
              const data = trimmed.slice(6)
              if (data === '[DONE]') {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                continue
              }
              try {
                const parsed = JSON.parse(data)
                const text = parsed?.choices?.[0]?.delta?.content
                if (text) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ t: text })}\n\n`))
                }
              } catch {
                // skip malformed chunks
              }
            }
          }
        } finally {
          controller.close()
        }
      },
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    console.error('chat-proxy error:', err)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
