import type { Metadata } from 'next';
import { HistoryView } from '@/components/user/UserViews';
import { getChannels, getScheduled } from '@/server/catalog';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Watch history',
  description: 'Continue watching where you left off across the TOMOSHA catalog.',
  alternates: { canonical: '/history' },
};

export default function HistoryPage() {
  const items = getScheduled(getChannels().filter((channel) => channel.state === 'published'));
  return (
    <div className="container">
      <header className="page-head">
        <h1 className="page-title">Watch history</h1>
        <p className="page-sub">Recently opened channels and continue watching, stored locally for privacy.</p>
      </header>
      <div style={{ marginTop: 22 }}>
        <HistoryView items={items} />
      </div>
    </div>
  );
}
