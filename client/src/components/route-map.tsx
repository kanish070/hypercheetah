import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import { Location, Route } from '@shared/schema';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet default icon issues
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Setup default Leaflet icon
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom color for route line
const routeOptions = { color: 'blue', weight: 4, opacity: 0.7 };

// Map controller component that sets view and draws route
function MapController({ center, route }: { center: Location, route?: Route }) {
  const map = useMap();
  
  useEffect(() => {
    // Center the map on the provided location
    map.setView([center.lat, center.lng], 13);
    
    // If a route is provided, fit bounds to include all route points
    if (route) {
      const points = [
        [route.start.lat, route.start.lng],
        ...route.waypoints.map(wp => [wp.lat, wp.lng]),
        [route.end.lat, route.end.lng]
      ];
      
      const bounds = L.latLngBounds(points.map(p => L.latLng(p[0], p[1])));
      map.fitBounds(bounds, { padding: [50, 50] });
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
  // If route exists, calculate route points for polyline
  const routePoints = route ? [
    [route.start.lat, route.start.lng],
    ...route.waypoints.map(wp => [wp.lat, wp.lng]),
    [route.end.lat, route.end.lng]
  ] : [];
  
  return (
    <div className={`rounded-md overflow-hidden ${className}`} style={{ height: '400px' }}>
      <MapContainer 
        center={[center.lat, center.lng]} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Map controller to handle view changes */}
        <MapController center={center} route={route} />
        
        {/* Start marker */}
        {route && (
          <Marker position={[route.start.lat, route.start.lng]}>
            <Popup>Starting point</Popup>
          </Marker>
        )}
        
        {/* Waypoint markers */}
        {route && route.waypoints.map((waypoint, index) => (
          <Marker 
            key={`waypoint-${index}`} 
            position={[waypoint.lat, waypoint.lng]}
          >
            <Popup>Waypoint {index + 1}</Popup>
          </Marker>
        ))}
        
        {/* End marker */}
        {route && (
          <Marker position={[route.end.lat, route.end.lng]}>
            <Popup>Destination</Popup>
          </Marker>
        )}
        
        {/* Route line */}
        {route && (
          <Polyline 
            positions={routePoints as [number, number][]} 
            pathOptions={routeOptions} 
          />
        )}
      </MapContainer>
    </div>
  );
}