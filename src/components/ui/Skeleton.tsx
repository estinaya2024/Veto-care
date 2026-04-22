import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-black/5 rounded-2xl",
        className
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm space-y-6 border border-gray-100">
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="w-32 h-6" />
          <Skeleton className="w-24 h-4" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="w-full h-16 rounded-xl" />
        <Skeleton className="w-full h-16 rounded-xl" />
        <Skeleton className="w-full h-10 rounded-xl" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="grid grid-cols-5 px-8 py-6 items-center border-b border-gray-100">
      <div className="flex items-center gap-4 col-span-2">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="w-32 h-5" />
          <Skeleton className="w-24 h-3" />
        </div>
      </div>
      <Skeleton className="w-24 h-5" />
      <Skeleton className="w-20 h-5" />
      <Skeleton className="w-28 h-5" />
    </div>
  );
}
