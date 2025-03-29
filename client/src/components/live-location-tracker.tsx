import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import { Location } from '@shared/schema';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  MapPin, Navigation, Clock, AlertCircle, Car, ArrowRight, 
  PhoneCall, MessageSquare, Share, Star, Shield, Info, Check
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Fix for Leaflet default icon issues
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Setup default Leaflet icon
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom icon for user
const UserLocationIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: 'user-location-icon'
});

// Custom icon for partner/driver
const PartnerLocationIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: 'partner-location-icon'
});

interface LiveMapControllerProps { 
  userLocation: Location; 
  partnerLocation?: Location;
  pickupLocation?: Location;
  dropoffLocation?: Location;
  fitAllMarkers?: boolean;
}

function LiveMapController({ 
  userLocation,
  partnerLocation,
  pickupLocation,
  dropoffLocation,
  fitAllMarkers = true
}: LiveMapControllerProps) {
  const map = useMap();
  
  useEffect(() => {
    // Initially center on user location
    map.setView([userLocation.lat, userLocation.lng], 14);
    
    // If we need to fit all markers
    if (fitAllMarkers) {
      const points = [
        [userLocation.lat, userLocation.lng],
      ];
      
      // Add other markers if they exist
      if (partnerLocation) {
        points.push([partnerLocation.lat, partnerLocation.lng]);
      }
      
      if (pickupLocation) {
        points.push([pickupLocation.lat, pickupLocation.lng]);
      }
      
      if (dropoffLocation) {
        points.push([dropoffLocation.lat, dropoffLocation.lng]);
      }
      
      // Only fit bounds if we have more than one point
      if (points.length > 1) {
        const bounds = L.latLngBounds(points.map(p => L.latLng(p[0], p[1])));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [map, userLocation, partnerLocation, pickupLocation, dropoffLocation, fitAllMarkers]);
  
  return null;
}

// Calculate distance between two coordinates
function getDistanceInMeters(loc1: Location, loc2: Location): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = loc1.lat * Math.PI / 180;
  const φ2 = loc2.lat * Math.PI / 180;
  const Δφ = (loc2.lat - loc1.lat) * Math.PI / 180;
  const Δλ = (loc2.lng - loc1.lng) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

// Format distance in meters to human-readable text
function formatDistanceInMeters(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  } else {
    return `${(meters / 1000).toFixed(1)}km`;
  }
}

// Calculate estimated time of arrival
function calculateETA(distanceInMeters: number, speedKmh: number): number {
  // Convert speed from km/h to m/s
  const speedMs = speedKmh * 1000 / 3600;
  // Calculate time in seconds
  return distanceInMeters / speedMs;
}

// Format seconds to time string
function formatETA(seconds: number): string {
  if (seconds < 60) {
    return "Less than a minute";
  } else if (seconds < 3600) {
    return `${Math.round(seconds / 60)} mins`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.round((seconds % 3600) / 60);
    return `${hours} ${hours === 1 ? 'hr' : 'hrs'} ${mins} min${mins !== 1 ? 's' : ''}`;
  }
}

interface LiveLocationTrackerProps {
  rideId: number;
  userId: number;
  partnerId: number;
  pickupLocation?: Location;
  dropoffLocation?: Location;
  onArrived?: () => void;
}

export function LiveLocationTracker({
  rideId,
  userId,
  partnerId,
  pickupLocation,
  dropoffLocation,
  onArrived
}: LiveLocationTrackerProps) {
  const [userLocation, setUserLocation] = useState<Location>({ lat: 37.7749, lng: -122.4194 });
  const [partnerLocation, setPartnerLocation] = useState<Location | null>(null);
  const [isLocationShared, setIsLocationShared] = useState(false);
  const [rideStatus, setRideStatus] = useState<'waiting' | 'enroute' | 'arrived' | 'completed'>('waiting');
  const [distance, setDistance] = useState<number | null>(null);
  const [eta, setEta] = useState<number | null>(null);
  const [securityAlerts, setSecurityAlerts] = useState<string[]>([]);
  const watchIdRef = useRef<number | null>(null);
  
  // Simulated driver speed in km/h
  const [driverSpeed, setDriverSpeed] = useState(30);
  
  // Get initial user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error("Error getting location: ", error);
          toast({
            title: "Location Error",
            description: "Unable to access your location. Please check your settings.",
            variant: "destructive"
          });
        }
      );
    }
  }, []);
  
  // Simulated partner location and movement
  useEffect(() => {
    if (pickupLocation) {
      // Start with partner at some distance from pickup location
      const partnerStartLat = pickupLocation.lat + (Math.random() - 0.5) * 0.01;
      const partnerStartLng = pickupLocation.lng + (Math.random() - 0.5) * 0.01;
      
      setPartnerLocation({ lat: partnerStartLat, lng: partnerStartLng });
      
      // Update partner location periodically to simulate movement
      const moveInterval = setInterval(() => {
        setPartnerLocation((prev) => {
          if (!prev) return null;
          
          // Determine target location based on ride status
          const targetLoc = rideStatus === 'waiting' ? pickupLocation : dropoffLocation;
          
          if (!targetLoc) return prev;
          
          // Calculate direction vector towards target
          const latDiff = targetLoc.lat - prev.lat;
          const lngDiff = targetLoc.lng - prev.lng;
          
          // Calculate magnitude of movement (random speed variations)
          const speed = 0.00005 + Math.random() * 0.00003;
          
          // Calculate new position
          const newLat = prev.lat + latDiff * speed;
          const newLng = prev.lng + lngDiff * speed;
          
          // Check if we've arrived at the target
          const distanceToTarget = getDistanceInMeters(
            { lat: newLat, lng: newLng },
            targetLoc
          );
          
          if (distanceToTarget < 50) {
            if (rideStatus === 'waiting') {
              setRideStatus('enroute');
              toast({
                title: "Driver Arrived",
                description: "Your driver has arrived at the pickup location.",
              });
            } else if (rideStatus === 'enroute' && onArrived) {
              setRideStatus('arrived');
              onArrived();
              toast({
                title: "Destination Reached",
                description: "You have arrived at your destination.",
              });
              
              // Stop the interval after arriving at final destination
              clearInterval(moveInterval);
            }
          }
          
          return { lat: newLat, lng: newLng };
        });
      }, 1000);
      
      return () => clearInterval(moveInterval);
    }
  }, [pickupLocation, dropoffLocation, rideStatus, onArrived]);
  
  // Calculate distance and ETA when locations change
  useEffect(() => {
    if (partnerLocation && userLocation) {
      const dist = getDistanceInMeters(userLocation, partnerLocation);
      setDistance(dist);
      
      const estimatedEta = calculateETA(dist, driverSpeed);
      setEta(estimatedEta);
    }
  }, [userLocation, partnerLocation, driverSpeed]);
  
  // Toggle location sharing
  const toggleLocationSharing = () => {
    if (isLocationShared) {
      // Stop sharing location
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsLocationShared(false);
      
      toast({
        title: "Location Sharing Disabled",
        description: "Your location is no longer being shared with the driver."
      });
    } else {
      // Start sharing location
      if (navigator.geolocation) {
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude });
          },
          (error) => {
            console.error("Error watching location: ", error);
          },
          { enableHighAccuracy: true }
        );
        
        watchIdRef.current = watchId;
        setIsLocationShared(true);
        
        toast({
          title: "Location Sharing Enabled",
          description: "Your location is now being shared with the driver."
        });
      } else {
        toast({
          title: "Location Error",
          description: "Geolocation is not supported by your browser.",
          variant: "destructive"
        });
      }
    }
  };
  
  // Safety check trigger
  const triggerSafetyCheck = () => {
    toast({
      title: "Safety Check Initiated",
      description: "Your current ride details have been shared with your emergency contacts."
    });
    
    setSecurityAlerts(prev => [
      ...prev,
      "Safety check initiated. Ride details shared with emergency contacts."
    ]);
  };
  
  return (
    <div className="flex flex-col space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Live Tracking</CardTitle>
            <Badge 
              variant={rideStatus === 'waiting' ? 'outline' : 
                rideStatus === 'enroute' ? 'default' :
                rideStatus === 'arrived' ? 'secondary' : 'secondary'}
            >
              {rideStatus === 'waiting' ? 'Driver on the way' : 
               rideStatus === 'enroute' ? 'En Route' :
               rideStatus === 'arrived' ? 'Arrived' : 'Completed'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Map */}
          <div className="h-[250px] w-full rounded-md overflow-hidden mb-4">
            <MapContainer
              center={[userLocation.lat, userLocation.lng]}
              zoom={14}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <LiveMapController
                userLocation={userLocation}
                partnerLocation={partnerLocation || undefined}
                pickupLocation={pickupLocation}
                dropoffLocation={dropoffLocation}
              />
              
              {/* User location */}
              <Marker position={[userLocation.lat, userLocation.lng]} icon={UserLocationIcon}>
                <Popup>You are here</Popup>
              </Marker>
              
              {/* Partner/driver location */}
              {partnerLocation && (
                <Marker position={[partnerLocation.lat, partnerLocation.lng]} icon={PartnerLocationIcon}>
                  <Popup>Driver location</Popup>
                </Marker>
              )}
              
              {/* Pickup location */}
              {pickupLocation && (
                <>
                  <Marker position={[pickupLocation.lat, pickupLocation.lng]}>
                    <Popup>Pickup location</Popup>
                  </Marker>
                  <Circle 
                    center={[pickupLocation.lat, pickupLocation.lng]} 
                    radius={100} 
                    pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }} 
                  />
                </>
              )}
              
              {/* Dropoff location */}
              {dropoffLocation && (
                <>
                  <Marker position={[dropoffLocation.lat, dropoffLocation.lng]}>
                    <Popup>Dropoff location</Popup>
                  </Marker>
                  <Circle 
                    center={[dropoffLocation.lat, dropoffLocation.lng]} 
                    radius={100} 
                    pathOptions={{ color: 'green', fillColor: 'green', fillOpacity: 0.1 }} 
                  />
                </>
              )}
            </MapContainer>
          </div>
          
          {/* Info section */}
          <div className="space-y-3">
            {/* Distance & ETA */}
            {partnerLocation && (
              <div className="flex justify-between items-center">
                <div className="flex items-center text-sm">
                  <Navigation className="h-4 w-4 mr-2 text-primary" />
                  <span className="font-medium">Distance:</span>
                  <span className="ml-1">{distance !== null ? formatDistanceInMeters(distance) : 'Calculating...'}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-primary" />
                  <span className="font-medium">ETA:</span>
                  <span className="ml-1">{eta !== null ? formatETA(eta) : 'Calculating...'}</span>
                </div>
              </div>
            )}
            
            {/* Progress bar */}
            {pickupLocation && dropoffLocation && partnerLocation && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Pickup</span>
                  <span>Destination</span>
                </div>
                <Progress 
                  value={rideStatus === 'waiting' ? 10 : 
                         rideStatus === 'enroute' ? 50 : 
                         rideStatus === 'arrived' ? 100 : 100} 
                  className="h-2"
                />
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="border-t pt-4 flex flex-wrap gap-2">
          <Button
            variant={isLocationShared ? "default" : "outline"}
            size="sm"
            onClick={toggleLocationSharing}
            className="flex-1"
          >
            <Share className="h-4 w-4 mr-2" />
            {isLocationShared ? "Sharing Location" : "Share Location"}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={triggerSafetyCheck}
            className="flex-1"
          >
            <Shield className="h-4 w-4 mr-2" />
            Safety Check
          </Button>
        </CardFooter>
      </Card>
      
      {/* Security alerts */}
      {securityAlerts.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {securityAlerts[securityAlerts.length - 1]}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Driver info card */}
      {partnerLocation && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-3 relative">
                <Car className="h-6 w-6 text-primary" />
                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-background"></div>
              </div>
              
              <div className="flex-1">
                <div className="font-medium">Alex Johnson</div>
                <div className="text-sm text-muted-foreground flex items-center">
                  <span className="flex items-center">
                    <Star className="h-3.5 w-3.5 text-amber-500 mr-1" />
                    4.8
                  </span>
                  <span className="mx-2">•</span>
                  <span>Toyota Camry • ABC123</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="rounded-full h-9 w-9">
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button variant="default" size="icon" className="rounded-full h-9 w-9">
                  <PhoneCall className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Vehicle details */}
            <div className="mt-3 text-sm">
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>Verified driver</span>
                <Info className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
              </div>
              <div className="flex items-center mt-1">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>Background checked</span>
                <Info className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}