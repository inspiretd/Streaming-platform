import { CinematicShell } from '@/components/CinematicShell';
import { demoChannels } from '@/lib/demo';

export default function HomePage() {
  return <CinematicShell channels={demoChannels} />;
}
