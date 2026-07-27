import { describe, expect, it } from 'vitest';
import {
  defaultFilters,
  extractQuality,
  extractTimeshift,
  filterChannels,
  monogramOf,
  normalizeApostrophes,
  normalizeSearchValue,
  scoreChannel,
  searchChannels,
  slugify,
  toLatin,
} from '@/lib/channel';
import { demoChannels } from '@/lib/demo';

describe('normalization', () => {
  it('unifies every apostrophe variant', () => {
    expect(normalizeApostrophes('O\u02bbzbekiston')).toBe("O'zbekiston");
    expect(normalizeApostrophes('O\u2019zbekiston')).toBe("O'zbekiston");
  });

  it('transliterates cyrillic to latin', () => {
    expect(toLatin('\u0423\u0437\u0431\u0435\u043a')).toBe('Uzbek'.toLowerCase().replace('u', 'u'));
  });

  it('produces tolerant search values', () => {
    expect(normalizeSearchValue('O\u02bbzbekiston 24 HD')).toBe('ozbekiston 24 hd');
    expect(normalizeSearchValue('\u0443\u0437\u0431\u0435\u043a')).toBe('uzbek');
  });

  it('slugifies uzbek names', () => {
    expect(slugify('Madaniyat va Ma\u02bcrifat HD')).toBe('madaniyat-va-marifat-hd');
  });

  it('builds monograms', () => {
    expect(monogramOf('Yoshlar')).toBe('YO');
    expect(monogramOf('Global News')).toBe('GN');
  });
});

describe('variant extraction', () => {
  it('splits quality suffixes', () => {
    expect(extractQuality('Sport UZ FHD')).toEqual({ baseName: 'Sport UZ', quality: 'FHD' });
    expect(extractQuality('Arena 4K')).toEqual({ baseName: 'Arena', quality: 'UHD' });
    expect(extractQuality('Mahalla TV')).toEqual({ baseName: 'Mahalla TV', quality: 'SD' });
  });

  it('splits timeshift variants', () => {
    expect(extractTimeshift('Kino +2')).toEqual({ baseName: 'Kino', timeshift: '+2' });
    expect(extractTimeshift('Kino orig')).toEqual({ baseName: 'Kino', timeshift: 'orig' });
    expect(extractTimeshift('Kino')).toEqual({ baseName: 'Kino', timeshift: 'orig' });
  });
});

describe('search ranking', () => {
  it('ranks exact matches highest', () => {
    const channel = demoChannels[0];
    expect(scoreChannel(channel, channel.name)).toBe(100);
  });

  it('matches cyrillic queries against latin names', () => {
    const results = searchChannels(demoChannels, '\u0441\u043f\u043e\u0440\u0442');
    expect(results.length).toBeGreaterThan(0);
  });

  it('returns nothing for an empty query', () => {
    expect(searchChannels(demoChannels, '   ')).toHaveLength(0);
  });

  it('tolerates a single typo', () => {
    expect(scoreChannel(demoChannels[4], 'bolajn')).toBeGreaterThan(0);
  });
});

describe('catalog filters', () => {
  it('keeps only published channels', () => {
    const results = filterChannels(demoChannels, defaultFilters);
    expect(results.every((channel) => channel.state === 'published')).toBe(true);
  });

  it('filters by country and online state', () => {
    const results = filterChannels(demoChannels, { ...defaultFilters, country: 'UZ', onlineOnly: true });
    expect(results.every((channel) => channel.country === 'UZ' && channel.status === 'online')).toBe(true);
  });

  it('sorts alphabetically on demand', () => {
    const results = filterChannels(demoChannels, { ...defaultFilters, sort: 'az' });
    const names = results.map((channel) => channel.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });
});
