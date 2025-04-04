import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserIcon, Car, ArrowLeft, Clock, Calendar, MapPin, Users, Info, CreditCard } from "lucide-react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { RouteMap } from "@/components/route-map";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Matches() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Sample match data - in a real app this would come from API/database
  const rideMatches = [
    {
      id: 1,
      driver: {
        id: 101,
        name: "Rahul Sharma",
        avatar: "/src/assets/images/avatars/avatar-1.png",
        rating: 4.8,
        verified: true,
        ridesCompleted: 124
      },
      price: 350,
      discount: 50,
      departureTime: new Date(Date.now() + 15 * 60000), // 15 minutes from now
      origin: "Alkapuri, Vadodara",
      destination: "Sayajigunj, Vadodara",
      distance: 7.2,
      duration: 22,
      availableSeats: 3,
      vehicleType: "sedan",
      preferences: ["AC", "Music", "Chattiness: Medium"],
      route: {
        start: { lat: 22.3072, lng: 73.1812 }, // Alkapuri
        end: { lat: 22.3241, lng: 73.1747 }, // Sayajigunj
        waypoints: []
      }
    },
    {
      id: 2,
      driver: {
        id: 102,
        name: "Preeti Patel",
        avatar: "/src/assets/images/avatars/avatar-2.png",
        rating: 4.9,
        verified: true,
        ridesCompleted: 87
      },
      price: 180,
      discount: 0,
      departureTime: new Date(Date.now() + 8 * 60000), // 8 minutes from now
      origin: "Fatehgunj, Vadodara",
      destination: "Karelibaug, Vadodara",
      distance: 4.5,
      duration: 14,
      availableSeats: 2,
      vehicleType: "hatchback",
      preferences: ["No AC", "No Music", "Chattiness: Low"],
      route: {
        start: { lat: 22.3229, lng: 73.1881 }, // Fatehgunj
        end: { lat: 22.3352, lng: 73.1893 }, // Karelibaug
        waypoints: []
      }
    },
    {
      id: 3,
      driver: {
        id: 103,
        name: "Ajay Verma",
        avatar: "/src/assets/images/avatars/avatar-3.png",
        rating: 4.6,
        verified: true,
        ridesCompleted: 56
      },
      price: 420,
      discount: 70,
      departureTime: new Date(Date.now() + 22 * 60000), // 22 minutes from now
      origin: "Akota, Vadodara",
      destination: "Manjalpur, Vadodara",
      distance: 9.3,
      duration: 30,
      availableSeats: 4,
      vehicleType: "suv",
      preferences: ["AC", "Music", "Chattiness: High"],
      route: {
        start: { lat: 22.2998, lng: 73.1681 }, // Akota
        end: { lat: 22.2743, lng: 73.1921 }, // Manjalpur
        waypoints: []
      }
    }
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTimeRemaining = (date: Date) => {
    const diffMs = date.getTime() - new Date().getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins <= 0) return "Departing now";
    if (diffMins === 1) return "In 1 minute";
    return `In ${diffMins} minutes`;
  };

  const getVehicleEmoji = (type: string) => {
    switch (type) {
      case "sedan": return "🚗";
      case "hatchback": return "🚙";
      case "suv": return "🚜";
      case "bike": return "🏍️";
      default: return "🚗";
    }
  };

  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Available Rides</h1>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <p className="text-muted-foreground">
            We found <span className="font-medium text-foreground">{rideMatches.length} rides</span> matching your route and preferences
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-4">
            {rideMatches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card 
                  className={`overflow-hidden transition-all duration-200 hover:shadow-md ${selectedMatch === match.id ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelectedMatch(match.id)}
                >
                  <CardContent className="p-0">
                    <div className="p-4 pb-3 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border">
                            <AvatarFallback>{match.driver.name.charAt(0)}</AvatarFallback>
                            <AvatarImage src={match.driver.avatar} />
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="font-medium">{match.driver.name}</span>
                              {match.driver.verified && (
                                <Badge variant="outline" className="h-5 text-xs bg-blue-50 text-blue-700 border-blue-200">
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <span className="text-yellow-500 mr-1">★</span> {match.driver.rating} • {match.driver.ridesCompleted} rides
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            ₹{match.price - match.discount}
                          </div>
                          {match.discount > 0 && (
                            <div className="text-xs text-muted-foreground">
                              <span className="line-through">₹{match.price}</span>
                              <span className="text-green-500 ml-1">Save ₹{match.discount}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          </div>
                          <div className="w-0.5 h-10 bg-gray-200"></div>
                          <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-red-500"></div>
                          </div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div>
                            <div className="text-sm font-medium">{match.origin}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {formatTime(match.departureTime)} • {getTimeRemaining(match.departureTime)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium">{match.destination}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {match.distance} km • {match.duration} min
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center gap-4 flex-wrap">
                        <Badge variant="outline" className="flex items-center gap-1 px-2 py-1 font-normal">
                          <Users className="h-3 w-3" /> {match.availableSeats} seats
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1 px-2 py-1 font-normal bg-primary/5">
                          <span>{getVehicleEmoji(match.vehicleType)}</span> {match.vehicleType}
                        </Badge>
                        {match.preferences.map((pref, idx) => (
                          <Badge key={idx} variant="outline" className="px-2 py-1 font-normal bg-primary/5">
                            {pref}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 pt-2 flex gap-2">
                      <Button 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMatch(match.id);
                          // Scroll to the map on mobile
                          if (window.innerWidth < 1024) {
                            document.querySelector('.route-preview-card')?.scrollIntoView({
                              behavior: 'smooth'
                            });
                          }
                        }}
                      >
                        <CreditCard className="mr-2 h-4 w-4" /> Book Ride
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMatch(match.id);
                          // Open modal or show details
                          // For now, we'll just select the ride and scroll to details
                          if (window.innerWidth < 1024) {
                            document.querySelector('.ride-summary')?.scrollIntoView({
                              behavior: 'smooth'
                            });
                          }
                        }}
                      >
                        <Info className="mr-2 h-4 w-4" /> Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="lg:col-span-2">
            <Card className="sticky top-6 route-preview-card">
              <CardHeader>
                <CardTitle className="text-lg">Route Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedMatch ? (
                  <div className="aspect-square w-full rounded-md overflow-hidden">
                    <RouteMap route={rideMatches.find(m => m.id === selectedMatch)?.route} />
                  </div>
                ) : (
                  <div className="aspect-square w-full bg-muted/30 rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground text-sm text-center p-4">
                      Select a ride to see the route details
                    </p>
                  </div>
                )}

                <div className="mt-4 space-y-4">
                  {selectedMatch && (
                    <>
                      <div className="bg-primary/5 rounded-md p-3 ride-summary">
                        <h3 className="font-medium text-sm mb-2">Ride Summary</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">Distance</div>
                          <div className="text-right font-medium">{rideMatches.find(m => m.id === selectedMatch)?.distance} km</div>
                          <div className="text-muted-foreground">Duration</div>
                          <div className="text-right font-medium">{rideMatches.find(m => m.id === selectedMatch)?.duration} min</div>
                          <div className="text-muted-foreground">Price</div>
                          <div className="text-right font-medium">₹{(rideMatches.find(m => m.id === selectedMatch)?.price || 0) - (rideMatches.find(m => m.id === selectedMatch)?.discount || 0)}</div>
                          <div className="text-muted-foreground">Departure</div>
                          <div className="text-right font-medium">{formatTime(rideMatches.find(m => m.id === selectedMatch)?.departureTime || new Date())}</div>
                        </div>
                      </div>

                      <Button 
                        className="w-full"
                        onClick={() => {
                          // In a real app, this would submit to a booking API
                          // For now, navigate to a success page with details
                          const selectedRide = rideMatches.find(m => m.id === selectedMatch);
                          if (selectedRide) {
                            // Show a toast notification
                            toast({
                              title: "Ride Booked Successfully!",
                              description: `Your ride with ${selectedRide.driver.name} has been booked. A confirmation will be sent to your registered phone.`,
                              variant: "default",
                            });
                            
                            // In a real app, would create a booking and redirect to details
                            // Simulating redirect after a short delay
                            setTimeout(() => {
                              // setLocation(`/bookings/${bookingId}`);
                              setLocation("/");
                            }, 2000);
                          }
                        }}
                      >
                        <CreditCard className="mr-2 h-4 w-4" /> Confirm Booking
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}