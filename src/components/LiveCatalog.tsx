'use client';
import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import type { Channel } from '@/lib/demo';
import { filterChannels } from '@/lib/channel';
import { ChannelCard } from './ChannelCard';
import { StatusPanel } from './StatusPanel';

export function LiveCatalog({ channels }: { channels: Channel[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [country, setCountry] = useState('');
  const [online, setOnline] = useState(false);
  const results = useMemo(() => filterChannels(channels, { query, category, country, online: online ? true : undefined }), [channels, query, category, country, online]);
  return <section className="catalog-page"><div className="catalog-toolbar"><div><p className="eyebrow">Live television</p><h1>Find your signal.</h1><p className="hero-copy">Browse safe demo fixtures by country, category, and live state.</p></div><div className="catalog-controls"><label className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search channels" aria-label="Search channels" /></label><select value={country} onChange={(event) => setCountry(event.target.value)} aria-label="Country"><option value="">All countries</option><option value="UZ">Uzbekistan</option><option value="INT">International</option></select><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Category"><option value="">All categories</option>{Array.from(new Set(channels.map((channel) => channel.category))).map((item) => <option key={item} value={item}>{item}</option>)}</select><button className={`filter-toggle ${online ? 'selected' : ''}`} onClick={() => setOnline((value) => !value)}><SlidersHorizontal size={15} /> Online only</button></div></div>{results.length ? <div className="channel-grid">{results.map((channel) => <ChannelCard key={channel.id} channel={channel} />)}</div> : <StatusPanel kind="empty" title="No channels match" detail="Try a broader search or clear one of the filters." />}</section>;
}
