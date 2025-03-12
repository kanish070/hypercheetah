import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { createMap, drawRoute } from "@/lib/maps";
import type { Location, Route } from "@shared/schema";

interface RouteMapProps {
  center: Location;
  route?: Route;
  className?: string;
}

export function RouteMap({ center, route, className = "" }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      try {
        mapInstanceRef.current = await createMap(mapRef.current, center);
      } catch (error) {
        console.error("Failed to initialize map:", error);
      }
    };

    initMap();
  }, [center]);

  useEffect(() => {
    if (!mapInstanceRef.current || !route) return;

    const showRoute = async () => {
      try {
        await drawRoute(mapInstanceRef.current, route);
      } catch (error) {
        console.error("Failed to draw route:", error);
      }
    };

    showRoute();
  }, [route]);

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div ref={mapRef} className="w-full h-full min-h-[400px]" />
    </Card>
  );
}