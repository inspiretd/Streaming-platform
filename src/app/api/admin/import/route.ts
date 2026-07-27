import { NextResponse } from 'next/server';
import { z } from 'zod';
import { parseSafeM3u } from '@/lib/m3u';

const requestSchema = z.object({ content: z.string().max(5_000_000) });

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'Playlist is too large or invalid.' }, { status: 400 });
  const entries = parseSafeM3u(parsed.data.content);
  return NextResponse.json({ total: entries.length, newEntries: entries.length, updated: 0, duplicates: 0, blocked: 0, entries });
}
