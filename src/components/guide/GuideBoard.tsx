'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { Channel, Program } from '@/lib/types';
import { formatTashkentTime } from '@/lib/epg';
import { Drawer } from '@/components/ui/Overlay';
import { Tabs } from '@/components/ui/controls';
import { EmptyState } from '@/components/StatusPanel';

export type GuideRow = { channel: Channel; programs: Program[] };

function isNow(program: Program, at: number): boolean {
  return Date.parse(program.startsAt) <= at && Date.parse(program.endsAt) > at;
}

export function GuideBoard({ rows, dayKey }: { rows: GuideRow[]; dayKey: string }) {
  const [now, setNow] = useState<number | null>(null);
  const [selected, setSelected] = useState<{ program: Program; channel: Channel } | null>(null);
  const [view, setView] = useState('grid');

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const slots = useMemo(() => (rows.length > 0 ? rows[0].programs : []), [rows]);

  if (rows.length === 0) {
    return <EmptyState title="No schedule for this day" description="Pick another date or connect an XMLTV source in the admin console." />;
  }

  return (
    <>
      <Tabs
        items={[
          { id: 'grid', label: 'Timeline' },
          { id: 'list', label: 'Channel list' },
        ]}
        active={view}
        onChange={setView}
        layoutId="guide-tab"
      />

      {view === 'grid' ? (
        <div className="guide-scroll">
          <div className="guide-inner">
            <div className="guide-axis">
              <span>Channel</span>
              {slots.map((slot) => (
                <span key={slot.id} className="mono">
                  {formatTashkentTime(slot.startsAt)}
                </span>
              ))}
            </div>
            {rows.map((row) => (
              <div className="guide-row" key={row.channel.id}>
                <div className="guide-channel">
                  <Link href={`/live/${row.channel.slug}`} style={{ fontWeight: 600, fontSize: 13.5 }}>
                    {row.channel.name}
                  </Link>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{row.channel.country}</span>
                </div>
                {row.programs.map((program) => (
                  <button
                    key={program.id}
                    type="button"
                    className="guide-block"
                    data-now={now !== null && isNow(program, now)}
                    onClick={() => setSelected({ program, channel: row.channel })}
                  >
                    <span style={{ display: 'block', fontWeight: 600 }}>{program.title}</span>
                    <span className="mono" style={{ color: 'var(--text-muted)', fontSize: 11.5 }}>
                      {formatTashkentTime(program.startsAt)}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="guide-list">
          {rows.map((row) => {
            const current = now === null ? row.programs[0] : row.programs.find((program) => isNow(program, now)) ?? row.programs[0];
            const upcoming = row.programs.filter((program) => Date.parse(program.startsAt) > Date.parse(current.startsAt)).slice(0, 3);
            return (
              <div className="panel" key={row.channel.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                  <Link href={`/live/${row.channel.slug}`} style={{ fontWeight: 700 }}>
                    {row.channel.name}
                  </Link>
                  <span className="badge">{row.channel.country}</span>
                </div>
                <div className="program-list">
                  <button type="button" className="program-row" data-now="true" onClick={() => setSelected({ program: current, channel: row.channel })}>
                    <span className="program-time mono">{formatTashkentTime(current.startsAt)}</span>
                    <span style={{ display: 'grid', gap: 2 }}>
                      <span className="program-title">{current.title}</span>
                      <span className="program-desc">{current.genre}</span>
                    </span>
                  </button>
                  {upcoming.map((program) => (
                    <button key={program.id} type="button" className="program-row" onClick={() => setSelected({ program, channel: row.channel })}>
                      <span className="program-time mono">{formatTashkentTime(program.startsAt)}</span>
                      <span style={{ display: 'grid', gap: 2 }}>
                        <span className="program-title">{program.title}</span>
                        <span className="program-desc">{program.genre}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="result-count" style={{ marginTop: 12 }}>
        Schedule for {dayKey} in Asia/Tashkent time.
      </p>

      <Drawer open={selected !== null} onClose={() => setSelected(null)} title={selected ? selected.program.title : 'Program'}>
        {selected ? (
          <div style={{ display: 'grid', gap: 12 }}>
            <span className="badge badge-accent">{selected.program.genre}</span>
            <p className="mono" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {formatTashkentTime(selected.program.startsAt)} - {formatTashkentTime(selected.program.endsAt)}
            </p>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{selected.program.description}</p>
            <Link href={`/live/${selected.channel.slug}`} className="btn btn-primary btn-sm">
              Watch {selected.channel.name}
            </Link>
          </div>
        ) : null}
      </Drawer>
    </>
  );
}
