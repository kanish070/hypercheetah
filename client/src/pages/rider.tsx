import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { LocationPicker } from "@/components/location-picker";
import { RouteMap } from "@/components/route-map";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { calculateRoute, formatDistance, formatTime, getDistanceInKm, getEstimatedTime } from "@/lib/maps";
import { apiRequest } from "@/lib/queryClient";
import type { Location, Route, Ride } from "@shared/schema";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, MapPin, Route as RouteIcon, Car, Users, IndianRupee, Bell } from "lucide-react";
import { useLocation } from "wouter";

export default function Rider() {
  const [startLocation, setStartLocation] = useState<Location>();
  const [endLocation, setEndLocation] = useState<Location>();
  const [route, setRoute] = useState<Route>();
  const [isActive, setIsActive] = useState(false);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [availableSeats, setAvailableSeats] = useState(3);
  const [price, setPrice] = useState(10);
  const [_, setLocation] = useLocation();

  const { data: nearbyRequests = [], isLoading } = useQuery({
    queryKey: ["/api/rides/nearby", startLocation],
    enabled: !!startLocation && isActive,
    queryFn: async () => {
      const params = new URLSearchParams({
        location: JSON.stringify(startLocation),
        type: "request"
      });
      return apiRequest<Ride[]>(`/api/rides/nearby?${params}`);
    }
  });

  const createRideMutation = useMutation({
    mutationFn: async () => {
      if (!route) return;
      return apiRequest<Ride>("/api/rides", {
        method: "POST",
        body: JSON.stringify({
          userId: 1, // In a real app, this would come from auth
          type: "offer",
          route,
          status: "active",
          availableSeats, // Use state value
          price, // Use state value
          departureTime: new Date().toISOString(),
          routeData: JSON.stringify(route)
        } as any)
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
      toast({
        title: "Ride Offer Paused",
        description: "You are no longer offering rides on this route."
      });
    }
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
            Offer a Ride
          </h1>
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
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Route Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <LocationPicker
                  placeholder="Enter starting location"
                  onLocationSelect={setStartLocation}
                  selectedLocation={startLocation}
                />
                <LocationPicker
                  placeholder="Enter destination"
                  onLocationSelect={setEndLocation}
                  selectedLocation={endLocation}
                />
                <Button
                  className="w-full"
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
                      Calculate Route
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Ride details */}
            {route && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Ride Offer Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Route summary */}
                    {routeSummary && (
                      <div className="flex items-center justify-between mb-4">
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
                    )}

                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-primary" />
                      <div className="font-medium">Available Seats:</div>
                      <div className="flex space-x-2">
                        {[1, 2, 3, 4].map(num => (
                          <Badge 
                            key={num}
                            variant={availableSeats === num ? "default" : "outline"}
                            className="cursor-pointer hover:bg-primary/20"
                            onClick={() => setAvailableSeats(num)}
                          >
                            {num}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <IndianRupee className="h-4 w-4 text-primary mt-1" />
                      <div>
                        <div className="font-medium mb-1">Price:</div>
                        <div className="text-sm text-muted-foreground mb-2">Calculated at 3 rupees per km</div>
                        <div className="flex flex-wrap gap-2">
                          {/* Note: Price is now automatically calculated in the backend at 3 rupees per km */}
                          <Badge className="bg-primary/10 border-primary text-primary font-medium">
                            ₹3 per km
                          </Badge>
                          {routeSummary && (
                            <Badge className="bg-green-50 text-green-700 border-green-200">
                              Est. ₹{Math.ceil(routeSummary.distance * 3)} for {formatDistance(routeSummary.distance)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator className="my-2" />

                    <Button
                      className="w-full"
                      variant={isActive ? "destructive" : "default"}
                      onClick={toggleActive}
                    >
                      {isActive ? (
                        <span className="flex items-center">
                          <Bell className="mr-2 h-4 w-4" />
                          Stop Offering Rides
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Car className="mr-2 h-4 w-4" />
                          Start Offering Rides
                        </span>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Nearby requests */}
            {isActive && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Nearby Ride Requests</h2>
                </div>
                
                {isLoading ? (
                  <Card className="bg-muted">
                    <CardContent className="p-6 text-center">
                      <svg className="animate-spin mx-auto h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="mt-2 text-muted-foreground">Searching for nearby passengers...</p>
                    </CardContent>
                  </Card>
                ) : nearbyRequests.length === 0 ? (
                  <Card className="bg-muted">
                    <CardContent className="p-6 text-center text-muted-foreground">
                      <MapPin className="h-8 w-8 text-primary/50 mx-auto mb-2" />
                      <p>No nearby ride requests currently.</p>
                      <p className="text-sm mt-1">Keep checking back!</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {nearbyRequests.map((request: Ride) => (
                      <Card key={request.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-primary/10">
                                <MapPin className="h-3 w-3 text-primary mr-1" />
                                Passenger Request
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>
                                {new Date(request.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-sm space-y-2 mt-2">
                            <div className="flex items-start">
                              <MapPin className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                              <div className="ml-2">
                                <p className="text-xs text-muted-foreground">From:</p>
                                <p className="font-medium">Location {request.route.start.lat.toFixed(2)}, {request.route.start.lng.toFixed(2)}</p>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <MapPin className="h-4 w-4 text-red-500 mt-1 shrink-0" />
                              <div className="ml-2">
                                <p className="text-xs text-muted-foreground">To:</p>
                                <p className="font-medium">Location {request.route.end.lat.toFixed(2)}, {request.route.end.lng.toFixed(2)}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-3 flex justify-end">
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                            <Button size="sm" className="ml-2">
                              Accept Request
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
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