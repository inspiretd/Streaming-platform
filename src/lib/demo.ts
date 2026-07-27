import type { CategoryId, Channel, ChannelQuality, StreamStatus } from './types';
import { monogramOf, slugify } from './channel';

type Seed = {
  name: string;
  category: CategoryId;
  country: string;
  languages: string[];
  quality: ChannelQuality;
  tagline: string;
  status?: StreamStatus;
  featured?: boolean;
};

const ACCENTS = [
  'linear-gradient(145deg,#1d2733,#0d1116)',
  'linear-gradient(145deg,#2a1f10,#120d07)',
  'linear-gradient(145deg,#122a22,#08120f)',
  'linear-gradient(145deg,#26161f,#120a0e)',
  'linear-gradient(145deg,#1a2233,#0b0f17)',
  'linear-gradient(145deg,#2b2412,#13100a)',
];

const SEEDS: Seed[] = [
  { name: 'Oʻzbekiston 24 HD', category: 'news', country: 'UZ', languages: ['uz', 'ru'], quality: 'HD', tagline: 'Round the clock national news desk', status: 'online', featured: true },
  { name: 'Yoshlar FHD', category: 'general', country: 'UZ', languages: ['uz'], quality: 'FHD', tagline: 'Youth culture, talk shows and music', status: 'online' },
  { name: 'Madaniyat va Maʼrifat HD', category: 'education', country: 'UZ', languages: ['uz'], quality: 'HD', tagline: 'Culture, heritage and learning', status: 'online' },
  { name: 'Sport UZ FHD', category: 'sport', country: 'UZ', languages: ['uz'], quality: 'FHD', tagline: 'National league and live tournaments', status: 'online', featured: true },
  { name: 'Bolajon HD', category: 'kids', country: 'UZ', languages: ['uz'], quality: 'HD', tagline: 'Safe cartoons and learning for kids', status: 'online' },
  { name: 'Navo Music HD', category: 'music', country: 'UZ', languages: ['uz'], quality: 'HD', tagline: 'Uzbek and regional music rotation', status: 'online' },
  { name: 'Diyor Regional', category: 'regional', country: 'UZ', languages: ['uz'], quality: 'SD', tagline: 'Regional studios across the country', status: 'degraded' },
  { name: 'Toshkent HD', category: 'general', country: 'UZ', languages: ['uz', 'ru'], quality: 'HD', tagline: 'Capital city magazine channel', status: 'online' },
  { name: 'Dunyo Boʻylab HD', category: 'documentary', country: 'UZ', languages: ['uz'], quality: 'HD', tagline: 'Travel and nature documentaries', status: 'online' },
  { name: 'Kinoteatr UZ FHD', category: 'movies', country: 'UZ', languages: ['uz'], quality: 'FHD', tagline: 'Licensed feature films every evening', status: 'online', featured: true },
  { name: 'Mahalla TV', category: 'regional', country: 'UZ', languages: ['uz'], quality: 'SD', tagline: 'Neighbourhood stories and services', status: 'offline' },
  { name: 'Ilm Yoʻli HD', category: 'education', country: 'UZ', languages: ['uz'], quality: 'HD', tagline: 'Courses, languages and exam prep', status: 'online' },
  { name: 'Milliy TV HD', category: 'general', country: 'UZ', languages: ['uz'], quality: 'HD', tagline: 'National entertainment and drama', status: 'online' },
  { name: 'UZ Report News', category: 'news', country: 'UZ', languages: ['uz', 'ru', 'en'], quality: 'SD', tagline: 'Business and market bulletins', status: 'degraded' },
  { name: 'Central Asia News HD', category: 'news', country: 'KZ', languages: ['ru', 'en'], quality: 'HD', tagline: 'Regional coverage from Central Asia', status: 'online' },
  { name: 'Almaty Sport HD', category: 'sport', country: 'KZ', languages: ['ru'], quality: 'HD', tagline: 'Kazakh league and winter sport', status: 'online' },
  { name: 'Bishkek Culture', category: 'documentary', country: 'KG', languages: ['ru'], quality: 'SD', tagline: 'Documentary strand from Kyrgyzstan', status: 'unknown' },
  { name: 'Dushanbe Music HD', category: 'music', country: 'TJ', languages: ['tg', 'ru'], quality: 'HD', tagline: 'Tajik music and live sessions', status: 'online' },
  { name: 'Baku Movies FHD', category: 'movies', country: 'AZ', languages: ['az'], quality: 'FHD', tagline: 'Feature films from the Caucasus', status: 'online' },
  { name: 'Istanbul Kids HD', category: 'kids', country: 'TR', languages: ['tr'], quality: 'HD', tagline: 'Animation block for young viewers', status: 'online' },
  { name: 'Anadolu Sport UHD', category: 'sport', country: 'TR', languages: ['tr'], quality: 'UHD', tagline: 'Ultra high definition sport events', status: 'online' },
  { name: 'Euro Docs HD', category: 'documentary', country: 'DE', languages: ['de', 'en'], quality: 'HD', tagline: 'European documentary showcase', status: 'online' },
  { name: 'Global News 24 HD', category: 'news', country: 'GB', languages: ['en'], quality: 'HD', tagline: 'International rolling news', status: 'online', featured: true },
  { name: 'Cinema Classics FHD', category: 'movies', country: 'US', languages: ['en'], quality: 'FHD', tagline: 'Restored classics, curated nightly', status: 'online' },
  { name: 'Discovery Lab HD', category: 'education', country: 'US', languages: ['en'], quality: 'HD', tagline: 'Science, engineering and space', status: 'online' },
  { name: 'Rhythm Nation UHD', category: 'music', country: 'US', languages: ['en'], quality: 'UHD', tagline: 'Concert films and music video', status: 'degraded' },
  { name: 'Family Zone HD', category: 'general', country: 'AE', languages: ['ar', 'en'], quality: 'HD', tagline: 'Family entertainment around the clock', status: 'online' },
  { name: 'Arena Live UHD', category: 'sport', country: 'ES', languages: ['es'], quality: 'UHD', tagline: 'Premium live sport in UHD', status: 'auth_required' },
];

