export type Quality = 'SD' | 'HD' | 'FHD' | 'UHD';

export type StreamStatus =
  | 'online'
  | 'degraded'
  | 'offline'
  | 'auth_required'
  | 'geo_blocked'
  | 'unsupported'
  | 'unknown';

export type Tone = 'sand' | 'ember' | 'plum' | 'teal' | 'indigo' | 'moss' | 'rose' | 'slate';

export type Channel = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  category: string;
  country: 'UZ' | 'INT';
  language: string;
  quality: Quality;
  tone: Tone;
  tagline: string;
  description: string;
  status: StreamStatus;
  featured: boolean;
  timeshift: number[];
};

export type Program = {
  id: string;
  channelId: string;
  title: string;
  description: string;
  category: string;
  start: string;
  end: string;
};

export type PlaybackSource = {
  type: 'hls';
  url: string;
  cdn: string;
  lowLatency: boolean;
};

export type PlaybackSession = {
  sessionId: string;
  channelId: string;
  mode: 'demo' | 'provider';
  issuedAt: string;
  expiresAt: string;
  source: PlaybackSource;
  restrictions: { geo: string[]; concurrentStreams: number };
};

export type ApiFailure = {
  requestId: string;
  code: string;
  message: string;
};
