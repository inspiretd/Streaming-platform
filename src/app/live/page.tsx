import { AppChrome } from '@/components/AppChrome';
import { ChannelCatalog } from '@/components/ChannelCatalog';
import { demoChannels } from '@/lib/demo';
export default function LivePage() { return <AppChrome active="live-tv"><section className="catalog-page"><ChannelCatalog channels={demoChannels} /></section></AppChrome>; }
