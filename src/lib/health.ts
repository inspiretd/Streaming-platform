import { demoChannels } from './demo';
import type { StreamStatus } from './types';

export const statusMeta: Record<StreamStatus, { label: string; tone: 'ok' | 'warn' | 'bad' | 'muted' }> = {
  online: { label: 'Online', tone: 'ok' },
  degraded: { label: 'Degraded', tone: 'warn' },
  offline: { label: 'Offline', tone: 'bad' },
  auth_required: { label: 'Auth required', tone: 'warn' },
  geo_blocked: { label: 'Geo blocked', tone: 'warn' },
  unsupported: { label: 'Unsupported', tone: 'bad' },
  unknown: { label: 'Unknown', tone: 'muted' },
};

export type HealthRow = {
  channelId: string;
  name: string;
  status: StreamStatus;
  latencyMs: number;
  host: string;
  checkedAt: string;
};

function hash(value: string): number {
  let result = 11;
  for (let index = 0; index < value.length; index += 1) result = (result * 33 + value.charCodeAt(index)) >>> 0;
  return result;
}

/**
 * Host grouped health snapshot. In production the checker runs DNS -> manifest GET ->
 * MIME check -> #EXTM3U check -> variant playlist -> first segment, with a circuit
 * breaker per host so one broken origin does not trigger thousands of probes.
 */
export function healthSnapshot(now: Date = new Date()): HealthRow[] {
  return demoChannels.map((channel) => ({
    channelId: channel.id,
    name: channel.name,
    status: channel.status,
    latencyMs: 90 + (hash(channel.id) % 420),
    host: channel.country === 'UZ' ? 'edge-tashkent.demo' : 'edge-global.demo',
    checkedAt: new Date(now.getTime() - (hash(channel.slug) % 9) * 60_000).toISOString(),
  }));
}

export function healthTotals(rows: HealthRow[]) {
  return {
    online: rows.filter((row) => row.status === 'online').length,
    degraded: rows.filter((row) => row.status === 'degraded').length,
    blocked: rows.filter((row) => row.status === 'geo_blocked' || row.status === 'auth_required').length,
    down: rows.filter((row) => row.status === 'offline' || row.status === 'unsupported').length,
    averageLatency: Math.round(rows.reduce((total, row) => total + row.latencyMs, 0) / Math.max(1, rows.length)),
  };
}
