import React, { useState, useRef, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  MapPin, Search, Home, Building, Briefcase, Star, X, Clock, 
  Navigation, ChevronRight, Crosshair, AlertCircle, Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Location } from '@shared/schema';

interface LocationPickerProps {
  onLocationSelect: (location: Location) => void;
  placeholder?: string;
  selectedLocation?: Location;
}

export function LocationPicker({ onLocationSelect, placeholder, selectedLocation }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<Array<{ name: string; desc: string; location: Location }>>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Simplified saved locations - combining saved and recent into a single list
  const [savedLocations, setSavedLocations] = useState<Array<{ name: string; desc: string; icon: string; location: Location }>>([
    { 
      name: "Home", 
      desc: "B-14 Vasant Kunj, New Delhi, 110070", 
      icon: "home", 
      location: { lat: 28.5424, lng: 77.1562 } 
    },
    { 
      name: "Work", 
      desc: "Cyber City, Gurugram, Haryana, 122002", 
      icon: "briefcase", 
      location: { lat: 28.4968, lng: 77.0881 } 
    },
    { 
      name: "Gym", 
      desc: "Sector 29, Gurugram, Haryana, 122001", 
      icon: "star", 
      location: { lat: 28.4685, lng: 77.0636 } 
    }
  ]);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  // Simulate search results - in a real app, this would call a geocoding API
  useEffect(() => {
    if (searchQuery.length > 2) {
      // Limit to just 2 suggestions to prevent cluttering
      const fakeAddresses = [
        {
          name: `${searchQuery} Road`,
          desc: `Connaught Place, New Delhi, 110001`,
          location: { lat: 28.6139 + Math.random() * 0.01, lng: 77.2090 + Math.random() * 0.01 }
        },
        {
          name: `${searchQuery} Marg`,
          desc: `Saket, New Delhi, 110017`,
          location: { lat: 28.5280 + Math.random() * 0.01, lng: 77.2130 + Math.random() * 0.01 }
        }
      ];
      
      setSuggestions(fakeAddresses);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);
  
  // Handle click outside of search container
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const handleSuggestionClick = (suggestion: { name: string; desc: string; location: Location }) => {
    onLocationSelect(suggestion.location);
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
    
    // Add to saved locations if not already in the list
    if (!savedLocations.some(loc => loc.name === suggestion.name)) {
      const newLocation = {
        ...suggestion,
        icon: 'mapPin'
      };
      setSavedLocations(prev => [newLocation, ...prev.slice(0, 2)]);
    }
  };
  
  const renderLocationIcon = (iconName: string) => {
    switch (iconName) {
      case 'home':
        return <Home className="h-4 w-4" />;
      case 'briefcase':
        return <Briefcase className="h-4 w-4" />;
      case 'star':
        return <Star className="h-4 w-4" />;
      case 'navigation':
        return <Navigation className="h-4 w-4" />;
      case 'clock':
        return <Clock className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };
  
  const handleUseCurrentLocation = () => {
    setIsLoadingLocation(true);
    setShowSuggestions(false);
    
    if (!navigator.geolocation) {
      toast({
        title: "Location Error",
        description: "Your browser doesn't support geolocation services",
        variant: "destructive"
      });
      setIsLoadingLocation(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const currentLocation = { lat: latitude, lng: longitude };
        
        // Attempt to find the nearest known location for user-friendly display
        // In production, you would use a proper reverse geocoding service
        const indianLocations = [
          { name: "Delhi", lat: 28.6139, lng: 77.2090 },
          { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
          { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
          { name: "Hyderabad", lat: 17.3850, lng: 78.4867 },
          { name: "Chennai", lat: 13.0827, lng: 80.2707 },
          { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
          { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
          { name: "Pune", lat: 18.5204, lng: 73.8567 },
          { name: "Jaipur", lat: 26.9124, lng: 75.7873 },
          { name: "Lucknow", lat: 26.8467, lng: 80.9462 },
          { name: "Noida", lat: 28.5355, lng: 77.3910 },
          { name: "Gurugram", lat: 28.4595, lng: 77.0266 },
          { name: "Chandigarh", lat: 30.7333, lng: 76.7794 },
          { name: "Indore", lat: 22.7196, lng: 75.8577 },
          { name: "Bhopal", lat: 23.2599, lng: 77.4126 },
        ];
        
        // Find closest city using Haversine formula for better approximation
        const getDistanceInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
          const R = 6371; // Radius of the earth in km
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLon = (lon2 - lon1) * Math.PI / 180;
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          return R * c;
        };
        
        // Find closest city
        let closestCity = indianLocations[0];
        let minDistance = getDistanceInKm(latitude, longitude, closestCity.lat, closestCity.lng);
        
        indianLocations.forEach(city => {
          const distance = getDistanceInKm(latitude, longitude, city.lat, city.lng);
          if (distance < minDistance) {
            minDistance = distance;
            closestCity = city;
          }
        });
        
        const locationName = `Current Location (near ${closestCity.name})`;
        
        // Add this location to saved locations for quick access
        const locationObj = {
          name: locationName,
          desc: `${closestCity.name}, India`,
          icon: "navigation",
          location: currentLocation
        };
        
        if (!savedLocations.some(loc => loc.name.includes("Current Location"))) {
          setSavedLocations(prev => [locationObj, ...prev.slice(0, 2)]);
        }
        
        // Update the search query and pass location to parent
        setSearchQuery(locationName);
        onLocationSelect(currentLocation);
        
        // Show success notification
        toast({
          title: "Location detected",
          description: `Using your location near ${closestCity.name}`,
        });
        
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsLoadingLocation(false);
        
        let errorMessage = "Unable to detect your location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location access in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable at this time.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
        }
        
        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive"
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
        maximumAge: 0
      }
    );
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    setShowSuggestions(false);
  };
  
  // Function to check if a location is currently selected
  const isLocationSelected = (location: Location) => {
    return selectedLocation && 
           location.lat === selectedLocation.lat && 
           location.lng === selectedLocation.lng;
  };

  return (
    <div className="relative w-full" ref={searchContainerRef}>
      <div className="relative">
        <Input
          placeholder={placeholder || "Enter destination"}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.length > 2 && setShowSuggestions(true)}
          className="pl-10 pr-10 bg-background"
        />
        <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-primary" />
        <div className="absolute right-0 top-0 h-full flex">
          {/* Current location button */}
          <Button
            variant="ghost"
            onClick={handleUseCurrentLocation}
            className="h-full px-2 text-muted-foreground"
            title="Use current location"
            disabled={isLoadingLocation}
          >
            {isLoadingLocation ? (
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
            ) : (
              <Crosshair className="h-4 w-4 text-primary" />
            )}
          </Button>

          {/* Clear button or search icon */}
          {searchQuery ? (
            <Button
              variant="ghost"
              className="h-full px-2 text-muted-foreground"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex items-center px-2">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
      </div>
      
      {/* Suggestions dropdown */}
      {showSuggestions && (
        <Card className="absolute mt-1 w-full z-50 shadow-lg overflow-hidden border border-primary/20">
          <div className="max-h-[300px] overflow-y-auto">
            {/* Use current location */}
            <div 
              className={`flex items-center p-3 ${isLoadingLocation ? 'cursor-wait opacity-70' : 'cursor-pointer hover:bg-primary/5'} border-b`}
              onClick={!isLoadingLocation ? handleUseCurrentLocation : undefined}
            >
              <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center mr-3">
                {isLoadingLocation ? (
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                ) : (
                  <Crosshair className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="font-medium">
                {isLoadingLocation ? "Detecting your location..." : "Use current location"}
              </div>
            </div>
            
            {/* Search results */}
            {suggestions.map((suggestion, index) => {
              const isSelected = isLocationSelected(suggestion.location);
              return (
                <div 
                  key={`suggestion-${index}`}
                  className={`flex items-center p-3 cursor-pointer ${
                    isSelected 
                      ? 'bg-primary/10 border-l-2 border-l-primary' 
                      : 'hover:bg-muted/70'
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className={`h-8 w-8 rounded-full ${
                    isSelected ? 'bg-primary/30' : 'bg-primary/15'
                  } flex items-center justify-center mr-3`}>
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div className="overflow-hidden">
                    <div className={`font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                      {suggestion.name}
                      {isSelected && <span className="ml-1 text-xs text-primary-foreground bg-primary rounded-full px-1.5 py-0">✓</span>}
                    </div>
                    <div className="text-sm text-foreground/70 truncate">{suggestion.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
      
      {/* Quick access locations */}
      {!searchQuery && !showSuggestions && (
        <Card className="mt-2 border border-primary/20">
          <div className="p-1">
            {/* Show just a combined compact list of saved locations */}
            {savedLocations.slice(0, 3).map((location: any, index: number) => {
              const isSelected = isLocationSelected(location.location);
              return (
                <div 
                  key={`location-${index}`}
                  className={`flex items-center p-2.5 cursor-pointer rounded-md ${
                    isSelected 
                      ? 'bg-primary/10 border border-primary/40' 
                      : 'hover:bg-muted/70'
                  } ${index < savedLocations.slice(0, 3).length - 1 ? 'border-b' : ''}`}
                  onClick={() => handleSuggestionClick(location)}
                >
                  <div className={`h-8 w-8 rounded-full ${
                    isSelected ? 'bg-primary/30' : 'bg-primary/15'
                  } flex items-center justify-center mr-3`}>
                    {renderLocationIcon(location.icon)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className={`font-medium truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                      {location.name}
                      {isSelected && <span className="ml-1 text-xs text-primary-foreground bg-primary rounded-full px-1.5 py-0">✓</span>}
                    </div>
                    <div className="text-sm text-foreground/70 truncate">{location.desc}</div>
                  </div>
                  <ChevronRight className={`h-4 w-4 ml-1 ${
                    isSelected ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}