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
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Passenger() {
  const [startLocation, setStartLocation] = useState<Location>();
  const [endLocation, setEndLocation] = useState<Location>();
  const [route, setRoute] = useState<Route>();
  const [_, setLocation] = useLocation();

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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
            Find a Ride
          </h1>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <LocationPicker
              placeholder="Enter pickup location"
              onLocationSelect={setStartLocation}
            />
            <LocationPicker
              placeholder="Enter destination"
              onLocationSelect={setEndLocation}
            />
            <Button
              className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
              onClick={handleRouteCalculation}
              disabled={!startLocation || !endLocation}
            >
              Find Matches
            </Button>

            {route && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-semibold">Available Matches</h2>
                <RideMatches
                  matches={matches}
                  onSelectMatch={handleMatchSelect}
                />
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <RouteMap
              center={startLocation || { lat: 40.7128, lng: -74.0060 }}
              route={route}
              className="h-[600px] shadow-xl rounded-xl overflow-hidden"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}