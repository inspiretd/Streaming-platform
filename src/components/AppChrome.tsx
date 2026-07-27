'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Home, Radio, CalendarDays, Heart, UserRound, Menu, X } from 'lucide-react';
import { useState } from 'react';

const nav = [{ href: '/', label: 'Home', icon: Home }, { href: '/live', label: 'Live TV', icon: Radio }, { href: '/guide', label: 'Guide', icon: CalendarDays }, { href: '/favorites', label: 'Favorites', icon: Heart }];

export function AppChrome({ children, active = 'home' }: { children: React.ReactNode; active?: string }) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  return <div className="product-frame"><header className="site-nav"><Link href="/" className="brand"><span className="brand-glyph">T</span><span>TOMOSHA</span></Link><nav className="site-nav-links">{nav.map(({ href, label }) => <Link href={href} className={active === label.toLowerCase().replace(' ', '-') ? 'active' : ''} key={href}>{label}</Link>)}</nav><div className="nav-actions"><button className="nav-icon" aria-label="Search" onClick={() => setSearchOpen(true)}><Search size={18} /></button><Link href="/profile" className="profile-link"><UserRound size={16} /> Profile</Link><button className="nav-menu" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((value) => !value)}>{open ? <X size={20} /> : <Menu size={20} />}</button></div></header>{open && <motion.nav initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mobile-nav">{nav.map(({ href, label, icon: Icon }) => <Link href={href} key={href} onClick={() => setOpen(false)}><Icon size={17} /> {label}</Link>)}<Link href="/profile"><UserRound size={17} /> Profile</Link></motion.nav>}<main>{children}</main><nav className="bottom-nav">{nav.map(({ href, label, icon: Icon }) => <Link href={href} key={href} className={active === label.toLowerCase().replace(' ', '-') ? 'active' : ''}><Icon size={18} /><span>{label}</span></Link>)}</nav><AnimatePresence>{searchOpen && <motion.div className="search-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><button className="overlay-close" aria-label="Close search" onClick={() => setSearchOpen(false)}><X size={20} /></button><div className="search-panel"><p className="eyebrow">Find your signal</p><h2>What are you watching for?</h2><form action="/search"><div className="search-input"><Search size={20} /><input name="q" autoFocus placeholder="Channel, program, category" /></div></form><p className="search-hint">Try “news”, “sport”, or “o‘zbek”</p></div></motion.div>}</AnimatePresence></div>;
}
