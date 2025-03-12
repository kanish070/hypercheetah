import { Card } from "@/components/ui/card";
import type { Location, Route } from "@shared/schema";
import { convertToRelativePosition } from "@/lib/maps";

interface RouteMapProps {
  center: Location;
  route?: Route;
  className?: string;
}

export function RouteMap({ center, route, className = "" }: RouteMapProps) {
  // Convert locations to relative positions
  const centerPos = convertToRelativePosition(center);

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      <div className="w-full h-full min-h-[400px] bg-secondary/5 relative">
        {/* Grid lines */}
        <div className="absolute inset-0 grid grid-cols-8 grid-rows-8">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="border border-secondary/10" />
          ))}
        </div>

        {/* Center marker */}
        <div
          className="absolute w-3 h-3 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${50 + centerPos.x}%`,
            top: `${50 + centerPos.y}%`
          }}
        />

        {/* Route visualization */}
        {route && (
          <svg className="absolute inset-0 w-full h-full">
            {/* Route path */}
            <path
              d={`M ${50 + convertToRelativePosition(route.start).x} ${
                50 + convertToRelativePosition(route.start).y
              } L ${50 + convertToRelativePosition(route.end).x} ${
                50 + convertToRelativePosition(route.end).y
              }`}
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              fill="none"
            />

            {/* Start point */}
            <circle
              cx={50 + convertToRelativePosition(route.start).x}
              cy={50 + convertToRelativePosition(route.start).y}
              r="4"
              fill="hsl(var(--primary))"
            />

            {/* End point */}
            <circle
              cx={50 + convertToRelativePosition(route.end).x}
              cy={50 + convertToRelativePosition(route.end).y}
              r="4"
              fill="hsl(var(--destructive))"
            />
          </svg>
        )}
      </div>
    </Card>
  );
}