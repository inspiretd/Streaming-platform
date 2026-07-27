import Link from 'next/link';
import { EmptyState } from '@/components/StatusPanel';

export default function NotFound() {
  return (
    <div className="container" style={{ paddingTop: 40 }}>
      <EmptyState
        title="That page is off air"
        description="The page you were looking for does not exist or was moved. The live catalog is always one tap away."
        action={
          <Link href="/live" className="btn btn-primary btn-sm">
            Go to Live TV
          </Link>
        }
      />
    </div>
  );
}