function qualitiesFor(quality: ChannelQuality): ChannelQuality[] {
  if (quality === 'UHD') return ['HD', 'FHD', 'UHD'];
  if (quality === 'FHD') return ['HD', 'FHD'];
  return [quality];
}

function buildChannel(seed: Seed, index: number): Channel {
  const slug = slugify(seed.name);
  const baseName = seed.name.replace(/\s+(HD|FHD|UHD|SD)$/i, '').trim();
  return {
    id: `ch_${String(index + 1).padStart(3, '0')}`,
    slug,
    name: seed.name,
    baseName,
    monogram: monogramOf(baseName),
    accent: ACCENTS[index % ACCENTS.length],
    tagline: seed.tagline,
    description: `${baseName} is part of the TOMOSHA demonstration catalog. Metadata, schedule and playback come from safe demo fixtures until a licensed provider is connected.`,
    category: seed.category,
    country: seed.country,
    languages: seed.languages,
    quality: seed.quality,
    qualities: qualitiesFor(seed.quality),
    timeshift: index % 5 === 0 ? ['orig', '+2'] : ['orig'],
    status: seed.status ?? 'unknown',
    state: 'published',
    featured: seed.featured ?? false,
    provider: 'TOMOSHA Demo Provider',
    rights: 'demo_fixture',
    epgId: `${slug}.tomosha`,
    sourceKey: index % 2 === 0 ? 'demo-primary' : 'demo-secondary',
    latencyMs: 120 + ((index * 37) % 480),
    popularity: 100 - index * 2,
  };
}

export const demoChannels: Channel[] = SEEDS.map(buildChannel);

export const categoryLabels: Record<CategoryId, string> = {
  general: 'General',
  news: 'News',
  sport: 'Sport',
  movies: 'Movies',
  kids: 'Kids',
  music: 'Music',
  education: 'Education',
  regional: 'Regional',
  documentary: 'Documentary',
};

export const countryLabels: Record<string, string> = {
  UZ: 'Uzbekistan',
  KZ: 'Kazakhstan',
  KG: 'Kyrgyzstan',
  TJ: 'Tajikistan',
  AZ: 'Azerbaijan',
  TR: 'Turkiye',
  DE: 'Germany',
  GB: 'United Kingdom',
  US: 'United States',
  AE: 'United Arab Emirates',
  ES: 'Spain',
  XX: 'Unmapped',
};

export const languageLabels: Record<string, string> = {
  uz: 'Uzbek',
  ru: 'Russian',
  en: 'English',
  tr: 'Turkish',
  de: 'German',
  es: 'Spanish',
  ar: 'Arabic',
  az: 'Azerbaijani',
  tg: 'Tajik',
};
