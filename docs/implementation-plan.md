# TOMOSHA implementation plan

## Workspace audit

Audit date: 2026-07-27

- Repository: `inspiretd/Streaming-platform`
- Default branch: `main`
- Existing commit history: one initial upload commit
- Existing tracked content: `playlist.m3u8` only
- Application status: no Next.js app, package manifest, source tree, tests, migrations, docs, CI, or environment template exists
- Security finding: the playlist is an unreviewed external source and must not be bundled, served, or copied into the application. It will be removed from the repository and replaced with safe demo fixtures plus an admin import flow.
- Technical baseline: greenfield single Next.js App Router project with TypeScript strict mode

## Delivery phases

### Phase 1: foundation and cinematic shell

- [ ] Create a single Next.js App Router application with strict TypeScript
- [ ] Add Tailwind, Motion for React, Lucide, Vitest, Playwright, and accessibility test support
- [ ] Establish TOMOSHA design tokens, typography, responsive grid, focus states, and reduced-motion behavior
- [ ] Build the original home, live catalog, guide, search, watch scaffold, auth, profile, favorites, history, and admin shells
- [ ] Add loading, empty, error, and success states to every route
- [ ] Add safe demo fixtures only, with no provider credentials or private stream data
- [ ] Add README, `.env.example`, architecture, content-rights, provider-integration, and deployment docs
- [ ] Run lint, TypeScript typecheck, unit tests, and production build; stop on failure

### Phase 2: live catalog and playback

- [ ] Add typed channel, EPG, playback, rights, and report models
- [ ] Add HLS player with native fallback, poster-first loading, recovery states, keyboard controls, and reduced-motion support
- [ ] Add live catalog filters, channel detail, favorites, history, reports, and local persistence
- [ ] Add Route Handler contracts for channel, playback session, favorites, history, search, and reports
- [ ] Run the full validation suite; stop on failure

### Phase 3: admin import and rights workflow

- [ ] Add server-side M3U parser and normalization
- [ ] Add preview counts, duplicate detection, blocked-content filtering, HTTPS/private-host validation, size and entry limits
- [ ] Add admin provider import UI, rights records, audit log model, publish/block workflow, and redacted logs
- [ ] Keep imported credentials server-side only; never return secrets to the browser
- [ ] Run the full validation suite; stop on failure

### Phase 4: persistence, EPG, and operations

- [ ] Add versioned Supabase migrations, RLS policies, seed data, and server repositories
- [ ] Add XMLTV import/mapping, provider health checks, retry/backoff, and monitoring views
- [ ] Add auth onboarding, profile settings, localization for Uzbek/Russian/English, and user data controls
- [ ] Add Playwright smoke coverage and accessibility checks
- [ ] Run the full validation suite; stop on failure

### Phase 5: hardening and release

- [ ] Add security headers, rate limits, audit events, analytics without raw tokens, and dependency review
- [ ] Verify responsive behavior at 360, 480, 768, 1024, 1280, 1440, and 1920 widths
- [ ] Verify all route states and legal/content-rights boundaries
- [ ] Document deployment and authorized-provider onboarding
- [ ] Run the full validation suite and publish only after all checks pass

## Validation checklist

- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] No `any` types unless explicitly justified in a comment
- [ ] No real provider tokens, cookies, account IDs, or M3U credentials
- [ ] No adult or unknown streams in demo content
- [ ] No provider authentication forgery, DRM bypass, or segment proxying
- [ ] Every page has loading, empty, error, and success affordances
- [ ] UI remains original and does not reproduce an existing streaming service
