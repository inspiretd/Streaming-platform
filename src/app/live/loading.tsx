import { CardGridSkeleton } from '@/components/StatusPanel';
import { Skeleton } from '@/components/ui/primitives';

export default function LiveLoading() {
  return (
    <div className="container">
      <div className="page-head">
        <Skeleton height={34} width="220px" />
        <Skeleton height={16} width="60%" />
      </div>
      <div style={{ marginTop: 26 }}>
        <CardGridSkeleton count={12} />
      </div>
    </div>
  );
}
