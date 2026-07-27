'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import type { Variants } from 'motion/react';
import { Heart, Play } from 'lucide-react';
import type { ChannelWithSchedule } from '@/lib/types';
import { LiveBadge, ProgressBar, QualityBadge, StatusBadge } from '@/components/ui/primitives';
import { formatTashkentTime } from '@/lib/epg';
import { useFavorites } from '@/hooks/useLocalCollection';
import { useToast } from '@/components/ui/Toast';

const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } };
const item: Variants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.34, ease: 'easeOut' } } };

export function HomeHero({ featured }: { featured: ChannelWithSchedule }) {
  const { channel, now, next, progress } = featured;
  const { isFavorite, toggle } = useFavorites();
  const { push } = useToast();
  const favorite = isFavorite(channel.slug);
  const onFavorite = () => { const added = toggle(channel.slug); push({ tone: 'success', title: added ? 'Sevimlilarga qo‘shildi' : 'Sevimlilardan olib tashlandi', body: channel.name }); };

  return (
    <section className="hero" aria-labelledby="hero-title">
      <motion.div className="hero-media" style={{ backgroundImage: "url('/media/tomosha-hero.svg')" }} initial={{ scale: 1 }} animate={{ scale: 1.02 }} transition={{ duration: 18, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }} />
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-scrim" aria-hidden="true" />
      <motion.div className="hero-inner" variants={container} initial="hidden" animate="show">
        <motion.div className="hero-eyebrow" variants={item}><LiveBadge /><StatusBadge status={channel.status} /><QualityBadge quality={channel.quality} /></motion.div>
        <motion.h1 className="hero-title" id="hero-title" variants={item}>{channel.name}</motion.h1>
        <motion.p className="hero-desc" variants={item}>{channel.tagline}. Jonli efir, yagona dastur jadvali va sevimli kanallar bitta joyda.</motion.p>
        <motion.div className="hero-actions" variants={item}>
          <Link href={`/live/${channel.slug}`} className="btn btn-primary"><Play size={16} aria-hidden="true" /><span>Tomosha qilish</span></Link>
          <button type="button" className="btn btn-ghost" onClick={onFavorite} aria-pressed={favorite}><Heart size={16} fill={favorite ? 'var(--accent)' : 'none'} aria-hidden="true" /><span>{favorite ? 'Sevimlilarda' : 'Sevimlilarga qo‘shish'}</span></button>
          <Link href="/guide" className="btn btn-ghost">TV dasturi</Link>
        </motion.div>
        <motion.div className="hero-epg" variants={item}>
          <div className="hero-epg-row"><strong style={{ color: 'var(--text-primary)' }}>{now ? now.title : 'Dastur jadvali topilmadi'}</strong><span className="mono">{now ? `${formatTashkentTime(now.startsAt)} - ${formatTashkentTime(now.endsAt)}` : '--:--'}</span></div>
          <ProgressBar value={progress} label="Joriy dastur jarayoni" />
          {next.slice(0, 1).map((program) => <div className="hero-epg-row" key={program.id}><span>Keyingi: {program.title}</span><span className="mono">{formatTashkentTime(program.startsAt)}</span></div>)}
        </motion.div>
      </motion.div>
    </section>
  );
}
