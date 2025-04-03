import { useState, useEffect, lazy, Suspense } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LocationPicker } from "@/components/location-picker";
import { RouteMap } from "@/components/route-map";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { calculateRoute, formatDistance, formatTime, getDistanceInKm, getEstimatedTime } from "@/lib/maps";
import { apiRequest } from "@/lib/queryClient";
import type { Location, Route, Ride } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, MapPin, Route as RouteIcon, Car, Bike, Users, IndianRupee, Bell, X, ThumbsUp, HelpCircle } from "lucide-react";
import { useLocation } from "wouter";
import { MapSkeleton } from "@/components/map-skeleton";
import { LocationCardSkeleton } from "@/components/location-card-skeleton";
import { TooltipHelper } from "@/components/tooltip-helper";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Rider() {
  const { user } = useAuth(); // Get authenticated user
  const [startLocation, setStartLocation] = useState<Location>();
  const [endLocation, setEndLocation] = useState<Location>();
  const [route, setRoute] = useState<Route>();
  const [isActive, setIsActive] = useState(false);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [vehicleType, setVehicleType] = useState<"car" | "bike">("car");
  const [isPooling, setIsPooling] = useState(false); 
  const [availableSeats, setAvailableSeats] = useState(3);
  const [_, setLocation] = useLocation();

  const { data: nearbyRequests = [], isLoading } = useQuery<Ride[]>({
    queryKey: ["/api/rides/nearby", startLocation],
    enabled: !!startLocation && isActive,
    queryFn: async () => {
      const params = new URLSearchParams({
        location: JSON.stringify(startLocation),
        type: "request"
      });
      const response = await fetch(`/api/rides/nearby?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch nearby ride requests");
      }
      return response.json();
    }
  });

  const createRideMutation = useMutation<Ride>({
    mutationFn: async () => {
      if (!route || !user) throw new Error("Route or user is not available");
      
      // Calculate price based on vehicle type and pooling status
      const distance = getDistanceInKm(route.start, route.end);
      const pricePerKm = vehicleType === "bike" ? 6 : (isPooling ? 12 : 15);
      const price = Math.ceil(distance * pricePerKm);
      
      const response = await fetch("/api/rides", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id, // Use authenticated user ID
          type: "offer",
          status: "active",
          vehicleType, // Include vehicle type
          isPooling, // Include pooling status
          availableSeats, // Use state value
          departureTime: new Date().toISOString(),
          routeData: JSON.stringify(route),
          price // Include calculated price
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Ride creation error:", errorData);
        throw new Error("Failed to create ride offer");
      }
      
      return response.json();
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
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to start offering rides.",
        variant: "destructive"
      });
      return;
    }

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

  // Fetch user's active rides
  const { data: activeRides = [], isLoading: loadingActiveRides } = useQuery<Ride[]>({
    queryKey: ["/api/users", user?.id, "rides", "active"],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];
      
      const response = await fetch(`/api/users/${user.id}/rides?status=active`);
      if (!response.ok) {
        throw new Error("Failed to fetch active rides");
      }
      return response.json();
    }
  });

  // Display pending ride requests for active ride offers
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  
  // Navigation options
  const [activeTab, setActiveTab] = useState<'new' | 'active'>('new');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
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
          </div>
          <div className="flex bg-secondary/20 rounded-lg p-1">
            <Button
              variant={activeTab === 'new' ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab('new')}
              className={`${activeTab === 'new' ? '' : 'hover:bg-primary/10'}`}
            >
              <Car className="mr-2 h-4 w-4" />
              New Ride
            </Button>
            <Button
              variant={activeTab === 'active' ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab('active')}
              className={`${activeTab === 'active' ? '' : 'hover:bg-primary/10'}`}
            >
              <Bell className="mr-2 h-4 w-4" />
              Active Rides
              {activeRides.length > 0 && (
                <Badge variant="secondary" className="ml-2">{activeRides.length}</Badge>
              )}
            </Button>
          </div>
        </motion.div>

        {activeTab === 'active' ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Bike className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Your Active Rides</h2>
            </div>
            
            {loadingActiveRides ? (
              <div className="grid gap-4 md:grid-cols-2">
                <LocationCardSkeleton />
                <LocationCardSkeleton />
                <div className="md:col-span-2 text-center text-sm text-muted-foreground mt-1">
                  Loading your active rides...
                </div>
              </div>
            ) : activeRides.length === 0 ? (
              <Card className="bg-muted">
                <CardContent className="p-6 text-center text-muted-foreground">
                  <Bike className="h-8 w-8 text-primary/50 mx-auto mb-2" />
                  <p>You don't have any active rides.</p>
                  <p className="text-sm mt-1">Create a new ride offer to get started!</p>
                  <Button 
                    className="mt-4" 
                    variant="outline" 
                    onClick={() => setActiveTab('new')}
                  >
                    <Car className="mr-2 h-4 w-4" />
                    Create New Ride Offer
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {activeRides.map((ride) => (
                  <Card key={ride.id} className={`overflow-hidden transition-shadow ${selectedRide?.id === ride.id ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-primary/10">
                            {ride.vehicleType === "bike" ? (
                              <Bike className="h-3 w-3 text-primary mr-1" />
                            ) : (
                              <Car className="h-3 w-3 text-primary mr-1" />
                            )}
                            {ride.vehicleType === "bike" ? "Bike" : "Car"} Ride
                          </Badge>
                          {ride.isPooling && (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              Carpooling
                            </Badge>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2 text-destructive hover:text-destructive"
                          onClick={() => {
                            // Function to cancel the ride
                            toast({
                              title: "Feature Coming Soon",
                              description: "Ride cancellation will be available in the next update",
                              variant: "default",
                            });
                          }}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                      
                      <div className="text-sm space-y-3">
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                          <div className="ml-2">
                            <p className="text-xs text-muted-foreground">Start:</p>
                            <p className="font-medium">
                              {ride.route.start.address || `${ride.route.start.lat.toFixed(4)}, ${ride.route.start.lng.toFixed(4)}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 text-red-500 mt-1 shrink-0" />
                          <div className="ml-2">
                            <p className="text-xs text-muted-foreground">Destination:</p>
                            <p className="font-medium">
                              {ride.route.end.address || `${ride.route.end.lat.toFixed(4)}, ${ride.route.end.lng.toFixed(4)}`}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-border">
                          <div className="flex items-center">
                            <IndianRupee className="h-4 w-4 text-green-600 mr-1" />
                            <span className="font-medium">₹{ride.price}</span>
                          </div>
                          <Button
                            size="sm" 
                            onClick={() => setSelectedRide(ride)}
                          >
                            <Users className="mr-2 h-4 w-4" />
                            View Requests
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {/* Selected Ride Details with Ride Match Requests */}
            {selectedRide && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg">Ride Match Requests</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setSelectedRide(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-4">
                    {/* For now, show a placeholder until we implement the ride match requests */}
                    <div className="py-8 text-center text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2 text-primary/50" />
                      <p>No pending ride match requests</p>
                      <p className="text-sm mt-1">
                        Passengers will appear here when they request to join your ride
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Location input */}
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Route Details</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      toast({
                        title: "Quick Tip",
                        description: "Enter your starting point and destination to create a route. You can then offer rides along this route.",
                      });
                    }}
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <LocationPicker
                    placeholder="Enter starting location"
                    onLocationSelect={(location) => {
                      setStartLocation(location);
                      // Clear route when location changes
                      if (route) setRoute(undefined);
                    }}
                    selectedLocation={startLocation}
                  />
                  <LocationPicker
                    placeholder="Enter destination"
                    onLocationSelect={(location) => {
                      setEndLocation(location);
                      // Clear route when location changes
                      if (route) setRoute(undefined);
                    }}
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
                        {route ? "Recalculate Route" : "Calculate Route"}
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

                      {/* Vehicle Type Selection */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">Vehicle Type:</div>
                          <TooltipHelper 
                            content="Choose the vehicle you'll be using. Bikes are for single passengers, while cars can accommodate multiple riders and enable carpooling."
                          />
                        </div>
                        <RadioGroup 
                          value={vehicleType} 
                          onValueChange={(v: "car" | "bike") => {
                            setVehicleType(v);
                            // When changing to bike, disable pooling and set seats to 1
                            if (v === "bike") {
                              setIsPooling(false);
                              setAvailableSeats(1);
                            } else {
                              // For car, default to 3 seats
                              setAvailableSeats(3);
                            }
                          }}
                          className="flex space-x-4"
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="car" id="car" />
                                  <Label htmlFor="car" className="flex items-center gap-1 cursor-pointer">
                                    <Car className="h-4 w-4" />
                                    <span>Car</span>
                                  </Label>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p>₹15/km standard rate. Can enable carpooling for reduced rate.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="bike" id="bike" />
                                  <Label htmlFor="bike" className="flex items-center gap-1 cursor-pointer">
                                    <Bike className="h-4 w-4" />
                                    <span>Bike</span>
                                  </Label>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p>₹6/km rate. Limited to one passenger only.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </RadioGroup>
                      </div>
                      
                      {/* Carpooling option (only for cars) */}
                      {vehicleType === "car" && (
                        <div className="flex items-center space-x-2">
                          <div className="font-medium">Enable Carpooling:</div>
                          <TooltipHelper 
                            content="Carpooling allows you to pick up multiple passengers along your route, reducing the per-person cost and environmental impact."
                          />
                          <Switch
                            checked={isPooling}
                            onCheckedChange={setIsPooling}
                          />
                          {isPooling && (
                            <span className="text-xs text-muted-foreground">
                              (Reduced price: ₹12 per km)
                            </span>
                          )}
                        </div>
                      )}

                      {/* Seats Selection */}
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-primary" />
                        <div className="font-medium">Available Seats:</div>
                        <TooltipHelper 
                          content={vehicleType === "bike" ? 
                            "Bikes can only accommodate one passenger." : 
                            "Select the number of seats available in your vehicle. This helps match you with the right number of passengers."
                          }
                        />
                        <div className="flex space-x-2">
                          {/* Show only 1 seat for bike, or up to 4 for car */}
                          {(vehicleType === "bike" ? [1] : [1, 2, 3, 4]).map(num => (
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

                      {/* Price Display */}
                      <div className="flex items-start space-x-2">
                        <IndianRupee className="h-4 w-4 text-primary mt-1" />
                        <div>
                          <div className="font-medium mb-1">Price:</div>
                          <div className="text-sm text-muted-foreground mb-2">
                            {vehicleType === "bike" 
                              ? "Calculated at 6 rupees per km for bike" 
                              : isPooling 
                                ? "Calculated at 12 rupees per km (carpooling rate)" 
                                : "Calculated at 15 rupees per km for car"
                            }
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge className="bg-primary/10 border-primary text-primary font-medium">
                              {vehicleType === "bike" 
                                ? "₹6 per km" 
                                : isPooling 
                                  ? "₹12 per km" 
                                  : "₹15 per km"
                              }
                            </Badge>
                            {routeSummary && (
                              <Badge className="bg-green-50 text-green-700 border-green-200">
                                Est. ₹{Math.ceil(routeSummary.distance * (
                                  vehicleType === "bike" ? 6 : (isPooling ? 12 : 15)
                                ))} for {formatDistance(routeSummary.distance)}
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
                            {vehicleType === "bike" ? (
                              <Bike className="mr-2 h-4 w-4" />
                            ) : (
                              <Car className="mr-2 h-4 w-4" />
                            )}
                            Start Offering {vehicleType === "bike" ? "Bike" : "Car"} Rides
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
                    <div className="space-y-4">
                      <LocationCardSkeleton />
                      <LocationCardSkeleton />
                      <div className="text-center text-sm text-muted-foreground mt-2">
                        Searching for nearby passengers...
                      </div>
                    </div>
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
                              
                              <div className="flex justify-between items-center mt-3">
                                <Badge className="bg-green-50 text-green-700 border-green-200">
                                  ₹{request.price}
                                </Badge>
                                <Button 
                                  size="sm"
                                  onClick={() => {
                                    toast({
                                      title: "Ride matched!",
                                      description: "You have accepted this ride request.",
                                    });
                                  }}
                                >
                                  <ThumbsUp className="mr-2 h-3 w-3" />
                                  Accept
                                </Button>
                              </div>
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
              className="relative"
            >
              <AnimatePresence>
                {isCalculatingRoute && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10"
                  >
                    <MapSkeleton className="h-[600px]" />
                  </motion.div>
                )}
              </AnimatePresence>
              <RouteMap
                center={startLocation || { lat: 22.3072, lng: 73.1812 }} /* Vadodara coordinates */
                route={route}
                className={`h-[600px] shadow-xl rounded-xl overflow-hidden ${isCalculatingRoute ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
              />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}