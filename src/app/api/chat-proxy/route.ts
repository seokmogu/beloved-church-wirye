import { NextRequest, NextResponse } from 'next/server'

const OPENCLAW_API_URL = process.env.OPENCLAW_API_URL || 'http://localhost:8000'

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (!body.message || typeof body.message !== 'string') {
    return NextResponse.json({ error: 'Invalid message' }, { status: 400 })
  }

  const message = body.message.slice(0, 2000) // max length

  try {
    const upstream = await fetch(`${OPENCLAW_API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, stream: true }),
    })

    if (!upstream.ok) {
      return NextResponse.json({ error: 'Upstream error' }, { status: upstream.status })
    }

    // Stream the response back
    return new NextResponse(upstream.body, {
      headers: {
        'Content-Type': upstream.headers.get('Content-Type') || 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
