import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Navigation,
  Clock,
  Car,
  AlertTriangle,
  Share2,
  User,
  Shield,
  PhoneCall,
  Coffee,
  ArrowRight,
  CheckCircle2,
  Send,
  BellRing,
  BellOff,
  Locate,
  AlertCircle,
  Lock,
  Timer,
  Home,
  Building,
  HeartPulse,
  Info
} from "lucide-react";
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Location, Route } from "@shared/schema";
import { RouteMap } from './route-map';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Map implementation component
// In a real app, this would use Leaflet or Google Maps for full interactive experience
function LiveMapController({ 
  userLocation,
  partnerLocation,
  pickupLocation,
  dropoffLocation
}: { 
  userLocation: Location, 
  partnerLocation?: Location,
  pickupLocation?: Location,
  dropoffLocation?: Location,
}) {
  return (
    <div className="relative w-full h-full rounded-md overflow-hidden">
      <RouteMap 
        center={userLocation}
        route={partnerLocation ? {
          start: userLocation,
          end: partnerLocation,
          waypoints: []
        } : undefined}
        className="h-full"
      />
      
      {/* Overlay location markers */}
      {pickupLocation && (
        <div 
          className="absolute w-6 h-6 bg-green-500 rounded-full flex items-center justify-center -ml-3 -mt-3 border-2 border-white"
          style={{ 
            left: '20%', 
            top: '50%'
          }}
        >
          <MapPin className="h-3 w-3 text-white" />
        </div>
      )}
      
      {dropoffLocation && (
        <div 
          className="absolute w-6 h-6 bg-red-500 rounded-full flex items-center justify-center -ml-3 -mt-3 border-2 border-white"
          style={{ 
            left: '80%', 
            top: '30%'
          }}
        >
          <Navigation className="h-3 w-3 text-white" />
        </div>
      )}
      
      {/* User location */}
      <div 
        className="absolute w-8 h-8 bg-primary rounded-full flex items-center justify-center -ml-4 -mt-4 border-2 border-white animate-pulse"
        style={{ 
          left: '40%', 
          top: '60%'
        }}
      >
        <User className="h-4 w-4 text-white" />
      </div>
      
      {/* Partner location */}
      {partnerLocation && (
        <div 
          className="absolute w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center -ml-4 -mt-4 border-2 border-white animate-pulse"
          style={{ 
            left: '60%', 
            top: '45%'
          }}
        >
          <Car className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );
}

// Helper functions for distance and time calculations
function getDistanceInMeters(loc1: Location, loc2: Location): number {
  // In a real app, this would use the Haversine formula for accurate distances
  // For this example, we'll generate a random distance that looks realistic
  return Math.floor(Math.random() * 3000) + 500; // Between 500m and 3500m
}

function formatDistanceInMeters(meters: number): string {
  if (meters < 1000) {
    return `${meters}m`;
  } else {
    return `${(meters / 1000).toFixed(1)}km`;
  }
}

function calculateETA(distanceInMeters: number, speedKmh: number): number {
  // Calculate ETA in seconds
  const distanceInKm = distanceInMeters / 1000;
  const timeInHours = distanceInKm / speedKmh;
  return Math.round(timeInHours * 3600);
}

function formatETA(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} sec`;
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)} min`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
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
  // State for locations
  const [userLocation, setUserLocation] = useState<Location>({ lat: 40.7128, lng: -74.0060 });
  const [partnerLocation, setPartnerLocation] = useState<Location>({ lat: 40.7648, lng: -73.9808 });
  
  // State for tracking
  const [isLocationShared, setIsLocationShared] = useState<boolean>(true);
  const [isSafetyModeEnabled, setIsSafetyModeEnabled] = useState<boolean>(true);
  const [isGeofenceAlertEnabled, setIsGeofenceAlertEnabled] = useState<boolean>(true);
  const [isEtaAlertEnabled, setIsEtaAlertEnabled] = useState<boolean>(true);
  
  // State for partner info
  const [partnerInfo, setPartnerInfo] = useState({
    name: "Alex Johnson",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    isDriver: true,
    vehicle: isLocationShared ? "Black Toyota Camry • ABC123" : "Vehicle info hidden",
    rating: 4.8,
    onTime: true,
    status: 'en_route' as 'en_route' | 'arrived' | 'completed' | 'delayed',
    delay: 0, // minutes
    distance: 0, // meters
    eta: 0, // seconds
    speed: 35, // km/h
    isLocationShared: true,
  });
  
  // State for safety features
  const [safetyAlerts, setSafetyAlerts] = useState<{
    id: number;
    type: 'route_deviation' | 'unsafe_area' | 'speeding' | 'stopped' | 'geofence';
    message: string;
    timestamp: string;
    acknowledged: boolean;
  }[]>([]);
  
  // Dialog states
  const [showSafetyAlertDialog, setShowSafetyAlertDialog] = useState<boolean>(false);
  const [selectedSafetyAlert, setSelectedSafetyAlert] = useState<number | null>(null);
  const [showShareDialog, setShowShareDialog] = useState<boolean>(false);
  
  // Simulate user's moving location
  useEffect(() => {
    // Only update if location sharing is enabled
    if (!isLocationShared) return;
    
    const intervalId = setInterval(() => {
      setUserLocation(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.0005,
        lng: prev.lng + (Math.random() - 0.5) * 0.0005
      }));
    }, 3000);
    
    return () => clearInterval(intervalId);
  }, [isLocationShared]);
  
  // Simulate partner's moving location
  useEffect(() => {
    // Only update if location sharing is enabled
    if (!isLocationShared || !partnerInfo.isLocationShared) return;
    
    const intervalId = setInterval(() => {
      setPartnerLocation(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001
      }));
    }, 2000);
    
    return () => clearInterval(intervalId);
  }, [isLocationShared, partnerInfo.isLocationShared]);
  
  // Update distances and ETA
  useEffect(() => {
    if (isLocationShared && partnerInfo.isLocationShared) {
      const distanceInMeters = getDistanceInMeters(userLocation, partnerLocation);
      const etaInSeconds = calculateETA(distanceInMeters, partnerInfo.speed);
      
      setPartnerInfo(prev => ({
        ...prev,
        distance: distanceInMeters,
        eta: etaInSeconds
      }));
      
      // If distance is very close, trigger arrival
      if (distanceInMeters < 200 && partnerInfo.status === 'en_route') {
        setPartnerInfo(prev => ({
          ...prev,
          status: 'arrived'
        }));
        
        // Trigger arrival notification
        toast({
          title: "Partner has arrived!",
          description: `${partnerInfo.name} is at the meeting point.`,
        });
        
        // Call the onArrived callback if provided
        if (onArrived) {
          onArrived();
        }
      }
    }
  }, [userLocation, partnerLocation, isLocationShared, partnerInfo.isLocationShared, partnerInfo.speed, partnerInfo.status, onArrived, partnerInfo.name]);
  
  // Simulate random safety alerts
  useEffect(() => {
    // Only generate alerts if safety mode is enabled
    if (!isSafetyModeEnabled) return;
    
    const generateRandomAlert = () => {
      const alertTypes = ['route_deviation', 'unsafe_area', 'speeding', 'stopped', 'geofence'] as const;
      const randomType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      
      const alertMessages = {
        route_deviation: "Your driver has deviated from the planned route.",
        unsafe_area: "You are entering an area with safety concerns.",
        speeding: "Your vehicle is exceeding the speed limit.",
        stopped: "Your ride has been stopped for over 5 minutes.",
        geofence: "Your ride has left the expected area."
      };
      
      const newAlert = {
        id: Date.now(),
        type: randomType,
        message: alertMessages[randomType],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        acknowledged: false
      };
      
      setSafetyAlerts(prev => [newAlert, ...prev]);
      
      // Show dialog for geofence alerts if enabled
      if (randomType === 'geofence' && isGeofenceAlertEnabled) {
        setSelectedSafetyAlert(newAlert.id);
        setShowSafetyAlertDialog(true);
      }
      
      toast({
        variant: "destructive",
        title: "Safety Alert",
        description: alertMessages[randomType],
      });
    };
    
    // Set a timeout for a random alert between 15-30 seconds
    const timeout = setTimeout(() => {
      if (Math.random() < 0.3) {
        generateRandomAlert();
      }
    }, Math.random() * 15000 + 15000);
    
    return () => clearTimeout(timeout);
  }, [isSafetyModeEnabled, isGeofenceAlertEnabled, safetyAlerts]);
  
  // Safety alert acknowledgment
  const handleAcknowledgeAlert = useCallback((alertId: number) => {
    setSafetyAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true } 
          : alert
      )
    );
    setShowSafetyAlertDialog(false);
    setSelectedSafetyAlert(null);
  }, []);
  
  // Toggle location sharing
  const handleToggleLocationSharing = () => {
    setIsLocationShared(prev => !prev);
    
    toast({
      title: isLocationShared ? "Location sharing disabled" : "Location sharing enabled",
      description: isLocationShared 
        ? "Your location is now private."
        : "Your location is now visible to your ride partner."
    });
  };
  
  // Toggle safety mode
  const handleToggleSafetyMode = () => {
    setIsSafetyModeEnabled(prev => !prev);
    
    toast({
      title: isSafetyModeEnabled ? "Safety mode disabled" : "Safety mode enabled",
      description: isSafetyModeEnabled 
        ? "Safety alerts have been turned off."
        : "You will receive alerts about safety concerns."
    });
  };
  
  // Share location with contacts
  const handleShareLocation = () => {
    setShowShareDialog(true);
  };
  
  // Confirm share with contacts
  const handleConfirmShare = () => {
    toast({
      title: "Location shared",
      description: "Your live location has been shared with your emergency contacts."
    });
    setShowShareDialog(false);
  };
  
  // Emergency assistance
  const handleEmergencyAssistance = () => {
    toast({
      variant: "destructive",
      title: "Emergency assistance requested",
      description: "Help is on the way. Stay calm and remain in your current location if safe to do so."
    });
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-xl">
          <MapPin className="h-5 w-5 mr-2 text-primary" />
          Live Location Tracker
        </CardTitle>
        <CardDescription>
          Real-time location sharing and tracking for your ride
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Map View */}
        <div className="h-[300px] relative">
          <LiveMapController 
            userLocation={userLocation}
            partnerLocation={isLocationShared && partnerInfo.isLocationShared ? partnerLocation : undefined}
            pickupLocation={pickupLocation}
            dropoffLocation={dropoffLocation}
          />
          
          {/* Map controls overlay */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0 bg-white"
              onClick={() => {
                toast({
                  description: "Centering on your location"
                });
              }}
            >
              <Locate className="h-4 w-4" />
            </Button>
            
            <Button 
              variant={isLocationShared ? "outline" : "secondary"}
              size="sm" 
              className={`h-8 w-8 p-0 ${isLocationShared ? 'bg-white' : 'bg-secondary'}`}
              onClick={handleToggleLocationSharing}
            >
              {isLocationShared ? (
                <Share2 className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Geofence alert */}
          {isGeofenceAlertEnabled && (
            <div className="absolute top-4 left-4 right-4 mx-auto w-fit">
              <Badge variant="outline" className="bg-white shadow-md border-primary px-3 py-1">
                <Shield className="h-3.5 w-3.5 mr-1.5 text-primary" />
                Geofence active: You'll be alerted if the ride goes off course
              </Badge>
            </div>
          )}
        </div>
        
        {/* Partner info panel */}
        <div className="flex items-center justify-between p-4 border-t border-b">
          <div className="flex items-center">
            <Avatar className="h-12 w-12 mr-3">
              <AvatarImage src={partnerInfo.avatar} />
              <AvatarFallback>{partnerInfo.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-medium">{partnerInfo.name}</h3>
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  {partnerInfo.isDriver ? 'Driver' : 'Passenger'}
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground flex items-center">
                <Car className="h-3.5 w-3.5 mr-1" />
                {partnerInfo.vehicle}
              </div>
              
              <div className="flex items-center gap-2 text-xs mt-0.5">
                <div className="flex items-center">
                  <Star className="h-3.5 w-3.5 mr-0.5 text-amber-500" />
                  {partnerInfo.rating}
                </div>
                
                {partnerInfo.isLocationShared ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 h-5 text-[10px]">
                    <Share2 className="h-3 w-3 mr-0.5" />
                    Sharing location
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 h-5 text-[10px]">
                    <Lock className="h-3 w-3 mr-0.5" />
                    Location hidden
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            {partnerInfo.status === 'en_route' && (
              <>
                <div className="text-lg font-semibold flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-primary" />
                  {formatETA(partnerInfo.eta)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDistanceInMeters(partnerInfo.distance)} away
                </div>
                
                {partnerInfo.onTime ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mt-1 text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-0.5" />
                    On time
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 mt-1 text-xs">
                    <AlertCircle className="h-3 w-3 mr-0.5" />
                    {partnerInfo.delay} min delayed
                  </Badge>
                )}
              </>
            )}
            
            {partnerInfo.status === 'arrived' && (
              <Badge className="bg-green-100 text-green-800 border-green-200 py-1.5 px-2">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Arrived at your location
              </Badge>
            )}
            
            {partnerInfo.status === 'completed' && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 py-1.5 px-2">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Ride completed
              </Badge>
            )}
          </div>
        </div>
        
        {/* Safety Features */}
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium flex items-center">
              <Shield className="h-5 w-5 mr-2 text-primary" />
              Safety Features
            </h3>
            
            <div className="flex items-center">
              <Label className="flex items-center space-x-2 text-sm">
                <span>Safety Mode</span>
                <Switch 
                  checked={isSafetyModeEnabled}
                  onCheckedChange={handleToggleSafetyMode}
                />
              </Label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <Button 
              variant="outline" 
              className="justify-start border-primary/20 hover:bg-primary/5 hover:text-primary"
              onClick={handleEmergencyAssistance}
            >
              <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
              Emergency Assistance
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start border-primary/20 hover:bg-primary/5 hover:text-primary"
            >
              <PhoneCall className="h-4 w-4 mr-2 text-primary" />
              Call Partner
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start border-primary/20 hover:bg-primary/5 hover:text-primary"
              onClick={handleShareLocation}
            >
              <Share2 className="h-4 w-4 mr-2 text-primary" />
              Share with Contacts
            </Button>
          </div>
          
          {/* Active Safety Alerts */}
          {isSafetyModeEnabled && safetyAlerts.filter(a => !a.acknowledged).length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1.5 text-red-500" />
                Active Safety Alerts
              </h4>
              
              <div className="space-y-2">
                <AnimatePresence>
                  {safetyAlerts
                    .filter(alert => !alert.acknowledged)
                    .map(alert => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                          <div className="flex justify-between">
                            <div className="font-medium text-red-800 flex items-center">
                              <AlertTriangle className="h-4 w-4 mr-1.5 text-red-600" />
                              {alert.type === 'route_deviation' && 'Route Deviation Detected'}
                              {alert.type === 'unsafe_area' && 'Unsafe Area Warning'}
                              {alert.type === 'speeding' && 'Speeding Alert'}
                              {alert.type === 'stopped' && 'Unexpected Stop'}
                              {alert.type === 'geofence' && 'Geofence Boundary Alert'}
                            </div>
                            <div className="text-xs text-red-700">{alert.timestamp}</div>
                          </div>
                          
                          <p className="text-sm text-red-700 mt-1">{alert.message}</p>
                          
                          <div className="mt-2 flex justify-end">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="bg-white text-xs border-red-200 text-red-800 hover:bg-red-50"
                              onClick={() => handleAcknowledgeAlert(alert.id)}
                            >
                              Acknowledge
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>
            </div>
          )}
          
          {/* Ride Progress */}
          {partnerInfo.status === 'en_route' && (
            <div className="mt-2">
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-sm font-medium">Ride Progress</h4>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceInMeters(partnerInfo.distance)} remaining
                </div>
              </div>
              <Progress 
                value={Math.max(0, Math.min(100, 100 - ((partnerInfo.distance / 5000) * 100)))} 
                className="h-2" 
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <div className="flex items-center">
                  <Car className="h-3 w-3 mr-1" />
                  Started
                </div>
                <div className="flex items-center">
                  <Navigation className="h-3 w-3 mr-1" />
                  Destination
                </div>
              </div>
            </div>
          )}
          
          {/* Notification Settings */}
          <Separator />
          
          <div>
            <h4 className="text-sm font-medium mb-2">Notification Settings</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center space-x-2 text-sm cursor-pointer">
                  <AlertCircle className="h-4 w-4 mr-1.5 text-primary" />
                  <span>Geofence Alerts</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    (Notify when ride deviates from expected route)
                  </span>
                </Label>
                <Switch 
                  checked={isGeofenceAlertEnabled}
                  onCheckedChange={setIsGeofenceAlertEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="flex items-center space-x-2 text-sm cursor-pointer">
                  <Clock className="h-4 w-4 mr-1.5 text-primary" />
                  <span>ETA Updates</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    (Notify when ETA changes significantly)
                  </span>
                </Label>
                <Switch 
                  checked={isEtaAlertEnabled}
                  onCheckedChange={setIsEtaAlertEnabled}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t px-4 py-3">
        <div className="w-full flex flex-col md:flex-row justify-between gap-2 text-center md:text-left">
          <div className="text-sm text-muted-foreground flex items-center justify-center md:justify-start">
            <Shield className="h-4 w-4 mr-2 text-primary" />
            <span>Safety features active • Trip monitored in real-time</span>
          </div>
          
          <div className="flex items-center justify-center md:justify-end">
            <Label className="flex items-center space-x-2 text-sm">
              <span>Share Location</span>
              <Switch 
                checked={isLocationShared}
                onCheckedChange={handleToggleLocationSharing}
              />
            </Label>
          </div>
        </div>
      </CardFooter>
      
      {/* Safety Alert Dialog */}
      <Dialog open={showSafetyAlertDialog} onOpenChange={setShowSafetyAlertDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Safety Alert
            </DialogTitle>
            <DialogDescription>
              We've detected a potential safety concern with your current ride.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-red-50 border border-red-200 rounded-md p-4 my-2">
            <h4 className="font-medium text-red-800 mb-1">
              {safetyAlerts.find(a => a.id === selectedSafetyAlert)?.type === 'geofence' && 'Geofence Boundary Alert'}
            </h4>
            <p className="text-sm text-red-700">
              {safetyAlerts.find(a => a.id === selectedSafetyAlert)?.message || 
               "Your ride has left the expected route. This could be due to traffic, a detour, or other reasons."}
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline"
                className="justify-center"
                onClick={() => {
                  if (selectedSafetyAlert) {
                    handleAcknowledgeAlert(selectedSafetyAlert);
                  }
                }}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                I'm Safe
              </Button>
              
              <Button 
                variant="destructive"
                className="justify-center"
                onClick={handleEmergencyAssistance}
              >
                <HeartPulse className="h-4 w-4 mr-2" />
                Get Emergency Help
              </Button>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full justify-center"
              onClick={handleShareLocation}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share My Location with Contacts
            </Button>
          </div>
          
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
            <Button 
              variant="ghost" 
              onClick={() => {
                setShowSafetyAlertDialog(false);
                if (selectedSafetyAlert) {
                  handleAcknowledgeAlert(selectedSafetyAlert);
                }
              }}
            >
              Dismiss Alert
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => {
                toast({
                  title: "Contacting ride partner",
                  description: "Connecting you with your ride partner..."
                });
                setShowSafetyAlertDialog(false);
              }}
            >
              <PhoneCall className="h-4 w-4 mr-2" />
              Contact Partner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Share Location Dialog */}
      <AlertDialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Share Your Live Location</AlertDialogTitle>
            <AlertDialogDescription>
              Share your real-time location with your emergency contacts for safety.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-3 my-2">
            <div className="flex items-center space-x-3 p-2 border rounded-md">
              <Avatar className="h-9 w-9">
                <AvatarImage src="https://randomuser.me/api/portraits/women/44.jpg" />
                <AvatarFallback>EC</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium text-sm">Emma Lewis</div>
                <div className="text-xs text-muted-foreground">Emergency Contact</div>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center space-x-3 p-2 border rounded-md">
              <Avatar className="h-9 w-9">
                <AvatarImage src="https://randomuser.me/api/portraits/men/67.jpg" />
                <AvatarFallback>DC</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium text-sm">David Chen</div>
                <div className="text-xs text-muted-foreground">Emergency Contact</div>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mt-3">
              <div className="flex items-start">
                <Info className="h-4 w-4 mr-2 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  Your contacts will receive a text message with a link to track your location in real-time for the next 2 hours.
                </div>
              </div>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share Location
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}