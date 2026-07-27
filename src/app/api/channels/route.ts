import { NextResponse } from 'next/server';
import { z } from 'zod';
import { demoChannels } from '@/lib/demo';
import { filterChannels } from '@/lib/channel';
const querySchema = z.object({ q: z.string().max(120).optional(), country: z.string().max(8).optional(), category: z.string().max(40).optional(), language: z.string().max(40).optional(), quality: z.string().max(8).optional(), online: z.coerce.boolean().optional() });
export function GET(request: Request) { const url = new URL(request.url); const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams)); if (!parsed.success) return NextResponse.json({ error: 'Invalid channel filters', requestId: crypto.randomUUID() }, { status: 400 }); const channels = filterChannels(demoChannels, { query: parsed.data.q, country: parsed.data.country, category: parsed.data.category, language: parsed.data.language, quality: parsed.data.quality, online: parsed.data.online }); return NextResponse.json({ data: channels, requestId: crypto.randomUUID() }); }
