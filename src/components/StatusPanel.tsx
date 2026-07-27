import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Inbox, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/primitives';

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="state-panel" role="status">
      <span className="state-icon">
        <Inbox size={20} aria-hidden="true" />
      </span>
      <p className="state-title">{title}</p>
      <p className="state-text">{description}</p>
      {action}
    </div>
  );
}

export function ErrorPanel({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="state-panel" role="alert">
      <span className="state-icon" style={{ color: 'var(--danger)' }}>
        <AlertTriangle size={20} aria-hidden="true" />
      </span>
      <p className="state-title">{title}</p>
      <p className="state-text">{description}</p>
      {action}
    </div>
  );
}

export function LoadingPanel({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="state-panel" role="status" aria-live="polite">
      <span className="state-icon">
        <Loader2 size={20} aria-hidden="true" />
      </span>
      <p className="state-text">{label}</p>
    </div>
  );
}

export function SuccessNote({ children }: { children: ReactNode }) {
  return (
    <p className="notice notice-success" role="status">
      <CheckCircle2 size={16} aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

export function Notice({ tone = 'default', children }: { tone?: 'default' | 'success' | 'warning' | 'danger'; children: ReactNode }) {
  return <p className={tone === 'default' ? 'notice' : `notice notice-${tone}`}>{children}</p>;
}

export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="channel-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="channel-card">
          <div className="card-media">
            <Skeleton height="100%" radius={0} />
          </div>
          <div className="card-body">
            <Skeleton height={14} width="70%" />
            <Skeleton height={12} width="45%" />
          </div>
        </div>
      ))}
    </div>
  );
}
