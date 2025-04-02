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
          className="pl-10 pr-10 bg-background"
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
        <Card className="absolute mt-1 w-full z-50 shadow-lg overflow-hidden border border-primary/20">
          <div className="max-h-[300px] overflow-y-auto">
            {/* Use current location */}
            <div 
              className="flex items-center p-3 cursor-pointer hover:bg-primary/5 border-b"
              onClick={handleUseCurrentLocation}
            >
              <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center mr-3">
                <Crosshair className="h-4 w-4 text-primary" />
              </div>
              <div className="font-medium">Use current location</div>
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