import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Location, Route } from "@shared/schema";
import { formatDistance, formatTime, getDistanceInKm, getEstimatedTime } from "@/lib/maps";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for Leaflet default icon issues in bundled environments
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Set up default icon for Leaflet markers
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons for start and end points
const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const endIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Component to recenter the map when props change
function MapController({ center, route }: { center: Location, route?: Route }) {
  const map = useMap();
  
  useEffect(() => {
    if (route) {
      // If we have a route, fit the map to show the entire route
      const points = [route.start, ...route.waypoints, route.end];
      const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      // Otherwise just center on the given location
      map.setView([center.lat, center.lng], 13);
    }
  }, [map, center, route]);
  
  return null;
}

interface RouteMapProps {
  center: Location;
  route?: Route;
  className?: string;
}

export function RouteMap({ center, route, className = "" }: RouteMapProps) {
  // Calculate route details if route is available
  const routeDetails = route ? {
    distance: getDistanceInKm(route.start, route.end),
    time: getEstimatedTime(route.start, route.end)
  } : null;

  // Prepare route points for the polyline
  const routePoints: [number, number][] = route 
    ? [
        [route.start.lat, route.start.lng] as [number, number],
        ...route.waypoints.map(wp => [wp.lat, wp.lng] as [number, number]),
        [route.end.lat, route.end.lng] as [number, number]
      ] 
    : [];

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="h-full">
        {/* Route details */}
        {routeDetails && (
          <div className="bg-muted/50 p-3 border-b flex justify-between items-center">
            <div>
              <span className="text-sm font-medium">Distance:</span>
              <span className="ml-2">{formatDistance(routeDetails.distance)}</span>
            </div>
            <div>
              <span className="text-sm font-medium">Estimated Time:</span>
              <span className="ml-2">{formatTime(routeDetails.time)}</span>
            </div>
          </div>
        )}
        {/* Map */}
        <div className="h-[500px]">
          <MapContainer 
            center={[center.lat, center.lng]} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController center={center} route={route} />
            
            {/* Render route if available */}
            {route && (
              <>
                {/* Route line */}
                <Polyline 
                  positions={routePoints}
                  color="#3b82f6"
                  weight={4}
                />
                
                {/* Start marker */}
                <Marker 
                  position={[route.start.lat, route.start.lng]} 
                  icon={startIcon}
                >
                  <Popup>
                    <strong>Start Location</strong>
                  </Popup>
                </Marker>
                
                {/* End marker */}
                <Marker 
                  position={[route.end.lat, route.end.lng]} 
                  icon={endIcon}
                >
                  <Popup>
                    <strong>Destination</strong>
                  </Popup>
                </Marker>
              </>
            )}
            
            {/* If no route, just show the center marker */}
            {!route && (
              <Marker position={[center.lat, center.lng]}>
                <Popup>
                  <strong>Current Location</strong>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>
    </Card>
  );
}