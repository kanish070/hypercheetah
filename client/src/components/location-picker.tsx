import { useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import type { Location } from "@shared/schema";

interface LocationPickerProps {
  onLocationSelect: (location: Location) => void;
  placeholder?: string;
}

export function LocationPicker({ onLocationSelect, placeholder }: LocationPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (!window.google || !inputRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ["address"],
      componentRestrictions: { country: "US" },
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        onLocationSelect({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    });
  }, [onLocationSelect]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocationSelect({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting location:", error);
      }
    );
  };

  return (
    <Card className="p-4">
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder || "Enter location"}
          className="flex-1"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={getCurrentLocation}
          title="Use current location"
        >
          <MapPin className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
