'use client';

import { useEffect, useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import type { CatalogFilters, CategoryId, ChannelQuality, ChannelWithSchedule } from '@/lib/types';
import { defaultFilters, filterChannels } from '@/lib/channel';
import { categoryLabels, countryLabels, languageLabels } from '@/lib/demo';
import { ChannelCard } from '@/components/ChannelCard';
import { Chip, Switch } from '@/components/ui/controls';
import { EmptyState } from '@/components/StatusPanel';

const PAGE_SIZE = 24;

const CATEGORY_IDS: (CategoryId | 'all')[] = [
  'all',
  'general',
  'news',
  'sport',
  'movies',
  'kids',
  'music',
  'education',
  'regional',
  'documentary',
];

const QUALITIES: (ChannelQuality | 'all')[] = ['all', 'SD', 'HD', 'FHD', 'UHD'];

export function ChannelCatalog({
  items,
  countries,
  languages,
  initialCategory = 'all',
}: {
  items: ChannelWithSchedule[];
  countries: string[];
  languages: string[];
  initialCategory?: CategoryId | 'all';
}) {
  const [filters, setFilters] = useState<CatalogFilters>({ ...defaultFilters, category: initialCategory });
  const [visible, setVisible] = useState(PAGE_SIZE);

  const results = useMemo(() => {
    const channels = filterChannels(
      items.map((item) => item.channel),
      filters,
    );
    const order = new Map(channels.map((channel, index) => [channel.id, index]));
    return items
      .filter((item) => order.has(item.channel.id))
      .sort((a, b) => (order.get(a.channel.id) ?? 0) - (order.get(b.channel.id) ?? 0));
  }, [items, filters]);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [filters]);

  const patch = (next: Partial<CatalogFilters>) => setFilters((current) => ({ ...current, ...next }));

  return (
    <div className="catalog">
      <aside className="filter-rail" aria-label="Catalog filters">
        <div className="filter-group">
          <span className="filter-label">
            <SlidersHorizontal size={12} aria-hidden="true" /> Search
          </span>
          <input
            className="field"
            value={filters.query}
            onChange={(event) => patch({ query: event.target.value })}
            placeholder="Channel name"
            aria-label="Filter by channel name"
          />
        </div>

        <div className="filter-group">
          <span className="filter-label">Category</span>
          <div className="chip-row">
            {CATEGORY_IDS.map((category) => (
              <Chip key={category} active={filters.category === category} onClick={() => patch({ category })}>
                {category === 'all' ? 'All' : categoryLabels[category]}
              </Chip>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-label">Country</span>
          <div className="chip-row">
            <Chip active={filters.country === 'all'} onClick={() => patch({ country: 'all' })}>
              All
            </Chip>
            {countries.map((country) => (
              <Chip key={country} active={filters.country === country} onClick={() => patch({ country })}>
                {countryLabels[country] ?? country}
              </Chip>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-label">Language</span>
          <div className="chip-row">
            <Chip active={filters.language === 'all'} onClick={() => patch({ language: 'all' })}>
              All
            </Chip>
            {languages.map((language) => (
              <Chip key={language} active={filters.language === language} onClick={() => patch({ language })}>
                {languageLabels[language] ?? language}
              </Chip>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-label">Quality</span>
          <div className="chip-row">
            {QUALITIES.map((quality) => (
              <Chip key={quality} active={filters.quality === quality} onClick={() => patch({ quality })}>
                {quality === 'all' ? 'All' : quality}
              </Chip>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <Switch checked={filters.onlineOnly} onChange={(value) => patch({ onlineOnly: value })} label="Online only" />
          <Switch checked={filters.withEpgOnly} onChange={(value) => patch({ withEpgOnly: value })} label="With TV guide" />
        </div>

        <div className="filter-group">
          <span className="filter-label">Sort</span>
          <div className="chip-row">
            <Chip active={filters.sort === 'popular'} onClick={() => patch({ sort: 'popular' })}>
              Popular
            </Chip>
            <Chip active={filters.sort === 'az'} onClick={() => patch({ sort: 'az' })}>
              A to Z
            </Chip>
            <Chip active={filters.sort === 'za'} onClick={() => patch({ sort: 'za' })}>
              Z to A
            </Chip>
          </div>
        </div>

        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setFilters(defaultFilters)}>
          Reset filters
        </button>
      </aside>

      <section aria-label="Channel results">
        <div className="toolbar">
          <p className="result-count" role="status" aria-live="polite">
            {results.length} channels match your filters
          </p>
        </div>

        {results.length === 0 ? (
          <EmptyState
            title="No channels match those filters"
            description="Try clearing a filter, switching country, or turning off the online only toggle."
            action={
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setFilters(defaultFilters)}>
                Reset filters
              </button>
            }
          />
        ) : (
          <>
            <div className="channel-grid">
              {results.slice(0, visible).map((item) => (
                <ChannelCard key={item.channel.id} item={item} />
              ))}
            </div>
            {visible < results.length ? (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 22 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setVisible((current) => current + PAGE_SIZE)}>
                  Load more channels
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
