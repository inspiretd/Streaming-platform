# Deployment

## Targets

- Vercel or Cloudflare Pages for the web app
- Supabase for PostgreSQL, Auth and Storage
- A scheduled job (Vercel Cron or GitHub Actions) for stream health checks

## Steps

1. Fork or clone the repository and connect it to the hosting provider.
2. Set the environment variables from `.env.example`. Leave `ENABLE_REAL_PROVIDERS` as `false` until credential rotation
   is complete and a rights record exists for every provider channel.
3. Set `ADMIN_API_TOKEN` before exposing a public deployment. Without it the admin API runs in local demo mode.
4. Apply database migrations:
   ```bash
   supabase db push
   ```
5. Deploy. The build runs `next build` with strict TypeScript and ESLint.
6. Verify: `/` renders, `/live` filters, `/live/[slug]` plays the demo stream, `/guide` shows Tashkent times, `/admin`
   dashboard loads.

## Operations

- Health: `/admin/health` groups channels by host and opens a circuit breaker when a host fails for the majority of its
  channels.
- Imports: `/admin/import` supports preview, dry run, execute and rollback. Playlists are processed in memory only.
- Incidents: record every credential exposure in `docs/security-incident.md` and rotate before re-enabling providers.
