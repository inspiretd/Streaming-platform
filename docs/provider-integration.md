# Provider integration

## Adapter contract

```ts
interface PlaybackProviderAdapter {
  validateConfiguration(): Promise<ValidationResult>;
  listChannels(): Promise<ProviderChannel[]>;
  getPlaybackSource(channelExternalId: string): Promise<PlaybackSource>;
  refreshSession?(): Promise<void>;
  healthCheck(): Promise<ProviderHealth>;
}
```

Implemented today: a demo fixture provider that resolves public test manifests server side. The importer produces draft
channels for any authorized playlist provider.

## Rules

- Secrets live in the server environment or Supabase Vault, never in the database as plain text and never in a client
  response.
- Stream URLs are redacted in every log, audit entry and API response that is not a playback session.
- Only `https` sources are accepted by default. Private, loopback, link local and metadata hosts are blocked.
- Redirects are followed with a limit, requests are bounded by a timeout, and playlists are capped at 5 MB and 20000
  entries.
- Token refresh only uses the official provider mechanism. Forging or extending provider tokens is out of scope and
  prohibited.

## Enabling a real provider

1. Record the rights: provider, rights type, territories, start and end dates, document reference, status.
2. Rotate any previously exposed credential at the provider.
3. Store the new credential in the server environment only.
4. Import the authorized playlist with preview and dry run first.
5. Publish channels one by one after health checks pass.
6. Set `ENABLE_REAL_PROVIDERS=true`.
