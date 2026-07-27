import type { Metadata } from 'next';
import Link from 'next/link';
import { GuideBoard } from '@/components/guide/GuideBoard';
import { buildSchedule, formatTashkentDate, shiftDayKey, tashkentDayKey } from '@/lib/epg';
import { getChannels } from '@/server/catalog';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'TV guide',
  description: 'The unified TOMOSHA TV guide in Asia/Tashkent time with program details for every published channel.',
  alternates: { canonical: '/guide' },
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export default function GuidePage({ searchParams }: { searchParams: { date?: string } }) {
  const today = tashkentDayKey(new Date());
  const requested = searchParams.date;
  const dayKey = requested && DATE_PATTERN.test(requested) ? requested : today;

  const days = [-1, 0, 1, 2, 3].map((offset) => shiftDayKey(today, offset));
  const rows = getChannels()
    .filter((channel) => channel.state === 'published')
    .slice(0, 24)
    .map((channel) => ({ channel, programs: buildSchedule(channel, dayKey) }));

  return (
    <div className="container">
      <header className="page-head">
        <h1 className="page-title">TV guide</h1>
        <p className="page-sub">
          Every provider schedule normalized into one timeline. Times are shown in Asia/Tashkent, the platform default.
        </p>
      </header>

      <nav className="guide-toolbar" aria-label="Guide date">
        {days.map((day) => (
          <Link key={day} href={`/guide?date=${day}`} className="chip" data-active={day === dayKey}>
            {day === today ? 'Today' : formatTashkentDate(day)}
          </Link>
        ))}
      </nav>

      <GuideBoard rows={rows} dayKey={dayKey} />
    </div>
  );
}
