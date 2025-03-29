import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserIcon, Car, Zap, Users, Coffee, MapPin, Sparkles, MessageSquare, Navigation, Share } from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Chat } from "@/components/chat";
import { RouteMap } from "@/components/route-map";
import { LocationPicker } from "@/components/location-picker";
import { RideMatches } from "@/components/ride-matches";
import { LiveLocationTracker } from "@/components/live-location-tracker";
import { useState } from "react";

export default function Home() {
  const [_, setLocation] = useLocation();
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number }>({ lat: 37.7749, lng: -122.4194 });
  
  const sampleMatches = [
    {
      id: 1,
      userId: 101,
      type: "offer",
      departureTime: new Date(),
      status: "active",
      price: 15.50,
      availableSeats: 3,
      routeData: JSON.stringify({
        start: { name: "Downtown SF", lat: 37.7749, lng: -122.4194 },
        end: { name: "Berkeley", lat: 37.8715, lng: -122.2730 }
      }),
      createdAt: new Date(),
      route: {
        start: { lat: 37.7749, lng: -122.4194 },
        end: { lat: 37.8715, lng: -122.2730 },
        waypoints: []
      }
    },
    {
      id: 2,
      userId: 102,
      type: "request",
      departureTime: new Date(Date.now() + 3600000),
      status: "active",
      price: 12.00,
      availableSeats: 1,
      routeData: JSON.stringify({
        start: { name: "San Jose", lat: 37.3382, lng: -121.8863 },
        end: { name: "Palo Alto", lat: 37.4419, lng: -122.1430 }
      }),
      createdAt: new Date(),
      route: {
        start: { lat: 37.3382, lng: -121.8863 },
        end: { lat: 37.4419, lng: -122.1430 },
        waypoints: []
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 p-6">
      <div className="max-w-5xl mx-auto space-y-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <Zap className="h-10 w-10 text-primary" />
            </motion.div>
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
              HyperCheetah
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Lightning-fast rides with social connections
          </p>
          
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge variant="outline" className="bg-primary/5 px-3 py-1">
              <Car className="h-3.5 w-3.5 mr-1" />
              Ride Sharing
            </Badge>
            <Badge variant="outline" className="bg-primary/5 px-3 py-1">
              <Users className="h-3.5 w-3.5 mr-1" />
              Social Network
            </Badge>
            <Badge variant="outline" className="bg-primary/5 px-3 py-1">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              Location Based
            </Badge>
            <Badge variant="outline" className="bg-primary/5 px-3 py-1">
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              Meet New People
            </Badge>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="relative overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 h-full flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="mb-6 mt-2">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <UserIcon className="h-12 w-12 text-primary" />
                  </motion.div>
                </div>
                <h2 className="text-xl font-semibold mb-3">Passenger Mode</h2>
                <p className="text-muted-foreground mb-6 flex-1">
                  Find rides along your route and save on travel costs while meeting new people
                </p>
                <Button
                  className="w-full transition-transform duration-300 group-hover:scale-105"
                  onClick={() => setLocation("/passenger")}
                >
                  Ride as Passenger
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="relative overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 h-full flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="mb-6 mt-2">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Car className="h-12 w-12 text-primary" />
                  </motion.div>
                </div>
                <h2 className="text-xl font-semibold mb-3">Rider Mode</h2>
                <p className="text-muted-foreground mb-6 flex-1">
                  Offer rides, share your journey with others, and make your commute more enjoyable
                </p>
                <Button
                  className="w-full transition-transform duration-300 group-hover:scale-105"
                  onClick={() => setLocation("/rider")}
                >
                  Drive as Rider
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="relative overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 h-full flex flex-col border-primary/20">
              <div className="absolute top-0 right-0 m-2">
                <Badge className="bg-primary/90 text-white">
                  New!
                </Badge>
              </div>
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="mb-6 mt-2">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    className="relative"
                  >
                    <Coffee className="h-12 w-12 text-primary" />
                    <div className="absolute -top-1 -right-1 bg-primary rounded-full h-5 w-5 flex items-center justify-center">
                      <Users className="h-3 w-3 text-white" />
                    </div>
                  </motion.div>
                </div>
                <h2 className="text-xl font-semibold mb-3">Social Connect</h2>
                <p className="text-muted-foreground mb-6 flex-1">
                  Connect with like-minded travelers, make friends, and build your network of ride companions
                </p>
                <Button
                  className="w-full transition-transform duration-300 group-hover:scale-105"
                  onClick={() => setLocation("/social")}
                  variant="secondary"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Explore Social
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        {/* App features */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 p-6 bg-white rounded-lg shadow-sm"
        >
          <h2 className="text-xl font-bold mb-6 text-center">Connect & Travel Together</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-2">Find Travel Buddies</h3>
              <p className="text-muted-foreground text-sm">
                Connect with people traveling the same route and share your journey
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-2">Build Your Network</h3>
              <p className="text-muted-foreground text-sm">
                Create profiles, share interests, and find people with similar hobbies
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-2">Unique Experiences</h3>
              <p className="text-muted-foreground text-sm">
                Turn ordinary commutes into opportunities to make memories
              </p>
            </div>
          </div>
        </motion.div>
        
        {/* Component Showcase Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12 mb-20"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Component Showcase</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="chat" className="w-full">
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="chat">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="map">
                    <MapPin className="h-4 w-4 mr-2" />
                    Route Map
                  </TabsTrigger>
                  <TabsTrigger value="location">
                    <Navigation className="h-4 w-4 mr-2" />
                    Location Picker
                  </TabsTrigger>
                  <TabsTrigger value="rides">
                    <Car className="h-4 w-4 mr-2" />
                    Ride Matches
                  </TabsTrigger>
                  <TabsTrigger value="tracker">
                    <Share className="h-4 w-4 mr-2" />
                    Location Tracker
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="chat" className="p-4">
                  <div className="p-4 text-center">
                    <h3 className="text-lg font-semibold mb-2">Chat Component</h3>
                    <p className="text-muted-foreground mb-4">The Chat component enables communication between ride partners.</p>
                    <div className="border rounded-lg p-4 h-[300px] flex items-center justify-center bg-muted/20">
                      <MessageSquare className="h-10 w-10 text-muted-foreground opacity-40 mr-2" />
                      <span className="text-muted-foreground">In-app messaging between ride partners</span>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="map" className="p-4">
                  <div className="p-4 text-center">
                    <h3 className="text-lg font-semibold mb-2">Route Map Component</h3>
                    <p className="text-muted-foreground mb-4">The RouteMap component requires Leaflet which isn't loading correctly.</p>
                    <div className="border rounded-lg p-4 h-[300px] flex items-center justify-center bg-muted/20">
                      <MapPin className="h-10 w-10 text-muted-foreground opacity-40 mr-2" />
                      <span className="text-muted-foreground">Interactive map with route visualization</span>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="location" className="p-4">
                  <div className="p-4 text-center">
                    <h3 className="text-lg font-semibold mb-2">Location Picker Component</h3>
                    <p className="text-muted-foreground mb-4">The LocationPicker component provides location search and selection.</p>
                    <div className="border rounded-lg p-4 h-[300px] flex items-center justify-center bg-muted/20">
                      <Navigation className="h-10 w-10 text-muted-foreground opacity-40 mr-2" />
                      <span className="text-muted-foreground">Search and select locations with suggestions</span>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="rides" className="p-4">
                  <div className="p-4 text-center">
                    <h3 className="text-lg font-semibold mb-2">Ride Matches Component</h3>
                    <p className="text-muted-foreground mb-4">The RideMatches component displays available ride options.</p>
                    <div className="border rounded-lg p-4 h-[300px] flex items-center justify-center bg-muted/20">
                      <Car className="h-10 w-10 text-muted-foreground opacity-40 mr-2" />
                      <span className="text-muted-foreground">View and select from available ride matches</span>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="tracker" className="p-4">
                  <div className="p-4 text-center">
                    <h3 className="text-lg font-semibold mb-2">Live Location Tracker Component</h3>
                    <p className="text-muted-foreground mb-4">The LiveLocationTracker component shows real-time ride tracking.</p>
                    <div className="border rounded-lg p-4 h-[300px] flex items-center justify-center bg-muted/20">
                      <Share className="h-10 w-10 text-muted-foreground opacity-40 mr-2" />
                      <span className="text-muted-foreground">Real-time location sharing and ride tracking</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}