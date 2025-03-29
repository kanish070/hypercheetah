import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Location, Route } from "@shared/schema";
import { formatDistance, formatTime, getDistanceInKm, getEstimatedTime } from "@/lib/maps";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, Clock, Car } from "lucide-react";

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

// Custom icons for start, end and waypoint markers
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

const waypointIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: iconShadow,
  iconSize: [20, 32], // Slightly smaller than regular markers
  iconAnchor: [10, 32],
  popupAnchor: [1, -30],
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
    time: getEstimatedTime(route.start, route.end),
    waypoints: route.waypoints.length
  } : null;

  // Prepare route points for the polyline
  const routePoints: [number, number][] = route 
    ? [
        [route.start.lat, route.start.lng] as [number, number],
        ...route.waypoints.map(wp => [wp.lat, wp.lng] as [number, number]),
        [route.end.lat, route.end.lng] as [number, number]
      ] 
    : [];

  // Calculate distances between each waypoint for detailed information
  const waypointDetails = route ? 
    route.waypoints.map((waypoint, index) => {
      const prevPoint = index === 0 ? route.start : route.waypoints[index-1];
      const distance = getDistanceInKm(prevPoint, waypoint);
      const time = getEstimatedTime(prevPoint, waypoint);
      return { 
        point: waypoint, 
        distance, 
        time,
        number: index + 1
      };
    }) : [];

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="h-full">
        {/* Route details */}
        {routeDetails && (
          <div className="bg-muted/50 p-3 border-b">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Badge variant="outline" className="mr-2 bg-primary/10">
                  <Navigation className="h-3 w-3 mr-1" />
                  Route
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {routeDetails.waypoints} waypoints
                </span>
              </div>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-primary mr-1" />
                  <span className="text-sm font-medium">{formatDistance(routeDetails.distance)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-primary mr-1" />
                  <span className="text-sm font-medium">{formatTime(routeDetails.time)}</span>
                </div>
              </div>
            </div>
            
            {/* Detailed waypoint information */}
            {route && route.waypoints.length > 0 && (
              <div className="mt-2 pt-2 border-t border-border/50">
                <details>
                  <summary className="cursor-pointer text-sm font-medium flex items-center">
                    <Car className="h-3.5 w-3.5 mr-1.5 text-primary" />
                    <span>Detailed Route Information</span>
                    <span className="ml-1 text-xs text-muted-foreground">(click to expand)</span>
                  </summary>
                  <div className="mt-2 grid grid-cols-1 gap-1 text-xs">
                    <div className="flex items-center py-1 border-b border-border/30">
                      <div className="w-6 shrink-0 flex justify-center">
                        <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center text-[10px] text-white font-bold">S</div>
                      </div>
                      <div className="flex-1 ml-2">Start point</div>
                      <div className="shrink-0 text-right text-muted-foreground">{route.start.lat.toFixed(4)}, {route.start.lng.toFixed(4)}</div>
                    </div>
                    
                    {waypointDetails.map((detail, index) => (
                      <div key={index} className="flex items-center py-1 border-b border-border/30">
                        <div className="w-6 shrink-0 flex justify-center">
                          <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold">{detail.number}</div>
                        </div>
                        <div className="flex-1 ml-2">Waypoint {detail.number}</div>
                        <div className="flex items-center justify-end text-muted-foreground mr-2">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{formatDistance(detail.distance)}</span>
                        </div>
                        <div className="flex items-center justify-end text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{formatTime(detail.time)}</span>
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex items-center py-1">
                      <div className="w-6 shrink-0 flex justify-center">
                        <div className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-[10px] text-white font-bold">E</div>
                      </div>
                      <div className="flex-1 ml-2">End point</div>
                      <div className="shrink-0 text-right text-muted-foreground">{route.end.lat.toFixed(4)}, {route.end.lng.toFixed(4)}</div>
                    </div>
                  </div>
                </details>
              </div>
            )}
          </div>
        )}
        
        {/* Map */}
        <div className={route ? "h-[450px]" : "h-[500px]"}>
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
                >
                  <Tooltip sticky>
                    <div className="text-xs">
                      <div className="font-bold mb-1">Route</div>
                      <div>Distance: {formatDistance(routeDetails?.distance || 0)}</div>
                      <div>Time: {formatTime(routeDetails?.time || 0)}</div>
                    </div>
                  </Tooltip>
                </Polyline>
                
                {/* Start marker */}
                <Marker 
                  position={[route.start.lat, route.start.lng]} 
                  icon={startIcon}
                >
                  <Popup>
                    <div className="text-center">
                      <strong className="block text-green-600">Start Location</strong>
                      <small className="text-gray-500">{route.start.lat.toFixed(6)}, {route.start.lng.toFixed(6)}</small>
                    </div>
                  </Popup>
                  <Tooltip direction="top" offset={[0, -30]} permanent>
                    <div className="bg-green-600 text-white px-1 rounded text-xs">START</div>
                  </Tooltip>
                </Marker>
                
                {/* Waypoint markers */}
                {route.waypoints.map((waypoint, index) => (
                  <Marker 
                    key={index}
                    position={[waypoint.lat, waypoint.lng]} 
                    icon={waypointIcon}
                  >
                    <Popup>
                      <div className="text-center">
                        <strong className="block text-blue-600">Waypoint {index + 1}</strong>
                        <small className="text-gray-500">{waypoint.lat.toFixed(6)}, {waypoint.lng.toFixed(6)}</small>
                        {index > 0 && (
                          <div className="text-xs mt-1 pt-1 border-t">
                            <div>From previous: {formatDistance(waypointDetails[index].distance)}</div>
                          </div>
                        )}
                      </div>
                    </Popup>
                    <Tooltip direction="top" offset={[0, -25]} permanent>
                      <div className="bg-blue-600 text-white px-1 rounded text-xs">{index + 1}</div>
                    </Tooltip>
                  </Marker>
                ))}
                
                {/* End marker */}
                <Marker 
                  position={[route.end.lat, route.end.lng]} 
                  icon={endIcon}
                >
                  <Popup>
                    <div className="text-center">
                      <strong className="block text-red-600">Destination</strong>
                      <small className="text-gray-500">{route.end.lat.toFixed(6)}, {route.end.lng.toFixed(6)}</small>
                    </div>
                  </Popup>
                  <Tooltip direction="top" offset={[0, -30]} permanent>
                    <div className="bg-red-600 text-white px-1 rounded text-xs">END</div>
                  </Tooltip>
                </Marker>
              </>
            )}
            
            {/* If no route, just show the center marker */}
            {!route && (
              <Marker position={[center.lat, center.lng]}>
                <Popup>
                  <strong>Current Location</strong>
                  <div className="text-xs mt-1">{center.lat.toFixed(6)}, {center.lng.toFixed(6)}</div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>
    </Card>
  );
}