# Architecture

## Runtime

Single Next.js App Router application. Server Components render catalog and guide data, Client Components own
interaction: navigation, filters, search overlay, player, admin console.

```
browser
  -> Next.js route handler (/api/playback/[channelId]/session)
  -> rights, publish state, provider and region checks
  -> authorized playback URL
  -> HLS.js in the browser
  -> media segments straight from the provider CDN
```

The application server never relays media segments. It only resolves access and metadata.

## Layers

- `src/lib` pure domain logic: normalization, search ranking, EPG, M3U parsing, URL safety, playback policy
- `src/server` server only services: catalog, health, audit and import store, HTTP envelope helpers
- `src/app/api` typed route handlers with Zod validation, request ids and rate limiting
- `src/components` UI system, split by feature area
- `src/hooks` client state: local favorites, history, settings, HLS loader

## Data

The MVP ships with safe demo fixtures plus an in memory import store so the product is fully explorable without a
database. Supabase migrations under `supabase/migrations` define the production schema with row level security for all
user owned tables.

## Motion

`MotionConfig reducedMotion="user"` wraps the app. Navigation animations stay in the 180 to 260 ms band, page
transitions stay under 320 ms, and only transform and opacity are animated.
