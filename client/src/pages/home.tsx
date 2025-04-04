import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserIcon, Car, Zap, Users, Coffee, MapPin, Sparkles, MessageSquare, Navigation, Share, Award, User, Leaf } from "lucide-react";
import { AppLogo } from "@/components/app-logo";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { Chat } from "@/components/chat";
import { RouteMap } from "@/components/route-map";
import { LocationPicker } from "@/components/location-picker";
import { RideMatches } from "@/components/ride-matches";
import { LiveLocationTracker } from "@/components/live-location-tracker";
import { useState } from "react";

export default function Home() {
  const [_, setLocation] = useLocation();
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number }>({ lat: 28.6139, lng: 77.2090 }); // New Delhi
  
  const sampleMatches = [
    {
      id: 1,
      userId: 101,
      type: "offer",
      departureTime: new Date(),
      status: "active",
      price: 350.00, // In INR
      availableSeats: 3,
      routeData: JSON.stringify({
        start: { name: "New Delhi", lat: 28.6139, lng: 77.2090 },
        end: { name: "Gurugram", lat: 28.4595, lng: 77.0266 }
      }),
      createdAt: new Date(),
      route: {
        start: { lat: 28.6139, lng: 77.2090 },
        end: { lat: 28.4595, lng: 77.0266 },
        waypoints: []
      }
    },
    {
      id: 2,
      userId: 102,
      type: "request",
      departureTime: new Date(Date.now() + 3600000),
      status: "active",
      price: 250.00, // In INR
      availableSeats: 1,
      routeData: JSON.stringify({
        start: { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
        end: { name: "Pune", lat: 18.5204, lng: 73.8567 }
      }),
      createdAt: new Date(),
      route: {
        start: { lat: 19.0760, lng: 72.8777 },
        end: { lat: 18.5204, lng: 73.8567 },
        waypoints: []
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 p-6">
      <div className="hidden md:flex justify-end max-w-5xl mx-auto mb-4 gap-2">
        <Link href="/ride-matching">
          <Button variant="outline" className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-500" />
            <span>Ride Matching</span>
            <Badge variant="secondary" className="ml-1 bg-purple-100 text-purple-700">New</Badge>
          </Button>
        </Link>
        <Link href="/eco-tracker">
          <Button variant="outline" className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-green-500" />
            <span>Eco Impact</span>
            <Badge variant="secondary" className="ml-1 bg-green-100 text-green-700">New</Badge>
          </Button>
        </Link>
        <Link href="/profile">
          <Button variant="outline" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
            <Badge variant="secondary" className="ml-1">New</Badge>
          </Button>
        </Link>
      </div>
      
      {/* Mobile feature buttons */}
      <div className="flex md:hidden flex-wrap justify-center max-w-5xl mx-auto mb-4 gap-2">
        <Link href="/ride-matching">
          <Button variant="outline" size="sm" className="flex items-center">
            <Zap className="h-3.5 w-3.5 text-purple-500 mr-1" />
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">New</Badge>
          </Button>
        </Link>
        <Link href="/eco-tracker">
          <Button variant="outline" size="sm" className="flex items-center">
            <Leaf className="h-3.5 w-3.5 text-green-500 mr-1" />
            <Badge variant="secondary" className="bg-green-100 text-green-700">New</Badge>
          </Button>
        </Link>
        <Link href="/profile">
          <Button variant="outline" size="sm" className="flex items-center">
            <User className="h-3.5 w-3.5 mr-1" />
            <Badge variant="secondary">New</Badge>
          </Button>
        </Link>
      </div>
      <div className="max-w-5xl mx-auto space-y-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6"
        >
          <div className="flex flex-col items-center justify-center gap-3 mb-4">
            <AppLogo 
              size="lg" 
              showTagline={true} 
              actionButton={true} 
              actionTarget="/matches" 
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-xs text-muted-foreground mt-2"
            >
              Click the logo to find ride matches!
            </motion.div>
          </div>
          
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
                <TabsList className="grid w-full grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-1 xs:gap-2 mb-6">
                  <TabsTrigger value="chat" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="map" className="w-full">
                    <MapPin className="h-4 w-4 mr-2" />
                    Route Map
                  </TabsTrigger>
                  <TabsTrigger value="location" className="w-full">
                    <Navigation className="h-4 w-4 mr-2" />
                    Location
                  </TabsTrigger>
                  <TabsTrigger value="rides" className="w-full">
                    <Car className="h-4 w-4 mr-2" />
                    Rides
                  </TabsTrigger>
                  <TabsTrigger value="tracker" className="w-full">
                    <Share className="h-4 w-4 mr-2" />
                    Tracker
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="chat" className="p-2">
                  <div className="p-2 text-center">
                    <h3 className="text-lg font-semibold mb-1">Instant Messaging</h3>
                    <p className="text-muted-foreground mb-3 text-sm">Connect with ride partners through our real-time messaging system.</p>
                    <div className="border rounded-lg p-4 h-[300px] flex items-center justify-center bg-gradient-to-b from-white to-blue-50 shadow-sm overflow-hidden">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full max-h-full flex items-center justify-center"
                      >
                        <img src="/src/assets/images/chat-illustration.svg" alt="Chat Interface" className="w-auto h-[250px] object-contain" />
                      </motion.div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="map" className="p-2">
                  <div className="p-2 text-center">
                    <h3 className="text-lg font-semibold mb-1">Interactive Map</h3>
                    <p className="text-muted-foreground mb-3 text-sm">View and navigate routes with our intelligent mapping system.</p>
                    <div className="border rounded-lg p-4 h-[300px] flex items-center justify-center bg-gradient-to-b from-white to-blue-50 shadow-sm overflow-hidden">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-full max-h-full flex items-center justify-center"
                      >
                        <img src="/src/assets/images/map-illustration.svg" alt="Interactive Map" className="w-auto h-[250px] object-contain" />
                      </motion.div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="location" className="p-2">
                  <div className="p-2 text-center">
                    <h3 className="text-lg font-semibold mb-1">Location Search</h3>
                    <p className="text-muted-foreground mb-3 text-sm">Find and select pickup and dropoff locations easily in Vadodara.</p>
                    <div className="border rounded-lg p-4 h-[300px] flex items-center justify-center bg-gradient-to-b from-white to-teal-50 shadow-sm overflow-hidden">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full max-h-full flex items-center justify-center"
                      >
                        <img src="/src/assets/images/location-illustration.svg" alt="Location Search" className="w-auto h-[250px] object-contain" />
                      </motion.div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="rides" className="p-2">
                  <div className="p-2 text-center">
                    <h3 className="text-lg font-semibold mb-1">Ride Options</h3>
                    <p className="text-muted-foreground mb-3 text-sm">Browse available ride matches along your route with detailed information.</p>
                    <div className="border rounded-lg p-4 h-[300px] flex items-center justify-center bg-gradient-to-b from-white to-blue-50 shadow-sm overflow-hidden">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full max-h-full flex items-center justify-center"
                      >
                        <img src="/src/assets/images/rides-illustration.svg" alt="Ride Options" className="w-auto h-[250px] object-contain" />
                      </motion.div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="tracker" className="p-2">
                  <div className="p-2 text-center">
                    <h3 className="text-lg font-semibold mb-1">Live Tracking</h3>
                    <p className="text-muted-foreground mb-3 text-sm">See your ride partner's location in real-time with GPS tracking and ETA updates.</p>
                    <div className="border rounded-lg p-4 h-[300px] flex items-center justify-center bg-gradient-to-b from-white to-green-50 shadow-sm overflow-hidden">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-full max-h-full flex items-center justify-center"
                      >
                        <img src="/src/assets/images/tracker-illustration.svg" alt="Live GPS Tracking" className="w-auto h-[250px] object-contain" />
                      </motion.div>
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