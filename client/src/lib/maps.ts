import { Location, Route } from "@shared/schema";

export async function loadGoogleMaps(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google) {
      resolve();
      return;
    }

    window.initGoogleMaps = () => {
      resolve();
    };

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
}

export async function calculateRoute(
  origin: Location,
  destination: Location
): Promise<Route> {
  // For accurate routing, we'd use a routing API (like Mapbox, GoogleMaps, etc.)
  // Since we're using leaflet-routing-machine on the client-side for visualization,
  // we'll just use the start and end points and let the routing machine calculate 
  // the actual route points
  
  // Return a simplified route structure
  return {
    start: origin,
    end: destination,
    waypoints: [] // Let the routing library calculate the actual waypoints
  };
}

// Convert geographic coordinates to relative positions for the prototype map
export function convertToRelativePosition(location: Location): { x: number; y: number } {
  // Map the location to a relative position (simplified for prototype)
  // In real implementation, this would use proper geographic projections
  
  // Center at United States (approximately)
  const centerLat = 39.8;
  const centerLng = -98.5;
  
  // Calculate relative position
  const x = (location.lng - centerLng) * 10;
  const y = (centerLat - location.lat) * 10; // Invert Y since latitude increases northward
  
  return { x, y };
}

// Calculate the distance between two locations in kilometers
export function getDistanceInKm(loc1: Location, loc2: Location): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = deg2rad(loc2.lat - loc1.lat);
  const dLng = deg2rad(loc2.lng - loc1.lng);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(loc1.lat)) * Math.cos(deg2rad(loc2.lat)) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

// Estimate travel time based on distance with a more realistic model
export function getEstimatedTime(origin: Location, destination: Location): number {
  const distance = getDistanceInKm(origin, destination);
  
  // More sophisticated model:
  // - For short distances (<5km): slower speed (25km/h) due to city traffic/lights
  // - For medium distances (5-20km): moderate speed (40km/h)
  // - For longer distances (>20km): highway speeds (70km/h)
  let avgSpeedKmh: number;
  
  if (distance < 5) {
    avgSpeedKmh = 25; // City driving
  } else if (distance < 20) {
    avgSpeedKmh = 40; // Mixed driving
  } else {
    avgSpeedKmh = 70; // Highway driving
  }
  
  // Add a small fixed time (0.1 hours = 6 min) for getting in/out, traffic signals, etc.
  const fixedTimeHours = 0.1;
  
  return (distance / avgSpeedKmh) + fixedTimeHours; // Time in hours
}

// Format time as text (e.g. "30 min", "1 h 15 min")
export function formatTime(timeInHours: number): string {
  if (timeInHours < 1/60) {
    return "< 1 min";
  }
  
  const hours = Math.floor(timeInHours);
  const minutes = Math.round((timeInHours - hours) * 60);
  
  if (hours === 0) {
    return `${minutes} min`;
  } else if (minutes === 0) {
    return `${hours} h`;
  } else {
    return `${hours} h ${minutes} min`;
  }
}

// Format distance as text (e.g. "5.3 km", "430 m")
export function formatDistance(distanceInKm: number): string {
  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)} m`;
  } else if (distanceInKm < 10) {
    return `${distanceInKm.toFixed(1)} km`;
  } else {
    return `${Math.round(distanceInKm)} km`;
  }
}

// Extend the Window interface to include the Google Maps initialization callback
declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}