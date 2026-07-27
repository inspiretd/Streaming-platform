import { NextResponse } from 'next/server';
export async function POST(_: Request, context: { params: { channelId: string } }) { return NextResponse.json({ requestId: crypto.randomUUID(), channelId: context.params.channelId, status: 'auth_required', message: 'Playback is unavailable until a rights-confirmed provider is configured.' }, { status: 403 }); }
