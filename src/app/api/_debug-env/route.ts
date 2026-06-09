import { NextResponse } from 'next/server'

// TEMPORARY diagnostic — remove after verifying dev Blob/storage env.
export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    hasBlobToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    blobTokenPrefix: (process.env.BLOB_READ_WRITE_TOKEN || '').slice(0, 14),
    blobStoreEnv: process.env.BLOB_STORE_ENV ?? null,
    nextPublicServerUrl: process.env.NEXT_PUBLIC_SERVER_URL ?? null,
    payloadServerUrl: process.env.PAYLOAD_SERVER_URL ?? null,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV ?? null,
  })
}
