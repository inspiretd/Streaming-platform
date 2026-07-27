import { AppChrome } from '@/components/AppChrome';
import { CinematicShell } from '@/components/CinematicShell';
import { demoChannels } from '@/lib/demo';
export default function HomePage() { return <AppChrome><CinematicShell channels={demoChannels} /></AppChrome>; }
