import { type Location, type Route } from "@shared/schema";

// Interface for Google Maps
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export async function loadGoogleMaps(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve();
      return;
    }

    window.initMap = () => resolve();

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
    script.async = true;
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
}

export function calculateRoute(
  origin: Location,
  destination: Location
): Promise<Route> {
  return new Promise((resolve, reject) => {
    const directionsService = new window.google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result: any, status: any) => {
        if (status === "OK") {
          const route: Route = {
            start: origin,
            end: destination,
            waypoints: result.routes[0].overview_path.map((point: any) => ({
              lat: point.lat(),
              lng: point.lng(),
            })),
          };
          resolve(route);
        } else {
          reject(new Error("Failed to calculate route"));
        }
      }
    );
  });
}

export function createMap(
  element: HTMLElement,
  center: Location,
  zoom: number = 12
) {
  return new window.google.maps.Map(element, {
    center,
    zoom,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
    ],
  });
}

export function drawRoute(map: any, route: Route) {
  const path = route.waypoints.map(
    (point) => new window.google.maps.LatLng(point.lat, point.lng)
  );

  new window.google.maps.Polyline({
    path,
    geodesic: true,
    strokeColor: "#4CAF50",
    strokeOpacity: 1.0,
    strokeWeight: 3,
    map,
  });

  // Add markers for start and end
  new window.google.maps.Marker({
    position: route.start,
    map,
    icon: {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: "#4CAF50",
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: "#FFFFFF",
    },
  });

  new window.google.maps.Marker({
    position: route.end,
    map,
    icon: {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: "#F44336",
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: "#FFFFFF",
    },
  });
}
