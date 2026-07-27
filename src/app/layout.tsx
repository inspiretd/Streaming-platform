import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Manrope } from 'next/font/google';
import './globals.css';
import { AppChrome } from '@/components/AppChrome';
import { siteConfig } from '@/config/site';

const sans = Manrope({ subsets: ['latin', 'cyrillic'], display: 'swap', variable: '--font-sans' });
const mono = JetBrains_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-mono' });

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
    <html lang="uz" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
