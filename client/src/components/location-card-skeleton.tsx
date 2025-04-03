import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LocationCardSkeleton() {
  return (
    <Card className="overflow-hidden animate-pulse">
      <CardContent className="p-4">
        {/* Header with badge and time */}
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
        
        {/* Location details */}
        <div className="space-y-4 mt-4">
          {/* From location */}
          <div className="flex items-start">
            <Skeleton className="h-4 w-4 rounded-full mt-1" />
            <div className="ml-2 space-y-1 w-full">
              <Skeleton className="h-3 w-12 rounded-full" />
              <Skeleton className="h-4 w-3/4 rounded-full" />
            </div>
          </div>
          
          {/* To location */}
          <div className="flex items-start">
            <Skeleton className="h-4 w-4 rounded-full mt-1" />
            <div className="ml-2 space-y-1 w-full">
              <Skeleton className="h-3 w-12 rounded-full" />
              <Skeleton className="h-4 w-4/5 rounded-full" />
            </div>
          </div>
          
          {/* Footer with price and button */}
          <div className="flex justify-between items-center mt-4 pt-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}