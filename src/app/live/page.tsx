import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LiveCatalog } from '@/components/LiveCatalog';
import { demoChannels } from '@/lib/demo';
export default function LivePage() { return <main className="app-shell"><header className="topbar"><Link href="/" className="brand"><span className="brand-glyph">T</span><span>TOMOSHA</span></Link><Link href="/" className="text-link"><ArrowLeft size={16} /> Home</Link></header><LiveCatalog channels={demoChannels} /></main>; }
