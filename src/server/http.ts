import { NextResponse } from 'next/server';
import type { ApiEnvelope } from '@/lib/types';

export function newRequestId(): string {
  const cryptoRef = globalThis.crypto;
  if (cryptoRef && typeof cryptoRef.randomUUID === 'function') return cryptoRef.randomUUID();
  return `req_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export function ok<T>(data: T, requestId: string, status = 200): NextResponse {
  const body: ApiEnvelope<T> = { ok: true, requestId, data };
  return NextResponse.json(body, {
    status,
    headers: { 'x-request-id': requestId, 'cache-control': 'no-store' },
  });
}

export function fail(code: string, message: string, requestId: string, status = 400): NextResponse {
  const body: ApiEnvelope<never> = { ok: false, requestId, error: { code, message } };
  return NextResponse.json(body, {
    status,
    headers: { 'x-request-id': requestId, 'cache-control': 'no-store' },
  });
}

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit = 60, windowMs = 60000): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

export function clientKey(request: Request, scope: string): string {
  const forwarded = request.headers.get('x-forwarded-for') ?? 'local';
  return `${scope}:${forwarded.split(',')[0].trim()}`;
}

export function isAdminAuthorized(request: Request): boolean {
  const expected = process.env.ADMIN_API_TOKEN;
  if (!expected || expected.length === 0) return true;
  return request.headers.get('x-admin-token') === expected;
}
