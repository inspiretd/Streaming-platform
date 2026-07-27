import { describe, expect, it } from 'vitest';
import { previewM3u } from '@/lib/m3u';

describe('M3U preview', () => {
  it('extracts metadata and rejects unsafe entries', () => {
    const preview = previewM3u('#EXTM3U\n#EXTINF:0 group-title="O\'zbekistan",Demo HD +2\nhttps://authorized.example/live.m3u8\n#EXTINF:0 group-title="Взрослые",Hidden\nhttps://authorized.example/hidden.m3u8\n#EXTINF:0 group-title="News",Bad\nhttp://private.example/live.m3u8');
    expect(preview.accepted).toBe(1);
    expect(preview.blocked).toBe(1);
    expect(preview.invalid).toBe(1);
    expect(preview.entries[0]).toMatchObject({ quality: 'HD', country: 'UZ', timeshift: '2', variant: 'timeshift' });
  });
});
