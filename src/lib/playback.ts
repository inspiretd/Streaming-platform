import type { Channel, PlaybackSessionResult, PlaybackSource } from './types';

/**
 * Playback sources are resolved on the server only. No provider URL, cookie or
 * account identifier is stored in client bundles or static fixtures.
 */
const DEMO_SOURCES: Record<string, { url: string; label: string }> = {
  'demo-primary': {
    url: process.env.DEMO_HLS_PRIMARY ?? 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    label: 'Demo multi-bitrate HLS',
  },
  'demo-secondary': {
    url:
      process.env.DEMO_HLS_SECONDARY ??
      'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8',
    label: 'Demo reference HLS',
  },
};

export const REAL_PROVIDERS_ENABLED = process.env.ENABLE_REAL_PROVIDERS === 'true';

export function resolvePlaybackSession(channel: Channel | null, requestId: string): PlaybackSessionResult {
  if (!channel) {
    return { ok: false, requestId, code: 'not_found', message: 'Channel not found.' };
  }
  if (channel.state !== 'published') {
    return { ok: false, requestId, code: 'unpublished', message: 'This channel is not published yet.' };
  }
  if (channel.status === 'geo_blocked') {
    return { ok: false, requestId, code: 'geo_blocked', message: 'This channel is not available in your region.' };
  }
  if (channel.status === 'auth_required') {
    return {
      ok: false,
      requestId,
      code: 'auth_required',
      message: 'The rights holder requires an authorized session for this channel.',
    };
  }
  if (channel.status === 'offline') {
    return { ok: false, requestId, code: 'provider_unavailable', message: 'The provider is currently unreachable.' };
  }
  if (channel.rights !== 'demo_fixture' && !REAL_PROVIDERS_ENABLED) {
    return {
      ok: false,
      requestId,
      code: 'rights_unconfirmed',
      message: 'Real provider playback stays disabled until credential rotation and rights confirmation complete.',
    };
  }

  const demo = DEMO_SOURCES[channel.sourceKey] ?? DEMO_SOURCES['demo-primary'];
  const source: PlaybackSource = {
    type: 'hls',
    url: demo.url,
    label: demo.label,
    live: true,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  };

  return {
    ok: true,
    requestId,
    channelId: channel.id,
    source,
    policy: {
      allowPictureInPicture: true,
      allowDownload: false,
      provider: channel.provider,
      notice: 'Demo fixture stream. Segments are delivered directly by the origin CDN, never relayed by TOMOSHA.',
    },
  };
}
