# TOMOSHA implementation plan

## Workspace audit

Audit date: 2026-07-27

- Repository: `inspiretd/Streaming-platform`, public
- App: single Next.js App Router project, TypeScript strict, Tailwind, Motion for React
- Package manager: pnpm 9.15.0 with a committed lockfile, CI installs with `--frozen-lockfile`
- CI: `.github/workflows/ci.yml`, four independent jobs (lint, typecheck, test, build)
- Security: historical playlist exposure documented in `docs/security-incident.md`, rotation still required

## Phase 1: foundation and quality gates (COMPLETED)

- [x] Reproducible pnpm setup with committed lockfile and pinned package manager
- [x] Four independent CI gates
- [x] Playlist ignore rules: `*.m3u`, `*.m3u8`, `/private-playlists/`, `/imports/private/`
- [x] Removed `experimental.typedRoutes`, the remaining production build blocker
- [x] Security headers on every route

## Phase 2: cinematic UI system (COMPLETED)

- [x] Token set: background layers, saffron accent, radii, shadows, focus ring
- [x] Manrope and JetBrains Mono type system with `display: swap`
- [x] Responsive grid, 360 to 1920 breakpoints, mobile bottom tab bar
- [x] Navbar with scroll blur and `layoutId` active indicator
- [x] Hero with staggered entrance and slow background scale
- [x] Cards, rails, chips, switches, tabs, dialogs, drawers, toasts, skeletons
- [x] Loading, empty, error and success states on every surface
- [x] `MotionConfig reducedMotion="user"` plus a CSS reduced motion fallback

## Phase 3: live catalog (COMPLETED)

- [x] Routes: `/`, `/live`, `/live/[slug]`, `/guide`, `/search`, `/favorites`, `/history`, `/profile`, `/watch`, `/auth`, `/admin`
- [x] Filters: category, country, language, quality, online only, EPG only, A to Z, popularity
- [x] Apostrophe normalization, Cyrillic and Latin tolerant search, single edit typo tolerance
- [x] Paged rendering so large catalogs never mount thousands of cards
- [x] Current and next program on every card, related channels on detail

## Phase 4: HLS playback (COMPLETED)

- [x] Server side playback session endpoint with rights, state, region and provider checks
- [x] HLS.js with native HLS fallback, no stream URL in any frontend source or fixture
- [x] Controls: play, mute, volume, fullscreen, PiP, quality, live edge, report
- [x] States: connecting, live, buffering, reconnecting, offline, auth required, geo blocked, error
- [x] Recovery: exponential network retry, media error recovery, retry action after 3 fatal errors
- [x] Keyboard shortcuts and a shortcuts dialog
- [x] Playback analytics events without any token in the payload

## Phase 5: secure importer (COMPLETED)

- [x] `#EXTM3U` and `#EXTINF` parsing with attributes, name, group, tvg id, logo, catchup
- [x] Quality and timeshift variant extraction and grouping
- [x] Uzbek group mapping to `country=UZ`
- [x] Adult, 18+, XXX and equivalent rejection
- [x] Duplicate detection by provider id, tvg id, normalized name and URL fingerprint
- [x] HTTPS only, private and loopback host blocking, port allowlist, size and entry caps
- [x] Preview, dry run, execute and rollback with audit entries
- [x] Stream URLs redacted in every response and log

## Phase 6: EPG and guide (COMPLETED)

- [x] Deterministic schedule generation with Asia/Tashkent normalization
- [x] Guide timeline and mobile list views with a program drawer
- [x] Current program marker, date switcher, current and next three programs
- [ ] XMLTV file ingestion and fuzzy tvg id mapping confirmation UI

## Phase 7: accounts and user data (PARTIAL)

- [x] Device local favorites, watch history, continue watching and player settings
- [x] Profile settings with clear history and delete local data
- [x] Magic link request endpoint that keeps keys server side
- [x] Supabase schema with RLS on every user owned table
- [ ] Session exchange, server side persistence and guest to account migration

## Phase 8: admin and operations (COMPLETED)

- [x] Dashboard with catalog, availability, import and audit metrics
- [x] Importer console with preview, dry run, execute and rollback
- [x] Stream health page with host grouping and circuit breaker state
- [x] Audit log and viewer reports

## Phase 9: hardening (COMPLETED)

- [x] Metadata, Open Graph, canonical URLs, sitemap and robots
- [x] Focus visible styles, skip link, 44px targets, ARIA roles and live regions
- [x] Fixed aspect ratios, no layout shift, transform and opacity only animations
- [x] Unit, integration and component tests
- [ ] Playwright E2E suite (requires adding the Playwright dependency)

## Security status

The historical credential shaped provider path is treated as compromised. Rotation at the provider remains a critical
blocker before `ENABLE_REAL_PROVIDERS` may be set to true. Until then only demo fixtures play. No playlist, token,
cookie, account identifier or raw stream URL is committed or returned to the browser.

## Known limitations

- hls.js loads from a pinned CDN build because the offline environment cannot regenerate `pnpm-lock.yaml` for a new
  dependency. Swap `NEXT_PUBLIC_HLS_JS_URL` for a self hosted copy, or add the npm dependency when running locally.
- Favorites, history and imports use device local storage and an in memory server store. The Supabase migrations define
  the production schema and are ready to be applied.
- Playwright and axe-core are not installed, so E2E and automated accessibility runs are documented but not executed.
