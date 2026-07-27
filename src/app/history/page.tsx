import { AppChrome } from '@/components/AppChrome';
import { StatusPanel } from '@/components/StatusPanel';
export default function HistoryPage() { return <AppChrome><section className="simple-page"><p className="eyebrow">Your viewing trail</p><h1>History</h1><StatusPanel kind="empty" title="Nothing watched yet" detail="Start with a live channel and your recent viewing will appear here." /></section></AppChrome>; }
