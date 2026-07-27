import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CardGridSkeleton, EmptyState, ErrorPanel, SuccessNote } from '@/components/StatusPanel';
import { LiveBadge, ProgressBar, StatusBadge } from '@/components/ui/primitives';

describe('state surfaces', () => {
  it('renders an empty state with guidance', () => {
    render(<EmptyState title="No channels" description="Try another filter" />);
    expect(screen.getByText('No channels')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders an error state as an alert', () => {
    render(<ErrorPanel title="Broken" description="Retry soon" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders a success note', () => {
    render(<SuccessNote>Saved</SuccessNote>);
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('renders skeleton placeholders', () => {
    const { container } = render(<CardGridSkeleton count={3} />);
    expect(container.querySelectorAll('.channel-card')).toHaveLength(3);
  });
});

describe('primitives', () => {
  it('exposes progress to assistive tech', () => {
    render(<ProgressBar value={42} label="Program" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '42');
  });

  it('labels stream status', () => {
    render(<StatusBadge status="geo_blocked" />);
    expect(screen.getByText('Geo blocked')).toBeInTheDocument();
  });

  it('renders the live badge', () => {
    render(<LiveBadge />);
    expect(screen.getByText('Live')).toBeInTheDocument();
  });
});
