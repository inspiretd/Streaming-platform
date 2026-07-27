'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Heart, Play } from 'lucide-react';
import type { ChannelWithSchedule } from '@/lib/types';
import { LiveBadge, ProgressBar, QualityBadge } from '@/components/ui/primitives';
import { formatTashkentTime } from '@/lib/epg';
import { useFavorites } from '@/hooks/useLocalCollection';

const cardVariants = { rest: { y: 0 }, hover: { y: -4 }, tap: { scale: 0.99 } };
const mediaVariants = { rest: { scale: 1 }, hover: { scale: 1.025 } };

export function ChannelCard({ item }: { item: ChannelWithSchedule }) {
  const { channel, now, progress } = item;
  const { isFavorite, toggle } = useFavorites();
  const favorite = isFavorite(channel.slug);
  const live = channel.status === 'online' || channel.status === 'degraded';

  return (
    <motion.article className="channel-card" variants={cardVariants} initial="rest" animate="rest" whileHover="hover" whileTap="tap" transition={{ duration: 0.22, ease: 'easeOut' }}>
      <div className="card-media" style={{ backgroundColor: channel.accent, backgroundImage: "url('/media/tomosha-channel.svg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <motion.div className="card-brand-lockup" variants={mediaVariants} transition={{ duration: 0.24, ease: 'easeOut' }}>
          <span className="card-brand-mark">T</span>
          <span className="card-brand-name">{channel.name}</span>
        </motion.div>
        <div className="card-topline">{live ? <LiveBadge /> : <span className="badge">{channel.status.replace('_', ' ')}</span>}<QualityBadge quality={channel.quality} /></div>
        <div className="card-play" aria-hidden="true"><Play size={18} fill="currentColor" /></div>
      </div>
      <div className="card-body"><p className="card-name">{channel.name}</p><p className="card-now">{now ? now.title : 'Dastur jadvali topilmadi'}</p><ProgressBar value={progress} label={`${channel.name} dastur jarayoni`} /><div className="card-meta"><span>{channel.country}</span><span aria-hidden="true">·</span><span className="mono">{now ? `${formatTashkentTime(now.startsAt)} - ${formatTashkentTime(now.endsAt)}` : '--:--'}</span></div></div>
      <Link href={`/live/${channel.slug}`} className="card-link" aria-label={`${channel.name} kanalini ochish`} />
      <button type="button" className="icon-btn" onClick={() => toggle(channel.slug)} aria-label={favorite ? `${channel.name} sevimlilardan olib tashlash` : `${channel.name} sevimlilarga qo‘shish`} aria-pressed={favorite} style={{ position: 'absolute', right: 10, bottom: 10, zIndex: 4, width: 36, height: 36 }}><Heart size={16} fill={favorite ? 'var(--accent)' : 'none'} color={favorite ? 'var(--accent)' : 'currentColor'} aria-hidden="true" /></button>
    </motion.article>
  );
}
