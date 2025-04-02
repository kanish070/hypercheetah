import React, { useState, useRef, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  MapPin, Search, Home, Building, Briefcase, Star, X, Clock, 
  Navigation, ChevronRight, Crosshair, AlertCircle, Loader2, Plus
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
  
  // Vadodara-specific saved locations
  const [savedLocations, setSavedLocations] = useState<Array<{ name: string; desc: string; icon: string; location: Location }>>([
    { 
      name: "Home", 
      desc: "Alkapuri, Vadodara, Gujarat 390007", 
      icon: "home", 
      location: { lat: 22.3071, lng: 73.1812 } 
    },
    { 
      name: "Work", 
      desc: "Race Course Circle, Vadodara, Gujarat 390007", 
      icon: "briefcase", 
      location: { lat: 22.3119, lng: 73.1795 } 
    },
    { 
      name: "MS University", 
      desc: "Pratapgunj, Vadodara, Gujarat 390002", 
      icon: "star", 
      location: { lat: 22.3149, lng: 73.1873 } 
    }
  ]);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  // Search results for Vadodara locations
  useEffect(() => {
    if (searchQuery.length > 1) {
      const vadodaraLocations = [
        // Main areas and landmarks in Vadodara
        {
          name: "Alkapuri",
          desc: "R.C. Dutt Road, Vadodara, Gujarat 390007",
          location: { lat: 22.3071, lng: 73.1812 }
        },
        {
          name: "Sayajigunj",
          desc: "Sayajigunj, Vadodara, Gujarat 390005",
          location: { lat: 22.3149, lng: 73.1857 }
        },
        {
          name: "Fatehgunj",
          desc: "Fatehgunj, Vadodara, Gujarat 390002",
          location: { lat: 22.3218, lng: 73.1794 }
        },
        {
          name: "Railway Station",
          desc: "Vadodara Railway Station, Alkapuri, Vadodara, Gujarat 390005",
          location: { lat: 22.3095, lng: 73.1813 }
        },
        {
          name: "Vadodara Airport",
          desc: "Harni Road, Vadodara, Gujarat 390022",
          location: { lat: 22.3358, lng: 73.2274 }
        },
        {
          name: "Laxmi Vilas Palace",
          desc: "Moti Baug, Vadodara, Gujarat 390001",
          location: { lat: 22.2937, lng: 73.1954 }
        },
        {
          name: "M S University",
          desc: "Pratapgunj, Vadodara, Gujarat 390002",
          location: { lat: 22.3149, lng: 73.1873 }
        },
        {
          name: "Kirti Mandir",
          desc: "Raopura, Vadodara, Gujarat 390001",
          location: { lat: 22.3007, lng: 73.2016 }
        },
        {
          name: "Mandvi Gate",
          desc: "Raopura, Vadodara, Gujarat 390001",
          location: { lat: 22.3006, lng: 73.2029 }
        },
        {
          name: "Nizampura",
          desc: "Nizampura, Vadodara, Gujarat 390002",
          location: { lat: 22.3251, lng: 73.1611 }
        },
        {
          name: "Makarpura",
          desc: "Makarpura, Vadodara, Gujarat 390014",
          location: { lat: 22.2548, lng: 73.1853 }
        },
        {
          name: "Chhani",
          desc: "Chhani, Vadodara, Gujarat 391740",
          location: { lat: 22.3534, lng: 73.1559 }
        },
        {
          name: "Manjalpur",
          desc: "Manjalpur, Vadodara, Gujarat 390011",
          location: { lat: 22.2665, lng: 73.1707 }
        },
        {
          name: "Akota",
          desc: "Akota, Vadodara, Gujarat 390020",
          location: { lat: 22.3012, lng: 73.1678 }
        },
        {
          name: "Karelibaug",
          desc: "Karelibaug, Vadodara, Gujarat 390018",
          location: { lat: 22.3313, lng: 73.2037 }
        },
        {
          name: "Gorwa",
          desc: "Gorwa, Vadodara, Gujarat 390016",
          location: { lat: 22.3363, lng: 73.1686 }
        },
        {
          name: "Waghodia Road",
          desc: "Waghodia Road, Vadodara, Gujarat 390019",
          location: { lat: 22.3281, lng: 73.2184 }
        },
        {
          name: "Sama",
          desc: "Sama, Vadodara, Gujarat 390008",
          location: { lat: 22.3321, lng: 73.1921 }
        },
        {
          name: "Subhanpura",
          desc: "Subhanpura, Vadodara, Gujarat 390023",
          location: { lat: 22.2931, lng: 73.1637 }
        },
        {
          name: "Vasna",
          desc: "Vasna, Vadodara, Gujarat 390015",
          location: { lat: 22.2726, lng: 73.1562 }
        },
        {
          name: "Harni",
          desc: "Harni, Vadodara, Gujarat 390022",
          location: { lat: 22.3394, lng: 73.2106 }
        },
        {
          name: "Tarsali",
          desc: "Tarsali, Vadodara, Gujarat 390009",
          location: { lat: 22.2448, lng: 73.1981 }
        },
        {
          name: "New VIP Road",
          desc: "New VIP Road, Vadodara, Gujarat 390007",
          location: { lat: 22.3171, lng: 73.1747 }
        },
        {
          name: "Old Padra Road",
          desc: "Old Padra Road, Vadodara, Gujarat 390015",
          location: { lat: 22.2870, lng: 73.1731 }
        },
        {
          name: "Atladara",
          desc: "Atladara, Vadodara, Gujarat 390012",
          location: { lat: 22.2714, lng: 73.2016 }
        },
        {
          name: "Maneja",
          desc: "Maneja, Vadodara, Gujarat 390013",
          location: { lat: 22.3486, lng: 73.1968 }
        }
      ];

      // Filter locations based on search query
      const matchingLocations = vadodaraLocations.filter(loc => 
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.desc.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Limit to top 5 results to avoid cluttering
      const results = matchingLocations.slice(0, 5);
      
      // Create a custom location option for when user wants to add a new location
      // This will always be an option as long as there's search text
      const customLocation = {
        name: searchQuery,
        desc: `Custom location in Vadodara (${searchQuery})`,
        location: { 
          // Use center of Vadodara with slight randomization for custom locations
          // In a real app, this would be geocoded
          lat: 22.3072 + (Math.random() * 0.02 - 0.01),
          lng: 73.1812 + (Math.random() * 0.02 - 0.01)
        },
        isCustom: true
      };
      
      // Always add the custom location option at the top
      results.unshift(customLocation);
      
      setSuggestions(results);
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
        
        // For area detection in Vadodara
        const vadodaraAreas = [
          { name: "Alkapuri", lat: 22.3071, lng: 73.1812, radius: 1.5 },
          { name: "Sayajigunj", lat: 22.3149, lng: 73.1857, radius: 1.0 },
          { name: "Fatehgunj", lat: 22.3218, lng: 73.1794, radius: 1.0 },
          { name: "Nizampura", lat: 22.3251, lng: 73.1611, radius: 1.5 },
          { name: "Makarpura", lat: 22.2548, lng: 73.1853, radius: 2.0 },
          { name: "Chhani", lat: 22.3534, lng: 73.1559, radius: 2.0 },
          { name: "Manjalpur", lat: 22.2665, lng: 73.1707, radius: 1.5 },
          { name: "Akota", lat: 22.3012, lng: 73.1678, radius: 1.2 },
          { name: "Karelibaug", lat: 22.3313, lng: 73.2037, radius: 1.5 },
          { name: "Gorwa", lat: 22.3363, lng: 73.1686, radius: 1.5 },
          { name: "Waghodia Road", lat: 22.3281, lng: 73.2184, radius: 2.0 },
          { name: "Sama", lat: 22.3321, lng: 73.1921, radius: 1.5 },
          { name: "Subhanpura", lat: 22.2931, lng: 73.1637, radius: 1.2 },
          { name: "Vasna", lat: 22.2726, lng: 73.1562, radius: 1.5 },
          { name: "Harni", lat: 22.3394, lng: 73.2106, radius: 1.8 },
          { name: "Tarsali", lat: 22.2448, lng: 73.1981, radius: 2.0 },
          { name: "New VIP Road", lat: 22.3171, lng: 73.1747, radius: 1.0 },
          { name: "Old Padra Road", lat: 22.2870, lng: 73.1731, radius: 1.5 },
          { name: "Atladara", lat: 22.2714, lng: 73.2016, radius: 1.8 },
          { name: "Maneja", lat: 22.3486, lng: 73.1968, radius: 1.8 }
        ];
        
        // Calculate distance in km using Haversine formula
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
        
        // Determine nearby area in Vadodara
        let nearestArea = "Vadodara";
        let minDistance = 10; // Initialize with a large number (km)
        
        vadodaraAreas.forEach(area => {
          const distance = getDistanceInKm(latitude, longitude, area.lat, area.lng);
          if (distance < minDistance && distance <= area.radius) {
            minDistance = distance;
            nearestArea = area.name;
          }
        });
        
        // Use exact coordinates and nearby area
        const locationName = `Your Current Location (${nearestArea})`;
        const locationDesc = `${nearestArea}, Vadodara - ${formatCoordinate(latitude)}, ${formatCoordinate(longitude)}`;
        
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
          description: `Using exact location in ${nearestArea}, Vadodara (${formatCoordinate(latitude)}, ${formatCoordinate(longitude)})`,
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
          placeholder={placeholder || "Search for Vadodara locations"}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          className="pl-10 pr-10 bg-background"
        />
        <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-primary" />
        <div className="absolute right-0 top-0 h-full flex">
          {/* Current location button */}
          <Button
            variant="ghost"
            onClick={handleUseCurrentLocation}
            className="h-full px-2 text-muted-foreground"
            title="Use exact current location"
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
                {isLoadingLocation ? 
                  "Detecting your exact Vadodara location..." : 
                  "Use your exact current location in Vadodara"
                }
              </div>
            </div>
            
            {/* Search results */}
            {suggestions.map((suggestion: any, index) => {
              const isSelected = isLocationSelected(suggestion.location);
              const isCustom = suggestion.isCustom;
              
              return (
                <div 
                  key={`suggestion-${index}`}
                  className={`flex items-center p-3 cursor-pointer ${
                    isSelected 
                      ? 'bg-primary/10 border-l-2 border-l-primary' 
                      : 'hover:bg-muted/70'
                  } ${isCustom ? 'border-t border-dashed border-primary/30' : ''}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className={`h-8 w-8 rounded-full ${
                    isCustom
                      ? 'bg-primary/20 border border-primary/40'
                      : isSelected ? 'bg-primary/30' : 'bg-primary/15'
                  } flex items-center justify-center mr-3`}>
                    {isCustom ? (
                      <Star className="h-4 w-4 text-primary" />
                    ) : (
                      <MapPin className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <div className={`font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                      {isCustom ? `Add custom: "${suggestion.name}"` : suggestion.name}
                      {isSelected && <span className="ml-1 text-xs text-primary-foreground bg-primary rounded-full px-1.5 py-0">✓</span>}
                    </div>
                    <div className="text-sm text-foreground/70 truncate">
                      {suggestion.desc}
                    </div>
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