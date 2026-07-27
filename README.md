# TOMOSHA

TOMOSHA is an original, cinematic live TV product for permitted streams and metadata. This repository starts with secure demo fixtures only. Provider URLs, cookies, access tokens, account identifiers, and M3U credentials must stay outside source control.

## Run locally

```bash
pnpm install
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

## Product boundary

The demo catalog contains no real provider streams. Authorized M3U imports belong in the server-side admin workflow described in `docs/provider-integration.md`; imported content must have confirmed rights before publishing.
