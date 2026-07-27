import { monogramOf, slugify } from '@/lib/channel';
import type { CategoryId, Channel, ChannelQuality } from '@/lib/types';
import type { ChannelVariantPreview } from '@/lib/m3u';

const CATEGORY_HINTS: { pattern: RegExp; category: CategoryId }[] = [
  { pattern: /news|\u043d\u043e\u0432\u043e\u0441\u0442|axborot/i, category: 'news' },
  { pattern: /sport|\u0441\u043f\u043e\u0440\u0442/i, category: 'sport' },
  { pattern: /kino|movie|film|\u0444\u0438\u043b\u044c\u043c/i, category: 'movies' },
  { pattern: /kids|bola|\u0434\u0435\u0442\u0441\u043a|cartoon/i, category: 'kids' },
  { pattern: /music|musiq|\u043c\u0443\u0437\u044b\u043a/i, category: 'music' },
  { pattern: /doc|\u043f\u043e\u0437\u043d\u0430\u0432|nature/i, category: 'documentary' },
  { pattern: /edu|ta'?lim|\u043e\u0431\u0440\u0430\u0437\u043e\u0432/i, category: 'education' },
  { pattern: /region|viloyat|\u0440\u0435\u0433\u0438\u043e\u043d/i, category: 'regional' },
];

function detectCategory(group: string, name: string): CategoryId {
  const haystack = `${group} ${name}`;
  for (const hint of CATEGORY_HINTS) {
    if (hint.pattern.test(haystack)) return hint.category;
  }
  return 'general';
}

function bestQuality(qualities: ChannelQuality[]): ChannelQuality {
  if (qualities.includes('UHD')) return 'UHD';
  if (qualities.includes('FHD')) return 'FHD';
  if (qualities.includes('HD')) return 'HD';
  return 'SD';
}

/**
 * Converts an import preview row into a catalog channel. Stream URLs are never
 * copied into the catalog record: playback is resolved server side per session.
 */
export function previewToChannel(preview: ChannelVariantPreview, index: number): Channel {
  const slug = slugify(`${preview.baseName}-${preview.country}`);
  const qualities = Array.from(new Set(preview.variants.map((variant) => variant.quality)));
  const timeshift = Array.from(new Set(preview.variants.map((variant) => variant.timeshift)));
  return {
    id: `imp_${slug}`,
    slug,
    name: preview.baseName,
    baseName: preview.baseName,
    monogram: monogramOf(preview.baseName),
    accent: 'linear-gradient(145deg,#202a1c,#0c1109)',
    tagline: preview.group.length > 0 ? preview.group : 'Imported channel',
    description: `${preview.baseName} was imported from an authorized playlist. Playback stays disabled until rights are confirmed for this provider.`,
    category: detectCategory(preview.group, preview.baseName),
    country: preview.country,
    languages: preview.country === 'UZ' ? ['uz'] : ['en'],
    quality: bestQuality(qualities),
    qualities,
    timeshift,
    status: 'unknown',
    state: 'draft',
    featured: false,
    provider: 'Imported provider',
    rights: 'pending',
    epgId: preview.tvgId.length > 0 ? preview.tvgId : `${slug}.imported`,
    sourceKey: 'demo-primary',
    latencyMs: 0,
    popularity: Math.max(1, 40 - index),
  };
}
