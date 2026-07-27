import Link from 'next/link';
import { ArrowRight, CalendarDays, Heart, Languages, Zap } from 'lucide-react';
import { HomeHero } from '@/components/home/HomeHero';
import { ChannelRail } from '@/components/LiveCatalog';
import { EmptyState } from '@/components/StatusPanel';
import { categoryLabels } from '@/lib/demo';
import { formatTashkentTime } from '@/lib/epg';
import { getChannels, getScheduled } from '@/server/catalog';
import type { CategoryId } from '@/lib/types';

export const revalidate = 60;

const BENEFITS = [
  { icon: Zap, title: 'Tez kanal almashtirish', text: 'Kanalni ikki bosishda oching, metadata esa tez yuklanadi.' },
  { icon: CalendarDays, title: 'Bitta TV dasturi', text: 'Har bir provider jadvali Asia/Tashkent vaqtiga moslanadi.' },
  { icon: Heart, title: 'Sevimlilar siz bilan', text: 'Kanallarni saqlang va oxirgi ko‘rgan joyingizdan davom eting.' },
  { icon: Languages, title: 'Uch tilda interfeys', text: 'O‘zbek, rus va inglizcha qidiruv hamda interfeys.' },
];

const CATEGORY_ORDER: CategoryId[] = ['general', 'news', 'sport', 'movies', 'kids', 'music', 'education', 'regional'];

export default function HomePage() {
  const at = new Date();
  const published = getChannels().filter((channel) => channel.state === 'published');
  const scheduled = getScheduled(published, at);
  const featured = scheduled.find((entry) => entry.channel.featured) ?? scheduled[0];
  const onAir = scheduled.filter((entry) => entry.channel.status === 'online').slice(0, 14);
  const uzbek = scheduled.filter((entry) => entry.channel.country === 'UZ').slice(0, 14);
  const guidePreview = scheduled.slice(0, 5);

  if (!featured) return <div className="container"><EmptyState title="Hali e’lon qilingan kanal yo‘q" description="Huquqi tasdiqlangan provider ulangach, bosh sahifa avtomatik to‘ladi." /> </div>;

  return (
    <div className="container">
      <HomeHero featured={featured} />
      <ChannelRail title="Hozir jonli efirda" subtitle="Providerlar bo‘yicha ayni damdagi efirlar" items={onAir} href="/live" />
      <ChannelRail title="O‘zbekiston kanallari" subtitle="Milliy va hududiy telekanallar" items={uzbek} href="/live" />
      <section className="section"><div className="section-head"><div><h2 className="section-title">Kategoriya bo‘yicha</h2><p className="section-sub">Kayfiyatingizga mos yo‘nalishni tanlang</p></div></div><div className="grid-2">{CATEGORY_ORDER.map((category) => <Link key={category} href={`/live?category=${category}`} className="feature-card"><span className="feature-title">{categoryLabels[category]}</span><span className="feature-text">{published.filter((channel) => channel.category === category).length} ta kanal</span><span className="section-link">Ochish <ArrowRight size={14} aria-hidden="true" /></span></Link>)}</div></section>
      <section className="section"><div className="section-head"><div><h2 className="section-title">Bugungi TV dasturi</h2><p className="section-sub">Asia/Tashkent vaqtida yagona jadval ko‘rinishi</p></div><Link href="/guide" className="section-link">To‘liq dastur</Link></div><div className="panel program-list">{guidePreview.map((entry) => <div className="program-row" key={entry.channel.id} data-now="true"><span className="program-time mono">{entry.now ? formatTashkentTime(entry.now.startsAt) : '--:--'}</span><span style={{ display: 'grid', gap: 2 }}><span className="program-title">{entry.now ? entry.now.title : 'Dastur jadvali topilmadi'}</span><span className="program-desc">{entry.channel.name}</span></span></div>)}</div></section>
      <section className="section"><div className="section-head"><div><h2 className="section-title">Nega TOMOSHA?</h2><p className="section-sub">Kichik ekranlar, sekin tarmoqlar va katta xonalar uchun yaratilgan</p></div></div><div className="grid-2">{BENEFITS.map((benefit) => <div className="feature-card" key={benefit.title}><benefit.icon size={18} aria-hidden="true" color="var(--accent)" /><span className="feature-title">{benefit.title}</span><span className="feature-text">{benefit.text}</span></div>)}</div></section>
    </div>
  );
}
