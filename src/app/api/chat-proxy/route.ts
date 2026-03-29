import { NextRequest, NextResponse } from 'next/server'

const OPENCLAW_API_URL = process.env.OPENCLAW_API_URL || 'http://localhost:18789'
const OPENCLAW_GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || ''

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (!body.message || typeof body.message !== 'string') {
    return NextResponse.json({ error: 'Invalid message' }, { status: 400 })
  }

  const message = body.message.slice(0, 2000) // max length

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
    })

    if (!upstream.ok) {
      const text = await upstream.text()
      console.error('Upstream error:', upstream.status, text)
      return NextResponse.json({ error: 'Upstream error' }, { status: upstream.status })
    }

    // Transform OpenAI SSE format → simple text SSE for the client
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
                  controller.enqueue(encoder.encode(`data: ${text}\n\n`))
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
