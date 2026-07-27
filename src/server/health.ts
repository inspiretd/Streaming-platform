import type { Channel, StreamStatus } from '@/lib/types';

export type HostHealth = {
  host: string;
  channels: number;
  online: number;
  degraded: number;
  offline: number;
  blocked: number;
  averageLatencyMs: number;
  circuitOpen: boolean;
};

export type HealthSummary = {
  checkedAt: string;
  total: number;
  byStatus: Record<StreamStatus, number>;
  hosts: HostHealth[];
  availability: number;
};

const EMPTY_STATUS: Record<StreamStatus, number> = {
  online: 0,
  degraded: 0,
  offline: 0,
  auth_required: 0,
  geo_blocked: 0,
  unsupported: 0,
  unknown: 0,
};

export function summarizeHealth(channels: Channel[]): HealthSummary {
  const byStatus: Record<StreamStatus, number> = { ...EMPTY_STATUS };
  const hostMap = new Map<string, HostHealth>();

  for (const channel of channels) {
    byStatus[channel.status] += 1;
    const host = `${channel.provider.toLowerCase().replace(/\s+/g, '-')}.origin`;
    const entry = hostMap.get(host) ?? {
      host,
      channels: 0,
      online: 0,
      degraded: 0,
      offline: 0,
      blocked: 0,
      averageLatencyMs: 0,
      circuitOpen: false,
    };
    entry.channels += 1;
    if (channel.status === 'online') entry.online += 1;
    else if (channel.status === 'degraded') entry.degraded += 1;
    else if (channel.status === 'offline') entry.offline += 1;
    else entry.blocked += 1;
    entry.averageLatencyMs = Math.round(
      (entry.averageLatencyMs * (entry.channels - 1) + channel.latencyMs) / entry.channels,
    );
    entry.circuitOpen = entry.channels > 3 && entry.offline / entry.channels > 0.5;
    hostMap.set(host, entry);
  }

  const total = channels.length;
  const availability = total === 0 ? 0 : Math.round(((byStatus.online + byStatus.degraded) / total) * 1000) / 10;

  return {
    checkedAt: new Date().toISOString(),
    total,
    byStatus,
    hosts: Array.from(hostMap.values()).sort((a, b) => b.channels - a.channels),
    availability,
  };
}

/**
 * Manifest probe used by the scheduled health worker. It validates HLS manifest
 * shape and never logs the stream URL, query string or credentials.
 */
export async function probeManifest(
  url: string,
  timeoutMs = 6000,
): Promise<{ status: StreamStatus; latencyMs: number }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();
  try {
    const response = await fetch(url, { signal: controller.signal, redirect: 'follow' });
    const latencyMs = Date.now() - startedAt;
    if (response.status === 401 || response.status === 403) return { status: 'auth_required', latencyMs };
    if (response.status === 451) return { status: 'geo_blocked', latencyMs };
    if (!response.ok) return { status: 'offline', latencyMs };
    const body = (await response.text()).slice(0, 2048);
    if (!body.includes('#EXTM3U')) return { status: 'unsupported', latencyMs };
    return { status: latencyMs > 2500 ? 'degraded' : 'online', latencyMs };
  } catch {
    return { status: 'offline', latencyMs: Date.now() - startedAt };
  } finally {
    clearTimeout(timer);
  }
}
