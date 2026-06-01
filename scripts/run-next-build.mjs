#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { loadRuntimeEnv, resolveAppEnv } from './env-utils.mjs'

const appEnv = resolveAppEnv()
loadRuntimeEnv(appEnv)

const result = spawnSync('next', ['build', '--webpack'], {
  env: process.env,
  stdio: 'inherit',
})

process.exit(result.status ?? 1)
