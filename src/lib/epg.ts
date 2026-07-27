import { demoChannels } from './demo';
import { TASHKENT_OFFSET_MINUTES } from './format';
import type { Program } from './types';

const pools: Record<string, string[]> = {
  News: ['Yangiliklar', 'Kun tahlili', 'Iqtisod sharhi', 'Dunyo bugun', 'Tungi xabarlar'],
  General: ['Shahar ritmi', 'Ochiq suhbat', 'Oila davrasi', 'Kechki studiya', 'Hafta yakuni'],
  Sport: ['Live arena', 'Superliga', 'Kurash kechasi', 'Stadion', 'Sport sharhi'],
  Kids: ['Rangli olam', 'Qiziqarli fan', 'Ertaklar vaqti', 'Kichkintoylar', 'Bolajon studiya'],
  Music: ['Navo jonli', 'Maqom kechasi', 'Yangi ovozlar', 'Konsert', 'Tungi pleylist'],
  Film: ['Kechki kino', 'Klassika', 'Qisqa metraj', 'Rejissyor kechasi', 'Premyera'],
  Documentary: ['Dunyo bo\u2018ylab', 'Tabiat kuchi', 'Tarix izlari', 'Ilm sari', 'Uzoq yo\u2018l'],
  Education: ['Ochiq kitob', 'Til darsi', 'Ustoz', 'Ilmiy soat', 'Kutubxona'],
  Regional: ['Mahalla xabarlari', 'Viloyat kuni', 'Dala hayoti', 'Shahar va qishloq', 'Yo\u2018l ustida'],
};

const durations = [30, 45, 60, 90];

function hash(value: string): number {
  let result = 7;
  for (let index = 0; index < value.length; index += 1) {
    result = (result * 31 + value.charCodeAt(index)) >>> 0;
  }
  return result;
}

export function tashkentDayStart(reference: Date = new Date()): Date {
  const shifted = new Date(reference.getTime() + TASHKENT_OFFSET_MINUTES * 60_000);
  shifted.setUTCHours(0, 0, 0, 0);
  return new Date(shifted.getTime() - TASHKENT_OFFSET_MINUTES * 60_000);
}

export function buildSchedule(channelId: string, reference: Date = new Date()): Program[] {
  const channel = demoChannels.find((item) => item.id === channelId);
  const category = channel?.category ?? 'General';
  const titles = pools[category] ?? pools.General;
  const seed = hash(channelId);
  const base = tashkentDayStart(reference);
  const programs: Program[] = [];
  let cursor = 0;
  let index = 0;

  while (cursor < 24 * 60) {
    const duration = durations[(seed + index) % durations.length];
    const endMinutes = Math.min(cursor + duration, 24 * 60);
    const title = titles[(seed + index) % titles.length];
    programs.push({
      id: `${channelId}-${index}`,
      channelId,
      title,
      description: `${title} on ${channel?.name ?? channelId}. Scheduled block generated from the demo EPG fixture.`,
      category,
      start: new Date(base.getTime() + cursor * 60_000).toISOString(),
      end: new Date(base.getTime() + endMinutes * 60_000).toISOString(),
    });
    cursor = endMinutes;
    index += 1;
  }

  return programs;
}

export function currentProgram(channelId: string, at: Date = new Date()): Program | undefined {
  const stamp = at.getTime();
  return buildSchedule(channelId, at).find(
    (program) => new Date(program.start).getTime() <= stamp && new Date(program.end).getTime() > stamp,
  );
}

export function upcomingPrograms(channelId: string, count = 3, at: Date = new Date()): Program[] {
  const stamp = at.getTime();
  return buildSchedule(channelId, at)
    .filter((program) => new Date(program.start).getTime() > stamp)
    .slice(0, count);
}
