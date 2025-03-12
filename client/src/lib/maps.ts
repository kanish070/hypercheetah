import { type Location, type Route } from "@shared/schema";

// Simplified map functions for prototype
export async function loadGoogleMaps(_apiKey: string): Promise<void> {
  // No-op in prototype
  return Promise.resolve();
}

export async function calculateRoute(
  origin: Location,
  destination: Location
): Promise<Route> {
  // Simple straight-line route for prototype
  return {
    start: origin,
    end: destination,
    waypoints: [origin, destination]
  };
}

// Convert lat/lng to relative x,y coordinates for prototype map
function convertToRelativePosition(location: Location): { x: number; y: number } {
  // Use NYC as center point (40.7128° N, 74.0060° W)
  const centerLat = 40.7128;
  const centerLng = -74.0060;

  // Convert to relative coordinates (-1 to 1)
  const x = (location.lng - centerLng) * 100;
  const y = (centerLat - location.lat) * 100;

  return { x, y };
}

export { convertToRelativePosition };