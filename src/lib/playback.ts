export type PlaybackState = 'connecting' | 'live' | 'buffering' | 'reconnecting' | 'offline' | 'geo_blocked' | 'auth_required' | 'expired_source' | 'unsupported_codec' | 'unknown_error';
export type PlaybackSource = { type: 'hls' | 'mp4' | 'official_embed'; url: string; expiresAt?: string };
export type PlaybackEvent = 'play_requested' | 'manifest_loaded' | 'first_frame' | 'buffering_start' | 'buffering_end' | 'error' | 'stop';
export function isExpired(source: PlaybackSource, now = Date.now()): boolean { return Boolean(source.expiresAt && Date.parse(source.expiresAt) <= now); }
