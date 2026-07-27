export const TASHKENT_OFFSET_MINUTES = 300;

function shift(date: Date): Date {
  return new Date(date.getTime() + TASHKENT_OFFSET_MINUTES * 60_000);
}

function pad(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

export function formatClock(input: string | Date): string {
  const date = shift(typeof input === 'string' ? new Date(input) : input);
  return `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
}

export function formatDayLabel(input: string | Date): string {
  const date = shift(typeof input === 'string' ? new Date(input) : input);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[date.getUTCDay()]}, ${date.getUTCDate()} ${months[date.getUTCMonth()]}`;
}

export function minutesBetween(from: string | Date, to: string | Date): number {
  const a = typeof from === 'string' ? new Date(from) : from;
  const b = typeof to === 'string' ? new Date(to) : to;
  return Math.round((b.getTime() - a.getTime()) / 60_000);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

export function formatRelative(input: string | Date, now: Date = new Date()): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  const diff = Math.round((now.getTime() - date.getTime()) / 60_000);
  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff} min ago`;
  if (diff < 60 * 24) return `${Math.floor(diff / 60)} h ago`;
  return `${Math.floor(diff / (60 * 24))} d ago`;
}
