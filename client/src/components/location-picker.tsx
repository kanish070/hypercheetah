import React, { useState, useRef, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  MapPin, Search, Home, Building, Briefcase, Star, X, Clock, 
  Navigation, ChevronRight, Crosshair
} from "lucide-react";
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
  const [recentLocations, setRecentLocations] = useState<Array<{ name: string; desc: string; location: Location }>>([
    { 
      name: "Home", 
      desc: "123 Main Street, San Francisco, CA", 
      location: { lat: 37.7749, lng: -122.4194 } 
    },
    { 
      name: "Work", 
      desc: "456 Market Street, San Francisco, CA", 
      location: { lat: 37.7899, lng: -122.4009 } 
    },
    { 
      name: "Gym", 
      desc: "789 Fitness Avenue, San Francisco, CA", 
      location: { lat: 37.7833, lng: -122.4167 } 
    }
  ]);
  
  const [savedLocations, setSavedLocations] = useState<Array<{ name: string; desc: string; icon: string; location: Location }>>([
    { 
      name: "Home", 
      desc: "123 Main Street, San Francisco, CA", 
      icon: "home", 
      location: { lat: 37.7749, lng: -122.4194 } 
    },
    { 
      name: "Office", 
      desc: "456 Market Street, San Francisco, CA", 
      icon: "briefcase", 
      location: { lat: 37.7899, lng: -122.4009 } 
    },
    { 
      name: "Gym", 
      desc: "789 Fitness Avenue, San Francisco, CA", 
      icon: "star", 
      location: { lat: 37.7833, lng: -122.4167 } 
    }
  ]);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  // Simulate search results - in a real app, this would call a geocoding API
  useEffect(() => {
    if (searchQuery.length > 2) {
      const fakeAddresses = [
        {
          name: `${searchQuery} Main St`,
          desc: `San Francisco, CA 94107`,
          location: { lat: 37.7749 + Math.random() * 0.01, lng: -122.4194 + Math.random() * 0.01 }
        },
        {
          name: `${searchQuery} Market St`,
          desc: `San Francisco, CA 94103`,
          location: { lat: 37.7749 + Math.random() * 0.01, lng: -122.4194 + Math.random() * 0.01 }
        },
        {
          name: `${searchQuery} Valencia St`,
          desc: `San Francisco, CA 94110`,
          location: { lat: 37.7749 + Math.random() * 0.01, lng: -122.4194 + Math.random() * 0.01 }
        },
        {
          name: `${searchQuery} Hayes St`,
          desc: `San Francisco, CA 94117`,
          location: { lat: 37.7749 + Math.random() * 0.01, lng: -122.4194 + Math.random() * 0.01 }
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
    
    // Add to recent locations if not already in the list
    if (!recentLocations.some(loc => loc.name === suggestion.name)) {
      setRecentLocations(prev => [suggestion, ...prev.slice(0, 2)]);
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
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };
  
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const currentLocation = { lat: latitude, lng: longitude };
          onLocationSelect(currentLocation);
          setSearchQuery("Current Location");
        },
        (error) => {
          console.error("Error getting location: ", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
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
          className="pl-10 pr-10"
        />
        <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-primary" />
        {searchQuery ? (
          <Button
            variant="ghost"
            className="absolute right-0 top-0 h-full px-3 text-muted-foreground"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        ) : (
          <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
        )}
      </div>
      
      {/* Suggestions dropdown */}
      {showSuggestions && (
        <Card className="absolute mt-1 w-full z-50 shadow-lg overflow-hidden">
          <div className="max-h-[300px] overflow-y-auto">
            {/* Use current location */}
            <div 
              className="flex items-center p-3 cursor-pointer hover:bg-muted"
              onClick={handleUseCurrentLocation}
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <Crosshair className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-medium">Use current location</div>
                <div className="text-xs text-muted-foreground">Detect your current GPS location</div>
              </div>
            </div>
            
            {/* Search results */}
            {suggestions.map((suggestion, index) => {
              const isSelected = isLocationSelected(suggestion.location);
              return (
                <div 
                  key={`suggestion-${index}`}
                  className={`flex items-center p-3 cursor-pointer border-t ${
                    isSelected 
                      ? 'bg-primary/10 border-l-2 border-l-primary' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className={`h-8 w-8 rounded-full ${
                    isSelected ? 'bg-primary/30' : 'bg-primary/10'
                  } flex items-center justify-center mr-3`}>
                    <MapPin className={`h-4 w-4 ${
                      isSelected ? 'text-primary' : 'text-primary'
                    }`} />
                  </div>
                  <div>
                    <div className={`font-medium ${isSelected ? 'text-primary' : ''}`}>
                      {suggestion.name}
                      {isSelected && <span className="ml-2 text-xs text-primary-foreground bg-primary rounded-full px-2 py-0.5">Selected</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">{suggestion.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
      
      {/* Recent locations (when input is empty and not focused) */}
      {!searchQuery && !showSuggestions && (
        <div className="mt-4">
          <div className="text-sm font-medium mb-2 flex items-center">
            <Clock className="h-4 w-4 mr-1.5" />
            Recent Locations
          </div>
          <div className="space-y-2">
            {recentLocations.map((location, index) => {
              const isSelected = isLocationSelected(location.location);
              return (
                <div 
                  key={`recent-${index}`}
                  className={`flex items-center p-2 cursor-pointer rounded-md ${
                    isSelected 
                      ? 'bg-primary/10 border border-primary/40' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => handleSuggestionClick(location)}
                >
                  <div className={`h-8 w-8 rounded-full ${
                    isSelected ? 'bg-primary/30' : 'bg-primary/10'
                  } flex items-center justify-center mr-3`}>
                    <MapPin className={`h-4 w-4 ${
                      isSelected ? 'text-primary-foreground' : 'text-primary'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${isSelected ? 'text-primary' : ''}`}>
                      {location.name}
                      {isSelected && <span className="ml-2 text-xs text-primary-foreground bg-primary rounded-full px-2 py-0.5">Selected</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">{location.desc}</div>
                  </div>
                  <ChevronRight className={`h-4 w-4 ${
                    isSelected ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Saved locations (when input is empty and not focused) */}
      {!searchQuery && !showSuggestions && (
        <div className="mt-4">
          <div className="text-sm font-medium mb-2 flex items-center">
            <Star className="h-4 w-4 mr-1.5" />
            Saved Places
          </div>
          <div className="space-y-2">
            {savedLocations.map((location, index) => {
              const isSelected = isLocationSelected(location.location);
              return (
                <div 
                  key={`saved-${index}`}
                  className={`flex items-center p-2 cursor-pointer rounded-md ${
                    isSelected 
                      ? 'bg-primary/10 border border-primary/40' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => handleSuggestionClick(location)}
                >
                  <div className={`h-8 w-8 rounded-full ${
                    isSelected ? 'bg-primary/30' : 'bg-primary/10'
                  } flex items-center justify-center mr-3`}>
                    {renderLocationIcon(location.icon)}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${isSelected ? 'text-primary' : ''}`}>
                      {location.name}
                      {isSelected && <span className="ml-2 text-xs text-primary-foreground bg-primary rounded-full px-2 py-0.5">Selected</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">{location.desc}</div>
                  </div>
                  <ChevronRight className={`h-4 w-4 ${
                    isSelected ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}