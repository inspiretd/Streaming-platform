-- TOMOSHA core schema
-- Versioned migration. Safe to re-run: every object uses IF NOT EXISTS.

create extension if not exists "pgcrypto";

create type public.publish_state as enum ('draft', 'published', 'blocked');
create type public.rights_status as enum ('demo_fixture', 'licensed', 'pending', 'expired');
create type public.stream_status as enum ('online', 'degraded', 'offline', 'auth_required', 'geo_blocked', 'unsupported', 'unknown');
create type public.channel_quality as enum ('SD', 'HD', 'FHD', 'UHD');
create type public.import_mode as enum ('preview', 'dry_run', 'execute', 'rollback');
create type public.user_role as enum ('user', 'editor', 'provider_manager', 'admin', 'super_admin');

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  locale text not null default 'uz',
  role public.user_role not null default 'user',
  autoplay boolean not null default true,
  reduced_data boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id text primary key,
  label_uz text not null,
  label_ru text not null,
  label_en text not null,
  sort_order integer not null default 0
);

create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  adapter text not null default 'static_m3u',
  enabled boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_rights (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers (id) on delete cascade,
  rights_type text not null,
  territories text[] not null default '{}',
  starts_on date,
  ends_on date,
  document_reference text,
  status public.rights_status not null default 'pending',
  admin_notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references public.providers (id) on delete set null,
  external_id text,
  slug text not null unique,
  name text not null,
  base_name text not null,
  description text,
  category_id text references public.categories (id) on delete set null,
  country char(2) not null default 'XX',
  languages text[] not null default '{}',
  quality public.channel_quality not null default 'SD',
  state public.publish_state not null default 'draft',
  rights public.rights_status not null default 'pending',
  status public.stream_status not null default 'unknown',
  featured boolean not null default false,
  popularity integer not null default 0,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider_id, external_id)
);

create index if not exists channels_state_idx on public.channels (state);
create index if not exists channels_country_idx on public.channels (country);
create index if not exists channels_category_idx on public.channels (category_id);

create table if not exists public.channel_variants (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.channels (id) on delete cascade,
  quality public.channel_quality not null,
  timeshift text not null default 'orig',
  label text,
  created_at timestamptz not null default now(),
  unique (channel_id, quality, timeshift)
);

-- Stream locations are stored server side only and are never exposed to clients.
create table if not exists public.playback_sources (
  id uuid primary key default gen_random_uuid(),
  channel_variant_id uuid not null references public.channel_variants (id) on delete cascade,
  source_type text not null default 'hls',
  url_fingerprint text not null,
  host text not null,
  secret_ref text,
  expires_at timestamptz,
  is_fallback boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists playback_sources_host_idx on public.playback_sources (host);

create table if not exists public.stream_health_checks (
  id bigserial primary key,
  channel_id uuid not null references public.channels (id) on delete cascade,
  status public.stream_status not null,
  latency_ms integer not null default 0,
  error_code text,
  checked_at timestamptz not null default now()
);

create index if not exists stream_health_checked_idx on public.stream_health_checks (channel_id, checked_at desc);

create table if not exists public.epg_channels (
  id uuid primary key default gen_random_uuid(),
  tvg_id text not null unique,
  display_name text not null,
  source text not null default 'xmltv'
);

create table if not exists public.epg_programs (
  id bigserial primary key,
  epg_channel_id uuid not null references public.epg_channels (id) on delete cascade,
  title text not null,
  description text,
  genre text,
  starts_at timestamptz not null,
  ends_at timestamptz not null
);

create index if not exists epg_programs_window_idx on public.epg_programs (epg_channel_id, starts_at, ends_at);

create table if not exists public.channel_epg_mappings (
  channel_id uuid not null references public.channels (id) on delete cascade,
  epg_channel_id uuid not null references public.epg_channels (id) on delete cascade,
  confidence numeric(4, 3) not null default 1.0,
  confirmed_by uuid references public.profiles (id) on delete set null,
  primary key (channel_id, epg_channel_id)
);

create table if not exists public.favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  channel_id uuid not null references public.channels (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, channel_id)
);

create table if not exists public.watch_history (
  id bigserial primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  channel_id uuid not null references public.channels (id) on delete cascade,
  watched_at timestamptz not null default now(),
  seconds_watched integer not null default 0,
  unique (user_id, channel_id)
);

create table if not exists public.playback_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  channel_id uuid not null references public.channels (id) on delete cascade,
  request_id text not null,
  granted boolean not null,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  channel_id uuid not null references public.channels (id) on delete cascade,
  reason text not null,
  note text,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.imports (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references public.providers (id) on delete set null,
  actor_id uuid references public.profiles (id) on delete set null,
  mode public.import_mode not null,
  total_entries integer not null default 0,
  accepted integer not null default 0,
  duplicates integer not null default 0,
  rejected integer not null default 0,
  rolled_back boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.import_items (
  id bigserial primary key,
  import_id uuid not null references public.imports (id) on delete cascade,
  display_name text not null,
  group_title text,
  country char(2),
  quality public.channel_quality,
  url_fingerprint text,
  accepted boolean not null default false,
  reject_reason text
);

create index if not exists import_items_import_idx on public.import_items (import_id);

create table if not exists public.audit_logs (
  id bigserial primary key,
  actor_id uuid references public.profiles (id) on delete set null,
  actor_role public.user_role,
  action text not null,
  detail text,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_created_idx on public.audit_logs (created_at desc);
