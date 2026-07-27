export type M3uQuality = 'HD' | 'FHD' | 'UHD' | 'SD';

export type RejectionReason = 'adult' | 'invalid-url' | 'unsafe-host' | 'duplicate' | 'missing-name';

export type M3uEntry = {
  name: string;
  rawName: string;
  url: string;
  group: string;
  tvgId?: string;
  tvgName?: string;
  tvgLogo?: string;
  quality: M3uQuality;
  country: string;
  language: string;
  timeshift?: number;
  variant: 'original' | 'timeshift';
  host: string;
};

export type M3uRejection = {
  line: number;
  name: string;
  reason: RejectionReason;
  host: string;
};

export type M3uPreview = {
  total: number;
  accepted: number;
  invalid: number;
  duplicates: number;
  blocked: number;
  groups: { name: string; count: number }[];
  entries: M3uEntry[];
  rejections: M3uRejection[];
};

export type DryRunResult = {
  create: number;
  update: number;
  unchanged: number;
  skipped: number;
  variants: { key: string; qualities: M3uQuality[]; timeshift: number[] }[];
};

const blockedTerms = ['adult', '18+', 'xxx', 'erotic', 'erotica', 'porn', '\u044d\u0440\u043e\u0442\u0438\u043a\u0430', '\u0432\u0437\u0440\u043e\u0441\u043b\u044b\u0435', '\u0434\u043b\u044f \u0432\u0437\u0440\u043e\u0441\u043b\u044b\u0445'];

const privateHost =
  /^(localhost|0\.0\.0\.0|10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?|\[?fc00:|\[?fd)/i;

/** Never log or render a full stream URL. Only the host is safe to surface. */
export function redactUrl(value: string): string {
  try {
    return `${new URL(value).host}/\u2026`;
  } catch {
    return 'invalid-url';
  }
}

export function hostOf(value: string): string {
  try {
    return new URL(value).host;
  } catch {
    return 'unknown';
  }
}

export function isSafeStreamUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return false;
    const host = url.hostname.toLowerCase();
    if (privateHost.test(host)) return false;
    if (host.endsWith('.localhost') || host.endsWith('.internal') || host.endsWith('.local')) return false;
    if (url.username || url.password) return false;
    return true;
  } catch {
    return false;
  }
}

function attr(info: string, key: string): string | undefined {
  const match = info.match(new RegExp(`${key}="([^"]*)"`, 'i'));
  return match?.[1];
}

export function detectQuality(name: string): M3uQuality {
  if (/\b(uhd|4k)\b/i.test(name)) return 'UHD';
  if (/\bfhd\b/i.test(name)) return 'FHD';
  if (/\bhd\b/i.test(name)) return 'HD';
  return 'SD';
}

