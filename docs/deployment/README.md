# Church Deployment Notes

## Deployment Path

- Development environment uses local services:
  - Frontend/admin: local Next.js dev server, normally `http://localhost:3000`.
  - Custom admin: same app at `/manage`; `/admin` redirects to `/manage`.
  - Database: local Docker Postgres from `docker-compose.yml`, port `54320`, database `beloved-church-wirye`.
- Production environment uses Vercel + Neon Postgres:
  - Frontend/admin: Vercel deployment under `seokmogus-projects/beloved-church-wirye`.
  - Custom admin: same Vercel app at `/manage`; `/admin` redirects to `/manage`.
  - Admin auth: Better Auth tables in Neon schema `manage_auth`, restricted by `MANAGE_ADMIN_EMAILS`.
  - Database: Neon Postgres project `beloved-church-wirye` (`blue-water-45288801`).
  - Existing Supabase bcrypt password hashes are imported once into `manage_auth`; sessions are deliberately not copied, so every administrator signs in once after cutover.
- Hosted development Preview uses separate Vercel + Neon resources:
  - Vercel project: `seokmogus-projects/beloved-church-wirye-dev`.
  - Database and admin auth: the Neon project `beloved-church-wirye-dev` with its own `manage_auth` schema.
  - The environment uses a separate `MANAGE_AUTH_SECRET` and `MANAGE_ADMIN_EMAILS` allowlist.
  - This project is intentionally isolated from production. Do not import production users or content into it for routine development tests.

Local `.env` must point to local Docker and local frontend URLs. Production `POSTGRES_URL` must point to the designated Neon production branch. The separate development Preview project uses its own Neon resources. Do not mix local URLs into Vercel env vars.

- This repo does not keep a tracked `.env.example`; use the real project env files instead.
- `.env.production` is intentionally tracked for non-secret production defaults required by Git builds, including the admin email allowlist. Do not put passwords, database URLs, or private tokens in `.env.production`.
- `.env`: canonical local development values; git ignored.
- `.deploy/vercel.env.local`: private copy of Vercel production values if needed; git ignored and not auto-loaded by Next.
- `.deploy/supabase.env.local`: legacy migration-only helper credentials and connection strings; git ignored.

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

## Legacy Supabase Migration Source

- Project name: `beloved-church-wirye`
- Project ref: `fpiqbslkwcyqpbrnbkhr`
- Dashboard: `https://supabase.com/dashboard/project/fpiqbslkwcyqpbrnbkhr`
- API endpoint: `https://fpiqbslkwcyqpbrnbkhr.supabase.co`

Supabase is not a live production dependency after cutover. Keep its access only for the scoped backup and migration comparison:

- Permission to view project settings and database connection strings.
- Permission to inspect the legacy Auth records and database connection only for a scoped backup, rollback, or final migration comparison.

Required legacy-source checks before a database cutover or rollback:

- Active Supabase account/token belongs to the church project account.
- Target project ref is exactly `fpiqbslkwcyqpbrnbkhr`.
- A restorable backup/export exists before destructive or overwrite operations.

## Neon Production Target

- Project name: `beloved-church-wirye`
- Project ID: `blue-water-45288801`
- Production application data uses `public`; administrator authentication is isolated in `manage_auth`.
- Create and validate a separate cutover branch before changing Vercel's Production `POSTGRES_URL`; do not overwrite the previous branch in place.
- The rollback source stays in the protected pre-cutover Supabase backup until the Neon release has been verified.
- Migration method is chosen explicitly: Payload migrations, `pg_dump`/`pg_restore`, or controlled SQL import.

### Administrator password-preserving cutover

1. Freeze new administrator sign-ins briefly, then take a fresh legacy database backup.
2. Apply the Payload migration to the isolated Neon cutover branch.
3. Run `scripts/migrate-supabase-manage-auth-to-neon.mjs` with private `SOURCE_AUTH_DATABASE_URL` and `TARGET_AUTH_DATABASE_URL` values. The script accepts only bcrypt source hashes, aborts if an unrelated target manager exists, and verifies the migrated account count without logging personal data or password hashes.
4. Set Vercel Production to the validated direct Neon SSL `POSTGRES_URL` (the app limits each runtime pool to two connections) and a private `MANAGE_AUTH_SECRET`, then remove every Supabase runtime variable.
5. Deploy through the GitHub-to-Vercel integration and have an existing administrator sign in using the same email and password. Sessions are intentionally not transferred, so one sign-in is required after the switch.
6. Keep the protected legacy backup and Supabase project unchanged until that real administrator sign-in and public-site checks pass. Do not delete the legacy project as part of the database cutover.

## Required Environment Variable Names

The production Vercel project should be checked for these names as applicable:

- `POSTGRES_URL`
- `PAYLOAD_SECRET`
- `NEXT_PUBLIC_SERVER_URL`
- `PAYLOAD_SERVER_URL`
- `PAYLOAD_PUBLIC_ORIGINS`
- `CRON_SECRET`
- `PREVIEW_SECRET`
- `BLOB_READ_WRITE_TOKEN`
- `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `MANAGE_AUTH_SECRET`
- `MANAGE_ADMIN_EMAILS`
- `NEXT_PUBLIC_CHAT_ENABLED`
- `OPENCLAW_API_URL`
- `OPENCLAW_GATEWAY_TOKEN`

The separate development Vercel project's **Preview** environment uses its own Neon values:

- `POSTGRES_URL` (the Neon development connection string)
- `MANAGE_AUTH_SECRET`
- `MANAGE_ADMIN_EMAILS` (development-only allowlist)

Keep the development project's Production environment unchanged unless a separate release decision explicitly approves it.

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
