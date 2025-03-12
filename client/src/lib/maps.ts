import { type Location, type Route } from "@shared/schema";

// Interface for Google Maps
declare global {
  interface Window {
    google: any;
    initMap: () => void;
    mapsLoaded: boolean;
  }
}

let loadPromise: Promise<void> | null = null;
let loadError: Error | null = null;

export async function loadGoogleMaps(apiKey: string): Promise<void> {
  if (loadPromise) return loadPromise;
  if (!apiKey) {
    loadError = new Error("Google Maps API key is required");
    throw loadError;
  }

  loadPromise = new Promise((resolve, reject) => {
    if (window.google?.maps) {
      window.mapsLoaded = true;
      resolve();
      return;
    }

    window.initMap = () => {
      window.mapsLoaded = true;
      resolve();
    };

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initMap`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      const error = new Error("Failed to load Google Maps");
      loadError = error;
      reject(error);
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

export async function waitForMapsToLoad(): Promise<void> {
  if (loadError) throw loadError;
  if (window.mapsLoaded) return;

  if (!loadPromise) {
    throw new Error("Call loadGoogleMaps before using Maps features");
  }

  await loadPromise;
}

export async function calculateRoute(
  origin: Location,
  destination: Location
): Promise<Route> {
  await waitForMapsToLoad();

  return new Promise((resolve, reject) => {
    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: { lat: origin.lat, lng: origin.lng },
        destination: { lat: destination.lat, lng: destination.lng },
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
          reject(new Error(`Failed to calculate route: ${status}`));
        }
      }
    );
  });
}

export async function createMap(
  element: HTMLElement,
  center: Location,
  zoom: number = 12
) {
  await waitForMapsToLoad();

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

export async function drawRoute(map: any, route: Route) {
  await waitForMapsToLoad();

  // Clear existing polylines and markers
  map.data?.forEach((feature: any) => {
    map.data.remove(feature);
  });

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

  // Fit bounds to show entire route
  const bounds = new window.google.maps.LatLngBounds();
  path.forEach((point: any) => bounds.extend(point));
  map.fitBounds(bounds);
}