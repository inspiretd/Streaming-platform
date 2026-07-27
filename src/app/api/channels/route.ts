import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { getFacets, getFilteredChannels, getScheduled } from '@/server/catalog';
import { clientKey, fail, newRequestId, ok, rateLimit } from '@/server/http';

export const dynamic = 'force-dynamic';

const querySchema = z.object({
  q: z.string().max(120).optional(),
  category: z.string().max(40).optional(),
  country: z.string().max(8).optional(),
  language: z.string().max(8).optional(),
  quality: z.enum(['SD', 'HD', 'FHD', 'UHD', 'all']).optional(),
  online: z.enum(['true', 'false']).optional(),
  sort: z.enum(['popular', 'az', 'za']).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

export async function GET(request: NextRequest) {
  const requestId = newRequestId();
  if (!rateLimit(clientKey(request, 'channels'), 120)) {
    return fail('rate_limited', 'Too many requests.', requestId, 429);
  }

  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));
  if (!parsed.success) {
    return fail('invalid_query', 'Query parameters are invalid.', requestId, 422);
  }

  const input = parsed.data;
  const channels = getFilteredChannels({
    query: input.q ?? '',
    category: (input.category as never) ?? 'all',
    country: input.country ?? 'all',
    language: input.language ?? 'all',
    quality: (input.quality as never) ?? 'all',
    onlineOnly: input.online === 'true',
    sort: input.sort ?? 'popular',
  });

  const limited = channels.slice(0, input.limit ?? 60);
  return ok(
    {
      total: channels.length,
      facets: getFacets(),
      items: getScheduled(limited),
    },
    requestId,
  );
}
