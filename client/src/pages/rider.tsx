import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { LocationPicker } from "@/components/location-picker";
import { RouteMap } from "@/components/route-map";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { calculateRoute } from "@/lib/maps";
import { apiRequest } from "@/lib/queryClient";
import type { Location, Route, Ride } from "@shared/schema"; // Assuming Ride type is defined here
import { Clock, MapPin } from "lucide-react";

export default function Rider() {
  const [startLocation, setStartLocation] = useState<Location>();
  const [endLocation, setEndLocation] = useState<Location>();
  const [route, setRoute] = useState<Route>();
  const [isActive, setIsActive] = useState(false);

  const { data: nearbyRequests = [], isLoading } = useQuery({
    queryKey: ["/api/rides/nearby", startLocation],
    enabled: !!startLocation && isActive,
    queryFn: async () => {
      const params = new URLSearchParams({
        location: JSON.stringify(startLocation),
        type: "request"
      });
      const res = await apiRequest("GET", `/api/rides/nearby?${params}`);
      return res.json();
    }
  });

  const createRideMutation = useMutation({
    mutationFn: async () => {
      if (!route) return;
      await apiRequest("POST", "/api/rides", {
        userId: 1, // In a real app, this would come from auth
        type: "offer",
        route,
        status: "active"
      });
    },
    onSuccess: () => {
      toast({
        title: "Ride Offer Created",
        description: "Your ride offer has been created successfully."
      });
      setIsActive(true);
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

  const toggleActive = () => {
    if (!route) {
      toast({
        title: "Set Route First",
        description: "Please set your route before activating ride offers.",
        variant: "destructive"
      });
      return;
    }

    if (!isActive) {
      createRideMutation.mutate();
    } else {
      setIsActive(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Offer a Ride</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <LocationPicker
              placeholder="Enter starting location"
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
              Calculate Route
            </Button>

            {route && (
              <Button
                className="w-full"
                variant={isActive ? "destructive" : "secondary"}
                onClick={toggleActive}
              >
                {isActive ? "Stop Offering Rides" : "Start Offering Rides"}
              </Button>
            )}

            {isActive && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Nearby Ride Requests</h2>
                {nearbyRequests.length === 0 ? (
                  <Card className="bg-muted">
                    <CardContent className="p-6 text-center text-muted-foreground">
                      No nearby ride requests. Keep checking back!
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {nearbyRequests.map((request: Ride) => ( //Corrected line
                      <Card key={request.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-primary" />
                              <span className="font-medium">
                                Nearby Passenger Request
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>
                                {new Date(request.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
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