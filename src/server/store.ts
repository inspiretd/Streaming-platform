import type { Channel } from '@/lib/types';
import { demoChannels } from '@/lib/demo';

export type AuditEntry = { id: string; at: string; actor: string; action: string; detail: string };

export type ImportRecord = {
  id: string;
  at: string;
  mode: 'preview' | 'dry-run' | 'execute';
  accepted: number;
  rejected: number;
  duplicates: number;
  status: 'completed' | 'rolled_back';
};

export type ReportRecord = { id: string; channelId: string; reason: string; at: string };

type Store = {
  imported: Channel[];
  audit: AuditEntry[];
  imports: ImportRecord[];
  reports: ReportRecord[];
};

const globalRef = globalThis as typeof globalThis & { __tomoshaStore?: Store };

function store(): Store {
  if (!globalRef.__tomoshaStore) {
    globalRef.__tomoshaStore = { imported: [], audit: [], imports: [], reports: [] };
  }
  return globalRef.__tomoshaStore;
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function allChannels(): Channel[] {
  return [...demoChannels, ...store().imported];
}

export function importedChannels(): Channel[] {
  return store().imported;
}

export function addImportedChannels(channels: Channel[]): number {
  const existing = new Set(allChannels().map((channel) => channel.slug));
  let added = 0;
  for (const channel of channels) {
    if (existing.has(channel.slug)) continue;
    store().imported.push(channel);
    existing.add(channel.slug);
    added += 1;
  }
  return added;
}

export function rollbackImports(): number {
  const removed = store().imported.length;
  store().imported = [];
  const record = store().imports[0];
  if (record) record.status = 'rolled_back';
  return removed;
}

export function recordImport(entry: Omit<ImportRecord, 'id' | 'at'>): ImportRecord {
  const record: ImportRecord = { id: makeId('imp'), at: new Date().toISOString(), ...entry };
  store().imports.unshift(record);
  store().imports = store().imports.slice(0, 40);
  return record;
}

export function recordAudit(actor: string, action: string, detail: string): void {
  store().audit.unshift({ id: makeId('aud'), at: new Date().toISOString(), actor, action, detail });
  store().audit = store().audit.slice(0, 80);
}

export function auditLog(): AuditEntry[] {
  return store().audit;
}

export function importHistory(): ImportRecord[] {
  return store().imports;
}

export function addReport(channelId: string, reason: string): ReportRecord {
  const record: ReportRecord = { id: makeId('rep'), channelId, reason, at: new Date().toISOString() };
  store().reports.unshift(record);
  store().reports = store().reports.slice(0, 60);
  return record;
}

export function reportList(): ReportRecord[] {
  return store().reports;
}
