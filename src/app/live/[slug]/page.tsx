import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { TomoshaPlayer } from '@/components/TomoshaPlayer';
import { ChannelRail } from '@/components/LiveCatalog';
import { Notice } from '@/components/StatusPanel';
import { MonogramTile, ProgressBar, QualityBadge, StatusBadge } from '@/components/ui/primitives';
import { formatTashkentTime, withSchedule } from '@/lib/epg';
import { categoryLabels, countryLabels, languageLabels } from '@/lib/demo';
import { getChannelBySlug, getChannels, getRelated, getScheduled } from '@/server/catalog';

export const revalidate = 60;

export function generateStaticParams() {
  return getChannels()
    .filter((channel) => channel.state === 'published')
    .map((channel) => ({ slug: channel.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const channel = getChannelBySlug(params.slug);
  if (!channel) return { title: 'Channel not found' };
  return {
    title: channel.name,
    description: `${channel.tagline}. Watch ${channel.name} live with the unified TOMOSHA TV guide.`,
    alternates: { canonical: `/live/${channel.slug}` },
    openGraph: { title: channel.name, description: channel.tagline, type: 'video.other' },
  };
}

export default function ChannelPage({ params }: { params: { slug: string } }) {
  const channel = getChannelBySlug(params.slug);
  if (!channel) notFound();

  const schedule = withSchedule(channel, new Date(), 6);
  const related = getScheduled(getRelated(channel, 10));

  return (
    <div className="container">
      <div className="detail">
        <div>
          <TomoshaPlayer channel={channel} />

          <div className="detail-head" style={{ marginTop: 18 }}>
            <MonogramTile monogram={channel.monogram} accent={channel.accent} size="lg" />
            <div style={{ display: 'grid', gap: 6 }}>
              <h1 style={{ fontSize: 'clamp(22px, 3vw, 30px)' }}>{channel.name}</h1>
              <div className="pill-row">
                <StatusBadge status={channel.status} />
                <QualityBadge quality={channel.quality} />
                <span className="badge">{categoryLabels[channel.category]}</span>
                <span className="badge">{countryLabels[channel.country] ?? channel.country}</span>
              </div>
            </div>
          </div>

          <p className="page-sub" style={{ marginTop: 14 }}>
            {channel.description}
          </p>

          <div style={{ marginTop: 16 }}>
            <Notice tone="warning">
              Rights status: {channel.rights.replace('_', ' ')}. Real provider streams stay disabled until credential
              rotation and a signed rights record are in place.
            </Notice>
          </div>
        </div>

        <aside className="detail-aside">
          <div className="panel">
            <h2 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              On now
            </h2>
            {schedule.now ? (
              <div style={{ display: 'grid', gap: 8 }}>
                <strong>{schedule.now.title}</strong>
                <span className="mono" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {formatTashkentTime(schedule.now.startsAt)} - {formatTashkentTime(schedule.now.endsAt)}
                </span>
                <ProgressBar value={schedule.progress} />
                <p className="program-desc">{schedule.now.description}</p>
              </div>
            ) : (
              <p className="program-desc">No schedule is mapped for this channel yet.</p>
            )}
          </div>

          <div className="panel">
            <h2 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Coming up
            </h2>
            <div className="program-list">
              {schedule.next.map((program) => (
                <div className="program-row" key={program.id}>
                  <span className="program-time mono">{formatTashkentTime(program.startsAt)}</span>
                  <span style={{ display: 'grid', gap: 2 }}>
                    <span className="program-title">{program.title}</span>
                    <span className="program-desc">{program.genre}</span>
                  </span>
                </div>
              ))}
            </div>
            <Link href="/guide" className="section-link" style={{ display: 'inline-block', marginTop: 12 }}>
              Open full guide
            </Link>
          </div>

          <div className="panel">
            <h2 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Channel details
            </h2>
            <div className="meta-list">
              <div className="meta-row">
                <span>Provider</span>
                <strong>{channel.provider}</strong>
              </div>
              <div className="meta-row">
                <span>Languages</span>
                <strong>{channel.languages.map((language) => languageLabels[language] ?? language).join(', ')}</strong>
              </div>
              <div className="meta-row">
                <span>Qualities</span>
                <strong>{channel.qualities.join(', ')}</strong>
              </div>
              <div className="meta-row">
                <span>Timeshift</span>
                <strong>{channel.timeshift.join(', ')}</strong>
              </div>
              <div className="meta-row">
                <span>Average latency</span>
                <strong className="mono">{channel.latencyMs} ms</strong>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <ChannelRail title="Similar channels" subtitle="Based on category and country" items={related} href="/live" />
    </div>
  );
}
