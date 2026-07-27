import { randomUUID } from 'node:crypto';
import type { Channel, PlaybackSession, StreamStatus } from './types';

/**
 * Server-only playback resolution.
 * The client never receives a provider URL from a bundle or a fixture, it always
 * asks /api/playback/[channelId]/session and gets a short lived source back.
 * Segments are fetched by the browser straight from the CDN, never relayed by Next.
 */
const DEMO_SOURCE = process.env.TOMOSHA_DEMO_STREAM_URL ?? 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
const SESSION_TTL_SECONDS = 300;

export type PlaybackDenial = { ok: false; status: number; code: StreamStatus | 'not_found'; message: string };
export type PlaybackGrant = { ok: true; session: PlaybackSession };

const denials: Partial<Record<StreamStatus, { status: number; message: string }>> = {
  auth_required: { status: 403, message: 'This channel needs a rights-confirmed provider account.' },
  geo_blocked: { status: 451, message: 'This channel is not licensed for your region.' },
  offline: { status: 503, message: 'The source is offline. Stream health monitoring is retrying.' },
  unsupported: { status: 415, message: 'The source codec is not supported by this player.' },
};

export function resolvePlayback(channel: Channel | undefined): PlaybackGrant | PlaybackDenial {
  if (!channel) {
    return { ok: false, status: 404, code: 'not_found', message: 'Unknown channel.' };
  }

  const denial = denials[channel.status];
  if (denial) {
    return { ok: false, status: denial.status, code: channel.status, message: denial.message };
  }

  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + SESSION_TTL_SECONDS * 1000);

  return {
    ok: true,
    session: {
      sessionId: randomUUID(),
      channelId: channel.id,
      mode: 'demo',
      issuedAt: issuedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      source: { type: 'hls', url: DEMO_SOURCE, cdn: 'demo-cdn', lowLatency: false },
      restrictions: { geo: ['UZ', 'INT'], concurrentStreams: 2 },
    },
  };
}
