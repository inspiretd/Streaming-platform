import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { buildSchedule, tashkentDayKey } from '@/lib/epg';
import { getChannels } from '@/server/catalog';
import { clientKey, fail, newRequestId, ok, rateLimit } from '@/server/http';

export const dynamic = 'force-dynamic';

const schema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  limit: z.coerce.number().int().min(1).max(60).optional(),
});

export async function GET(request: NextRequest) {
  const requestId = newRequestId();
  if (!rateLimit(clientKey(request, 'epg'), 120)) {
    return fail('rate_limited', 'Too many requests.', requestId, 429);
  }
  const parsed = schema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));
  if (!parsed.success) {
    return fail('invalid_query', 'Query parameters are invalid.', requestId, 422);
  }
  const dayKey = parsed.data.date ?? tashkentDayKey(new Date());
  const channels = getChannels()
    .filter((channel) => channel.state === 'published')
    .slice(0, parsed.data.limit ?? 24);
  return ok(
    {
      dayKey,
      timezone: 'Asia/Tashkent',
      rows: channels.map((channel) => ({ channel, programs: buildSchedule(channel, dayKey) })),
    },
    requestId,
  );
}
