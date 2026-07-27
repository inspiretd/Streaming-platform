import { demoChannels } from './demo';
import type { Channel } from './types';

const cyrillic: Record<string, string> = {
  \u0430: 'a', \u0431: 'b', \u0432: 'v', \u0433: 'g', \u0434: 'd', \u0435: 'e', \u0451: 'e', \u0436: 'j', \u0437: 'z',
  \u0438: 'i', \u0439: 'y', \u043a: 'k', \u043b: 'l', \u043c: 'm', \u043d: 'n', \u043e: 'o', \u043f: 'p', \u0440: 'r',
  \u0441: 's', \u0442: 't', \u0443: 'u', \u0444: 'f', \u0445: 'h', \u0446: 'ts', \u0447: 'ch', \u0448: 'sh',
  \u0449: 'sh', \u044a: '', \u044b: 'i', \u044c: '', \u044d: 'e', \u044e: 'yu', \u044f: 'ya', \u049b: 'q',
  \u0493: 'g', \u04b3: 'h', \u045e: 'o',
};

export function normalizeSearch(value: string): string {
  const lowered = value.normalize('NFKC').toLowerCase().replace(/[\u02bb\u02bc\u2018\u2019`\u00b4']/g, "'");
  let output = '';
  for (const char of lowered) {
    output += cyrillic[char] ?? char;
  }
  return output.replace(/\s+/g, ' ').trim();
}

export function searchKey(value: string): string {
  return normalizeSearch(value).replace(/'/g, '');
}

export function isLive(channel: Channel): boolean {
  return channel.status === 'online' || channel.status === 'degraded';
}

export type ChannelFilters = {
  query?: string;
  category?: string;
  country?: string;
  language?: string;
  quality?: string;
  letter?: string;
  onlineOnly?: boolean;
};

export function matchesQuery(channel: Channel, query: string): boolean {
  if (!query) return true;
  const needle = searchKey(query);
  const haystack = searchKey(
    `${channel.name} ${channel.tagline} ${channel.category} ${channel.country} ${channel.language} ${channel.shortName}`,
  );
  return haystack.includes(needle);
}

export function scoreChannel(channel: Channel, query: string): number {
  if (!query) return channel.featured ? 2 : 1;
  const needle = searchKey(query);
  const name = searchKey(channel.name);
  if (name === needle) return 100;
  if (name.startsWith(needle)) return 80;
  if (name.includes(needle)) return 60;
  if (searchKey(channel.category).startsWith(needle)) return 40;
  return matchesQuery(channel, query) ? 20 : 0;
}

export function filterChannels(channels: Channel[], filters: ChannelFilters): Channel[] {
  const query = filters.query?.trim() ?? '';
  return channels.filter((channel) => {
    if (filters.category && filters.category !== 'All' && channel.category !== filters.category) return false;
    if (filters.country && filters.country !== 'All' && channel.country !== filters.country) return false;
    if (filters.language && filters.language !== 'All' && channel.language !== filters.language) return false;
    if (filters.quality && filters.quality !== 'All' && channel.quality !== filters.quality) return false;
    if (filters.onlineOnly && !isLive(channel)) return false;
    if (filters.letter && filters.letter !== 'All' && !channel.name.toUpperCase().startsWith(filters.letter)) return false;
    return matchesQuery(channel, query);
  });
}

export function sortChannels(channels: Channel[], query = ''): Channel[] {
  return [...channels].sort((a, b) => {
    const delta = scoreChannel(b, query) - scoreChannel(a, query);
    if (delta !== 0) return delta;
    return a.name.localeCompare(b.name);
  });
}

export function paginate<T>(items: T[], page: number, size: number): { items: T[]; page: number; pages: number; total: number } {
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / size));
  const safePage = Math.min(Math.max(1, page), pages);
  return { items: items.slice((safePage - 1) * size, safePage * size), page: safePage, pages, total };
}

export function quickSearch(query: string, limit = 8): Channel[] {
  if (!query.trim()) return demoChannels.filter((channel) => channel.featured).slice(0, limit);
  return sortChannels(filterChannels(demoChannels, { query }), query).slice(0, limit);
}

export function alphabet(channels: Channel[]): string[] {
  return Array.from(new Set(channels.map((channel) => channel.name.charAt(0).toUpperCase()))).sort();
}
