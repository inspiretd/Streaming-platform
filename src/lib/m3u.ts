import type { ChannelQuality, TimeshiftVariant } from './types';
import { extractQuality, extractTimeshift, normalizeApostrophes, normalizeSearchValue } from './channel';
import { fingerprintUrl, inspectStreamUrl, redactUrl } from './url-safety';

export const MAX_PLAYLIST_BYTES = 5 * 1024 * 1024;
export const MAX_ENTRIES = 20000;

const ADULT_PATTERNS = [
  /\badult\b/i,
  /\b18\s*\+/,
  /\bxxx\b/i,
  /porn/i,
  /\bsex\b/i,
  /erotic/i,
  /\u044d\u0440\u043e\u0442\u0438\u043a/i,
  /\u0432\u0437\u0440\u043e\u0441\u043b/i,
];

const UZ_GROUP_PATTERNS = [
  /\u0443\u0437\u0431\u0435\u043a/i,
  /o['\u02bb\u2018\u2019]?zbek/i,
  /uzbek/i,
  /\buz\b/i,
];

export type RejectReason =
  | 'adult'
  | 'missing_url'
  | 'empty_name'
  | 'invalid_url'
  | 'unsupported_scheme'
  | 'insecure_scheme'
  | 'private_host'
  | 'credentials_in_url'
  | 'blocked_port'
  | 'duplicate'
  | 'limit_exceeded';

export type ParsedEntry = {
  index: number;
  name: string;
  baseName: string;
  group: string;
  tvgId: string;
  tvgName: string;
  tvgLogo: string;
  catchup: string;
  quality: ChannelQuality;
  timeshift: TimeshiftVariant;
  country: string;
  url: string;
  host: string;
  fingerprint: string;
};

export type RejectedEntry = { index: number; name: string; group: string; reason: RejectReason };

export type ChannelVariantPreview = {
  key: string;
  baseName: string;
  country: string;
  group: string;
  tvgId: string;
  variants: { quality: ChannelQuality; timeshift: TimeshiftVariant; host: string; redactedUrl: string }[];
};

export type ImportTotals = {
  lines: number;
  parsed: number;
  accepted: number;
  channels: number;
  duplicates: number;
  rejectedAdult: number;
  rejectedInvalid: number;
  uzbek: number;
};

export type ImportPreview = {
  totals: ImportTotals;
  channels: ChannelVariantPreview[];
  rejected: RejectedEntry[];
  groups: { name: string; count: number }[];
  warnings: string[];
};

export function isAdultLabel(value: string): boolean {
  return ADULT_PATTERNS.some((pattern) => pattern.test(value));
}

export function isUzbekGroup(value: string): boolean {
  return UZ_GROUP_PATTERNS.some((pattern) => pattern.test(value));
}

export function parseAttributes(line: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const pattern = /([a-zA-Z0-9_-]+)="([^"]*)"/g;
  let match = pattern.exec(line);
  while (match !== null) {
    attributes[match[1].toLowerCase()] = match[2];
    match = pattern.exec(line);
  }
  return attributes;
}

export function parseDisplayName(line: string): string {
  const commaIndex = line.lastIndexOf(',');
  if (commaIndex === -1) return '';
  return normalizeApostrophes(line.slice(commaIndex + 1)).trim();
}

export function detectCountry(group: string, name: string): string {
  if (isUzbekGroup(group) || isUzbekGroup(name)) return 'UZ';
  return 'XX';
}

