import Link from 'next/link';
import { ArrowUpRight, Radio } from 'lucide-react';
import type { Channel } from '@/lib/demo';

export function ChannelCard({ channel }: { channel: Channel }) {
  return <Link href={`/live/${channel.id}`} className={`channel-card tone-${channel.tone}`}>
    <div className="channel-art"><span className="channel-mark">{channel.shortName}</span><span className="quality-chip">{channel.quality}</span><span className={`live-chip ${channel.live ? '' : 'offline'}`}><Radio size={11} /> {channel.live ? 'LIVE' : 'OFF AIR'}</span><ArrowUpRight className="card-arrow" size={19} /></div>
    <div className="channel-copy"><div><h3>{channel.name}</h3><p>{channel.program}</p></div><span className="mono">{channel.next}</span></div>
  </Link>;
}
