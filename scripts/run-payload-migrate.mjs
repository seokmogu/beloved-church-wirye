#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { hasPayloadRuntimeConfig, loadRuntimeEnv, resolveAppEnv } from './env-utils.mjs'

const appEnv = resolveAppEnv()
loadRuntimeEnv(appEnv)

const isProduction = appEnv === 'production'
const isPreview = appEnv === 'preview' || process.env.VERCEL_ENV === 'preview'
const shouldRun = process.env.PAYLOAD_MIGRATE === 'true' || isProduction

if (!hasPayloadRuntimeConfig()) {
  if (isProduction) {
    console.error(
      'Cannot run Payload migrations in production without PAYLOAD_SECRET and POSTGRES_URL.',
    )
    process.exit(1)
  }

  console.log('Skipping Payload migrations because Payload runtime env is incomplete.')
  process.exit(0)
}

if (isPreview && process.env.PAYLOAD_MIGRATE !== 'true') {
  console.log('Skipping Payload migrations for Vercel Preview deployment.')
  process.exit(0)
}

if (!shouldRun) {
  console.log(
    `Skipping Payload migrations for APP_ENV=${appEnv}. Set PAYLOAD_MIGRATE=true to run them explicitly.`,
  )
  process.exit(0)
}

const result = spawnSync('pnpm', ['payload', 'migrate'], {
  env: process.env,
  stdio: 'inherit',
})

process.exit(result.status ?? 1)
