import { describe, expect, it } from 'vitest';
import { resolvePlaybackSession } from '@/lib/playback';
import { demoChannels } from '@/lib/demo';
import type { Channel } from '@/lib/types';

function channelWith(patch: Partial<Channel>): Channel {
  return { ...demoChannels[0], ...patch };
}

describe('playback session resolution', () => {
  it('returns an HLS source for a published demo channel', () => {
    const result = resolvePlaybackSession(channelWith({}), 'req_1');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.source.type).toBe('hls');
      expect(result.source.url.startsWith('https://')).toBe(true);
      expect(result.policy.allowDownload).toBe(false);
    }
  });

  it('refuses unknown channels', () => {
    const result = resolvePlaybackSession(null, 'req_2');
    expect(result).toMatchObject({ ok: false, code: 'not_found' });
  });

  it('refuses drafts and blocked channels', () => {
    expect(resolvePlaybackSession(channelWith({ state: 'draft' }), 'req_3')).toMatchObject({ code: 'unpublished' });
  });

  it('surfaces provider and region restrictions', () => {
    expect(resolvePlaybackSession(channelWith({ status: 'auth_required' }), 'req_4')).toMatchObject({
      code: 'auth_required',
    });
    expect(resolvePlaybackSession(channelWith({ status: 'geo_blocked' }), 'req_5')).toMatchObject({
      code: 'geo_blocked',
    });
    expect(resolvePlaybackSession(channelWith({ status: 'offline' }), 'req_6')).toMatchObject({
      code: 'provider_unavailable',
    });
  });

  it('blocks real providers until rights are confirmed', () => {
    expect(resolvePlaybackSession(channelWith({ rights: 'pending' }), 'req_7')).toMatchObject({
      code: 'rights_unconfirmed',
    });
  });
});
