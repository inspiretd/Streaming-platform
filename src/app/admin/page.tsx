import { CinematicShell } from '@/components/CinematicShell';
import { demoChannels } from '@/lib/demo';

export default function AdminPage() {
  return <CinematicShell channels={demoChannels} active="admin" />;
}
