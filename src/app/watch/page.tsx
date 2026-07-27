import { AppChrome } from '@/components/AppChrome';
import { StatusPanel } from '@/components/StatusPanel';
export default function WatchPage() { return <AppChrome><section className="simple-page"><p className="eyebrow">Coming into focus</p><h1>Watch <em>later.</em></h1><p className="hero-copy">VOD is scaffolded for licensed movies, series, cartoons, documentaries, and local creators.</p><StatusPanel kind="empty" title="VOD library is empty" detail="Add rights-confirmed titles from Admin when the catalog is ready." /></section></AppChrome>; }
