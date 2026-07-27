import Link from 'next/link';
import { ArrowRight, CalendarDays, Heart, Languages, Zap } from 'lucide-react';
import { HomeHero } from '@/components/home/HomeHero';
import { ChannelRail } from '@/components/LiveCatalog';
import { EmptyState } from '@/components/StatusPanel';
import { categoryLabels } from '@/lib/demo';
import { formatTashkentTime } from '@/lib/epg';
import { getChannels, getScheduled } from '@/server/catalog';
import type { CategoryId } from '@/lib/types';

export const revalidate = 60;

const BENEFITS = [
  { icon: Zap, title: 'Fast channel switching', text: 'Channels open in two taps with a warm player and cached metadata.' },
  { icon: CalendarDays, title: 'One TV guide', text: 'Every provider is normalized into a single Tashkent time schedule.' },
  { icon: Heart, title: 'Favorites that follow you', text: 'Save channels and pick up the last one you watched instantly.' },
  { icon: Languages, title: 'Three languages', text: 'Uzbek, Russian and English interface with tolerant search.' },
];

const CATEGORY_ORDER: CategoryId[] = ['general', 'news', 'sport', 'movies', 'kids', 'music', 'education', 'regional'];

export default function HomePage() {
  const at = new Date();
  const published = getChannels().filter((channel) => channel.state === 'published');
  const scheduled = getScheduled(published, at);

  const featured = scheduled.find((entry) => entry.channel.featured) ?? scheduled[0];
  const onAir = scheduled.filter((entry) => entry.channel.status === 'online').slice(0, 14);
  const uzbek = scheduled.filter((entry) => entry.channel.country === 'UZ').slice(0, 14);
  const guidePreview = scheduled.slice(0, 5);

  if (!featured) {
    return (
      <div className="container">
        <EmptyState
          title="No published channels yet"
          description="Once a licensed provider is connected and channels are published, the home page fills up automatically."
        />
      </div>
    );
  }

  return (
    <div className="container">
      <HomeHero featured={featured} />

      <ChannelRail title="On air now" subtitle="Live right this minute across every provider" items={onAir} href="/live" />
      <ChannelRail title="Uzbekistan channels" subtitle="National and regional broadcasters" items={uzbek} href="/live" />

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">Browse by category</h2>
            <p className="section-sub">Jump straight into the genre you are in the mood for</p>
          </div>
        </div>
        <div className="grid-2">
          {CATEGORY_ORDER.map((category) => (
            <Link key={category} href={`/live?category=${category}`} className="feature-card">
              <span className="feature-title">{categoryLabels[category]}</span>
              <span className="feature-text">
                {published.filter((channel) => channel.category === category).length} channels
              </span>
              <span className="section-link">
                Open <ArrowRight size={14} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">Tonight on TOMOSHA</h2>
            <p className="section-sub">A preview of the unified schedule in Asia/Tashkent time</p>
          </div>
          <Link href="/guide" className="section-link">
            Full guide
          </Link>
        </div>
        <div className="panel program-list">
          {guidePreview.map((entry) => (
            <div className="program-row" key={entry.channel.id} data-now="true">
              <span className="program-time mono">{entry.now ? formatTashkentTime(entry.now.startsAt) : '--:--'}</span>
              <span style={{ display: 'grid', gap: 2 }}>
                <span className="program-title">{entry.now ? entry.now.title : 'Schedule unavailable'}</span>
                <span className="program-desc">{entry.channel.name}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">Why TOMOSHA</h2>
            <p className="section-sub">Built for slow networks, small screens and big living rooms</p>
          </div>
        </div>
        <div className="grid-2">
          {BENEFITS.map((benefit) => (
            <div className="feature-card" key={benefit.title}>
              <benefit.icon size={18} aria-hidden="true" color="var(--accent)" />
              <span className="feature-title">{benefit.title}</span>
              <span className="feature-text">{benefit.text}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
