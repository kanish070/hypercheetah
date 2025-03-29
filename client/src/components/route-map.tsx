import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import { Location, Route } from '@shared/schema';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';

// Type declaration for Leaflet routing machine
declare global {
  namespace L {
    namespace Routing {
      function control(options: any): any;
      function osrmv1(options: any): any;
    }
  }
}

// Fix for Leaflet default icon issues
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Custom icons for start, waypoint and destination
const startIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  className: 'start-icon' // For potential custom styling
});

const waypointIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  className: 'waypoint-icon'
});

const destinationIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  className: 'destination-icon'
});

// Default icon for general usage
L.Marker.prototype.options.icon = startIcon;

// Custom color for route line
const routeOptions = { color: '#1e88e5', weight: 5, opacity: 0.8 };

// Map controller component that sets view and draws route
function MapController({ center, route }: { center: Location, route?: Route }) {
  const map = useMap();
  const [routingControl, setRoutingControl] = useState<any>(null);
  
  useEffect(() => {
    // Center the map on the provided location
    map.setView([center.lat, center.lng], 13);
    
    // If a route is provided, setup routing
    if (route) {
      // Remove previous routing control if exists
      if (routingControl) {
        map.removeControl(routingControl);
      }
      
      const waypoints = [
        L.latLng(route.start.lat, route.start.lng),
        ...route.waypoints.map(wp => L.latLng(wp.lat, wp.lng)),
        L.latLng(route.end.lat, route.end.lng)
      ];
      
      // Create routing control with better styling options
      const control = L.Routing.control({
        waypoints,
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1',
          profile: 'driving'
        }),
        lineOptions: {
          styles: [
            // Main route line - more visible and branded
            { color: '#4CAF50', weight: 6, opacity: 0.7 },
            // Highlight edge for better visibility
            { color: '#FFF', weight: 10, opacity: 0.3 }
          ],
          extendToWaypoints: true,
          missingRouteTolerance: 0
        },
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        showAlternatives: false,
        routeWhileDragging: false,
        show: false, // Hide the instructions panel
        collapsible: true, // Allow collapsing the instructions
        createMarker: function() { return null; } // Disable default markers, we have our own
      });
      
      control.addTo(map);
      setRoutingControl(control);
      
      // Calculate bounds to fit
      const bounds = L.latLngBounds(waypoints);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
    
    return () => {
      // Clean up control when component unmounts or updates
      if (routingControl) {
        map.removeControl(routingControl);
      }
    };
  }, [map, center, route]);
  
  return null;
}

interface RouteMapProps {
  center: Location;
  route?: Route;
  className?: string;
}

export function RouteMap({ center, route, className = "" }: RouteMapProps) {
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
        
        {/* Map controller to handle view changes and routing */}
        <MapController center={center} route={route} />
        
        {/* Start marker */}
        {route && (
          <Marker 
            position={[route.start.lat, route.start.lng]} 
            icon={startIcon}
          >
            <Popup>
              <div className="font-medium">Starting point</div>
              <div className="text-xs text-muted-foreground">Pickup location</div>
            </Popup>
          </Marker>
        )}
        
        {/* Waypoint markers */}
        {route && route.waypoints.map((waypoint, index) => (
          <Marker 
            key={`waypoint-${index}`} 
            position={[waypoint.lat, waypoint.lng]}
            icon={waypointIcon}
          >
            <Popup>
              <div className="font-medium">Waypoint {index + 1}</div>
              <div className="text-xs text-muted-foreground">Stop {index + 1}</div>
            </Popup>
          </Marker>
        ))}
        
        {/* End marker */}
        {route && (
          <Marker 
            position={[route.end.lat, route.end.lng]} 
            icon={destinationIcon}
          >
            <Popup>
              <div className="font-medium">Destination</div>
              <div className="text-xs text-muted-foreground">Dropoff location</div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}