'use client';

import Link from 'next/link';
import { motion, MotionConfig } from 'motion/react';
import { ArrowRight, Bell, ChevronRight, Compass, Heart, Menu, Play, Settings2, Tv, X } from 'lucide-react';
import { useState } from 'react';
import type { Channel } from '@/lib/demo';
import { ChannelCard } from './ChannelCard';
import { StatusPanel } from './StatusPanel';

const nav = [{ href: '/', label: 'Home' }, { href: '/live', label: 'Live TV' }, { href: '/guide', label: 'TV Guide' }, { href: '/search', label: 'Search' }] as const;

export function CinematicShell({ channels, active = 'home' }: { channels: Channel[]; active?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const featured = channels[0];
  const current = active === 'guide' ? 'Guide' : active === 'admin' ? 'Admin' : active === 'search' ? 'Search' : active === 'live' ? 'Live TV' : 'Home';
  return (
    <MotionConfig reducedMotion="user">
      <main className="app-shell">
        <header className="topbar">
          <Link href="/" className="brand"><span className="brand-glyph">T</span><span>TOMOSHA</span></Link>
          <nav className="desktop-nav">{nav.map((item) => <Link className={current === item.label ? 'active' : ''} href={item.href} key={item.href}>{item.label}</Link>)}</nav>
          <div className="top-actions">
            <button className="icon-button" aria-label="Notifications"><Bell size={18} /></button>
            <Link href="/admin" className="admin-link">Admin <Settings2 size={15} /></Link>
            <button className="menu-button" aria-label="Open menu" onClick={() => setMenuOpen((value) => !value)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
          </div>
        </header>
        {menuOpen && <div className="mobile-menu">{nav.map((item) => <Link href={item.href} key={item.href} onClick={() => setMenuOpen(false)}>{item.label}<ChevronRight size={16} /></Link>)}</div>}
        <section className="hero">
          <div className="hero-grid">
            <div className="hero-kicker"><span className="live-pulse" /> On air now <span className="mono">18:12 TST</span></div>
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <p className="eyebrow">TOMOSHA PREMIERE / {featured.category.toUpperCase()}</p>
              <h1>Stories that<br /><em>stay with you.</em></h1>
              <p className="hero-copy">A sharper way to find the broadcasts, voices, and moments worth staying for.</p>
              <div className="hero-actions"><Link href={`/live/${featured.id}`} className="primary-button"><Play size={16} fill="currentColor" /> Watch now</Link><button className={`secondary-button ${saved ? 'is-saved' : ''}`} onClick={() => setSaved((value) => !value)}><Heart size={16} fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Saved' : 'Add to favorites'}</button></div>
            </motion.div>
            <div className="hero-meta"><span><b>{featured.name}</b> / {featured.program}</span><span className="mono">Next {featured.next}</span></div>
          </div>
          <div className="hero-orbit"><div className="orbit-card orbit-back" /><div className="orbit-card orbit-main"><span className="orbit-logo">{featured.shortName}</span><span className="orbit-caption">Toshkent<br /><small>live broadcast</small></span></div><div className="orbit-stamp">SINCE<br /><b>2026</b></div></div>
        </section>
        <section className="content-section"><div className="section-head"><div><p className="eyebrow">Curated for tonight</p><h2>On air now <span>/{channels.filter((channel) => channel.live).length} channels</span></h2></div><Link className="text-link" href="/live">Open live catalog <ArrowRight size={16} /></Link></div><div className="channel-grid">{channels.map((channel, index) => <motion.div key={channel.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05, duration: 0.25 }}><ChannelCard channel={channel} /></motion.div>)}</div></section>
        <section className="split-section"><div className="guide-card"><div className="section-head compact"><div><p className="eyebrow">Tonight / Monday</p><h2>Signal guide</h2></div><Link className="round-link" href="/guide"><Compass size={18} /></Link></div><div className="guide-row active-row"><span className="mono">18:00</span><div><b>Shahar ritmi</b><p>Toshkent <span>•</span> General</p></div><span className="on-now">ON NOW</span></div><div className="guide-row"><span className="mono">18:30</span><div><b>Yangiliklar</b><p>Toshkent <span>•</span> News</p></div><span className="mono muted">30 min</span></div><div className="guide-row"><span className="mono">19:00</span><div><b>Ochiq kitob</b><p>Madaniyat va Ma’rifat</p></div><span className="mono muted">45 min</span></div></div><div className="signal-note"><div className="note-icon"><Tv size={21} /></div><p className="eyebrow">The TOMOSHA promise</p><h2>Less hunting.<br /><em>More watching.</em></h2><p>Favorites, a clean guide, and a calm interface built for the way people actually watch.</p><Link href="/favorites" className="text-link">Your saved channels <ArrowRight size={16} /></Link></div></section>
        <section className="state-section"><StatusPanel kind="success" title="Demo catalog ready" detail="Only safe fixtures are active. Authorized providers can be connected from Admin." /><StatusPanel kind="empty" title="No saved channels yet" detail="Save a channel to see it here." /></section>
        <footer className="footer"><div><span className="brand"><span className="brand-glyph">T</span><span>TOMOSHA</span></span><p>Live broadcast. Favorite channels. One place.</p></div><div className="footer-links"><Link href="/guide">Guide</Link><Link href="/admin">Rights & providers</Link><Link href="/privacy">Privacy</Link></div><span className="mono">UZ / RU / EN</span></footer>
      </main>
    </MotionConfig>
  );
}