export function detectCountry(value: string): string {
  return /\u0443\u0437\u0431\u0435\u043a|o['\u2019\u02bb]?zbek|uzbek|toshkent|tashkent|\buz\b/i.test(value) ? 'UZ' : 'INT';
}

export function cleanChannelName(name: string): string {
  return name
    .replace(/\s*\((orig|original)\)/gi, '')
    .replace(/\s+(uhd|fhd|hd|4k|sd|orig)\b/gi, '')
    .replace(/\s*\+\d+\s*$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isBlocked(value: string): boolean {
  const haystack = value.toLowerCase();
  return blockedTerms.some((term) => haystack.includes(term));
}

export function previewM3u(input: string, maxEntries = 20_000): M3uPreview {
  const lines = input.split(/\r?\n/).map((line) => line.trim());
  const entries: M3uEntry[] = [];
  const rejections: M3uRejection[] = [];
  const groups = new Map<string, number>();
  const fingerprints = new Set<string>();
  let invalid = 0;
  let blocked = 0;
  let duplicates = 0;

  for (let index = 0; index < lines.length && entries.length < maxEntries; index += 1) {
    const info = lines[index];
    if (!info.startsWith('#EXTINF:')) continue;

    const rawName = info.slice(info.indexOf(',') + 1).trim();
    let cursor = index + 1;
    while (cursor < lines.length && (lines[cursor] === '' || lines[cursor].startsWith('#'))) cursor += 1;
    const url = lines[cursor] ?? '';
    const group = attr(info, 'group-title') ?? 'Ungrouped';
    const line = index + 1;

    if (!rawName) {
      invalid += 1;
      rejections.push({ line, name: '(unnamed)', reason: 'missing-name', host: hostOf(url) });
      index = cursor;
      continue;
    }

    if (isBlocked(`${group} ${rawName}`)) {
      blocked += 1;
      rejections.push({ line, name: cleanChannelName(rawName), reason: 'adult', host: hostOf(url) });
      index = cursor;
      continue;
    }

    if (!isSafeStreamUrl(url)) {
      invalid += 1;
      rejections.push({
        line,
        name: cleanChannelName(rawName),
        reason: url && /^https?:/i.test(url) ? 'unsafe-host' : 'invalid-url',
        host: hostOf(url),
      });
      index = cursor;
      continue;
    }

    const tvgId = attr(info, 'tvg-id');
    const quality = detectQuality(rawName);
    const country = detectCountry(`${group} ${rawName}`);
    const shiftMatch = rawName.match(/\+(\d+)\s*$/);
    const timeshift = shiftMatch ? Number(shiftMatch[1]) : undefined;
    const name = cleanChannelName(rawName);
    const key = `${(tvgId ?? name).toLowerCase()}|${quality}|${timeshift ?? 0}`;

    if (fingerprints.has(key)) {
      duplicates += 1;
      rejections.push({ line, name, reason: 'duplicate', host: hostOf(url) });
      index = cursor;
      continue;
    }
    fingerprints.add(key);
    groups.set(group, (groups.get(group) ?? 0) + 1);

    entries.push({
      name,
      rawName,
      url,
      group,
      tvgId,
      tvgName: attr(info, 'tvg-name'),
      tvgLogo: attr(info, 'tvg-logo'),
      quality,
      country,
      language: country === 'UZ' ? 'uz' : 'ru',
      timeshift,
      variant: timeshift ? 'timeshift' : 'original',
      host: hostOf(url),
    });
    index = cursor;
  }

  return {
    total: entries.length + invalid + blocked + duplicates,
    accepted: entries.length,
    invalid,
    duplicates,
    blocked,
    groups: Array.from(groups.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    entries,
    rejections,
  };
}

export function dryRunImport(preview: M3uPreview, existingKeys: string[] = []): DryRunResult {
  const existing = new Set(existingKeys.map((key) => key.toLowerCase()));
  const variants = new Map<string, { qualities: Set<M3uQuality>; timeshift: Set<number> }>();
  let create = 0;
  let update = 0;

  for (const entry of preview.entries) {
    const key = entry.name.toLowerCase();
    if (existing.has(key)) update += 1;
    else create += 1;
    const bucket = variants.get(key) ?? { qualities: new Set<M3uQuality>(), timeshift: new Set<number>() };
    bucket.qualities.add(entry.quality);
    if (entry.timeshift) bucket.timeshift.add(entry.timeshift);
    variants.set(key, bucket);
  }

  return {
    create,
    update,
    unchanged: 0,
    skipped: preview.blocked + preview.invalid + preview.duplicates,
    variants: Array.from(variants.entries()).map(([key, bucket]) => ({
      key,
      qualities: Array.from(bucket.qualities),
      timeshift: Array.from(bucket.timeshift).sort((a, b) => a - b),
    })),
  };
}

/** Safe projection for the admin UI: metadata only, never the stream URL. */
export function toSafePreview(preview: M3uPreview, sample = 40) {
  return {
    total: preview.total,
    accepted: preview.accepted,
    invalid: preview.invalid,
    duplicates: preview.duplicates,
    blocked: preview.blocked,
    groups: preview.groups.slice(0, 12),
    rejections: preview.rejections.slice(0, sample),
    entries: preview.entries.slice(0, sample).map((entry) => ({
      name: entry.name,
      group: entry.group,
      quality: entry.quality,
      country: entry.country,
      language: entry.language,
      timeshift: entry.timeshift ?? null,
      variant: entry.variant,
      tvgId: entry.tvgId ?? null,
      host: entry.host,
    })),
  };
}

export function parseSafeM3u(input: string, maxEntries = 20_000): M3uEntry[] {
  return previewM3u(input, maxEntries).entries;
}
