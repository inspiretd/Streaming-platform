'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, CalendarDays, Heart, Home, Search, Settings2, Tv, User } from 'lucide-react';
import { mobileNav, primaryNav, siteConfig } from '@/config/site';
import { useSearchOverlay } from '@/components/search/SearchProvider';

const MOBILE_ICONS = [Home, Tv, CalendarDays, Heart, User];

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function TopNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const { open } = useSearchOverlay();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="topbar" data-scrolled={scrolled}>
      <div className="container topbar-inner">
        <Link href="/" className="brand" aria-label={`${siteConfig.name} home`}>
          <span className="brand-mark" aria-hidden="true">
            T
          </span>
          <span>{siteConfig.name}</span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary">
          {primaryNav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link key={item.href} href={item.href} className="nav-link" data-active={active} aria-current={active ? 'page' : undefined}>
                {active ? (
                  <motion.span layoutId="nav-indicator" className="nav-indicator" transition={{ type: 'spring', stiffness: 460, damping: 38 }} />
                ) : null}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="top-actions">
          <button type="button" className="search-trigger" onClick={open}>
            <Search size={16} aria-hidden="true" />
            <span>Search channels</span>
            <span className="kbd mono">Ctrl K</span>
          </button>
          <button type="button" className="icon-btn" onClick={open} aria-label="Open search" style={{ display: 'grid' }}>
            <Search size={17} aria-hidden="true" />
          </button>
          <Link href="/profile" className="icon-btn" aria-label="Notifications and profile">
            <Bell size={17} aria-hidden="true" />
          </Link>
          <Link href="/admin" className="btn btn-ghost btn-sm" aria-label="Admin console">
            <Settings2 size={15} aria-hidden="true" />
            <span>Admin</span>
          </Link>
          <Link href="/live" className="btn btn-primary btn-sm">
            Watch now
          </Link>
        </div>
      </div>
    </header>
  );
}

export function MobileTabBar() {
  const pathname = usePathname();
  return (
    <nav className="mobile-tabbar" aria-label="Mobile">
      {mobileNav.map((item, index) => {
        const Icon = MOBILE_ICONS[index] ?? Home;
        const active = isActive(pathname, item.href);
        return (
          <Link key={item.href} href={item.href} className="tab-item" data-active={active} aria-current={active ? 'page' : undefined}>
            {active ? <motion.span layoutId="tab-indicator" className="tab-indicator" transition={{ type: 'spring', stiffness: 480, damping: 40 }} /> : null}
            <Icon size={19} aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.24, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

const FOOTER_LINKS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: 'Platform',
    links: [
      { href: '/live', label: 'Live TV' },
      { href: '/guide', label: 'TV guide' },
      { href: '/watch', label: 'Movies' },
      { href: '/favorites', label: 'Favorites' },
    ],
  },
  {
    title: 'Rights holders',
    links: [
      { href: '/privacy', label: 'Content partnerships' },
      { href: '/privacy', label: 'Copyright request' },
      { href: '/privacy', label: 'Provider onboarding' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy' },
      { href: '/privacy', label: 'Terms' },
      { href: '/privacy', label: 'Support' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <span className="brand">
              <span className="brand-mark" aria-hidden="true">
                T
              </span>
              <span>{siteConfig.name}</span>
            </span>
            <p className="feature-text">{siteConfig.tagline}</p>
          </div>
          {FOOTER_LINKS.map((group) => (
            <div key={group.title} className="footer-col">
              <span className="footer-title">{group.title}</span>
              {group.links.map((link) => (
                <Link key={`${group.title}-${link.label}`} href={link.href} className="footer-link">
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>Only licensed and rights holder approved streams are published.</span>
          <span className="mono">TOMOSHA MVP</span>
        </div>
      </div>
    </footer>
  );
}
