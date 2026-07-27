import type { Metadata, Viewport } from 'next';
import type { CSSProperties } from 'react';
import './globals.css';
import { AppChrome } from '@/components/AppChrome';
import { siteConfig } from '@/config/site';

/**
 * Fonts are resolved without a build time network fetch so the production build
 * stays hermetic. Manrope and JetBrains Mono are used when available locally or
 * self hosted, otherwise the tuned system stack keeps the same metrics.
 */
const fontVariables = {
  '--font-sans': "'Manrope', 'Geist Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial",
  '--font-mono': "'JetBrains Mono', 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
} as CSSProperties;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Live TV and shows in one place`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: ['live tv', 'uzbekistan tv', 'ott', 'tv guide', 'streaming'],
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    title: `${siteConfig.name} | Live TV and shows in one place`,
    description: siteConfig.description,
    locale: 'uz_UZ',
  },
  twitter: { card: 'summary_large_image', title: siteConfig.name, description: siteConfig.description },
  alternates: {
    canonical: '/',
    languages: { uz: '/', ru: '/', en: '/' },
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#090a0b',
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" style={fontVariables}>
      <body>
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
