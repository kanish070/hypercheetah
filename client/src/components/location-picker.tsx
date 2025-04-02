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
        
        // Format the coordinates for better display
        const formatCoordinate = (coord: number): string => {
          return coord.toFixed(6);
        };
        
        // Create a precise location name with exact coordinates
        const locationName = "Your Exact Current Location";
        
        // For a more user-friendly description, we'll use the coordinates in a readable format
        const locationDesc = `Coordinates: ${formatCoordinate(latitude)}, ${formatCoordinate(longitude)}`;
        
        // Add this location to saved locations for quick access
        const locationObj = {
          name: locationName,
          desc: locationDesc,
          icon: "navigation", 
          location: currentLocation
        };
        
        // Filter out any existing current location entries
        const filteredLocations = savedLocations.filter(loc => !loc.name.includes("Current Location"));
        
        // Add the new current location to the saved locations
        setSavedLocations([locationObj, ...filteredLocations.slice(0, 2)]);
        
        // Update the search query and pass location to parent
        setSearchQuery(locationName);
        onLocationSelect(currentLocation);
        
        // Show success notification
        toast({
          title: "Location detected",
          description: `Using your exact location at ${formatCoordinate(latitude)}, ${formatCoordinate(longitude)}`,
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