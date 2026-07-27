import type { Channel } from './types';

export const categories = [
  'News',
  'General',
  'Sport',
  'Kids',
  'Music',
  'Film',
  'Documentary',
  'Education',
  'Regional',
] as const;

/**
 * Safe demo fixtures. No provider URL, token, cookie or account id lives here.
 * Playback sources are resolved server-side only, in src/lib/playback.ts.
 */
export const demoChannels: Channel[] = [
  { id: 'toshkent', slug: 'toshkent', name: 'Toshkent', shortName: 'TK', category: 'General', country: 'UZ', language: 'uz', quality: 'FHD', tone: 'sand', tagline: 'Shahar ritmi', description: 'The pulse of the capital: mornings, culture and the long evening talk shows.', status: 'online', featured: true, timeshift: [2, 4] },
  { id: 'uzbekistan-24', slug: 'uzbekistan-24', name: 'O\u2018zbekiston 24', shortName: '24', category: 'News', country: 'UZ', language: 'uz', quality: 'FHD', tone: 'indigo', tagline: 'Rolling news', description: 'Round the clock national and regional reporting.', status: 'online', featured: true, timeshift: [2] },
  { id: 'sport-uz', slug: 'sport-uz', name: 'Sport', shortName: 'SP', category: 'Sport', country: 'UZ', language: 'uz', quality: 'UHD', tone: 'teal', tagline: 'Live arena', description: 'League football, kurash and every national fixture.', status: 'online', featured: true, timeshift: [2, 4, 7] },
  { id: 'futbol-tv', slug: 'futbol-tv', name: 'Futbol TV', shortName: 'FT', category: 'Sport', country: 'UZ', language: 'uz', quality: 'FHD', tone: 'moss', tagline: 'Matchday', description: 'Full match coverage with studio analysis.', status: 'degraded', featured: false, timeshift: [2] },
  { id: 'madaniyat', slug: 'madaniyat', name: 'Madaniyat va Ma\u2019rifat', shortName: 'MM', category: 'Education', country: 'UZ', language: 'uz', quality: 'HD', tone: 'plum', tagline: 'Ochiq kitob', description: 'Literature, theatre and the slow craft of learning.', status: 'online', featured: true, timeshift: [] },
  { id: 'bolajon', slug: 'bolajon', name: 'Bolajon', shortName: 'BJ', category: 'Kids', country: 'UZ', language: 'uz', quality: 'HD', tone: 'rose', tagline: 'Rangli olam', description: 'Cartoons, songs and gentle science for younger viewers.', status: 'online', featured: false, timeshift: [] },
  { id: 'yoshlar', slug: 'yoshlar', name: 'Yoshlar', shortName: 'YO', category: 'General', country: 'UZ', language: 'uz', quality: 'FHD', tone: 'ember', tagline: 'Young voices', description: 'Music, campus culture and late night formats.', status: 'online', featured: false, timeshift: [2] },
  { id: 'kinoteatr', slug: 'kinoteatr', name: 'Kinoteatr', shortName: 'KN', category: 'Film', country: 'UZ', language: 'uz', quality: 'FHD', tone: 'slate', tagline: 'Feature night', description: 'Uzbek cinema and dubbed international features.', status: 'online', featured: true, timeshift: [4] },
  { id: 'dunyo-boylab', slug: 'dunyo-boylab', name: 'Dunyo bo\u2018ylab', shortName: 'DB', category: 'Documentary', country: 'UZ', language: 'uz', quality: 'HD', tone: 'teal', tagline: 'Long form', description: 'Travel, nature and history documentaries.', status: 'online', featured: false, timeshift: [] },
  { id: 'navo', slug: 'navo', name: 'Navo', shortName: 'NV', category: 'Music', country: 'UZ', language: 'uz', quality: 'HD', tone: 'plum', tagline: 'All music', description: 'Maqom, pop and the new wave of Tashkent producers.', status: 'online', featured: false, timeshift: [] },
  { id: 'zor-tv', slug: 'zor-tv', name: 'Zo\u2018r TV', shortName: 'ZR', category: 'General', country: 'UZ', language: 'uz', quality: 'HD', tone: 'ember', tagline: 'Entertainment', description: 'Comedy, family shows and weekend specials.', status: 'online', featured: false, timeshift: [2] },
  { id: 'sevimli', slug: 'sevimli', name: 'Sevimli', shortName: 'SV', category: 'General', country: 'UZ', language: 'uz', quality: 'HD', tone: 'rose', tagline: 'Serial night', description: 'Drama series and long running family serials.', status: 'online', featured: false, timeshift: [2, 4] },
  { id: 'mahalla', slug: 'mahalla', name: 'Mahalla', shortName: 'MH', category: 'Regional', country: 'UZ', language: 'uz', quality: 'SD', tone: 'sand', tagline: 'Neighbourhood', description: 'Regional reporting from the provinces.', status: 'unknown', featured: false, timeshift: [] },
  { id: 'world-news', slug: 'world-news', name: 'World News', shortName: 'WN', category: 'News', country: 'INT', language: 'en', quality: 'FHD', tone: 'indigo', tagline: 'The daily brief', description: 'International newsroom coverage in English.', status: 'geo_blocked', featured: false, timeshift: [] },
  { id: 'cine-international', slug: 'cine-international', name: 'Cine International', shortName: 'CI', category: 'Film', country: 'INT', language: 'en', quality: 'UHD', tone: 'slate', tagline: 'Modern classics', description: 'Curated international cinema, subtitled.', status: 'auth_required', featured: false, timeshift: [] },
  { id: 'planet-docs', slug: 'planet-docs', name: 'Planet Docs', shortName: 'PD', category: 'Documentary', country: 'INT', language: 'en', quality: 'HD', tone: 'moss', tagline: 'Nature hour', description: 'Wildlife and science documentaries.', status: 'offline', featured: false, timeshift: [] },
];

export function channelBySlug(slug: string): Channel | undefined {
  return demoChannels.find((channel) => channel.slug === slug || channel.id === slug);
}

export function featuredChannels(): Channel[] {
  return demoChannels.filter((channel) => channel.featured);
}

export function relatedChannels(channel: Channel, limit = 4): Channel[] {
  return demoChannels
    .filter((item) => item.id !== channel.id && (item.category === channel.category || item.country === channel.country))
    .slice(0, limit);
}
