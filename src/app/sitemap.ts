import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { getChannels } from '@/server/catalog';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = ['', '/live', '/guide', '/search', '/watch', '/favorites', '/history', '/profile', '/privacy'];

  const channelRoutes = getChannels()
    .filter((channel) => channel.state === 'published')
    .map((channel) => ({
      url: `${siteConfig.url}/live/${channel.slug}`,
      lastModified: now,
      changeFrequency: 'hourly' as const,
      priority: 0.7,
    }));

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteConfig.url}${route}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: route === '' ? 1 : 0.8,
    })),
    ...channelRoutes,
  ];
}
