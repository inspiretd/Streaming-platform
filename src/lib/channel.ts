import type { CatalogFilters, Channel, ChannelQuality, StreamStatus, TimeshiftVariant } from './types';

const APOSTROPHES = /[\u2018\u2019\u02BB\u02BC\u2032\u0060\u00B4']/g;

const CYRILLIC_MAP: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', ғ: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'j', з: 'z',
  и: 'i', й: 'y', к: 'k', қ: 'q', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ў: 'o', ф: 'f', х: 'h', ҳ: 'h', ц: 'ts', ч: 'ch', ш: 'sh',
  щ: 'sh', ъ: '', ы: 'i', ь: '', э: 'e', ю: yu(), я: 'ya',
};

function yu(): string {
  return 'yu';
}

export function normalizeApostrophes(value: string): string {
  return value.replace(APOSTROPHES, "'");
}

export function toLatin(value: string): string {
  let out = '';
  for (const char of value) {
    const mapped = CYRILLIC_MAP[char];
    out += mapped === undefined ? char : mapped;
  }
  return out;
}

export function normalizeSearchValue(value: string): string {
  return toLatin(normalizeApostrophes(value).toLowerCase())
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function slugify(value: string): string {
  const base = normalizeSearchValue(value).replace(/\s+/g, '-');
  return base.length > 0 ? base : 'channel';
}

export function monogramOf(value: string): string {
  const words = normalizeApostrophes(value)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length > 0);
  if (words.length === 0) return 'TV';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

const QUALITY_PATTERN = /\s*[([]?\b(UHD|4K|FHD|FULLHD|HD|SD)\b[)\]]?\s*$/i;
const TIMESHIFT_PATTERN = /\s*[([]?\s*(orig|original|\+2|\+4|\+7)\s*[)\]]?\s*$/i;

export function extractQuality(rawName: string): { baseName: string; quality: ChannelQuality } {
  let name = normalizeApostrophes(rawName).trim();
  let quality: ChannelQuality = 'SD';
  let found = true;
  while (found) {
    found = false;
    const match = QUALITY_PATTERN.exec(name);
    if (match) {
      const token = match[1].toUpperCase();
      if (token === 'UHD' || token === '4K') quality = 'UHD';
      else if (token === 'FHD' || token === 'FULLHD') quality = quality === 'UHD' ? quality : 'FHD';
      else if (token === 'HD') quality = quality === 'SD' ? 'HD' : quality;
      name = name.slice(0, match.index ?? 0).trim();
      found = true;
    }
  }
  return { baseName: name.length > 0 ? name : normalizeApostrophes(rawName).trim(), quality };
}

export function extractTimeshift(rawName: string): { baseName: string; timeshift: TimeshiftVariant } {
  const name = normalizeApostrophes(rawName).trim();
  const match = TIMESHIFT_PATTERN.exec(name);
  if (!match) return { baseName: name, timeshift: 'orig' };
  const token = match[1].toLowerCase();
  const timeshift: TimeshiftVariant = token === '+2' || token === '+4' || token === '+7' ? token : 'orig';
  const baseName = name.slice(0, match.index ?? 0).trim();
  return { baseName: baseName.length > 0 ? baseName : name, timeshift };
}

function withinOneEdit(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i += 1;
      j += 1;
      continue;
    }
    edits += 1;
    if (edits > 1) return false;
    if (a.length > b.length) i += 1;
    else if (a.length < b.length) j += 1;
    else {
      i += 1;
      j += 1;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

export function scoreChannel(channel: Channel, rawQuery: string): number {
  const query = normalizeSearchValue(rawQuery);
  if (query.length === 0) return 0;
  const name = normalizeSearchValue(channel.name);
  const base = normalizeSearchValue(channel.baseName);
  const haystack = [name, base, channel.category, channel.country, normalizeSearchValue(channel.tagline)].join(' ');
  if (name === query) return 100;
  if (name.startsWith(query)) return 82;
  if (base.startsWith(query)) return 74;
  if (haystack.includes(query)) return 56;
  const tokens = query.split(' ').filter((token) => token.length > 0);
  const hits = tokens.filter((token) => haystack.includes(token)).length;
  if (tokens.length > 0 && hits === tokens.length) return 40;
  if (hits > 0) return 18 + hits;
  if (tokens.length === 1) {
    const words = haystack.split(' ');
    if (words.some((word) => withinOneEdit(word, tokens[0]))) return 12;
  }
  return 0;
}

export function searchChannels(channels: Channel[], query: string, limit = 40): Channel[] {
  if (normalizeSearchValue(query).length === 0) return [];
  return channels
    .map((channel) => ({ channel, score: scoreChannel(channel, query) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.channel.popularity - a.channel.popularity)
    .slice(0, limit)
    .map((entry) => entry.channel);
}

export const defaultFilters: CatalogFilters = {
  query: '',
  category: 'all',
  country: 'all',
  language: 'all',
  quality: 'all',
  onlineOnly: false,
  withEpgOnly: false,
  sort: 'popular',
};

export function filterChannels(channels: Channel[], filters: CatalogFilters): Channel[] {
  const query = normalizeSearchValue(filters.query);
  const filtered = channels.filter((channel) => {
    if (channel.state !== 'published') return false;
    if (filters.category !== 'all' && channel.category !== filters.category) return false;
    if (filters.country !== 'all' && channel.country !== filters.country) return false;
    if (filters.language !== 'all' && !channel.languages.includes(filters.language)) return false;
    if (filters.quality !== 'all' && channel.quality !== filters.quality) return false;
    if (filters.onlineOnly && channel.status !== 'online') return false;
    if (filters.withEpgOnly && channel.epgId.length === 0) return false;
    if (query.length > 0 && scoreChannel(channel, filters.query) === 0) return false;
    return true;
  });

  if (query.length > 0) {
    return filtered.sort((a, b) => scoreChannel(b, filters.query) - scoreChannel(a, filters.query));
  }
  if (filters.sort === 'az') return filtered.sort((a, b) => a.name.localeCompare(b.name));
  if (filters.sort === 'za') return filtered.sort((a, b) => b.name.localeCompare(a.name));
  return filtered.sort((a, b) => b.popularity - a.popularity || a.name.localeCompare(b.name));
}

export const statusLabels: Record<StreamStatus, string> = {
  online: 'Online',
  degraded: 'Degraded',
  offline: 'Offline',
  auth_required: 'Auth required',
  geo_blocked: 'Geo blocked',
  unsupported: 'Unsupported',
  unknown: 'Unknown',
};

export function isPlayable(channel: Channel): boolean {
  return channel.state === 'published' && (channel.status === 'online' || channel.status === 'degraded');
}
