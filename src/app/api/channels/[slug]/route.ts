import type { NextRequest } from 'next/server';
import { withSchedule } from '@/lib/epg';
import { getChannelBySlug, getRelated } from '@/server/catalog';
import { clientKey, fail, newRequestId, ok, rateLimit } from '@/server/http';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, context: { params: { slug: string } }) {
  const requestId = newRequestId();
  if (!rateLimit(clientKey(request, 'channel'), 180)) {
    return fail('rate_limited', 'Too many requests.', requestId, 429);
  }
  const channel = getChannelBySlug(context.params.slug);
  if (!channel) {
    return fail('not_found', 'Channel not found.', requestId, 404);
  }
  return ok({ ...withSchedule(channel, new Date(), 6), related: getRelated(channel) }, requestId);
}
