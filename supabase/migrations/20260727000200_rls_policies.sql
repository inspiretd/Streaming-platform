-- Row level security for every user owned table.

alter table public.profiles enable row level security;
alter table public.favorites enable row level security;
alter table public.watch_history enable row level security;
alter table public.user_reports enable row level security;
alter table public.playback_sessions enable row level security;
alter table public.channels enable row level security;
alter table public.categories enable row level security;
alter table public.epg_channels enable row level security;
alter table public.epg_programs enable row level security;
alter table public.providers enable row level security;
alter table public.playback_sources enable row level security;
alter table public.imports enable row level security;
alter table public.import_items enable row level security;
alter table public.audit_logs enable row level security;

-- Profiles: a user can only see and edit their own row.
create policy profiles_select_own on public.profiles for select using (auth.uid() = id);
create policy profiles_update_own on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy profiles_insert_own on public.profiles for insert with check (auth.uid() = id);

-- Favorites and history are strictly per user.
create policy favorites_rw_own on public.favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy history_rw_own on public.watch_history for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy reports_insert_own on public.user_reports for insert with check (auth.uid() = user_id or user_id is null);
create policy reports_select_own on public.user_reports for select using (auth.uid() = user_id);
create policy sessions_select_own on public.playback_sessions for select using (auth.uid() = user_id);

-- Public catalog data is readable by anyone but only published rows are exposed.
create policy channels_public_read on public.channels for select using (state = 'published');
create policy categories_public_read on public.categories for select using (true);
create policy epg_channels_public_read on public.epg_channels for select using (true);
create policy epg_programs_public_read on public.epg_programs for select using (true);

-- Operational tables stay closed to anon and authenticated roles.
-- Access happens through the service role in server side code only.
