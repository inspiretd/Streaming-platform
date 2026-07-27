import type { Metadata } from 'next';
import Link from 'next/link';
import { AdminImport } from '@/components/AdminImport';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Playlist importer',
  robots: { index: false, follow: false },
};

export default function AdminImportPage() {
  return (
    <div className="container">
      <div className="admin-head">
        <div className="page-head">
          <h1 className="page-title">Authorized playlist importer</h1>
          <p className="page-sub">
            Parse, preview and dry run an authorized M3U playlist before anything touches the catalog. Adult groups, unsafe
            hosts and duplicates are rejected automatically.
          </p>
        </div>
        <Link href="/admin" className="btn btn-ghost btn-sm">
          Back to dashboard
        </Link>
      </div>

      <AdminImport />
    </div>
  );
}
