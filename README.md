# TOMOSHA

Cinematic live TV and OTT web platform. Next.js App Router, TypeScript strict, Tailwind, Motion for React and HLS playback.

> Live broadcast. Favorite channels. One place.

## Quick start

```bash
corepack enable
corepack prepare pnpm@9.15.0 --activate
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

## Quality gates

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

All four run on every push and pull request in `.github/workflows/ci.yml`.

## What is implemented

- Cinematic design system: tokens, layered dark surfaces, saffron accent, responsive 4/8/12 column grid
- Motion: navbar indicator, hero stagger, card hover, carousel, page transitions, dialogs, drawers, toasts, reduced motion support
- Live catalog with category, country, language, quality, online and A to Z filtering plus tolerant Cyrillic and Latin search
- Channel detail with player, current and upcoming programs, rights notice and related channels
- HLS player: native fallback, quality menu, PiP, fullscreen, live edge, keyboard shortcuts, buffering and recovery states
- TV guide with Asia/Tashkent normalization, timeline and list views, program drawer
- Favorites, watch history, continue watching and profile settings (device local, privacy first)
- Admin console: dashboard, authorized playlist importer with preview, dry run, execute and rollback, stream health monitoring, audit log
- Secure M3U importer: adult rejection, duplicate detection, SSRF and private host blocking, redacted output
- Typed API layer with Zod validation, request ids, rate limiting and structured errors

## Content and security rules

- Only licensed, public domain or rights holder approved streams may be published
- Adult content is rejected at import time and never published
- Playlists, provider tokens, cookies and account identifiers are never committed; see `.gitignore`
- Real provider playback is disabled until credential rotation completes, see `docs/security-incident.md`

## Documentation

- `docs/implementation-plan.md`
- `docs/architecture.md`
- `docs/provider-integration.md`
- `docs/content-rights.md`
- `docs/deployment.md`
- `docs/security-incident.md`
