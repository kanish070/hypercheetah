import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { LocationPicker } from "@/components/location-picker";
import { RouteMap } from "@/components/route-map";
import { RideMatches } from "@/components/ride-matches";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { calculateRoute, formatDistance, formatTime, getDistanceInKm, getEstimatedTime } from "@/lib/maps";
import { apiRequest } from "@/lib/queryClient";
import type { Location, Route, Ride } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, MapPin, Route as RouteIcon, Car, Zap, Search } from "lucide-react";
import { useLocation } from "wouter";

export default function Passenger() {
  const [startLocation, setStartLocation] = useState<Location>();
  const [endLocation, setEndLocation] = useState<Location>();
  const [route, setRoute] = useState<Route>();
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [isQuickMode, setIsQuickMode] = useState(false);
  const [_, setLocation] = useLocation();
  
  // Parse URL query parameter for quick mode and auto-calculate route
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const quickParam = urlParams.get('quick');
    if (quickParam === 'true') {
      setIsQuickMode(true);
      
      // Set default popular locations for quick route finding in India
      const delhiLocation = { lat: 28.6139, lng: 77.2090 }; // New Delhi
      const gurugramLocation = { lat: 28.4595, lng: 77.0266 }; // Gurugram
      
      setStartLocation(delhiLocation);
      setEndLocation(gurugramLocation);
      
      // Show toast notification for quick mode
      toast({
        title: "Quick Route Finder Activated",
        description: "We've selected popular locations for you. You can change them if needed.",
      });
      
      // Automatically calculate route after a short delay
      setTimeout(async () => {
        try {
          setIsCalculatingRoute(true);
          const calculatedRoute = await calculateRoute(delhiLocation, gurugramLocation);
          setRoute(calculatedRoute);
          
          toast({
            title: "Quick Route Found",
            description: "The fastest route has been automatically calculated for you.",
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to calculate quick route",
            variant: "destructive"
          });
        } finally {
          setIsCalculatingRoute(false);
        }
      }, 1000);
    }
  }, []);

  const { data: matches = [], isLoading: isLoadingMatches } = useQuery({
    queryKey: ["/api/rides/match", route],
    enabled: !!route,
    queryFn: async () => {
      return apiRequest<Ride[]>("/api/rides/match", {
        method: "POST", 
        body: JSON.stringify({ 
          route,
          type: "offer" // Looking for ride offers
        })
      });
    }
  });

  const createRideMutation = useMutation({
    mutationFn: async (ride: Ride) => {
      return apiRequest<Ride>("/api/rides", {
        method: "POST",
        body: JSON.stringify(ride)
      });
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
      setIsCalculatingRoute(true);
      const calculatedRoute = await calculateRoute(startLocation, endLocation);
      setRoute(calculatedRoute);
      
      toast({
        title: "Route Calculated",
        description: "We found the fastest route for your journey."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to calculate route",
        variant: "destructive"
      });
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  const handleMatchSelect = (match: Ride) => {
    createRideMutation.mutate({
      userId: 1, // In a real app, this would come from auth
      type: "request",
      route: route!,
      status: "active",
      availableSeats: null,
      price: null,
      departureTime: null,
      routeData: JSON.stringify(route)
    } as any);
  };

  // Calculate route summary if available
  const routeSummary = route ? {
    distance: getDistanceInKm(route.start, route.end),
    time: getEstimatedTime(route.start, route.end)
  } : null;

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
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
              Find a Ride
            </h1>
            {isQuickMode && (
              <div className="flex items-center gap-2 mt-1 text-sm text-green-600">
                <Zap className="h-4 w-4" />
                <span>Quick Route Finder Active</span>
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Location input */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center mb-2">
                  <MapPin className="h-5 w-5 text-primary mr-2" />
                  <h2 className="font-medium">Where are you going?</h2>
                </div>
                <LocationPicker
                  placeholder="Enter pickup location"
                  onLocationSelect={setStartLocation}
                  selectedLocation={startLocation}
                />
                <LocationPicker
                  placeholder="Enter destination"
                  onLocationSelect={setEndLocation}
                  selectedLocation={endLocation}
                />
                <Button
                  className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 mt-2"
                  onClick={handleRouteCalculation}
                  disabled={!startLocation || !endLocation || isCalculatingRoute}
                >
                  {isCalculatingRoute ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Calculating Route...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <RouteIcon className="mr-2 h-4 w-4" />
                      Find Matches
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Route summary */}
            {routeSummary && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-lg mb-3">Journey Details</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Badge variant="outline" className="bg-primary/10 p-1">
                          <MapPin className="h-4 w-4 text-primary" />
                        </Badge>
                        <span className="ml-2">Distance:</span>
                        <span className="ml-2 font-medium">{formatDistance(routeSummary.distance)}</span>
                      </div>
                      <div className="flex items-center">
                        <Badge variant="outline" className="bg-primary/10 p-1">
                          <Clock className="h-4 w-4 text-primary" />
                        </Badge>
                        <span className="ml-2">ETA:</span>
                        <span className="ml-2 font-medium">{formatTime(routeSummary.time)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Ride matches */}
            {route && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center">
                  <Car className="mr-2 h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Available Rides</h2>
                </div>
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
              center={startLocation || { lat: 20.5937, lng: 78.9629 }} // Default to center of India if no location selected
              route={route}
              className="h-[600px] shadow-xl rounded-xl overflow-hidden"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}