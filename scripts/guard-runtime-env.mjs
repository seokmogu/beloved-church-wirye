#!/usr/bin/env node

import {
  PRODUCTION_SUPABASE_REF,
  hasProductionServiceMarker,
  loadRuntimeEnv,
  resolveAppEnv,
} from './env-utils.mjs'

const command = process.argv[2] || 'check'
const appEnv = resolveAppEnv()

loadRuntimeEnv(appEnv)

const isProduction = appEnv === 'production'
const isPreview = appEnv === 'preview' || process.env.VERCEL_ENV === 'preview'
const allowProductionServices = process.env.ALLOW_PRODUCTION_SERVICES === 'true'

const requiredForPayloadRuntime = ['PAYLOAD_SECRET', 'POSTGRES_URL']

const missingPayloadRuntime = requiredForPayloadRuntime.filter((name) => !process.env[name])

const productionMarkers = [
  ['POSTGRES_URL', process.env.POSTGRES_URL],
  ['NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL],
  ['SUPABASE_URL', process.env.SUPABASE_URL],
].filter(([, value]) => hasProductionServiceMarker(value))

if (!isProduction && productionMarkers.length > 0 && !allowProductionServices) {
  console.error(
    [
      `Refusing to run ${command} with APP_ENV=${appEnv} because production service markers were detected.`,
      `Production Supabase ref: ${PRODUCTION_SUPABASE_REF}`,
      `Matched env names: ${productionMarkers.map(([name]) => name).join(', ')}`,
      'Use separate development/staging Supabase resources, or set ALLOW_PRODUCTION_SERVICES=true only for an explicit read-only diagnostic.',
    ].join('\n'),
  )
  process.exit(1)
}

if (!isProduction && process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ENV) {
  console.error(
    [
      `Refusing to run ${command} with APP_ENV=${appEnv} because BLOB_READ_WRITE_TOKEN is set but BLOB_STORE_ENV is not labeled.`,
      'Set BLOB_STORE_ENV=development or BLOB_STORE_ENV=staging for non-production Blob stores.',
      'Do not use the production Blob token for local admin upload QA.',
    ].join('\n'),
  )
  process.exit(1)
}

if (!isProduction && process.env.BLOB_STORE_ENV === 'production' && !allowProductionServices) {
  console.error(
    [
      `Refusing to run ${command} with APP_ENV=${appEnv} because BLOB_STORE_ENV=production.`,
      'Use a separate development/staging Blob store before upload QA.',
    ].join('\n'),
  )
  process.exit(1)
}

if (isProduction && missingPayloadRuntime.length > 0) {
  console.error(`Missing required production env vars: ${missingPayloadRuntime.join(', ')}`)
  process.exit(1)
}

if (command === 'dev' && missingPayloadRuntime.length > 0) {
  console.error(
    [
      `Missing required local dev env vars: ${missingPayloadRuntime.join(', ')}`,
      'Create .env.local from .env.development.example after development Supabase/Postgres resources exist.',
    ].join('\n'),
  )
  process.exit(1)
}

if (command === 'build' && missingPayloadRuntime.length > 0 && !isPreview) {
  console.warn(
    `Payload runtime env is incomplete for APP_ENV=${appEnv}; build will use frontend fallbacks where possible.`,
  )
}

console.log(`Environment guard passed for APP_ENV=${appEnv} command=${command}.`)
