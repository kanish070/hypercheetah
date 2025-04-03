import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface MapSkeletonProps {
  className?: string;
}

export function MapSkeleton({ className }: MapSkeletonProps) {
  return (
    <div className={cn("relative rounded-xl overflow-hidden", className)}>
      <Skeleton className="absolute inset-0 bg-muted animate-pulse" />
      
      {/* Map UI elements */}
      <div className="absolute top-4 right-4">
        <Skeleton className="h-10 w-10 rounded-md" />
      </div>
      
      <div className="absolute bottom-4 right-4">
        <Skeleton className="h-24 w-10 rounded-md" />
      </div>
      
      {/* Route line indicators */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-2/3 h-1/2">
          {/* Start point */}
          <Skeleton className="absolute top-0 left-0 h-6 w-6 rounded-full bg-green-200" />
          
          {/* Path line */}
          <div className="absolute top-3 left-3 w-[calc(100%-24px)] h-[calc(100%-24px)]">
            <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M 10,10 Q 50,20 60,50 T 90,90" 
                fill="none" 
                stroke="#e2e8f0" 
                strokeWidth="3" 
                strokeDasharray="12"
                strokeDashoffset="12"
                className="animate-dash"
              />
            </svg>
          </div>
          
          {/* End point */}
          <Skeleton className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-red-200" />
        </div>
      </div>
      
      {/* Loading indicator */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-background/80 rounded-full p-3 shadow-lg">
          <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
      
      {/* Add additional skeleton elements as needed */}
    </div>
  );
}