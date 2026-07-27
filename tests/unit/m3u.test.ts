import { describe, expect, it } from 'vitest';
import { parseSafeM3u } from '@/lib/m3u';

describe('parseSafeM3u', () => {
  it('parses permitted https entries and rejects unsafe content', () => {
    const input = '#EXTM3U\n#EXTINF:0 group-title="News" tvg-id="demo",Demo News\nhttps://demo.invalid/live.m3u8\n#EXTINF:0 group-title="Adult",Hidden\nhttps://demo.invalid/adult.m3u8\n#EXTINF:0 group-title="News",Insecure\nhttp://demo.invalid/live.m3u8';
    expect(parseSafeM3u(input)).toEqual([{ name: 'Demo News', url: 'https://demo.invalid/live.m3u8', group: 'News', tvgId: 'demo', tvgLogo: undefined }]);
  });
});
