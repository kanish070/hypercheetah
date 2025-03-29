import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Location } from "@shared/schema";
import { MapPin, Search, X } from "lucide-react";

interface LocationPickerProps {
  onLocationSelect: (location: Location) => void;
  placeholder?: string;
}

// Simulated locations for the prototype
const suggestedLocations = [
  { name: "New York City", location: { lat: 40.7128, lng: -74.006 } },
  { name: "Los Angeles", location: { lat: 34.0522, lng: -118.2437 } },
  { name: "Chicago", location: { lat: 41.8781, lng: -87.6298 } },
  { name: "San Francisco", location: { lat: 37.7749, lng: -122.4194 } },
  { name: "Miami", location: { lat: 25.7617, lng: -80.1918 } },
  { name: "Seattle", location: { lat: 47.6062, lng: -122.3321 } },
];

export function LocationPicker({ onLocationSelect, placeholder }: LocationPickerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ name: string; location: Location }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter suggestions when search term changes
  useEffect(() => {
    if (searchTerm) {
      const filteredSuggestions = suggestedLocations.filter(loc =>
        loc.name.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleSuggestionClick = (suggestion: { name: string; location: Location }) => {
    onLocationSelect(suggestion.location);
    setSearchTerm(suggestion.name);
    setIsFocused(false);
  };

  const handleClear = () => {
    setSearchTerm("");
    inputRef.current?.focus();
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
          className="pr-10"
        />
        {searchTerm ? (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        ) : (
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        )}
      </div>

      {isFocused && suggestions.length > 0 && (
        <Card className="absolute z-10 w-full mt-1">
          <CardContent className="p-0">
            <ul className="py-2">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="px-3 py-2 hover:bg-accent flex items-center cursor-pointer"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{suggestion.name}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}