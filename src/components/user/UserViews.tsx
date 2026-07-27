'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { ChannelWithSchedule } from '@/lib/types';
import { ChannelCard } from '@/components/ChannelCard';
import { CardGridSkeleton, EmptyState } from '@/components/StatusPanel';
import { Switch } from '@/components/ui/controls';
import { useToast } from '@/components/ui/Toast';
import { useFavorites, usePlayerSettings, useWatchHistory } from '@/hooks/useLocalCollection';

export function FavoritesView({ items }: { items: ChannelWithSchedule[] }) {
  const { slugs, ready, clear } = useFavorites();
  const saved = useMemo(() => items.filter((item) => slugs.includes(item.channel.slug)), [items, slugs]);

  if (!ready) return <CardGridSkeleton count={6} />;

  if (saved.length === 0) {
    return (
      <EmptyState
        title="No favorites yet"
        description="Tap the heart on any channel card to pin it here. Favorites stay on this device until you sign in."
        action={
          <Link href="/live" className="btn btn-primary btn-sm">
            Browse channels
          </Link>
        }
      />
    );
  }

  return (
    <>
      <div className="toolbar">
        <p className="result-count">{saved.length} saved channels</p>
        <button type="button" className="btn btn-ghost btn-sm" onClick={clear}>
          Clear all
        </button>
      </div>
      <div className="channel-grid">
        {saved.map((item) => (
          <ChannelCard key={item.channel.id} item={item} />
        ))}
      </div>
    </>
  );
}

export function HistoryView({ items }: { items: ChannelWithSchedule[] }) {
  const { entries, ready, remove, clear } = useWatchHistory();

  const watched = useMemo(
    () =>
      entries
        .map((entry) => ({ entry, item: items.find((candidate) => candidate.channel.slug === entry.slug) }))
        .filter((row): row is { entry: { slug: string; at: string }; item: ChannelWithSchedule } => row.item !== undefined),
    [entries, items],
  );

  if (!ready) return <CardGridSkeleton count={4} />;

  if (watched.length === 0) {
    return (
      <EmptyState
        title="Nothing watched yet"
        description="Channels you open appear here so you can jump back in. History is stored on this device only."
        action={
          <Link href="/live" className="btn btn-primary btn-sm">
            Start watching
          </Link>
        }
      />
    );
  }

  return (
    <>
      <div className="toolbar">
        <p className="result-count">{watched.length} channels in history</p>
        <button type="button" className="btn btn-ghost btn-sm" onClick={clear}>
          Clear history
        </button>
      </div>

      <h2 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
        Continue watching
      </h2>
      <div className="channel-grid">
        {watched.slice(0, 6).map((row) => (
          <ChannelCard key={row.item.channel.id} item={row.item} />
        ))}
      </div>

      <h2 className="section-title" style={{ fontSize: 18, margin: '28px 0 12px' }}>
        Full history
      </h2>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Channel</th>
              <th scope="col">Last watched</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {watched.map((row) => (
              <tr key={row.entry.slug}>
                <td>
                  <Link href={`/live/${row.item.channel.slug}`}>{row.item.channel.name}</Link>
                </td>
                <td className="mono">{row.entry.at.slice(0, 16).replace('T', ' ')}</td>
                <td>
                  <button type="button" className="btn btn-quiet" onClick={() => remove(row.entry.slug)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function ProfileView() {
  const { settings, ready, update } = usePlayerSettings();
  const { clear: clearHistory } = useWatchHistory();
  const { clear: clearFavorites } = useFavorites();
  const { push } = useToast();

  if (!ready) {
    return <div className="panel">Loading your preferences</div>;
  }

  return (
    <div className="grid-2" style={{ marginTop: 24, alignItems: 'start' }}>
      <div className="panel" style={{ display: 'grid', gap: 14 }}>
        <h2 className="section-title" style={{ fontSize: 18 }}>
          Playback
        </h2>
        <Switch checked={settings.autoplay} onChange={(value) => update({ autoplay: value })} label="Autoplay on channel open" />
        <Switch checked={settings.reducedData} onChange={(value) => update({ reducedData: value })} label="Reduced data mode" />
        <p className="feature-text">Reduced data caps the player quality to the visible player size and lowers buffer size.</p>
      </div>

      <div className="panel" style={{ display: 'grid', gap: 14 }}>
        <h2 className="section-title" style={{ fontSize: 18 }}>
          Language
        </h2>
        <div className="chip-row">
          {(['uz', 'ru', 'en'] as const).map((locale) => (
            <button
              key={locale}
              type="button"
              className="chip"
              data-active={settings.locale === locale}
              onClick={() => update({ locale })}
            >
              {locale.toUpperCase()}
            </button>
          ))}
        </div>
        <p className="feature-text">Interface copy ships in Uzbek, Russian and English. Uzbek is the platform default.</p>
      </div>

      <div className="panel" style={{ display: 'grid', gap: 14 }}>
        <h2 className="section-title" style={{ fontSize: 18 }}>
          Privacy
        </h2>
        <p className="feature-text">
          Favorites and history are stored on this device only. Nothing is sent to a server until you sign in and consent to
          syncing.
        </p>
        <div className="pill-row">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              clearHistory();
              push({ tone: 'success', title: 'History cleared' });
            }}
          >
            Clear history
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => {
              clearHistory();
              clearFavorites();
              push({ tone: 'success', title: 'Local account data deleted' });
            }}
          >
            Delete local data
          </button>
        </div>
      </div>
    </div>
  );
}
