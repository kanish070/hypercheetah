import { useEffect, useState } from 'react';
import { useWebSocket } from '@/hooks/use-websocket';
import { queryClient } from './queryClient';
import { useQuery } from '@tanstack/react-query';
import { Location, Ride, User } from '@shared/schema';

// Location service to get and update current location
export function useLocationService() {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { sendMessage } = useWebSocket();
  
  // Function to get the current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentLocation(location);
        setIsLoading(false);
        
        // Broadcast location update to server
        sendMessage({
          type: 'location_update',
          location
        });
      },
      (error) => {
        setError(`Error getting location: ${error.message}`);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // Use cached position if less than 1 minute old
      }
    );
  };
  
  // Watch location changes
  const watchLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return null;
    }
    
    setIsLoading(true);
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentLocation(location);
        setIsLoading(false);
        
        // Broadcast location update to server
        sendMessage({
          type: 'location_update',
          location
        });
      },
      (error) => {
        setError(`Error watching location: ${error.message}`);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000 // Use cached position if less than 30 seconds old
      }
    );
    
    return watchId;
  };
  
  // Geocode location to get address
  const getAddressFromCoordinates = async (location: Location): Promise<string> => {
    try {
      // This is just a placeholder - in a real app, you would use a geocoding service
      // Such as Google Maps Geocoding API, Mapbox Geocoding, or a local database
      return 'Address lookup not implemented';
    } catch (error) {
      console.error('Error geocoding location:', error);
      return 'Unknown location';
    }
  };
  
  return {
    currentLocation,
    error,
    isLoading,
    getCurrentLocation,
    watchLocation,
    getAddressFromCoordinates
  };
}

// Nearby users service to find other users in the vicinity
export function useNearbyUsers(radiusInKm: number = 5) {
  const { addMessageListener } = useWebSocket();
  const [nearbyUsers, setNearbyUsers] = useState<User[]>([]);
  
  // Fetch nearby users initially
  const { data: initialNearbyUsers, refetch } = useQuery({
    queryKey: ['/api/users/nearby', radiusInKm],
    queryFn: async () => {
      const response = await fetch(`/api/users/nearby?radius=${radiusInKm}`);
      if (!response.ok) {
        throw new Error('Failed to fetch nearby users');
      }
      return response.json() as Promise<User[]>;
    }
  });
  
  // Update nearby users when we get them from API
  useEffect(() => {
    if (initialNearbyUsers) {
      setNearbyUsers(initialNearbyUsers);
    }
  }, [initialNearbyUsers]);
  
  // Listen for real-time updates of nearby users
  useEffect(() => {
    const removeListener = addMessageListener((message) => {
      if (message.type === 'nearby_users_update') {
        setNearbyUsers(message.users);
        // Also update the query cache
        queryClient.setQueryData(['/api/users/nearby', radiusInKm], message.users);
      }
    });
    
    return removeListener;
  }, [addMessageListener, radiusInKm]);
  
  return {
    nearbyUsers,
    refetchNearbyUsers: refetch
  };
}

// Available rides service to find rides in real-time
export function useAvailableRides(location?: Location, type: 'offer' | 'request' = 'offer', radiusInKm: number = 10) {
  const { addMessageListener } = useWebSocket();
  const [availableRides, setAvailableRides] = useState<Ride[]>([]);
  
  // Fetch available rides initially
  const { data: initialRides, refetch } = useQuery({
    queryKey: ['/api/rides/nearby', location, type, radiusInKm],
    enabled: !!location,
    queryFn: async () => {
      if (!location) return [];
      
      const locationParam = encodeURIComponent(JSON.stringify(location));
      const response = await fetch(
        `/api/rides/nearby?location=${locationParam}&type=${type}&radius=${radiusInKm}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch nearby rides');
      }
      
      return response.json() as Promise<Ride[]>;
    }
  });
  
  // Update available rides when we get them from API
  useEffect(() => {
    if (initialRides) {
      setAvailableRides(initialRides);
    }
  }, [initialRides]);
  
  // Listen for real-time updates of available rides
  useEffect(() => {
    const removeListener = addMessageListener((message) => {
      if (message.type === 'available_rides_update' && message.rideType === type) {
        setAvailableRides(message.rides);
        // Also update the query cache
        queryClient.setQueryData(
          ['/api/rides/nearby', location, type, radiusInKm],
          message.rides
        );
      }
    });
    
    return removeListener;
  }, [addMessageListener, location, type, radiusInKm]);
  
  return {
    availableRides,
    refetchAvailableRides: refetch
  };
}

// Ride status updates service for tracking ongoing rides
export function useRideStatusUpdates(rideId?: number) {
  const { addMessageListener } = useWebSocket();
  const [rideStatus, setRideStatus] = useState<string | null>(null);
  const [rideLocation, setRideLocation] = useState<Location | null>(null);
  
  // Listen for real-time updates of ride status
  useEffect(() => {
    if (!rideId) return;
    
    const removeListener = addMessageListener((message) => {
      if (message.type === 'ride_status_update' && message.rideId === rideId) {
        setRideStatus(message.status);
        // Also update the query cache
        queryClient.setQueryData(['/api/rides', rideId], (oldData: any) => {
          if (!oldData) return oldData;
          return { ...oldData, status: message.status };
        });
      }
      
      if (message.type === 'ride_location_update' && message.rideId === rideId) {
        setRideLocation(message.location);
      }
    });
    
    return removeListener;
  }, [addMessageListener, rideId]);
  
  return {
    rideStatus,
    rideLocation
  };
}

// Service for getting real-time ride matches
export function useRideMatches(route?: any, type: 'offer' | 'request' = 'request') {
  const { addMessageListener, sendMessage } = useWebSocket();
  const [matches, setMatches] = useState<Ride[]>([]);
  
  // Search for ride matches
  const searchForMatches = () => {
    if (!route) return;
    
    sendMessage({
      type: 'find_ride_matches',
      route,
      rideType: type
    });
  };
  
  // Listen for real-time updates of ride matches
  useEffect(() => {
    const removeListener = addMessageListener((message) => {
      if (message.type === 'ride_matches' && message.rideType === type) {
        setMatches(message.matches);
      }
    });
    
    return removeListener;
  }, [addMessageListener, type]);
  
  return {
    matches,
    searchForMatches
  };
}