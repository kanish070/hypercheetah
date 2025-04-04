import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Info, Zap, Users, Car, User } from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { RideMatchingAnimation } from '@/components/ride-matching-animation';
import { useAuth } from "@/hooks/use-auth";

export default function RideMatching() {
  const [_, setLocation] = useLocation();
  
  // Sample data for the ride matching animation
  const sampleRiders = [
    {
      id: 1,
      name: "Rahul Sharma",
      avatar: "/avatars/rahul.jpg",
      rating: 4.8,
      origin: {
        name: "Alkapuri, Vadodara",
        lat: 22.3072,
        lng: 73.1812
      },
      destination: {
        name: "Sayajigunj, Vadodara",
        lat: 22.3241,
        lng: 73.1747
      },
      departureTime: new Date(Date.now() + 15 * 60000), // 15 minutes from now
      vehicleType: "sedan",
      price: 120,
      seatsAvailable: 3
    },
    {
      id: 2,
      name: "Anjali Patel",
      avatar: "/avatars/anjali.jpg",
      rating: 4.9,
      origin: {
        name: "Fatehgunj, Vadodara",
        lat: 22.3229,
        lng: 73.1881
      },
      destination: {
        name: "Manjalpur, Vadodara",
        lat: 22.2743,
        lng: 73.1921
      },
      departureTime: new Date(Date.now() + 25 * 60000), // 25 minutes from now
      vehicleType: "hatchback",
      price: 180,
      seatsAvailable: 2
    },
    {
      id: 3,
      name: "Vijay Mehra",
      avatar: "/avatars/vijay.jpg",
      rating: 4.7,
      origin: {
        name: "Nizampura, Vadodara",
        lat: 22.3307,
        lng: 73.1787
      },
      destination: {
        name: "Gorwa, Vadodara",
        lat: 22.3361,
        lng: 73.1494
      },
      departureTime: new Date(Date.now() + 18 * 60000), // 18 minutes from now
      vehicleType: "suv",
      price: 150,
      seatsAvailable: 4
    },
    {
      id: 4,
      name: "Priya Singh",
      avatar: "/avatars/priya.jpg",
      rating: 4.5,
      origin: {
        name: "Karelibaug, Vadodara",
        lat: 22.3352,
        lng: 73.1893
      },
      destination: {
        name: "Makarpura, Vadodara",
        lat: 22.2529,
        lng: 73.1942
      },
      departureTime: new Date(Date.now() + 30 * 60000), // 30 minutes from now
      vehicleType: "sedan",
      price: 200,
      seatsAvailable: 3
    }
  ];
  
  const samplePassengers = [
    {
      id: 101,
      name: "Aarav Kumar",
      avatar: "/avatars/aarav.jpg",
      origin: {
        name: "Alkapuri, Vadodara",
        lat: 22.3080,
        lng: 73.1820
      },
      destination: {
        name: "Sayajigunj, Vadodara",
        lat: 22.3245,
        lng: 73.1750
      },
      departureTime: new Date(Date.now() + 12 * 60000), // 12 minutes from now
      preferences: ["AC", "Music"]
    },
    {
      id: 102,
      name: "Meera Desai",
      avatar: "/avatars/meera.jpg",
      origin: {
        name: "Nizampura, Vadodara",
        lat: 22.3310,
        lng: 73.1790
      },
      destination: {
        name: "Chhani, Vadodara",
        lat: 22.3638,
        lng: 73.1936
      },
      departureTime: new Date(Date.now() + 20 * 60000), // 20 minutes from now
      preferences: ["No Music", "Female Driver"]
    },
    {
      id: 103,
      name: "Rohan Joshi",
      avatar: "/avatars/rohan.jpg",
      origin: {
        name: "Fatehgunj, Vadodara",
        lat: 22.3235,
        lng: 73.1885
      },
      destination: {
        name: "Manjalpur, Vadodara",
        lat: 22.2745,
        lng: 73.1925
      },
      departureTime: new Date(Date.now() + 22 * 60000), // 22 minutes from now
      preferences: ["AC", "Quick Trip"]
    },
    {
      id: 104,
      name: "Neha Gupta",
      avatar: "/avatars/neha.jpg",
      origin: {
        name: "Karelibaug, Vadodara",
        lat: 22.3355,
        lng: 73.1895
      },
      destination: {
        name: "Makarpura, Vadodara",
        lat: 22.2532,
        lng: 73.1945
      },
      departureTime: new Date(Date.now() + 35 * 60000), // 35 minutes from now
      preferences: ["Non-smoking", "Quiet"]
    },
    {
      id: 105,
      name: "Siddharth Patel",
      avatar: "/avatars/siddharth.jpg",
      origin: {
        name: "Akota, Vadodara",
        lat: 22.3005,
        lng: 73.1688
      },
      destination: {
        name: "Waghodia Road, Vadodara",
        lat: 22.3144,
        lng: 73.2278
      },
      departureTime: new Date(Date.now() + 28 * 60000), // 28 minutes from now
      preferences: ["AC", "Music", "Chatty"]
    }
  ];
  
  interface MatchResult {
    riderId: number;
    passengerId: number;
    matchScore: number;
    status: 'pending' | 'matched' | 'rejected';
  }
  
  const [matches, setMatches] = useState<MatchResult[]>([]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Real-time Ride Matching</h1>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <p className="text-muted-foreground">
            Watch our intelligent algorithm connect riders and passengers in real-time
          </p>
        </motion.div>

        <div className="grid md:grid-cols-8 gap-6">
          <div className="md:col-span-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Ride Matching Animation</CardTitle>
                <CardDescription>
                  See how our algorithm finds the perfect matches between riders and passengers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RideMatchingAnimation 
                  riders={sampleRiders}
                  passengers={samplePassengers}
                  onMatchComplete={(results: MatchResult[]) => setMatches(results)}
                  className="min-h-[400px] md:min-h-[600px]"
                />
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">How it Works</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex gap-2">
                      <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-primary">1</span>
                      </div>
                      <span>We analyze user location, destination, and departure time</span>
                    </li>
                    <li className="flex gap-2">
                      <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-primary">2</span>
                      </div>
                      <span>Our algorithm calculates match scores based on route similarity</span>
                    </li>
                    <li className="flex gap-2">
                      <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-primary">3</span>
                      </div>
                      <span>We consider user preferences and compatibility factors</span>
                    </li>
                    <li className="flex gap-2">
                      <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-primary">4</span>
                      </div>
                      <span>Highest quality matches are suggested to both parties</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Zap className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">Efficient Matching</div>
                        <div className="text-xs text-muted-foreground">Find the perfect ride in seconds</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">Preference Based</div>
                        <div className="text-xs text-muted-foreground">Matches based on your comfort</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <Info className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">Transparent Process</div>
                        <div className="text-xs text-muted-foreground">See how matches are created</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-primary" />
                        <span className="text-sm">Rides Offered Today</span>
                      </div>
                      <span className="font-medium">243</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <span className="text-sm">Ride Requests Today</span>
                      </div>
                      <span className="font-medium">361</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Match Success Rate</span>
                      </div>
                      <span className="font-medium">81%</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Active Users Now</span>
                      </div>
                      <span className="font-medium">128</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex justify-center"
        >
          <Tabs defaultValue="basic" className="w-full max-w-3xl">
            <TabsList className="grid w-full grid-cols-3 overflow-x-auto text-xs md:text-sm">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Route Matching</CardTitle>
                  <CardDescription>
                    Our standard algorithm matches riders and passengers based on their route, time, and basic preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Matching Factors:</h4>
                      <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                        <li>Origin proximity</li>
                        <li>Destination proximity</li>
                        <li>Departure time</li>
                        <li>Available seats</li>
                        <li>Rider rating</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Features:</h4>
                      <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                        <li>Real-time matching</li>
                        <li>Match score calculation</li>
                        <li>Push notifications</li>
                        <li>Instant booking</li>
                        <li>Ride history</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="advanced" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Preference Matching</CardTitle>
                  <CardDescription>
                    Our advanced algorithm takes detailed user preferences into account for more personalized matching.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Advanced Matching Factors:</h4>
                      <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                        <li>User personality profiles</li>
                        <li>Music preferences</li>
                        <li>Temperature settings</li>
                        <li>Conversation style</li>
                        <li>Vehicle type preference</li>
                        <li>Gender preference</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Additional Features:</h4>
                      <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                        <li>Preference-based matching</li>
                        <li>Compatibility score</li>
                        <li>Split fare options</li>
                        <li>Advanced route optimization</li>
                        <li>Multiple stop coordination</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="enterprise" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Enterprise Matching Solutions</CardTitle>
                  <CardDescription>
                    Corporate solutions for companies looking to optimize employee commutes and reduce carbon footprint.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Enterprise Features:</h4>
                      <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                        <li>Company-wide ride management</li>
                        <li>Employee groups</li>
                        <li>Carbon footprint tracking</li>
                        <li>Cost optimization</li>
                        <li>Custom reporting</li>
                        <li>Admin dashboard</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Benefits:</h4>
                      <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                        <li>Reduced parking needs</li>
                        <li>Lower carbon emissions</li>
                        <li>Employee cost savings</li>
                        <li>Team building opportunities</li>
                        <li>Streamlined commute management</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}