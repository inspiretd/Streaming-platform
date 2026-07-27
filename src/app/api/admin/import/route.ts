import { NextResponse } from 'next/server';
import { z } from 'zod';
import { previewM3u } from '@/lib/m3u';
const schema = z.object({ content: z.string().min(1).max(5_000_000), dryRun: z.boolean().optional() });
export async function POST(request: Request) { const parsed = schema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: 'Invalid or oversized playlist.' }, { status: 400 }); const preview = previewM3u(parsed.data.content); return NextResponse.json({ requestId: crypto.randomUUID(), dryRun: parsed.data.dryRun !== false, ...preview, entries: preview.entries.map(({ url: _url, ...entry }) => entry) }); }
