import { describe, expect, it } from 'vitest';
import { buildImportPreview, detectCountry, isAdultLabel, isUzbekGroup, parseAttributes, parseM3u } from '@/lib/m3u';

const PLAYLIST = [
  '#EXTM3U',
  '#EXTINF:-1 tvg-id="uz24" tvg-name="Ozbekiston 24" tvg-logo="https://cdn.example.com/uz24.png" group-title="\u0423\u0437\u0431\u0435\u043a\u0438\u0441\u0442\u0430\u043d",Ozbekiston 24 HD',
  'https://demo.example.com/uz24/index.m3u8',
  '#EXTINF:-1 tvg-id="uz24" group-title="\u0423\u0437\u0431\u0435\u043a\u0438\u0441\u0442\u0430\u043d",Ozbekiston 24 HD',
  'https://demo.example.com/uz24/index.m3u8',
  '#EXTINF:-1 group-title="Sport",Arena Sport UHD',
  'https://demo.example.com/arena/index.m3u8',
  '#EXTINF:-1 group-title="\u0412\u0437\u0440\u043e\u0441\u043b\u044b\u0435",Blocked Channel',
  'https://demo.example.com/blocked/index.m3u8',
  '#EXTINF:-1 group-title="XXX",Another Blocked',
  'https://demo.example.com/blocked2/index.m3u8',
  '#EXTINF:-1 group-title="Local",Private Host',
  'https://192.168.1.4/index.m3u8',
  '#EXTINF:-1 group-title="Local",Insecure Source',
  'http://cdn.example.com/index.m3u8',
  '#EXTINF:-1 group-title="Local",Broken Url',
  'not-a-url',
].join('\n');

describe('attribute parsing', () => {
  it('reads every quoted attribute', () => {
    const attributes = parseAttributes('#EXTINF:-1 tvg-id="a" group-title="News",Name');
    expect(attributes['tvg-id']).toBe('a');
    expect(attributes['group-title']).toBe('News');
  });
});

describe('content safety', () => {
  it('detects adult labels', () => {
    expect(isAdultLabel('XXX')).toBe(true);
    expect(isAdultLabel('18+')).toBe(true);
    expect(isAdultLabel('\u0412\u0437\u0440\u043e\u0441\u043b\u044b\u0435')).toBe(true);
    expect(isAdultLabel('Kids')).toBe(false);
  });

  it('maps uzbek groups to UZ', () => {
    expect(isUzbekGroup('\u0423\u0437\u0431\u0435\u043a\u0438\u0441\u0442\u0430\u043d')).toBe(true);
    expect(detectCountry('Uzbekistan', 'Yoshlar')).toBe('UZ');
    expect(detectCountry('Sport', 'Arena')).toBe('XX');
  });
});

describe('playlist parsing', () => {
  it('rejects adult, private, insecure and invalid entries', () => {
    const result = parseM3u(PLAYLIST);
    const reasons = result.rejected.map((entry) => entry.reason);
    expect(reasons).toContain('adult');
    expect(reasons).toContain('private_host');
    expect(reasons).toContain('insecure_scheme');
    expect(reasons).toContain('invalid_url');
    expect(result.entries.every((entry) => entry.url.startsWith('https://'))).toBe(true);
  });

  it('extracts quality and country', () => {
    const result = parseM3u(PLAYLIST);
    const uz = result.entries.find((entry) => entry.tvgId === 'uz24');
    expect(uz).toBeDefined();
    expect(uz?.country).toBe('UZ');
    expect(uz?.quality).toBe('HD');
    expect(uz?.baseName).toBe('Ozbekiston 24');
  });
});

describe('import preview', () => {
  it('summarizes totals and removes duplicates', () => {
    const preview = buildImportPreview(PLAYLIST);
    expect(preview.totals.duplicates).toBe(1);
    expect(preview.totals.rejectedAdult).toBe(2);
    expect(preview.totals.uzbek).toBe(1);
    expect(preview.channels.length).toBe(preview.totals.channels);
  });

  it('never exposes a raw stream url', () => {
    const preview = buildImportPreview(PLAYLIST);
    const serialized = JSON.stringify(preview);
    expect(serialized).not.toContain('/uz24/index.m3u8');
    expect(serialized).toContain('redacted');
  });

  it('warns when the playlist header is missing', () => {
    const preview = buildImportPreview('#EXTINF:-1,Test\nhttps://demo.example.com/a.m3u8');
    expect(preview.warnings.length).toBeGreaterThan(0);
  });
});
