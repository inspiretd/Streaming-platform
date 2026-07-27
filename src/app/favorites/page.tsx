import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { StatusPanel } from '@/components/StatusPanel';

export default function FavoritesPage() { return <main className="app-shell"><header className="topbar"><Link href="/" className="brand"><span className="brand-glyph">T</span><span>TOMOSHA</span></Link><Link href="/" className="text-link"><ArrowLeft size={16} /> Home</Link></header><section className="simple-page"><p className="eyebrow">Your library</p><h1>Favorites</h1><StatusPanel kind="empty" title="No saved channels yet" detail="Save a live channel and it will appear here." /></section></main>; }
