# Church Deployment Notes

## Deployment Path

- Development environment uses local services:
  - Frontend/admin: local Next.js dev server, normally `http://localhost:3000`.
  - Custom admin: same app at `/manage`; `/admin` redirects to `/manage`.
  - Database: local Docker Postgres from `docker-compose.yml`, port `54320`, database `beloved-church-wirye`.
- Production environment uses Vercel + Supabase:
  - Frontend/admin: Vercel deployment under `seokmogus-projects/beloved-church-wirye`.
  - Custom admin: same Vercel app at `/manage`; `/admin` redirects to `/manage`.
  - Admin auth: Supabase Auth in project `fpiqbslkwcyqpbrnbkhr`, restricted by `MANAGE_ADMIN_EMAILS`.
  - Database: Supabase Postgres project `fpiqbslkwcyqpbrnbkhr`.

Local `.env` must point to local Docker and local frontend URLs. Vercel Production/Preview env vars must point to Supabase and the Vercel production/preview URL. Do not mix local URLs into Vercel env vars.

- This repo does not keep a tracked `.env.example`; use the real project env files instead.
- `.env.production` is intentionally tracked for non-secret production defaults required by Git builds, including the Supabase public URL, Supabase anon key, and admin email allowlist. Do not put passwords, service-role keys, database URLs, or private tokens in `.env.production`.
- `.env`: canonical local development values; git ignored.
- `.deploy/vercel.env.local`: private copy of Vercel/Supabase production values if needed; git ignored and not auto-loaded by Next.
- `.deploy/supabase.env.local`: Supabase helper credentials and connection strings; git ignored.

Do not create `.env.production.local` unless intentionally testing Vercel-like production env locally. Next.js auto-loads that file during `next build`, so empty or stale values can mask the local Docker `.env`.

- GitHub repo: `seokmogu/beloved-church-wirye`
- Production branch: `main`
- Approved deployment path: GitHub -> Vercel Git integration
- Direct `vercel deploy` is not an approved release path.

## GitHub To Vercel Routing

The live site must remain tied to the production Vercel project only. The dev project exists to test branches without touching the live domains.

| GitHub branch/action | Vercel project | Expected deployment |
| --- | --- | --- |
| `main` push or merge | `seokmogus-projects/beloved-church-wirye` | Production deployment. This is the only path that updates `https://belovedchurch.co.kr/` and `https://www.belovedchurch.co.kr/`. |
| `develop` push | `seokmogus-projects/beloved-church-wirye-dev` | Dev project deployment for shared dev QA. |
| `feature/*`, `fix/*`, `chore/*` push | `seokmogus-projects/beloved-church-wirye-dev` | Dev project branch deployment for task-level QA. |
| Non-`main` push | `seokmogus-projects/beloved-church-wirye` | Skipped. The production project has an Ignored Build Step that exits `0` for non-`main` branches. |
| `main` push | `seokmogus-projects/beloved-church-wirye-dev` | Skipped. The dev project has an Ignored Build Step that exits `0` for `main`. |

Current production project Ignored Build Step:

```sh
if [ "$VERCEL_GIT_COMMIT_REF" = "main" ]; then exit 1; else exit 0; fi
```

Current dev project Ignored Build Step:

```sh
if [ "$VERCEL_GIT_COMMIT_REF" = "main" ]; then exit 0; else exit 1; fi
```

Vercel treats exit code `0` from the Ignored Build Step as "skip/cancel this build" and exit code `1` as "continue the build." Keep this inverted convention in mind before editing the command.

Operational rules:

- Live release: merge an approved PR into `main`; do not push directly to `main`.
- Dev release: push `develop` or a task branch and use the dev Vercel Preview URL.
- Normal work: branch -> local validation -> push -> PR -> dev preview QA -> approved merge to `main`.
- Do not use direct Vercel CLI deployments, deploy hooks, or dashboard redeploys for normal releases.
- Before a live merge, confirm the production Vercel project is still connected to `seokmogu/beloved-church-wirye` with production branch `main`.
- Before destructive admin QA, confirm the target URL is a dev Preview deployment and the env points to Supabase `tnvhgvxekvwqgdjufnwe`, not production Supabase `fpiqbslkwcyqpbrnbkhr`.

## Vercel Production Target

