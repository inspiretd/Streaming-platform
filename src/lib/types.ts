export type CategoryId =
  | 'general'
  | 'news'
  | 'sport'
  | 'movies'
  | 'kids'
  | 'music'
  | 'education'
  | 'regional'
  | 'documentary';

export type ChannelQuality = 'SD' | 'HD' | 'FHD' | 'UHD';

export type TimeshiftVariant = 'orig' | '+2' | '+4' | '+7';

export type StreamStatus =
  | 'online'
  | 'degraded'
  | 'offline'
  | 'auth_required'
  | 'geo_blocked'
  | 'unsupported'
  | 'unknown';

export type PublishState = 'draft' | 'published' | 'blocked';

export type RightsStatus = 'demo_fixture' | 'licensed' | 'pending' | 'expired';

export type Channel = {
  id: string;
  slug: string;
  name: string;
  baseName: string;
  monogram: string;
  accent: string;
  tagline: string;
  description: string;
  category: CategoryId;
  country: string;
  languages: string[];
  quality: ChannelQuality;
  qualities: ChannelQuality[];
  timeshift: TimeshiftVariant[];
  status: StreamStatus;
  state: PublishState;
  featured: boolean;
  provider: string;
  rights: RightsStatus;
  epgId: string;
  sourceKey: string;
  latencyMs: number;
  popularity: number;
};

export type Program = {
  id: string;
  epgId: string;
  title: string;
  description: string;
  genre: string;
  startsAt: string;
  endsAt: string;
};

export type ChannelWithSchedule = {
  channel: Channel;
  now: Program | null;
  next: Program[];
  progress: number;
};

export type PlaybackSourceType = 'hls' | 'mp4' | 'youtube' | 'official_embed';

export type PlaybackSource = {
  type: PlaybackSourceType;
  url: string;
  label: string;
  live: boolean;
  expiresAt: string;
};

export type PlaybackErrorCode =
  | 'not_found'
  | 'unpublished'
  | 'rights_unconfirmed'
  | 'auth_required'
  | 'geo_blocked'
  | 'provider_unavailable'
  | 'rate_limited'
  | 'unsupported';

export type PlaybackSessionOk = {
  ok: true;
  requestId: string;
  channelId: string;
  source: PlaybackSource;
  policy: { allowPictureInPicture: boolean; allowDownload: boolean; provider: string; notice: string };
};

export type PlaybackSessionError = {
  ok: false;
  requestId: string;
  code: PlaybackErrorCode;
  message: string;
};

export type PlaybackSessionResult = PlaybackSessionOk | PlaybackSessionError;

export type CatalogFilters = {
  query: string;
  category: CategoryId | 'all';
  country: string;
  language: string;
  quality: ChannelQuality | 'all';
  onlineOnly: boolean;
  withEpgOnly: boolean;
  sort: 'popular' | 'az' | 'za';
};

export type ApiEnvelope<T> = { ok: true; requestId: string; data: T } | { ok: false; requestId: string; error: { code: string; message: string } };
