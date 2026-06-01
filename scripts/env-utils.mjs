import fs from 'node:fs'
import path from 'node:path'
import { config as loadDotenv } from 'dotenv'

export const PRODUCTION_SUPABASE_REF = 'fpiqbslkwcyqpbrnbkhr'
export const PRODUCTION_VERCEL_PROJECT_ID = 'prj_rlSbDEXCQBanqqOZorCnYKL6BTnH'

export function resolveAppEnv() {
  const explicit = process.env.APP_ENV?.trim()
  if (explicit) return explicit
  if (process.env.VERCEL_ENV === 'production') return 'production'
  if (process.env.VERCEL_ENV === 'preview') return 'preview'
  return 'development'
}

export function loadRuntimeEnv(appEnv = resolveAppEnv()) {
  const cwd = process.cwd()
  const files = [`.env.${appEnv}.local`, '.env.local', `.env.${appEnv}`, '.env']

  for (const file of files) {
    const fullPath = path.join(cwd, file)
    if (!fs.existsSync(fullPath)) continue
    loadDotenv({ path: fullPath, override: false })
  }
}

export function hasPayloadRuntimeConfig() {
  return Boolean(process.env.PAYLOAD_SECRET && process.env.POSTGRES_URL)
}

export function hasProductionServiceMarker(value) {
  if (!value) return false
  return String(value).includes(PRODUCTION_SUPABASE_REF)
}
