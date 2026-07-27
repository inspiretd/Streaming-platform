'use client';

import type { ReactNode } from 'react';
import { MotionConfig } from 'motion/react';
import { ToastProvider } from '@/components/ui/Toast';
import { SearchProvider } from '@/components/search/SearchProvider';
import { MobileTabBar, PageTransition, SiteFooter, TopNav } from '@/components/CinematicShell';

export function AppChrome({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <SearchProvider>
          <a className="skip-link" href="#main">
            Skip to main content
          </a>
          <TopNav />
          <main id="main" className="site-main">
            <PageTransition>{children}</PageTransition>
          </main>
          <SiteFooter />
          <MobileTabBar />
        </SearchProvider>
      </ToastProvider>
    </MotionConfig>
  );
}
