import type { Channel, ChannelWithSchedule, Program } from './types';

export const TASHKENT_OFFSET_MINUTES = 300;
export const SLOT_MINUTES = 90;
export const SLOTS_PER_DAY = (24 * 60) / SLOT_MINUTES;

const GENRE_TITLES: Record<string, string[]> = {
  news: ['Kunduzgi axborot', 'Iqtisodiyot sharhi', 'Dunyo yangiliklari', 'Tahliliy studiya'],
  sport: ['Chempionat sharhi', 'Jonli uchrashuv', 'Sport dayjesti', 'Kurash arenasi'],
  movies: ['Kinozal', 'Klassika kechasi', 'Premyera', 'Rejissyor kesimi'],
  kids: ['Bolajon ertaklari', 'Multfilm karvoni', 'Bilimdon bolalar', 'Qiziqarli darslar'],
  music: ['Navo konsert', 'Yangi klip', 'Retro to plam', 'Jonli sahna'],
  education: ['Bilim maydoni', 'Ilm yo li', 'Til darslari', 'Kelajak kasblari'],
  general: ['Ertalabki dastur', 'Oilaviy studiya', 'Suhbat soati', 'Kechki dastur'],
  regional: ['Viloyat xabarlari', 'Mahalla hayoti', 'Diyor manzaralari', 'Hududiy studiya'],
  documentary: ['Tarix izlari', 'Tabiat qomusi', 'Ilmiy hujjatli', 'Sayohat kundaligi'],
};

const GENRE_LABELS: Record<string, string> = {
  news: 'News',
  sport: 'Sport',
  movies: 'Movie',
  kids: 'Kids',
  music: 'Music',
  education: 'Education',
  general: 'General',
  regional: 'Regional',
  documentary: 'Documentary',
};

function hash(value: string): number {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result = (result * 31 + value.charCodeAt(index)) % 100000;
  }
  return result;
}

export function tashkentDayKey(date: Date): string {
  return new Date(date.getTime() + TASHKENT_OFFSET_MINUTES * 60000).toISOString().slice(0, 10);
}

export function dayKeyStart(dayKey: string): Date {
  return new Date(Date.parse(`${dayKey}T00:00:00.000Z`) - TASHKENT_OFFSET_MINUTES * 60000);
}

export function shiftDayKey(dayKey: string, days: number): string {
  const base = Date.parse(`${dayKey}T00:00:00.000Z`) + days * 86400000;
  return new Date(base).toISOString().slice(0, 10);
}

export function formatTashkentTime(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Tashkent',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
}

export function formatTashkentDate(dayKey: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Tashkent',
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(dayKeyStart(dayKey).getTime() + 12 * 3600000);
}

export function buildSchedule(channel: Channel, dayKey: string): Program[] {
  const start = dayKeyStart(dayKey).getTime();
  const seed = hash(`${channel.id}:${dayKey}`);
  const titles = GENRE_TITLES[channel.category] ?? GENRE_TITLES.general;
  const programs: Program[] = [];
  for (let slot = 0; slot < SLOTS_PER_DAY; slot += 1) {
    const startsAt = new Date(start + slot * SLOT_MINUTES * 60000);
    const endsAt = new Date(start + (slot + 1) * SLOT_MINUTES * 60000);
    const title = titles[(seed + slot) % titles.length];
    programs.push({
      id: `${channel.epgId}-${dayKey}-${slot}`,
      epgId: channel.epgId,
      title: `${title}`,
      description: `${channel.name} presents ${title.toLowerCase()} in the ${slot < 8 ? 'daytime' : 'primetime'} block.`,
      genre: GENRE_LABELS[channel.category] ?? 'General',
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
    });
  }
  return programs;
}

export function currentProgram(programs: Program[], at: Date): Program | null {
  const time = at.getTime();
  return (
    programs.find((program) => Date.parse(program.startsAt) <= time && Date.parse(program.endsAt) > time) ?? null
  );
}

export function programProgress(program: Program | null, at: Date): number {
  if (!program) return 0;
  const start = Date.parse(program.startsAt);
  const end = Date.parse(program.endsAt);
  if (end <= start) return 0;
  const ratio = (at.getTime() - start) / (end - start);
  return Math.min(100, Math.max(0, Math.round(ratio * 100)));
}

export function withSchedule(channel: Channel, at: Date, upcoming = 3): ChannelWithSchedule {
  const dayKey = tashkentDayKey(at);
  const programs = [
    ...buildSchedule(channel, dayKey),
    ...buildSchedule(channel, shiftDayKey(dayKey, 1)),
  ];
  const now = currentProgram(programs, at);
  const index = now ? programs.findIndex((program) => program.id === now.id) : -1;
  const next = index >= 0 ? programs.slice(index + 1, index + 1 + upcoming) : programs.slice(0, upcoming);
  return { channel, now, next, progress: programProgress(now, at) };
}
