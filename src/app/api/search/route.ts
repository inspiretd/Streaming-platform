import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { searchChannels } from '@/lib/channel';
import { getChannels } from '@/server/catalog';
import { clientKey, fail, newRequestId, ok, rateLimit } from '@/server/http';

export const dynamic = 'force-dynamic';

const schema = z.object({ q: z.string().max(120).optional(), limit: z.coerce.number().int().min(1).max(50).optional() });

export async function GET(request: NextRequest) {
  const requestId = newRequestId();
  if (!rateLimit(clientKey(request, 'search'), 180)) {
    return fail('rate_limited', 'Too many requests.', requestId, 429);
  }
  const parsed = schema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));
  if (!parsed.success) {
    return fail('invalid_query', 'Query parameters are invalid.', requestId, 422);
  }
  const query = parsed.data.q ?? '';
  const items = searchChannels(getChannels(), query, parsed.data.limit ?? 12).map((channel) => ({
    id: channel.id,
    slug: channel.slug,
    name: channel.name,
    monogram: channel.monogram,
    accent: channel.accent,
    category: channel.category,
    country: channel.country,
    quality: channel.quality,
    status: channel.status,
  }));
  return ok({ query, items }, requestId);
}
