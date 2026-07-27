import type { Metadata } from 'next';
import { ChannelCatalog } from '@/components/ChannelCatalog';
import { getChannels, getFacets, getScheduled } from '@/server/catalog';
import type { CategoryId } from '@/lib/types';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Live TV catalog',
  description: 'Browse every licensed live channel by category, country, language and quality.',
  alternates: { canonical: '/live' },
};

const CATEGORIES = [
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

export default function LivePage({ searchParams }: { searchParams: { category?: string } }) {
  const requested = searchParams.category ?? 'all';
  const initialCategory = (CATEGORIES.includes(requested) ? requested : 'all') as CategoryId | 'all';

  const published = getChannels().filter((channel) => channel.state === 'published');
  const items = getScheduled(published);
  const facets = getFacets();

  return (
    <div className="container">
      <header className="page-head">
        <h1 className="page-title">Live TV</h1>
        <p className="page-sub">
          {published.length} channels are published from licensed and demo providers. Filters apply instantly and respect
          reduced motion settings.
        </p>
      </header>

      <ChannelCatalog items={items} countries={facets.countries} languages={facets.languages} initialCategory={initialCategory} />
    </div>
  );
}
