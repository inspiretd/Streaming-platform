# TOMOSHA implementation plan

## Workspace audit

Audit date: 2026-07-27

- Repository: `inspiretd/Streaming-platform`
- Default branch: `main`
- Public repository, with historical `playlist.m3u8` exposure documented in `docs/security-incident.md`
- Current app: single Next.js App Router application, strict TypeScript, Tailwind, Motion, typed fixtures
- Current CI: pinned pnpm 9.15.0, committed lockfile, frozen-lockfile installs, four separate quality gates

## Delivery phases

### Phase 1: foundation and cinematic shell (COMPLETED)

Approved CI run: [#15 / 30272183080](https://github.com/inspiretd/Streaming-platform/actions/runs/30272183080)
Commit SHA: `2669ee7989e719e1141fed800683e9733e981e9d`

- [x] Foundation, strict TypeScript, responsive shell, demo fixtures, route states, docs, CI
- [x] Lint, typecheck, unit tests, production build

### Phase 2: cinematic UI system (IN PROGRESS)

- [x] App chrome with desktop navbar, mobile menu, bottom navigation, search overlay
- [x] Layered dark surfaces, saffron accent, Manrope and DM Mono typography
- [x] Motion hero stagger, card transitions, overlay transitions, reduced motion config
- [x] Responsive catalog grid, filters, focus-visible controls, empty and success states
- [ ] Run and pass lint, typecheck, unit tests, production build

### Phase 3: live catalog and detail

- [x] Live catalog route with category, country, quality, online filtering and tolerant search
- [x] Channel cards link to typed detail routes
- [ ] Add pagination/virtualization for large catalogs
- [ ] Add EPG timeline and related channels to detail view
- [ ] Run quality gates

### Phase 4: HLS playback

- [ ] Add HLS.js and native fallback player
- [ ] Server-side playback session contract with rights checks
- [ ] Recovery states and analytics without raw URLs
- [ ] Run quality gates

### Phase 5: authorized importer and rights workflow

- [ ] Full M3U parser, normalization, duplicate report, dry-run, rollback
- [ ] Adult filter, UZ mapping, quality and timeshift variants
- [ ] Server-side secret handling and import audit log
- [ ] Run quality gates

### Phase 6: EPG and guide

- [ ] XMLTV parser, timezone normalization, mapping UI, guide grid and drawer
- [ ] Run quality gates

### Phase 7: auth and user data

- [ ] Supabase Auth, profiles, favorites, history, settings, RLS migrations
- [ ] Run quality gates

### Phase 8: admin and monitoring

- [ ] Provider management, rights, reports, health jobs, admin dashboard
- [ ] Run quality gates

### Phase 9: hardening and release

- [ ] Accessibility, performance, SEO, security headers, tests, deployment docs
- [ ] Run quality gates

## Security constraints

- Never commit playlists, provider cookies, tokens, account identifiers, or raw stream credentials.
- Historical credential-like path remains a critical rotation blocker. Real provider streams stay disabled until provider-side revoke/rotate is confirmed.
- Demo fixtures contain no real stream URLs.
