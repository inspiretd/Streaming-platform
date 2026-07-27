import { CinematicShell } from '@/components/CinematicShell';
import { demoChannels } from '@/lib/demo';

export default function SearchPage() {
  return <CinematicShell channels={demoChannels} active="search" />;
}
