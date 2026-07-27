import type { Metadata } from 'next';
import Link from 'next/link';
import { adminNav } from '@/config/site';
import { Notice } from '@/components/StatusPanel';
import { getChannels } from '@/server/catalog';
import { summarizeHealth } from '@/server/health';
import { auditLog, importHistory } from '@/server/store';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin dashboard',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  const channels = getChannels();
  const health = summarizeHealth(channels);
  const imports = importHistory();
  const audit = auditLog();
  const drafts = channels.filter((channel) => channel.state === 'draft').length;

  return (
    <div className="container">
      <div className="admin-head">
        <div className="page-head">
          <h1 className="page-title">Operations dashboard</h1>
          <p className="page-sub">Catalog health, imports and audit activity for the TOMOSHA platform.</p>
        </div>
        <nav className="pill-row" aria-label="Admin sections">
          {adminNav.map((item) => (
            <Link key={item.href} href={item.href} className="btn btn-ghost btn-sm">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div style={{ marginTop: 18 }}>
        <Notice tone="warning">
          Real provider playback is disabled. A historical playlist exposure requires credential rotation before any live
          provider is enabled. See docs/security-incident.md.
        </Notice>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-value">{channels.length}</span>
          <span className="stat-label">Channels in catalog</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{health.byStatus.online}</span>
          <span className="stat-label">Online now</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{health.availability}%</span>
          <span className="stat-label">Availability</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{drafts}</span>
          <span className="stat-label">Draft channels</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{imports.length}</span>
          <span className="stat-label">Import runs</span>
        </div>
      </div>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Recent imports</h2>
          <Link href="/admin/import" className="section-link">
            Open importer
          </Link>
        </div>
        {imports.length === 0 ? (
          <p className="notice">No import has been run in this session yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Run</th>
                  <th scope="col">Mode</th>
                  <th scope="col">Accepted</th>
                  <th scope="col">Rejected</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {imports.map((record) => (
                  <tr key={record.id}>
                    <td className="mono">{record.at.slice(11, 19)}</td>
                    <td>{record.mode}</td>
                    <td>{record.accepted}</td>
                    <td>{record.rejected}</td>
                    <td>{record.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Audit log</h2>
        </div>
        {audit.length === 0 ? (
          <p className="notice">No admin activity recorded in this session.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Time</th>
                  <th scope="col">Actor</th>
                  <th scope="col">Action</th>
                  <th scope="col">Detail</th>
                </tr>
              </thead>
              <tbody>
                {audit.map((entry) => (
                  <tr key={entry.id}>
                    <td className="mono">{entry.at.slice(11, 19)}</td>
                    <td>{entry.actor}</td>
                    <td>{entry.action}</td>
                    <td className="mono">{entry.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
