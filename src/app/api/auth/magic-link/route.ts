import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { clientKey, fail, newRequestId, ok, rateLimit } from '@/server/http';

export const dynamic = 'force-dynamic';

const schema = z.object({ email: z.string().email().max(160) });

/**
 * Requests a Supabase GoTrue magic link. Keys stay server side and the response
 * never reveals whether the address is already registered.
 */
export async function POST(request: NextRequest) {
  const requestId = newRequestId();
  if (!rateLimit(clientKey(request, 'auth'), 8, 300000)) {
    return fail('rate_limited', 'Too many sign in attempts. Try again in a few minutes.', requestId, 429);
  }

  const payload = await request.json().catch(() => null);
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return fail('invalid_email', 'Enter a valid email address.', requestId, 422);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return fail(
      'auth_not_configured',
      'Sign in is not enabled in this environment. Configure Supabase credentials to activate magic links.',
      requestId,
      503,
    );
  }

  try {
    const response = await fetch(`${url}/auth/v1/otp`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', apikey: anonKey },
      body: JSON.stringify({ email: parsed.data.email, create_user: true }),
    });
    if (!response.ok) {
      return fail('auth_unavailable', 'The sign in service rejected the request.', requestId, 502);
    }
    return ok({ sent: true }, requestId);
  } catch {
    return fail('auth_unavailable', 'The sign in service is unreachable.', requestId, 502);
  }
}
