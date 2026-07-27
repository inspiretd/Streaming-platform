import type { Metadata } from 'next';
import { FavoritesView } from '@/components/user/UserViews';
import { getChannels, getScheduled } from '@/server/catalog';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Favorites',
  description: 'Your saved TOMOSHA channels, ready to open in one tap.',
  alternates: { canonical: '/favorites' },
};

export default function FavoritesPage() {
  const items = getScheduled(getChannels().filter((channel) => channel.state === 'published'));
  return (
    <div className="container">
      <header className="page-head">
        <h1 className="page-title">Favorites</h1>
        <p className="page-sub">Channels you saved on this device. Sign in later to sync them across devices.</p>
      </header>
      <div style={{ marginTop: 22 }}>
        <FavoritesView items={items} />
      </div>
    </div>
  );
}
