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
- Direct `vercel deploy` is not the normal release path.

## Vercel Target

- Scope/project: `seokmogus-projects/beloved-church-wirye`
- Project ID: `prj_rlSbDEXCQBanqqOZorCnYKL6BTnH`
- Dashboard: `https://vercel.com/seokmogus-projects/beloved-church-wirye`

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

## Current Local Source Database

- Mac Studio project path: `/Users/aktn/project/beloved-church-wirye`
