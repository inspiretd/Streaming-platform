import { CinematicShell } from '@/components/CinematicShell';
import { demoChannels } from '@/lib/demo';

export default function GuidePage() {
  return <CinematicShell channels={demoChannels} active="guide" />;
}