export function parseM3u(
  content: string,
  options: { allowHttp?: boolean } = {},
): { entries: ParsedEntry[]; rejected: RejectedEntry[]; lines: number } {
  const lines = content.split(/\r?\n/);
  const entries: ParsedEntry[] = [];
  const rejected: RejectedEntry[] = [];
  let pending: { name: string; attributes: Record<string, string> } | null = null;
  let index = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.length === 0) continue;
    if (line.startsWith('#EXTM3U')) continue;
    if (line.startsWith('#EXTINF')) {
      if (pending !== null) {
        rejected.push({ index, name: pending.name, group: pending.attributes['group-title'] ?? '', reason: 'missing_url' });
      }
      index += 1;
      pending = { name: parseDisplayName(line), attributes: parseAttributes(line) };
      continue;
    }
    if (line.startsWith('#')) continue;
    if (pending === null) continue;

    const current = pending;
    pending = null;

    if (entries.length >= MAX_ENTRIES) {
      rejected.push({ index, name: current.name, group: current.attributes['group-title'] ?? '', reason: 'limit_exceeded' });
      continue;
    }

    const group = normalizeApostrophes(current.attributes['group-title'] ?? '').trim();
    const tvgName = normalizeApostrophes(current.attributes['tvg-name'] ?? '').trim();
    const displayName = current.name.length > 0 ? current.name : tvgName;

    if (displayName.length === 0) {
      rejected.push({ index, name: '(unnamed)', group, reason: 'empty_name' });
      continue;
    }
    if (isAdultLabel(group) || isAdultLabel(displayName)) {
      rejected.push({ index, name: displayName, group, reason: 'adult' });
      continue;
    }

    const verdict = inspectStreamUrl(line, { allowHttp: options.allowHttp });
    if (!verdict.safe) {
      rejected.push({ index, name: displayName, group, reason: verdict.reason });
      continue;
    }

    const timeshiftResult = extractTimeshift(displayName);
    const qualityResult = extractQuality(timeshiftResult.baseName);

    entries.push({
      index,
      name: displayName,
      baseName: qualityResult.baseName,
      group,
      tvgId: (current.attributes['tvg-id'] ?? '').trim(),
      tvgName,
      tvgLogo: (current.attributes['tvg-logo'] ?? '').trim(),
      catchup: (current.attributes.catchup ?? current.attributes['catchup-type'] ?? '').trim(),
      quality: qualityResult.quality,
      timeshift: timeshiftResult.timeshift,
      country: detectCountry(group, displayName),
      url: verdict.url,
      host: verdict.host,
      fingerprint: fingerprintUrl(verdict.url),
    });
  }

  if (pending !== null) {
    rejected.push({ index, name: pending.name, group: pending.attributes['group-title'] ?? '', reason: 'missing_url' });
  }

  return { entries, rejected, lines: lines.length };
}

export function dedupeKey(entry: ParsedEntry): string {
  if (entry.tvgId.length > 0) return `tvg:${normalizeSearchValue(entry.tvgId)}`;
  const base = normalizeSearchValue(entry.baseName);
  if (base.length > 0) return `name:${base}|${entry.country}|${entry.quality}|${entry.timeshift}`;
  return `url:${entry.fingerprint}`;
}

export function buildImportPreview(content: string, options: { allowHttp?: boolean } = {}): ImportPreview {
  const warnings: string[] = [];
  if (!content.trimStart().startsWith('#EXTM3U')) {
    warnings.push('Playlist does not start with #EXTM3U. Parsing continued in tolerant mode.');
  }
  if (content.length > MAX_PLAYLIST_BYTES) {
    warnings.push('Playlist exceeds the 5 MB safety limit and was truncated for preview.');
  }

  const source = content.length > MAX_PLAYLIST_BYTES ? content.slice(0, MAX_PLAYLIST_BYTES) : content;
  const parsed = parseM3u(source, options);

  const seenKeys = new Set<string>();
  const seenUrls = new Set<string>();
  const accepted: ParsedEntry[] = [];
  const duplicates: RejectedEntry[] = [];

  for (const entry of parsed.entries) {
    const key = dedupeKey(entry);
    if (seenKeys.has(key) || seenUrls.has(entry.fingerprint)) {
      duplicates.push({ index: entry.index, name: entry.name, group: entry.group, reason: 'duplicate' });
      continue;
    }
    seenKeys.add(key);
    seenUrls.add(entry.fingerprint);
    accepted.push(entry);
  }

  const grouped = new Map<string, ChannelVariantPreview>();
  for (const entry of accepted) {
    const key = `${normalizeSearchValue(entry.baseName)}|${entry.country}`;
    const variant = {
      quality: entry.quality,
      timeshift: entry.timeshift,
      host: entry.host,
      redactedUrl: redactUrl(entry.url),
    };
    const existing = grouped.get(key);
    if (existing) {
      existing.variants.push(variant);
      continue;
    }
    grouped.set(key, {
      key,
      baseName: entry.baseName,
      country: entry.country,
      group: entry.group,
      tvgId: entry.tvgId,
      variants: [variant],
    });
  }

  const groupCounts = new Map<string, number>();
  for (const entry of accepted) {
    const label = entry.group.length > 0 ? entry.group : 'Ungrouped';
    groupCounts.set(label, (groupCounts.get(label) ?? 0) + 1);
  }

  const channels = Array.from(grouped.values()).sort((a, b) => a.baseName.localeCompare(b.baseName));
  const rejectedAdult = parsed.rejected.filter((item) => item.reason === 'adult').length;

  return {
    totals: {
      lines: parsed.lines,
      parsed: parsed.entries.length + parsed.rejected.length,
      accepted: accepted.length,
      channels: channels.length,
      duplicates: duplicates.length,
      rejectedAdult,
      rejectedInvalid: parsed.rejected.length - rejectedAdult,
      uzbek: accepted.filter((entry) => entry.country === 'UZ').length,
    },
    channels,
    rejected: [...parsed.rejected, ...duplicates].slice(0, 200),
    groups: Array.from(groupCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 40),
    warnings,
  };
}
