import { NextResponse } from 'next/server'

import { __BLOB_ENABLED_AT_EVAL } from '@payload-config'

// TEMPORARY diagnostic — remove after verifying dev Blob/storage env.
export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    blobEnabledAtConfigEval: __BLOB_ENABLED_AT_EVAL,
    hasBlobTokenRuntime: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    nextPublicServerUrl: process.env.NEXT_PUBLIC_SERVER_URL ?? null,
    vercelEnv: process.env.VERCEL_ENV ?? null,
  })
}
