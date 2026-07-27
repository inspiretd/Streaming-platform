import Link from 'next/link';
import { ArrowLeft, Heart, Play, Radio } from 'lucide-react';
import { demoChannels } from '@/lib/demo';

export default function ChannelPage({ params }: { params: { slug: string } }) {
  const channel = demoChannels.find((item) => item.id === params.slug) ?? demoChannels[0];
  return <main className="app-shell"><header className="topbar"><Link href="/" className="brand"><span className="brand-glyph">T</span><span>TOMOSHA</span></Link><Link href="/live" className="text-link"><ArrowLeft size={16} /> Back to live</Link></header><section className="player-page"><div className={`player-frame tone-${channel.tone}`}><div className="player-placeholder"><span>{channel.shortName}</span><button className="primary-button"><Play size={16} fill="currentColor" /> Start demo playback</button></div></div><div className="player-copy"><div><p className="eyebrow"><Radio size={12} /> {channel.live ? 'Live signal' : 'Offline fixture'}</p><h1>{channel.name}</h1><p>{channel.program}. This safe demo fixture has no provider URL attached.</p></div><button className="secondary-button"><Heart size={16} /> Add to favorites</button></div><div className="rights-note"><strong>Availability notice</strong><span>Playback is intentionally disabled until a rights-confirmed provider is connected in Admin.</span></div></section></main>;
}
