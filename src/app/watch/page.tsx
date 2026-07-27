import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/StatusPanel';

export const metadata: Metadata = {
  title: 'Movies and shows',
  description: 'The TOMOSHA video on demand catalog scaffold for licensed movies, series and local creators.',
  alternates: { canonical: '/watch' },
};

export default function WatchPage() {
  return (
    <div className="container">
      <header className="page-head">
        <h1 className="page-title">Movies and shows</h1>
        <p className="page-sub">
          The video on demand surface is scaffolded for the MVP. Titles appear here as soon as a distribution agreement is
          recorded in the rights register.
        </p>
      </header>

      <div style={{ marginTop: 24 }}>
        <EmptyState
          title="No licensed titles published yet"
          description="Live TV is the MVP focus. The VOD data model, detail route and player already share the same playback pipeline."
          action={
            <Link href="/live" className="btn btn-primary btn-sm">
              Browse live TV
            </Link>
          }
        />
      </div>
    </div>
  );
}
