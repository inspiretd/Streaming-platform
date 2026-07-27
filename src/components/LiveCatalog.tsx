'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ChannelWithSchedule } from '@/lib/types';
import { ChannelCard } from '@/components/ChannelCard';
import { EmptyState } from '@/components/StatusPanel';

export function ChannelRail({
  title,
  subtitle,
  items,
  href,
}: {
  title: string;
  subtitle?: string;
  items: ChannelWithSchedule[];
  href?: string;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const scrollBy = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * Math.max(280, track.clientWidth * 0.8), behavior: 'smooth' });
  };

  return (
    <motion.section
      className="section rail"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
    >
      <div className="section-head">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle ? <p className="section-sub">{subtitle}</p> : null}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {href ? (
            <Link href={href} className="section-link">
              View all
            </Link>
          ) : null}
          <div className="rail-nav">
            <button type="button" className="icon-btn" onClick={() => scrollBy(-1)} aria-label={`Scroll ${title} left`}>
              <ChevronLeft size={17} aria-hidden="true" />
            </button>
            <button type="button" className="icon-btn" onClick={() => scrollBy(1)} aria-label={`Scroll ${title} right`}>
              <ChevronRight size={17} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState title="No channels here yet" description="This rail will fill up as soon as licensed channels are published." />
      ) : (
        <div className="rail-track" ref={trackRef}>
          {items.map((item) => (
            <ChannelCard key={item.channel.id} item={item} />
          ))}
        </div>
      )}
    </motion.section>
  );
}
