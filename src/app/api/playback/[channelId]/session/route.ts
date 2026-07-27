import type { NextRequest } from 'next/server';
import { resolvePlaybackSession } from '@/lib/playback';
import { getChannelById, getChannelBySlug } from '@/server/catalog';
import { clientKey, fail, newRequestId, rateLimit } from '@/server/http';

export const dynamic = 'force-dynamic';

function lookup(identifier: string) {
  return getChannelById(identifier) ?? getChannelBySlug(identifier);
}

export async function POST(request: NextRequest, context: { params: { channelId: string } }) {
  const requestId = newRequestId();
  if (!rateLimit(clientKey(request, 'playback'), 60)) {
    return fail('rate_limited', 'Too many playback requests. Try again shortly.', requestId, 429);
  }

  const channel = lookup(context.params.channelId);
  const result = resolvePlaybackSession(channel, requestId);
  const status = result.ok ? 200 : result.code === 'not_found' ? 404 : 403;

  return Response.json(result, {
    status,
    headers: { 'x-request-id': requestId, 'cache-control': 'no-store' },
  });
}

export async function GET(request: NextRequest, context: { params: { channelId: string } }) {
  return POST(request, context);
}
