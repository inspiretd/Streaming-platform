export type M3uEntry = { name: string; url: string; group?: string; tvgId?: string; tvgLogo?: string };

export function parseSafeM3u(input: string, maxEntries = 5000): M3uEntry[] {
  const lines = input.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const entries: M3uEntry[] = [];
  for (let index = 0; index < lines.length && entries.length < maxEntries; index += 1) {
    const info = lines[index];
    if (!info.startsWith('#EXTINF:')) continue;
    const url = lines[index + 1];
    if (!url || url.startsWith('#') || !/^https:\/\//i.test(url)) continue;
    const name = info.split(',').slice(1).join(',').trim();
    if (!name) continue;
    const attribute = (key: string) => info.match(new RegExp(`${key}="([^"]*)"`, 'i'))?.[1];
    const lower = `${attribute('group-title') ?? ''} ${name}`.toLowerCase();
    if (['adult', '18+', 'xxx', 'erotica', 'эротика', 'взрослые'].some((term) => lower.includes(term))) continue;
    entries.push({ name, url, group: attribute('group-title'), tvgId: attribute('tvg-id'), tvgLogo: attribute('tvg-logo') });
    index += 1;
  }
  return entries;
}
