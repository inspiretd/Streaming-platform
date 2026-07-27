import type { ReactNode } from 'react';
import type { ChannelQuality, StreamStatus } from '@/lib/types';
import { statusLabels } from '@/lib/channel';

export function Badge({ tone = 'default', children }: { tone?: 'default' | 'live' | 'accent' | 'success' | 'warning' | 'danger' | 'info'; children: ReactNode }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

const STATUS_TONE: Record<StreamStatus, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  online: 'success',
  degraded: 'warning',
  offline: 'danger',
  auth_required: 'warning',
  geo_blocked: 'danger',
  unsupported: 'info',
  unknown: 'default',
};

export function StatusBadge({ status }: { status: StreamStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{statusLabels[status]}</Badge>;
}

export function QualityBadge({ quality }: { quality: ChannelQuality }) {
  return <Badge tone={quality === 'UHD' ? 'accent' : 'default'}>{quality}</Badge>;
}

export function LiveBadge() {
  return (
    <span className="badge badge-live">
      <span className="live-dot" aria-hidden="true" />
      Live
    </span>
  );
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  return (
    <div className="progress" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? 'Program progress'}>
      <span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function Skeleton({ height = 16, width = '100%', radius = 10 }: { height?: number | string; width?: number | string; radius?: number }) {
  return <div className="skeleton" style={{ height, width, borderRadius: radius }} aria-hidden="true" />;
}

export function MonogramTile({ monogram, accent, size = 'md' }: { monogram: string; accent: string; size?: 'sm' | 'md' | 'lg' }) {
  const dimension = size === 'sm' ? 32 : size === 'lg' ? 60 : 44;
  return (
    <span
      aria-hidden="true"
      style={{
        width: dimension,
        height: dimension,
        background: accent,
        borderRadius: size === 'sm' ? 8 : 12,
        display: 'grid',
        placeItems: 'center',
        fontWeight: 800,
        fontSize: size === 'sm' ? 12 : size === 'lg' ? 20 : 15,
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {monogram}
    </span>
  );
}
