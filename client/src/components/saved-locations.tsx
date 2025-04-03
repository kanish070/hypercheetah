import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Location, SavedLocation } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Home, Briefcase, Star, MapPin, Clock, Trash2, Edit, Check, X, PlusCircle } from 'lucide-react';

interface SavedLocationsProps {
  userId: number;
  onSelectLocation?: (location: SavedLocation) => void;
}

// Location category icons
const categoryIcons: Record<string, React.ReactNode> = {
  'home': <Home className="h-4 w-4" />,
  'work': <Briefcase className="h-4 w-4" />,
  'favorite': <Star className="h-4 w-4" />,
  'recent': <Clock className="h-4 w-4" />,
  'other': <MapPin className="h-4 w-4" />
};

export function SavedLocations({ userId, onSelectLocation }: SavedLocationsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<SavedLocation | null>(null);
  const [newLocation, setNewLocation] = useState<Partial<SavedLocation>>({
    name: '',
    desc: '',
    icon: '',
    category: 'other',
    isFavorite: false,
    geofenceRadius: 100,
    tags: []
  });

  // Query saved locations
  const { data: savedLocations = [], isLoading } = useQuery({
    queryKey: ['/api/users', userId, 'locations'],
    queryFn: () => apiRequest<SavedLocation[]>(`/api/users/${userId}/locations`)
  });

  // Filtered locations based on active tab
  const filteredLocations = activeTab === 'all'
    ? savedLocations
    : activeTab === 'favorites'
      ? savedLocations.filter(location => location.isFavorite)
      : savedLocations.filter(location => location.category === activeTab);

  // Create new location mutation
  const createLocationMutation = useMutation({
    mutationFn: (location: Partial<SavedLocation>) => apiRequest<SavedLocation>('/api/locations', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        name: location.name,
        desc: location.desc,
        icon: location.icon || location.category,
        locationData: JSON.stringify(location.location),
        category: location.category,
        isFavorite: location.isFavorite,
        geofenceRadius: location.geofenceRadius,
        tags: location.tags?.join(',')
      })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'locations'] });
      toast({
        title: "Location saved",
        description: "Your location has been saved successfully."
      });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error saving location",
        description: "There was an error saving your location. Please try again.",
        variant: "destructive"
      });
      console.error("Error saving location:", error);
    }
  });

  // Update location mutation
  const updateLocationMutation = useMutation({
    mutationFn: (location: SavedLocation) => apiRequest<SavedLocation>(`/api/locations/${location.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: location.name,
        desc: location.desc,
        icon: location.icon,
        category: location.category,
        isFavorite: location.isFavorite,
        geofenceRadius: location.geofenceRadius,
        tags: Array.isArray(location.tags) ? location.tags.join(',') : ''
      })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'locations'] });
      toast({
        title: "Location updated",
        description: "Your location has been updated successfully."
      });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error updating location",
        description: "There was an error updating your location. Please try again.",
        variant: "destructive"
      });
      console.error("Error updating location:", error);
    }
  });

  // Delete location mutation
  const deleteLocationMutation = useMutation({
    mutationFn: (locationId: number) => apiRequest<void>(`/api/locations/${locationId}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'locations'] });
      toast({
        title: "Location deleted",
        description: "Your location has been deleted successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting location",
        description: "There was an error deleting your location. Please try again.",
        variant: "destructive"
      });
      console.error("Error deleting location:", error);
    }
  });

  const handleAddLocation = () => {
    if (!newLocation.name || !newLocation.location) {
      toast({
        title: "Missing information",
        description: "Please provide a name and location.",
        variant: "destructive"
      });
      return;
    }

    createLocationMutation.mutate(newLocation);
  };

  const handleUpdateLocation = () => {
    if (!selectedLocation) return;

    updateLocationMutation.mutate(selectedLocation);
  };

  const handleDeleteLocation = (locationId: number) => {
    if (confirm("Are you sure you want to delete this location?")) {
      deleteLocationMutation.mutate(locationId);
    }
  };

  const handleEditLocation = (location: SavedLocation) => {
    setSelectedLocation(location);
    setIsEditDialogOpen(true);
  };

  const handleLocationSelect = (location: SavedLocation) => {
    if (onSelectLocation) {
      onSelectLocation(location);
    }
  };

  const resetForm = () => {
    setNewLocation({
      name: '',
      desc: '',
      icon: '',
      category: 'other',
      isFavorite: false,
      geofenceRadius: 100,
      tags: []
    });
  };

  const getIconForLocation = (location: SavedLocation) => {
    const iconKey = location.category as keyof typeof categoryIcons;
    return categoryIcons[iconKey] || categoryIcons.other;
  };

  // Dummy function for current location - would use Geolocation API in real app
  const useCurrentLocation = async () => {
    toast({
      title: "Using current location",
      description: "Getting your current location..."
    });
    
    // Simulate getting current location
    setTimeout(() => {
      setNewLocation({
        ...newLocation,
        name: newLocation.name || "Current Location",
        location: {
          lat: 22.3072,  // Vadodara coordinates
          lng: 73.1812,
          name: "Current Location",
          address: "Vadodara, Gujarat, India"
        }
      });
      
      toast({
        title: "Location found",
        description: "Your current location has been set."
      });
    }, 1000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Saved Locations</h2>
        <Button 
          variant="default" 
          onClick={() => setIsAddDialogOpen(true)}
          className="flex items-center gap-1"
        >
          <PlusCircle className="h-4 w-4 mr-1" /> Add Location
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="work">Work</TabsTrigger>
          <TabsTrigger value="favorite">Favorites</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredLocations.length === 0 ? (
            <div className="text-center py-8 bg-muted/20 rounded-md">
              <MapPin className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No saved locations found in this category.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsAddDialogOpen(true)}
              >
                Add your first location
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredLocations.map((location) => (
                  <Card key={location.id} className="relative">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="bg-primary/10 p-2 rounded-md">
                            {getIconForLocation(location)}
                          </div>
                          <CardTitle className="text-lg">{location.name}</CardTitle>
                        </div>
                        {location.isFavorite && (
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        )}
                      </div>
                      <CardDescription className="text-sm mt-1">
                        {location.location?.address || 'No address provided'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm">{location.desc}</p>
                      {location.tags && Array.isArray(location.tags) && location.tags.length > 0 && (
                        <div className="flex flex-wrap mt-2 gap-1">
                          {location.tags.map((tag, index) => (
                            <span key={index} className="text-xs bg-muted px-2 py-1 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="pt-2 flex justify-between">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => handleLocationSelect(location)}
                      >
                        Select
                      </Button>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditLocation(location)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteLocation(location.id as number)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>

      {/* Add New Location Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Location</DialogTitle>
            <DialogDescription>
              Save a location for quick access when planning your rides.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Location Name</Label>
              <Input
                id="name"
                value={newLocation.name}
                onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                placeholder="Home, Work, Gym, etc."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={newLocation.desc}
                onChange={(e) => setNewLocation({ ...newLocation, desc: e.target.value })}
                placeholder="Add details about this location"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={newLocation.category as string} 
                onValueChange={(value) => setNewLocation({ ...newLocation, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="favorite">Favorite</SelectItem>
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="geofence">Geofence Radius (meters)</Label>
              <Input
                id="geofence"
                type="number"
                value={newLocation.geofenceRadius}
                onChange={(e) => setNewLocation({ 
                  ...newLocation, 
                  geofenceRadius: parseInt(e.target.value) 
                })}
                min={50}
                max={500}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={Array.isArray(newLocation.tags) ? newLocation.tags.join(', ') : ''}
                onChange={(e) => setNewLocation({ 
                  ...newLocation, 
                  tags: e.target.value ? e.target.value.split(',').map(tag => tag.trim()).filter(Boolean) : []
                })}
                placeholder="office, central, mall"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="favorite"
                checked={newLocation.isFavorite}
                onCheckedChange={(checked) => setNewLocation({ ...newLocation, isFavorite: checked })}
              />
              <Label htmlFor="favorite">Mark as favorite</Label>
            </div>
            <Button 
              type="button" 
              variant="outline"
              onClick={useCurrentLocation}
              className="mt-2"
            >
              Use Current Location
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddLocation} disabled={!newLocation.name || !newLocation.location}>Save Location</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Location Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
            <DialogDescription>
              Update the details of your saved location.
            </DialogDescription>
          </DialogHeader>
          {selectedLocation && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Location Name</Label>
                <Input
                  id="edit-name"
                  value={selectedLocation.name}
                  onChange={(e) => setSelectedLocation({ 
                    ...selectedLocation, 
                    name: e.target.value 
                  })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={selectedLocation.desc}
                  onChange={(e) => setSelectedLocation({ 
                    ...selectedLocation, 
                    desc: e.target.value 
                  })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select 
                  value={selectedLocation.category || 'other'} 
                  onValueChange={(value) => setSelectedLocation({ 
                    ...selectedLocation, 
                    category: value 
                  })}
                >
                  <SelectTrigger id="edit-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="favorite">Favorite</SelectItem>
                    <SelectItem value="recent">Recent</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-geofence">Geofence Radius (meters)</Label>
                <Input
                  id="edit-geofence"
                  type="number"
                  value={selectedLocation.geofenceRadius || 100}
                  onChange={(e) => setSelectedLocation({ 
                    ...selectedLocation, 
                    geofenceRadius: parseInt(e.target.value) 
                  })}
                  min={50}
                  max={500}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-tags">Tags (comma separated)</Label>
                <Input
                  id="edit-tags"
                  value={Array.isArray(selectedLocation.tags) 
                    ? selectedLocation.tags.join(', ') 
                    : typeof selectedLocation.tags === 'string' 
                      ? selectedLocation.tags 
                      : ''}
                  onChange={(e) => setSelectedLocation({ 
                    ...selectedLocation, 
                    tags: e.target.value ? e.target.value.split(',').map(tag => tag.trim()).filter(Boolean) : [] 
                  })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-favorite"
                  checked={selectedLocation.isFavorite}
                  onCheckedChange={(checked) => setSelectedLocation({ 
                    ...selectedLocation, 
                    isFavorite: checked 
                  })}
                />
                <Label htmlFor="edit-favorite">Mark as favorite</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateLocation}>Update Location</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}