import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { LocationPicker } from "@/components/location-picker";
import { RouteMap } from "@/components/route-map";
import { RideMatches } from "@/components/ride-matches";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { calculateRoute } from "@/lib/maps";
import { apiRequest } from "@/lib/queryClient";
import type { Location, Route, Ride } from "@shared/schema";

export default function Passenger() {
  const [startLocation, setStartLocation] = useState<Location>();
  const [endLocation, setEndLocation] = useState<Location>();
  const [route, setRoute] = useState<Route>();

  const { data: matches = [], isLoading: isLoadingMatches } = useQuery({
    queryKey: ["/api/rides/match", route],
    enabled: !!route,
    queryFn: async () => {
      const res = await apiRequest("POST", "/api/rides/match", { route });
      return res.json();
    }
  });

  const createRideMutation = useMutation({
    mutationFn: async (ride: Ride) => {
      await apiRequest("POST", "/api/rides", ride);
    },
    onSuccess: () => {
      toast({
        title: "Ride Request Created",
        description: "Your ride request has been created successfully."
      });
    }
  });

  const handleRouteCalculation = async () => {
    if (!startLocation || !endLocation) return;

    try {
      const calculatedRoute = await calculateRoute(startLocation, endLocation);
      setRoute(calculatedRoute);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to calculate route",
        variant: "destructive"
      });
    }
  };

  const handleMatchSelect = (match: Ride) => {
    createRideMutation.mutate({
      userId: 1, // In a real app, this would come from auth
      type: "request",
      route: route!,
      status: "active"
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Find a Ride</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <LocationPicker
              placeholder="Enter pickup location"
              onLocationSelect={setStartLocation}
            />
            <LocationPicker
              placeholder="Enter destination"
              onLocationSelect={setEndLocation}
            />
            <Button
              className="w-full"
              onClick={handleRouteCalculation}
              disabled={!startLocation || !endLocation}
            >
              Find Matches
            </Button>

            {route && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Available Matches</h2>
                <RideMatches
                  matches={matches}
                  onSelectMatch={handleMatchSelect}
                />
              </div>
            )}
          </div>

          <RouteMap
            center={startLocation || { lat: 40.7128, lng: -74.0060 }}
            route={route}
            className="h-[600px]"
          />
        </div>
      </div>
    </div>
  );
}
