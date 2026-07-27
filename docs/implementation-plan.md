# TOMOSHA implementation plan

## Workspace audit

Audit date: 2026-07-27

- Repository: `inspiretd/Streaming-platform`
- Public repository with historical playlist exposure documented in `docs/security-incident.md`
- Current app: single Next.js App Router app, strict TypeScript, Tailwind, Motion, typed safe fixtures
- CI: pnpm 9.15.0, committed lockfile, frozen-lockfile install, separate lint/typecheck/test/build jobs

## Phase 1: foundation and cinematic shell (COMPLETED)
Approved CI run: #15, commit `2669ee7989e719e1141fed800683e9733e981e9d`.

## Phase 2: cinematic UI system (COMPLETED)
- [x] App chrome, desktop navigation, mobile menu, bottom navigation
- [x] Search overlay with Motion transitions and keyboard-focusable controls
- [x] Layered dark surfaces, saffron accent, Manrope/DM Mono type system
- [x] Responsive catalog grid, filter rail, empty state, hover/focus transitions
- [x] Reduced motion configuration on Motion surfaces

## Phase 3: live catalog and detail (COMPLETED)
- [x] Live route with category, country, quality, online status filters
- [x] Tolerant apostrophe-normalized search
- [x] Channel cards and detail links
- [x] Typed playback session contract that blocks unconfigured real providers
- [x] Pagination/virtualization reserved for persistence-scale catalog

## Phase 4: HLS playback (IN PROGRESS)
- [ ] HLS.js player with native fallback and responsive controls
- [x] Server playback session contract with rights-safe auth-required response
- [ ] Recovery states, keyboard controls, and analytics events

## Phase 5: secure importer
- [x] Dry-run preview API with redacted stream URLs
- [x] HTTPS/private IP validation, adult rejection, duplicate detection
- [x] Uzbek country mapping, quality and timeshift variant mapping
- [ ] Persistence execute/rollback workflow

## Phase 6: EPG and guide
- [ ] XMLTV parser and timezone normalization
- [ ] Guide timeline and program drawer

## Phase 7: auth and user data
- [x] Initial Supabase migration with RLS for profile-owned data
- [ ] Auth flows, profile persistence, favorites and history APIs

## Phase 8: admin and monitoring
- [ ] Provider management, rights, reports, audit UI
- [ ] Stream health worker and host circuit breaker

## Phase 9: hardening and release
- [ ] Accessibility audit, SEO, performance, E2E, deployment docs

## Security

Historical credential-like provider path is compromised. Rotation/revocation remains a critical blocker. Real provider playback is disabled. No private playlist, token, cookie, account identifier, or raw stream URL is returned to the browser or committed.
