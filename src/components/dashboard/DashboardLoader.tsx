
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MetricCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

export function ChartSkeleton({ height = "300px", className = "" }) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-32 mb-1" />
        <Skeleton className="h-3 w-48" />
      </CardHeader>
      <CardContent>
        <div className={`flex items-center justify-center h-[${height}]`}>
          <Skeleton className="h-full w-full rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

export function FilterBarSkeleton() {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Skeleton className="h-10 w-[180px]" />
      <Skeleton className="h-10 w-[150px]" />
      <Skeleton className="h-10 w-[120px]" />
      <div className="ml-auto flex gap-2">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-[100px]" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      
      <FilterBarSkeleton />
      
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <ChartSkeleton className="md:col-span-2" height="350px" />
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <ChartSkeleton className="md:col-span-2" />
      </div>
    </div>
  );
}
