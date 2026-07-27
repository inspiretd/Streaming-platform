import { NextResponse } from 'next/server';
export async function POST(_: Request, context: { params: { channelId: string } }) { return NextResponse.json({ error: 'Playback unavailable', code: 'RIGHTS_REQUIRED', detail: `Channel ${context.params.channelId} has no rights-confirmed provider session.`, requestId: crypto.randomUUID() }, { status: 403 }); }
