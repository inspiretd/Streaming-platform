import { describe, expect, it } from 'vitest';
import {
  SLOTS_PER_DAY,
  buildSchedule,
  currentProgram,
  dayKeyStart,
  formatTashkentTime,
  programProgress,
  shiftDayKey,
  tashkentDayKey,
  withSchedule,
} from '@/lib/epg';
import { demoChannels } from '@/lib/demo';

const channel = demoChannels[0];

describe('timezone handling', () => {
  it('uses the Tashkent day boundary', () => {
    expect(tashkentDayKey(new Date('2026-07-27T18:30:00.000Z'))).toBe('2026-07-27');
    expect(tashkentDayKey(new Date('2026-07-27T19:30:00.000Z'))).toBe('2026-07-28');
  });

  it('starts a day at 19:00 UTC the day before', () => {
    expect(dayKeyStart('2026-07-28').toISOString()).toBe('2026-07-27T19:00:00.000Z');
  });

  it('formats times in Asia/Tashkent', () => {
    expect(formatTashkentTime('2026-07-27T19:00:00.000Z')).toBe('00:00');
  });

  it('shifts day keys', () => {
    expect(shiftDayKey('2026-07-27', 1)).toBe('2026-07-28');
    expect(shiftDayKey('2026-07-27', -1)).toBe('2026-07-26');
  });
});

describe('schedule generation', () => {
  it('creates a full day of slots', () => {
    const programs = buildSchedule(channel, '2026-07-27');
    expect(programs).toHaveLength(SLOTS_PER_DAY);
    expect(programs[0].epgId).toBe(channel.epgId);
  });

  it('is deterministic for the same day', () => {
    expect(buildSchedule(channel, '2026-07-27')).toEqual(buildSchedule(channel, '2026-07-27'));
  });

  it('resolves the current program and progress', () => {
    const programs = buildSchedule(channel, '2026-07-27');
    const at = new Date(Date.parse(programs[3].startsAt) + 45 * 60000);
    const now = currentProgram(programs, at);
    expect(now?.id).toBe(programs[3].id);
    expect(programProgress(now, at)).toBe(50);
  });

  it('returns upcoming programs with the channel', () => {
    const result = withSchedule(channel, new Date('2026-07-27T10:00:00.000Z'));
    expect(result.channel.id).toBe(channel.id);
    expect(result.next).toHaveLength(3);
  });
});
