import { defaultFilters, filterChannels } from '@/lib/channel';
import { withSchedule } from '@/lib/epg';
import type { CatalogFilters, Channel, ChannelWithSchedule } from '@/lib/types';
import { allChannels } from './store';

export function getChannels(): Channel[] {
  return allChannels();
}

export function getChannelBySlug(slug: string): Channel | null {
  return allChannels().find((channel) => channel.slug === slug) ?? null;
}

export function getChannelById(id: string): Channel | null {
  return allChannels().find((channel) => channel.id === id) ?? null;
}

export function getFilteredChannels(partial: Partial<CatalogFilters>): Channel[] {
  const filters: CatalogFilters = { ...defaultFilters, ...partial };
  return filterChannels(allChannels(), filters);
}

export function getScheduled(channels: Channel[], at = new Date()): ChannelWithSchedule[] {
  return channels.map((channel) => withSchedule(channel, at));
}

export function getFacets(): { countries: string[]; languages: string[] } {
  const countries = new Set<string>();
  const languages = new Set<string>();
  for (const channel of allChannels()) {
    countries.add(channel.country);
    for (const language of channel.languages) languages.add(language);
  }
  return { countries: Array.from(countries).sort(), languages: Array.from(languages).sort() };
}

export function getRelated(channel: Channel, limit = 6): Channel[] {
  return allChannels()
    .filter((item) => item.id !== channel.id && item.state === 'published')
    .sort((a, b) => {
      const scoreA = (a.category === channel.category ? 2 : 0) + (a.country === channel.country ? 1 : 0);
      const scoreB = (b.category === channel.category ? 2 : 0) + (b.country === channel.country ? 1 : 0);
      return scoreB - scoreA || b.popularity - a.popularity;
    })
    .slice(0, limit);
}
