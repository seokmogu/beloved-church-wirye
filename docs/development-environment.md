# Development Environment

The live church site must not be used for destructive admin QA. Local and staging work should use separate resources from production.

## Targets

- Production: GitHub `main` -> Vercel `seokmogus-projects/beloved-church-wirye`.
- Development/Staging: non-`main` GitHub branches -> Vercel `seokmogus-projects/beloved-church-wirye-dev` Preview deployments.
- Development database/auth: Supabase `beloved-church-wirye-dev` (`tnvhgvxekvwqgdjufnwe`).
- Development uploads: Vercel Blob store `beloved-church-wirye-dev-blob` (`store_PsGvFSpiCzfBPzlT`).
- `.env.production` in git is limited to non-secret domain defaults. Project-bound production values must be configured in Vercel Project Settings, not committed.

## Current Vercel Audit

Read-only check on 2026-06-01:

- Production project: `seokmogus-projects/beloved-church-wirye` (`prj_rlSbDEXCQBanqqOZorCnYKL6BTnH`).
- Production project Node.js version is set to `22.x`.
- Production env now has the required Supabase public auth, manage admin allowlist, Payload URL/origin, Payload secret, Postgres, Blob, cron, YouTube, Naver map, and OpenClaw values configured in Vercel Project Settings.
- Production `BLOB_READ_WRITE_TOKEN` is scoped to Production only.
- Production Vercel Ignored Build Step is set to `if [ "$VERCEL_GIT_COMMIT_REF" = "main" ]; then exit 1; else exit 0; fi`. Vercel continues the build when this command exits `1`, so only `main` builds on the production project.
- Development project: `seokmogus-projects/beloved-church-wirye-dev` (`prj_WP15MtYl2epk2Y7gQa158GWjoeTj`), Node.js `22.x`, framework `nextjs`.
- Development/Preview env values are configured for the dev Supabase project, dev Blob store, Payload runtime, manage admin allowlist, and explicit `PAYLOAD_MIGRATE=true`.
- Dev Vercel Git integration is connected to `seokmogu/beloved-church-wirye`.
- Dev Vercel Ignored Build Step is set to `if [ "$VERCEL_GIT_COMMIT_REF" = "main" ]; then exit 0; else exit 1; fi`. Vercel skips the build when this command exits `0`, so `main` does not build on the dev project; all non-`main` branches can build there.

## Local Setup

Use Node `22.22.2` for local work. On the MacBook Air this runtime is available at:

```sh
/Users/seokmogu/project/.tools/node-v22.22.2-darwin-arm64/bin
```

1. Use the git-ignored `.env.development.local` on this MacBook Air checkout for development-only values.
2. Keep `.env.local` for local Vercel Blob token values created by `vercel blob create-store`.
3. Run `pnpm env:check`.
4. Run `APP_ENV=development pnpm exec node scripts/run-payload-migrate.mjs` after schema changes when `PAYLOAD_MIGRATE=true`.
5. Run `pnpm dev`.

For the development/staging Vercel project, use `.env.preview.example` as the env-name checklist.

The env guard blocks local dev when it detects the production Supabase project ref in non-production mode. It also requires `BLOB_STORE_ENV=development` or `BLOB_STORE_ENV=staging` when a Blob token is present.

The dev Supabase direct database host resolves to IPv6 and is not reachable from this MacBook Air network. Use the Supabase pooler connection string for `POSTGRES_URL` in development and preview.

## Branch And Deployment Flow

- Work in feature branches from the verified MacBook Air checkout.
- Open PRs through GitHub.
- Let Vercel build from Git integration.
- Never run direct `vercel deploy` for this project.
- Merge to `main` only after local checks and PR checks pass.

### Live vs Dev Routing

Use this as the current source of truth:

| Git action | Vercel project | Vercel environment | Result |
| --- | --- | --- | --- |
| Push or merge to `main` | `beloved-church-wirye` | Production | Updates the live domains `https://belovedchurch.co.kr/` and `https://www.belovedchurch.co.kr/` after the Git deployment succeeds. |
| Push to `develop` | `beloved-church-wirye-dev` | Preview | Creates/updates the shared dev preview using the dev Supabase and dev Blob resources. |
| Push to `feature/*`, `fix/*`, or `chore/*` | `beloved-church-wirye-dev` | Preview | Creates an isolated preview for QA before PR review. |
| Push to `main` | `beloved-church-wirye-dev` | Skipped by Ignored Build Step | Does not build the dev project. |
| Push to non-`main` | `beloved-church-wirye` | Skipped by Ignored Build Step | Does not build the production project. |

The production Vercel project still uses `main` as its production branch and is intentionally configured to build only `main`. The dev project is intentionally configured to build only non-`main` branches. This keeps `main` merges live-only and development branches dev-only.

Recommended daily flow:

1. Create a branch from current `main`: `git switch main && git pull --ff-only && git switch -c feature/<short-name>`.
2. Validate locally against dev resources.
3. Push the branch and open a PR. The dev Vercel project should create a Preview deployment.
4. QA the dev Preview URL.
5. Merge the PR to `main` only after approval. That is the live release path.
6. Do not use `vercel deploy`, `vercel --prod`, deploy hooks, or dashboard redeploys for normal releases.

## Admin E2E

Run write-heavy admin E2E only against the development/staging environment. Use test records with an `E2E_` prefix and clean them up after the run.
