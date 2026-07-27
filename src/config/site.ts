export const siteConfig = {
  name: 'TOMOSHA',
  tagline: 'Jonli efir. Sevimli kanallar. Bitta joyda.',
  description:
    'TOMOSHA is a cinematic live TV platform: Uzbek and international channels, a unified TV guide, favorites and instant search.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tomosha.example',
  timezone: 'Asia/Tashkent',
  defaultLocale: 'uz',
  locales: ['uz', 'ru', 'en'],
} as const;

export type NavItem = { href: string; label: string };

export const primaryNav: NavItem[] = [
  { href: '/live', label: 'Live TV' },
  { href: '/guide', label: 'TV Guide' },
  { href: '/watch', label: 'Movies' },
  { href: '/favorites', label: 'Favorites' },
];

export const mobileNav: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/live', label: 'Live' },
  { href: '/guide', label: 'Guide' },
  { href: '/favorites', label: 'Saved' },
  { href: '/profile', label: 'Profile' },
];

export const adminNav: NavItem[] = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/import', label: 'Import' },
  { href: '/admin/health', label: 'Stream health' },
];
