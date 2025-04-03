import { useQuery, useMutation } from "@tanstack/react-query";
import { ComfortPreferences } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useComfortPreferences() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Get user's default comfort preferences
  const {
    data: preferences,
    isLoading,
    error,
  } = useQuery<ComfortPreferences>({
    queryKey: ["/api/user/comfort-preferences"],
    enabled: !!user, // Only run the query when we have a user
  });

  // Update user's default comfort preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: ComfortPreferences) => {
      const res = await apiRequest("PUT", "/api/user/comfort-preferences", newPreferences);
      return await res.json();
    },
    onSuccess: (newPreferences: ComfortPreferences) => {
      queryClient.setQueryData(["/api/user/comfort-preferences"], newPreferences);
      toast({
        title: "Preferences Updated",
        description: "Your comfort preferences have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get ride-specific comfort preferences
  const getRideComfortPreferences = (rideId: number) => {
    return useQuery<ComfortPreferences>({
      queryKey: ["/api/rides", rideId, "comfort-preferences"],
      enabled: !!rideId, // Only run when we have a ride ID
    });
  };

  // Update ride-specific comfort preferences
  const updateRidePreferencesMutation = useMutation({
    mutationFn: async ({ rideId, preferences }: { rideId: number; preferences: ComfortPreferences }) => {
      const res = await apiRequest("PUT", `/api/rides/${rideId}/comfort-preferences`, preferences);
      return await res.json();
    },
    onSuccess: (newPreferences: ComfortPreferences, variables) => {
      queryClient.setQueryData(["/api/rides", variables.rideId, "comfort-preferences"], newPreferences);
      toast({
        title: "Ride Preferences Updated",
        description: "Comfort preferences for this ride have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update ride status with comfort preferences
  const updateRideStatusWithPreferencesMutation = useMutation({
    mutationFn: async ({ 
      rideId, 
      status, 
      comfortPreferences 
    }: { 
      rideId: number; 
      status: string; 
      comfortPreferences?: ComfortPreferences 
    }) => {
      const res = await apiRequest("PATCH", `/api/rides/${rideId}/status`, {
        status,
        comfortPreferences
      });
      return await res.json();
    },
    onSuccess: (updatedRide, variables) => {
      // Invalidate both ride and preferences queries
      queryClient.invalidateQueries({
        queryKey: ["/api/rides", variables.rideId],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/rides", variables.rideId, "comfort-preferences"],
      });
      toast({
        title: "Ride Updated",
        description: `Ride status changed to ${variables.status} with your comfort preferences.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Helper to use user default preferences as initial values
  const getDefaultPreferences = (): ComfortPreferences => {
    return preferences || {
      temperature: 22, // Default comfortable temperature
      music: {
        genre: "driver_choice",
        volume: 5,
        allowDriverChoice: true,
      },
      conversation: "driver_choice",
      seatingPreference: "no_preference",
      smoking: false,
      petsAllowed: true,
      airConditioning: "auto",
      windowPreference: "driver_choice",
      additionalStops: true,
      maxWaitTime: 10,
      routePreference: "fastest",
      phoneCharger: ["usb_c", "lightning"],
      notes: "",
    };
  };

  return {
    preferences: preferences || {},
    isLoading,
    error,
    updatePreferencesMutation,
    getRideComfortPreferences,
    updateRidePreferencesMutation,
    updateRideStatusWithPreferencesMutation,
    getDefaultPreferences,
  };
}