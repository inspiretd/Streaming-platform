import { CinematicShell } from '@/components/CinematicShell';
import { demoChannels } from '@/lib/demo';

export default function LivePage() {
  return <CinematicShell channels={demoChannels} active="live" />;
}
