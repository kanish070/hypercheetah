import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Location } from "@shared/schema";
import { MapPin, Search, X, Navigation, MapPinOff } from "lucide-react";

interface LocationPickerProps {
  onLocationSelect: (location: Location) => void;
  placeholder?: string;
  selectedLocation?: Location;
}

// Enhanced location database with more descriptive names and accurate coordinates
const locationDatabase = [
  { name: "New York City", desc: "New York, USA", location: { lat: 40.7128, lng: -74.006 } },
  { name: "Los Angeles", desc: "California, USA", location: { lat: 34.0522, lng: -118.2437 } },
  { name: "Chicago", desc: "Illinois, USA", location: { lat: 41.8781, lng: -87.6298 } },
  { name: "San Francisco", desc: "California, USA", location: { lat: 37.7749, lng: -122.4194 } },
  { name: "Miami", desc: "Florida, USA", location: { lat: 25.7617, lng: -80.1918 } },
  { name: "Seattle", desc: "Washington, USA", location: { lat: 47.6062, lng: -122.3321 } },
  { name: "Boston", desc: "Massachusetts, USA", location: { lat: 42.3601, lng: -71.0589 } },
  { name: "Philadelphia", desc: "Pennsylvania, USA", location: { lat: 39.9526, lng: -75.1652 } },
  { name: "Houston", desc: "Texas, USA", location: { lat: 29.7604, lng: -95.3698 } },
  { name: "Phoenix", desc: "Arizona, USA", location: { lat: 33.4484, lng: -112.0740 } },
  { name: "Dallas", desc: "Texas, USA", location: { lat: 32.7767, lng: -96.7970 } },
  { name: "Washington D.C.", desc: "USA", location: { lat: 38.9072, lng: -77.0369 } },
  { name: "San Diego", desc: "California, USA", location: { lat: 32.7157, lng: -117.1611 } },
  { name: "Las Vegas", desc: "Nevada, USA", location: { lat: 36.1699, lng: -115.1398 } },
  { name: "London", desc: "United Kingdom", location: { lat: 51.5074, lng: -0.1278 } },
  { name: "Paris", desc: "France", location: { lat: 48.8566, lng: 2.3522 } },
  { name: "Tokyo", desc: "Japan", location: { lat: 35.6762, lng: 139.6503 } },
  { name: "Sydney", desc: "Australia", location: { lat: -33.8688, lng: 151.2093 } },
  { name: "Toronto", desc: "Canada", location: { lat: 43.6532, lng: -79.3832 } },
  { name: "Berlin", desc: "Germany", location: { lat: 52.5200, lng: 13.4050 } }
];

export function LocationPicker({ onLocationSelect, placeholder, selectedLocation }: LocationPickerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ name: string; desc: string; location: Location }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isGettingCurrentLocation, setIsGettingCurrentLocation] = useState(false);
  const [selectedLocationName, setSelectedLocationName] = useState("");

  // Find location name from coordinates if one is selected
  useEffect(() => {
    if (selectedLocation) {
      const found = locationDatabase.find(
        (item) => 
          Math.abs(item.location.lat - selectedLocation.lat) < 0.01 && 
          Math.abs(item.location.lng - selectedLocation.lng) < 0.01
      );
      
      if (found) {
        setSelectedLocationName(found.name);
        setSearchTerm(found.name);
      } else {
        // Format coordinates as a string if exact location not found
        setSelectedLocationName(`Location (${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)})`);
        setSearchTerm(`Location (${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)})`);
      }
    }
  }, [selectedLocation]);

  // Filter suggestions when search term changes
  useEffect(() => {
    if (searchTerm) {
      const filteredSuggestions = locationDatabase.filter(loc =>
        loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.desc.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  // Handle clicks outside the component to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSuggestionClick = (suggestion: { name: string; desc: string; location: Location }) => {
    onLocationSelect(suggestion.location);
    setSearchTerm(suggestion.name);
    setSelectedLocationName(suggestion.name);
    setIsFocused(false);
  };

  const handleClear = () => {
    setSearchTerm("");
    setSelectedLocationName("");
    onLocationSelect({ lat: 0, lng: 0 }); // Reset location
    inputRef.current?.focus();
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsGettingCurrentLocation(true);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          onLocationSelect(currentLocation);
          setSearchTerm(`Current Location (${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)})`);
          setSelectedLocationName(`Current Location`);
          setIsGettingCurrentLocation(false);
        },
        (error) => {
          console.error("Error getting current location:", error);
          setIsGettingCurrentLocation(false);
        }
      );
    }
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder || "Enter location"}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="pr-20" // Extra space for the location button
        />
        <div className="absolute right-0 top-0 h-full flex items-center pr-2">
          {searchTerm ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleClear}
              title="Clear selection"
            >
              <MapPinOff className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={getCurrentLocation}
              disabled={isGettingCurrentLocation}
              title="Use current location"
            >
              <Navigation className={`h-4 w-4 ${isGettingCurrentLocation ? "animate-pulse text-primary" : ""}`} />
            </Button>
          )}
        </div>
      </div>

      {/* Selected location badge */}
      {selectedLocationName && !isFocused && (
        <Badge variant="outline" className="mt-2 bg-primary/10">
          <MapPin className="mr-1 h-3 w-3" />
          {selectedLocationName}
        </Badge>
      )}

      {isFocused && suggestions.length > 0 && (
        <Card className="absolute z-10 w-full mt-1 shadow-md">
          <CardContent className="p-0">
            <ul className="py-2 max-h-60 overflow-auto">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="px-3 py-2 hover:bg-accent flex items-start cursor-pointer"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <MapPin className="mr-2 h-4 w-4 text-primary mt-1 shrink-0" />
                  <div>
                    <p className="font-medium">{suggestion.name}</p>
                    <p className="text-xs text-muted-foreground">{suggestion.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}