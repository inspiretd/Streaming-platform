import type { Metadata } from 'next';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/primitives';
import { getChannels } from '@/server/catalog';
import { summarizeHealth } from '@/server/health';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Stream health',
  robots: { index: false, follow: false },
};

export default function AdminHealthPage() {
  const channels = getChannels();
  const health = summarizeHealth(channels);
  const statuses = Object.entries(health.byStatus);

  return (
    <div className="container">
      <div className="admin-head">
        <div className="page-head">
          <h1 className="page-title">Stream health</h1>
          <p className="page-sub">
            Host grouped monitoring with circuit breaker state. Probes validate the manifest shape without logging stream
            URLs or credentials.
          </p>
        </div>
        <Link href="/admin" className="btn btn-ghost btn-sm">
          Back to dashboard
        </Link>
      </div>

      <div className="stat-grid">
        {statuses.map(([status, count]) => (
          <div className="stat-card" key={status}>
            <span className="stat-value">{count}</span>
            <span className="stat-label">{status.replace('_', ' ')}</span>
          </div>
        ))}
      </div>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Hosts</h2>
          <p className="section-sub mono">Checked {health.checkedAt.slice(11, 19)} UTC</p>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Host</th>
                <th scope="col">Channels</th>
                <th scope="col">Online</th>
                <th scope="col">Offline</th>
                <th scope="col">Avg latency</th>
                <th scope="col">Circuit</th>
              </tr>
            </thead>
            <tbody>
              {health.hosts.map((host) => (
                <tr key={host.host}>
                  <td className="mono">{host.host}</td>
                  <td>{host.channels}</td>
                  <td>{host.online}</td>
                  <td>{host.offline}</td>
                  <td className="mono">{host.averageLatencyMs} ms</td>
                  <td>{host.circuitOpen ? 'open' : 'closed'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Channel status</h2>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Channel</th>
                <th scope="col">State</th>
                <th scope="col">Rights</th>
                <th scope="col">Status</th>
                <th scope="col">Latency</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((channel) => (
                <tr key={channel.id}>
                  <td>
                    <Link href={`/live/${channel.slug}`}>{channel.name}</Link>
                  </td>
                  <td>{channel.state}</td>
                  <td>{channel.rights.replace('_', ' ')}</td>
                  <td>
                    <StatusBadge status={channel.status} />
                  </td>
                  <td className="mono">{channel.latencyMs} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
