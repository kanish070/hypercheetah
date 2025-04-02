import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Chat } from "@/components/chat";
import { RideShareQR } from "@/components/ride-share-qr";
import { DialogMapHandler } from "@/components/dialog-map-handler";
import { Ride } from '@shared/schema';
import { motion } from "framer-motion";
import { 
  MapPin, Clock, User, Car, Star, ChevronRight, MessageSquare, Share2,
  Calendar, Music, VolumeX, Cigarette, Dices, X
} from 'lucide-react';

// Extended Ride with additional properties for UI
interface ExtendedRide extends Ride {
  driverName?: string;
  driverPicture?: string;
  preferences?: {
    music?: boolean;
    pets?: boolean;
    smoking?: boolean;
    talkative?: boolean;
  };
  passengerCount?: number;
}

interface RideMatchesProps {
  matches: Ride[];
  onSelectMatch: (ride: Ride) => void;
}

export function RideMatches({ matches, onSelectMatch }: RideMatchesProps) {
  // State for chat dialog
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);

  // Open chat dialog with selected ride
  const handleOpenChat = (ride: Ride) => {
    setSelectedRide(ride);
    setChatOpen(true);
  };

  // Cast to extended ride for UI purposes
  const extendedMatches = matches.map(ride => {
    const extendedRide = ride as ExtendedRide;
    // Set default values for UI
    extendedRide.driverName = "User " + ride.userId;
    extendedRide.passengerCount = ride.availableSeats || 1;
    extendedRide.preferences = {
      music: Math.random() > 0.5,
      pets: Math.random() > 0.7,
      smoking: false,
      talkative: Math.random() > 0.3
    };
    return extendedRide;
  });
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Ride Matches</h3>
        <div className="text-sm text-muted-foreground">
          {matches.length} results found
        </div>
      </div>
      
      {extendedMatches.length === 0 ? (
        <div className="text-center py-12 border rounded-md bg-muted/20">
          <Car className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
          <h3 className="text-lg font-medium mb-2">No matches found</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Try adjusting your departure time or pickup/dropoff locations to find more matches
          </p>
          <Button>
            Modify Search
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {extendedMatches.map((ride, index) => (
            <motion.div
              key={ride.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                transition: { delay: index * 0.1, duration: 0.3 } 
              }}
              whileHover={{ y: -2 }}
            >
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="sm:flex">
                    {/* Driver/Rider Info */}
                    <div className="p-4 sm:w-1/3 sm:border-r flex items-center">
                      <Avatar className="h-12 w-12 mr-3">
                        <AvatarImage 
                          src={ride.driverPicture || `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`} 
                          alt="Driver" 
                        />
                        <AvatarFallback>{ride.driverName?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium flex items-center">
                          {ride.driverName || "Anonymous User"}
                          {ride.type === 'offer' ? (
                            <Badge className="ml-2 text-xs bg-blue-50 text-blue-700 border-blue-200">Driver</Badge>
                          ) : (
                            <Badge className="ml-2 text-xs bg-purple-50 text-purple-700 border-purple-200">Passenger</Badge>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Star className="h-3.5 w-3.5 mr-1 text-amber-500" />
                          <span>4.8 (42 rides)</span>
                        </div>
                        <div className="flex items-center text-xs mt-1 text-muted-foreground">
                          <User className="h-3 w-3 mr-1" />
                          <span>Verified User</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Ride Details */}
                    <div className="p-4 sm:w-2/3">
                      <div className="flex flex-col sm:flex-row sm:justify-between mb-3">
                        <div className="mb-3 sm:mb-0">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-primary mr-1.5" />
                            <div className="text-sm font-medium">
                              {ride.routeData 
                                ? (typeof ride.routeData === 'string' 
                                   ? ((() => {
                                      try {
                                        const parsed = JSON.parse(ride.routeData as string);
                                        return parsed?.start?.name || "Pickup Location";
                                      } catch (e) {
                                        return "Pickup Location";
                                      }
                                    })())
                                   : "Pickup Location")
                                : "Pickup Location"}
                            </div>
                          </div>
                          <div className="h-8 border-l-2 border-dashed border-primary/30 ml-[7px] my-1"></div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-primary mr-1.5" />
                            <div className="text-sm font-medium">
                              {ride.routeData 
                                ? (typeof ride.routeData === 'string' 
                                   ? ((() => {
                                      try {
                                        const parsed = JSON.parse(ride.routeData as string);
                                        return parsed?.end?.name || "Dropoff Location";
                                      } catch (e) {
                                        return "Dropoff Location";
                                      }
                                    })())
                                   : "Dropoff Location")
                                : "Dropoff Location"}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center mb-1">
                            <Clock className="h-4 w-4 text-primary mr-1.5" />
                            <div className="text-sm font-medium">
                              {ride.departureTime ? 
                                // Make sure we have a string representation to construct the Date
                                new Date(ride.departureTime.toString()).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : "TBD"}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-primary mr-1.5" />
                            <div className="text-sm font-medium">
                              {ride.departureTime ? 
                                // Make sure we have a string representation to construct the Date
                                new Date(ride.departureTime.toString()).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric'
                                }) : "TBD"}
                            </div>
                          </div>
                          <div className="flex items-center mt-1">
                            <Car className="h-4 w-4 text-primary mr-1.5" />
                            <div className="text-xs text-muted-foreground">
                              {ride.passengerCount} {ride.passengerCount === 1 ? 'passenger' : 'passengers'}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {ride.preferences?.music && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            <Music className="h-3 w-3 mr-0.5" />
                            Music
                          </Badge>
                        )}
                        {ride.preferences?.pets && (
                          <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                            <Dices className="h-3 w-3 mr-0.5" />
                            Pet Friendly
                          </Badge>
                        )}
                        {ride.preferences?.smoking === false && (
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                            <Cigarette className="h-3 w-3 mr-0.5" />
                            No Smoking
                          </Badge>
                        )}
                        {ride.preferences?.talkative === false && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            <VolumeX className="h-3 w-3 mr-0.5" />
                            Quiet Ride
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center pt-3 border-t">
                        <div className="flex items-center text-sm font-medium text-primary">
                          {ride.type === 'offer' ? (
                            ride.price ? (
                              <span>
                                ₹{ride.price} • 
                                {ride.vehicleType === 'bike' 
                                  ? " ₹6 per km" 
                                  : ride.isPooling 
                                    ? " ₹12 per km" 
                                    : " ₹15 per km"
                                }
                              </span>
                            ) : (
                              <span>Free ride</span>
                            )
                          ) : (
                            ride.price ? (
                              <span>
                                ₹{ride.price} •
                                {ride.vehicleType === 'bike' 
                                  ? " ₹6 per km" 
                                  : ride.isPooling 
                                    ? " ₹12 per km" 
                                    : " ₹15 per km"
                                }
                              </span>
                            ) : (
                              <span>No price specified</span>
                            )
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <RideShareQR 
                            ride={ride} 
                            userName={ride.driverName}
                          />
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8"
                            onClick={() => handleOpenChat(ride)}
                          >
                            <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                            Message
                          </Button>
                          <Button 
                            size="sm" 
                            className="h-8"
                            onClick={() => onSelectMatch(ride)}
                          >
                            {ride.type === 'offer' ? 'Request' : 'Offer'}
                            <ChevronRight className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Chat Dialog */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent 
          className="sm:max-w-[500px] h-[80vh] p-0 z-[999] shadow-xl border border-border bg-background rounded-md overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
            <DialogTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-primary" />
              Chat with {selectedRide ? (selectedRide as ExtendedRide).driverName : "Rider"}
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full"
              onClick={() => setChatOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {selectedRide && (
            <div className="h-[calc(80vh-56px)] overflow-hidden">
              <Chat 
                rideId={selectedRide.id}
                userId={1} // Current user ID
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Fallback for browsers without :has() selector support */}
      <DialogMapHandler isOpen={chatOpen} />
    </div>
  );
}