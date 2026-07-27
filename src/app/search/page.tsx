import type { Metadata } from 'next';
import { Search } from 'lucide-react';
import { ChannelCard } from '@/components/ChannelCard';
import { EmptyState } from '@/components/StatusPanel';
import { searchChannels } from '@/lib/channel';
import { getChannels, getScheduled } from '@/server/catalog';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Search',
  description: 'Find channels, categories and countries with Cyrillic and Latin tolerant search.',
  alternates: { canonical: '/search' },
};

export default function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = (searchParams.q ?? '').slice(0, 120);
  const results = query.trim().length > 0 ? getScheduled(searchChannels(getChannels(), query, 48)) : [];

  return (
    <div className="container">
      <header className="page-head">
        <h1 className="page-title">Search</h1>
        <p className="page-sub">
          Apostrophes, Cyrillic and Latin spellings are normalized, so Oʻzbekiston and Узбекистан both match.
        </p>
      </header>

      <form action="/search" method="get" className="toolbar" style={{ marginTop: 18 }} role="search">
        <label className="visually-hidden" htmlFor="search-field">
          Search channels
        </label>
        <input id="search-field" name="q" defaultValue={query} className="field" placeholder="Channel, category or country" style={{ maxWidth: 420 }} />
        <button type="submit" className="btn btn-primary btn-sm">
          <Search size={15} aria-hidden="true" />
          <span>Search</span>
        </button>
      </form>

      {query.trim().length === 0 ? (
        <EmptyState title="Start typing to search" description="Search across channels, categories and countries. Press Ctrl and K anywhere to open the quick overlay." />
      ) : results.length === 0 ? (
        <EmptyState title={`Nothing found for ${query}`} description="Try a shorter query, remove a filter word, or browse the live catalog instead." />
      ) : (
        <>
          <p className="result-count" role="status">
            {results.length} results for {query}
          </p>
          <div className="channel-grid" style={{ marginTop: 14 }}>
            {results.map((item) => (
              <ChannelCard key={item.channel.id} item={item} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
