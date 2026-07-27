-- Minimal seed data. No stream URL, token or account identifier is stored here.

insert into public.categories (id, label_uz, label_ru, label_en, sort_order) values
  ('general', 'Umumiy', 'Общие', 'General', 1),
  ('news', 'Yangiliklar', 'Новости', 'News', 2),
  ('sport', 'Sport', 'Спорт', 'Sport', 3),
  ('movies', 'Kino', 'Кино', 'Movies', 4),
  ('kids', 'Bolalar', 'Детские', 'Kids', 5),
  ('music', 'Musiqa', 'Музыка', 'Music', 6),
  ('education', 'Talim', 'Образование', 'Education', 7),
  ('regional', 'Hududiy', 'Региональные', 'Regional', 8),
  ('documentary', 'Hujjatli', 'Документальные', 'Documentary', 9)
on conflict (id) do nothing;

insert into public.providers (slug, name, adapter, enabled, notes) values
  ('tomosha-demo', 'TOMOSHA Demo Provider', 'static_m3u', true, 'Public test manifests used for demonstration only')
on conflict (slug) do nothing;
