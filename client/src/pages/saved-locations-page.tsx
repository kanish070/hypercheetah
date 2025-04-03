import { useEffect, useState } from "react";
import { SavedLocation } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Home, Briefcase, Star, MapPin } from "lucide-react";

export function SavedLocationsPage() {
  const { toast } = useToast();
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLocations() {
      try {
        const response = await fetch('/api/users/1/locations');
        const data = await response.json();
        setLocations(data);
      } catch (error) {
        console.error("Error fetching locations:", error);
        toast({
          title: "Error",
          description: "Failed to load saved locations.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }

    fetchLocations();
  }, [toast]);

  // Map category to icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'home':
        return <Home className="w-4 h-4" />;
      case 'work':
        return <Briefcase className="w-4 h-4" />;
      case 'favorite':
        return <Star className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  return (
    <div className="container py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Your Saved Locations</h1>
          <p className="text-muted-foreground mt-1">
            Manage your frequently visited places for quick access when planning rides
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : locations.length === 0 ? (
          <div className="text-center py-12 bg-muted/20 rounded-lg">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-xl font-medium">No saved locations</h3>
            <p className="text-muted-foreground mt-2">
              Save your frequently visited places for easier ride planning.
            </p>
            <Button className="mt-4">Add Your First Location</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {locations.map((location) => (
              <Card key={location.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-full">
                      {getCategoryIcon(location.category || 'other')}
                    </div>
                    <CardTitle className="text-lg">{location.name}</CardTitle>
                    {location.isFavorite && (
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 ml-auto" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {location.location?.address || 'No address provided'}
                  </p>
                  {location.desc && (
                    <p className="text-sm mt-2">{location.desc}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <div className="mt-8 bg-muted/30 rounded-lg p-6">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Why Save Locations?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div className="bg-background rounded-lg p-4 shadow-sm">
              <h4 className="font-medium">Quick Ride Setup</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Quickly set up rides without having to search for addresses every time.
              </p>
            </div>
            <div className="bg-background rounded-lg p-4 shadow-sm">
              <h4 className="font-medium">Location Categories</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Organize your places as home, work, favorites, and more.
              </p>
            </div>
            <div className="bg-background rounded-lg p-4 shadow-sm">
              <h4 className="font-medium">Smart Arrival Alerts</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Receive notifications when approaching your saved locations using geofencing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}