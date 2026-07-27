'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import type { ChannelWithSchedule } from '@/lib/types';
import { LiveBadge, ProgressBar, QualityBadge } from '@/components/ui/primitives';
import { formatTashkentTime } from '@/lib/epg';
import { useFavorites } from '@/hooks/useLocalCollection';

const cardVariants = {
  rest: { y: 0 },
  hover: { y: -4 },
  tap: { scale: 0.99 },
};

const mediaVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.025 },
};

export function ChannelCard({ item }: { item: ChannelWithSchedule }) {
  const { channel, now, progress } = item;
  const { isFavorite, toggle } = useFavorites();
  const favorite = isFavorite(channel.slug);
  const live = channel.status === 'online' || channel.status === 'degraded';

  return (
    <motion.article
      className="channel-card"
      variants={cardVariants}
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileTap="tap"
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      <div className="card-media" style={{ background: channel.accent }}>
        <motion.span className="card-monogram" variants={mediaVariants} transition={{ duration: 0.24, ease: 'easeOut' }}>
          {channel.monogram}
        </motion.span>
        <div className="card-topline">
          {live ? <LiveBadge /> : <span className="badge">{channel.status.replace('_', ' ')}</span>}
          <QualityBadge quality={channel.quality} />
        </div>
      </div>

      <div className="card-body">
        <p className="card-name">{channel.name}</p>
        <p className="card-now">{now ? now.title : 'Schedule unavailable'}</p>
        <ProgressBar value={progress} label={`${channel.name} program progress`} />
        <div className="card-meta">
          <span>{channel.country}</span>
          <span aria-hidden="true">·</span>
          <span className="mono">{now ? `${formatTashkentTime(now.startsAt)} - ${formatTashkentTime(now.endsAt)}` : '--:--'}</span>
        </div>
      </div>

      <Link href={`/live/${channel.slug}`} className="card-link" aria-label={`Open ${channel.name}`} />

      <button
        type="button"
        className="icon-btn"
        onClick={() => toggle(channel.slug)}
        aria-label={favorite ? `Remove ${channel.name} from favorites` : `Add ${channel.name} to favorites`}
        aria-pressed={favorite}
        style={{ position: 'absolute', right: 10, bottom: 10, zIndex: 4, width: 36, height: 36 }}
      >
        <Heart size={16} fill={favorite ? 'var(--accent)' : 'none'} color={favorite ? 'var(--accent)' : 'currentColor'} aria-hidden="true" />
      </button>
    </motion.article>
  );
}
