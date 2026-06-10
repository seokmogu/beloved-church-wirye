import { spawnSync } from 'node:child_process'

const isVercelPreview = process.env.VERCEL_ENV === 'preview'
const forceMigration = process.env.PAYLOAD_MIGRATE === 'true'

if (isVercelPreview && !forceMigration) {
  console.log('Skipping Payload migrations for Vercel Preview deployment.')
  process.exit(0)
}

const requiredEnv = ['PAYLOAD_SECRET', 'POSTGRES_URL']
const missingEnv = requiredEnv.filter((name) => !process.env[name])

if (missingEnv.length > 0) {
  console.error(`Cannot run Payload migrations. Missing: ${missingEnv.join(', ')}`)
  process.exit(1)
}

const result = spawnSync('pnpm', ['payload', 'migrate'], {
  env: {
    ...process.env,
    NODE_OPTIONS: process.env.NODE_OPTIONS || '--no-deprecation',
  },
  shell: false,
  stdio: 'inherit',
})

process.exit(result.status ?? 1)