- Scope/project: `seokmogus-projects/beloved-church-wirye`
- Project ID: `prj_rlSbDEXCQBanqqOZorCnYKL6BTnH`
- Dashboard: `https://vercel.com/seokmogus-projects/beloved-church-wirye`
- Git repository: `seokmogu/beloved-church-wirye`
- Ignored Build Step: build `main`, skip non-`main` branches.
- Environment: Production variables point to the production Supabase and production Blob resources.

## Vercel Dev Target

- Scope/project: `seokmogus-projects/beloved-church-wirye-dev`
- Project ID: `prj_WP15MtYl2epk2Y7gQa158GWjoeTj`
- Dashboard: `https://vercel.com/seokmogus-projects/beloved-church-wirye-dev`
- Git repository: `seokmogu/beloved-church-wirye`
- Ignored Build Step: skip `main`, build non-`main` branches.
- Environment: Production, Preview, and Development variables point to the dev Supabase and dev Blob resources.
- Note: Vercel may label a Git deployment on this separate dev project as target `production`. That target belongs only to the dev project aliases such as `beloved-church-wirye-dev-seokmogus-projects.vercel.app`; it must not use production Supabase or production Blob values.

Required Vercel access:

- Permission to view project settings, deployments, Git integration, domains, logs, and environment variables.
- Permission to edit environment variables for Production and Preview.
- Permission to trigger redeploys from the Vercel dashboard if Git integration needs a retry.

Required Vercel checks before production release:

- Git provider is connected to `seokmogu/beloved-church-wirye`.
- Production branch is `main`.
- Automatic Git deployments are enabled for the intended branch/environment.
- Build command, install command, root directory, and Node.js version match the repository settings.
- Production env vars are present by name, without exposing values.

## Supabase Target

- Project name: `beloved-church-wirye`
- Project ref: `fpiqbslkwcyqpbrnbkhr`
- Dashboard: `https://supabase.com/dashboard/project/fpiqbslkwcyqpbrnbkhr`
- API endpoint: `https://fpiqbslkwcyqpbrnbkhr.supabase.co`

Required Supabase access:

- Permission to view project settings and database connection strings.
- Permission to connect to the Postgres database for schema/data migration.
- Permission to inspect tables, roles, extensions, storage, logs, and backups.
- Permission to run SQL or use the CLI against project ref `fpiqbslkwcyqpbrnbkhr`.

Required Supabase checks before migration:

- Active Supabase account/token belongs to the church project account.
- Target project ref is exactly `fpiqbslkwcyqpbrnbkhr`.
- Remote Postgres major version and extensions are compatible with the local dump.
- A restorable backup/export exists before destructive or overwrite operations.
- Migration method is chosen explicitly: Payload migrations, `pg_dump`/`pg_restore`, or controlled SQL import.

## Required Environment Variable Names

Vercel Production and Preview should be checked for these names as applicable:

- `POSTGRES_URL`
- `PAYLOAD_SECRET`
- `NEXT_PUBLIC_SERVER_URL`
- `PAYLOAD_SERVER_URL`
- `PAYLOAD_PUBLIC_ORIGINS`
- `CRON_SECRET`
- `PREVIEW_SECRET`
- `BLOB_READ_WRITE_TOKEN`
- `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `MANAGE_ADMIN_EMAILS`
- `NEXT_PUBLIC_CHAT_ENABLED`
- `OPENCLAW_API_URL`
- `OPENCLAW_GATEWAY_TOKEN`

Do not print secret values in Markdown, issues, screenshots, terminal summaries, or chat. For normal agent work, keep secret-containing env files git ignored; if the repo owner explicitly asks to commit a specific env file, confirm the exact file and scope first.

## Local-Only Storage Inside This Project

Store deployment-only local material under `.deploy/`. The directory is git ignored.

Suggested local files:

- `.deploy/vercel.env.local` for Vercel env values, token, or non-committed CLI helper vars.
- `.deploy/supabase.env.local` for Supabase token and connection strings.
- `.deploy/dumps/` for local database exports before migration.
- `.deploy/checks/` for private command output that may include project metadata.

Secret values may also live in `.env`, `.env.development`, `.env.preview`, `.env.production`, `.env.local`, or `.env.*.local`, which are git ignored. Keep all secret-containing files mode `600` when possible.

## Current Local Source Checkout

- MacBook Air project path: `/Users/seokmogu/project/beloved-church-wirye`
- Current environment-split working copy: `/Users/seokmogu/project/beloved-church-wirye-env`
