import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TOMOSHA | Live broadcast. One place.',
  description: 'A cinematic live TV experience for permitted channels and programs.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="uz"><body>{children}</body></html>;
}
