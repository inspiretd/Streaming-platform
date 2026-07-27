import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { getChannelById, getChannelBySlug } from '@/server/catalog';
import { clientKey, fail, newRequestId, ok, rateLimit } from '@/server/http';
import { addReport, recordAudit } from '@/server/store';

export const dynamic = 'force-dynamic';

const schema = z.object({
  channelId: z.string().min(1).max(80),
  reason: z.enum(['no_signal', 'bad_quality', 'wrong_program', 'audio_issue', 'other']),
  note: z.string().max(400).optional(),
});

export async function POST(request: NextRequest) {
  const requestId = newRequestId();
  if (!rateLimit(clientKey(request, 'reports'), 20)) {
    return fail('rate_limited', 'Too many reports.', requestId, 429);
  }
  const payload = await request.json().catch(() => null);
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return fail('invalid_body', 'Report payload is invalid.', requestId, 422);
  }
  const channel = getChannelById(parsed.data.channelId) ?? getChannelBySlug(parsed.data.channelId);
  if (!channel) {
    return fail('not_found', 'Channel not found.', requestId, 404);
  }
  const record = addReport(channel.id, parsed.data.reason);
  recordAudit('viewer', 'report.created', `${channel.slug}:${parsed.data.reason}`);
  return ok({ id: record.id, acknowledged: true }, requestId, 201);
}
