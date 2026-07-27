import type { Channel } from '@/lib/demo';

export type ChannelFilters = { country?: string; category?: string; language?: string; quality?: string; online?: boolean; query?: string };

export function normalizeSearch(value: string): string {
  return value.normalize('NFKC').toLocaleLowerCase('uz-UZ').replace(/[ʻʼ‘’`']/g, "'").replace(/\s+/g, ' ').trim();
}

export function filterChannels(channels: Channel[], filters: ChannelFilters): Channel[] {
  const query = filters.query ? normalizeSearch(filters.query) : '';
  return channels.filter((channel) => {
    const haystack = normalizeSearch(`${channel.name} ${channel.program} ${channel.category} ${channel.country} ${channel.language}`);
    return (!query || haystack.includes(query)) && (!filters.country || channel.country === filters.country) && (!filters.category || channel.category === filters.category) && (!filters.language || channel.language === filters.language) && (!filters.quality || channel.quality === filters.quality) && (filters.online === undefined || channel.live === filters.online);
  });
}
