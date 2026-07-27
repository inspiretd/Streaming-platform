import { Skeleton } from '@/components/ui/primitives';

export default function RootLoading() {
  return (
    <div className="container" style={{ paddingTop: 28, display: 'grid', gap: 16 }}>
      <Skeleton height={420} radius={24} />
      <Skeleton height={22} width="240px" />
      <Skeleton height={16} width="55%" />
    </div>
  );
}
