import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { createMap, drawRoute } from "@/lib/maps";
import type { Location, Route } from "@shared/schema";
import { Loader2 } from "lucide-react";

interface RouteMapProps {
  center: Location;
  route?: Route;
  className?: string;
}

export function RouteMap({ center, route, className = "" }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      try {
        setIsLoading(true);
        setError(undefined);
        mapInstanceRef.current = await createMap(mapRef.current, center);
      } catch (error) {
        console.error("Failed to initialize map:", error);
        setError("Failed to load map. Please check your internet connection.");
      } finally {
        setIsLoading(false);
      }
    };

    initMap();
  }, [center]);

  useEffect(() => {
    if (!mapInstanceRef.current || !route) return;

    const showRoute = async () => {
      try {
        setIsLoading(true);
        await drawRoute(mapInstanceRef.current, route);
      } catch (error) {
        console.error("Failed to draw route:", error);
        setError("Failed to display route on map.");
      } finally {
        setIsLoading(false);
      }
    };

    showRoute();
  }, [route]);

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
          <p className="text-destructive text-center px-4">{error}</p>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full min-h-[400px]" />
    </Card>
  );
}