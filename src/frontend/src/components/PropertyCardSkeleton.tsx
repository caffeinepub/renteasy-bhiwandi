import { Skeleton } from "@/components/ui/skeleton";

export function PropertyCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none skeleton-shimmer" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4 skeleton-shimmer" />
        <Skeleton className="h-4 w-1/2 skeleton-shimmer" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-24 skeleton-shimmer" />
          <Skeleton className="h-4 w-16 skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}
