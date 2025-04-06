import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Info, Route as RouteIcon, MapPin, Users } from 'lucide-react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { RealTimeRideMatching } from '@/components/realtime-ride-matching';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';

export default function RideMatchAnimationPage() {
  const [, setLocation] = useLocation();
  const [matchedRiders, setMatchedRiders] = useState<any[]>([]);
  
  const handleMatchingComplete = (matches: any[]) => {
    setMatchedRiders(matches);
    
    toast({
      title: "Matching Complete",
      description: `Found ${matches.length} potential ride partners for your route.`,
    });
  };
  
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
          <h1 className="text-2xl font-bold">Dynamic Ride Matching</h1>
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
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main animation column */}
          <div className="md:col-span-2 space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Real-time matching algorithm</AlertTitle>
              <AlertDescription>
                Our system analyzes multiple factors including route similarity, departure time, comfort preferences, 
                and user ratings to create optimal matches.
              </AlertDescription>
            </Alert>
            
            <RealTimeRideMatching 
              onMatchingComplete={handleMatchingComplete}
              startLocation={{
                name: "Alkapuri, Vadodara",
                lat: 22.3072,
                lng: 73.1812
              }}
              endLocation={{
                name: "Vadodara Railway Station",
                lat: 22.3220,
                lng: 73.2131
              }}
            />
          </div>
          
          {/* Side panel with details */}
          <div className="space-y-6">
            <Tabs defaultValue="about">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="matches">Matches</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="space-y-4 pt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <RouteIcon className="h-4 w-4 mr-2 text-primary" />
                      How It Works
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-1">
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>User starts the matching process</li>
                      <li>Our AI analyzes nearby users' routes and preferences</li>
                      <li>Compatibility scores are calculated for each potential match</li>
                      <li>Matches above a threshold are shown as a successful connection</li>
                      <li>Real-time notifications are sent to both parties</li>
                    </ol>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-primary" />
                      Route Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-medium">Origin</p>
                        <p className="text-muted-foreground">Alkapuri, Vadodara</p>
                      </div>
                      <div>
                        <p className="font-medium">Destination</p>
                        <p className="text-muted-foreground">Vadodara Railway Station</p>
                      </div>
                      <div>
                        <p className="font-medium">Distance</p>
                        <p className="text-muted-foreground">5.3 km</p>
                      </div>
                      <div>
                        <p className="font-medium">Estimated Time</p>
                        <p className="text-muted-foreground">18 minutes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="matches" className="space-y-4 pt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Users className="h-4 w-4 mr-2 text-primary" />
                      Match Results
                    </CardTitle>
                    <CardDescription>
                      {matchedRiders.length > 0 
                        ? `${matchedRiders.length} potential ride partners found` 
                        : 'Start matching to find ride partners'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {matchedRiders.length > 0 ? (
                      <div className="space-y-4">
                        {matchedRiders.map((rider: any) => (
                          <div key={rider.id} className="flex items-center gap-3 pb-3 border-b last:border-0">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                              {rider.avatar ? (
                                <img src={rider.avatar} alt={rider.name} className="object-cover w-full h-full" />
                              ) : (
                                <span className="text-lg font-medium">{rider.name.charAt(0)}</span>
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{rider.name}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <span className="text-primary font-medium">{rider.matchScore}%</span> match
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="ml-auto"
                              onClick={() => {
                                toast({
                                  title: "Connection Request Sent",
                                  description: `You've sent a ride request to ${rider.name}.`
                                });
                              }}
                            >
                              Connect
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        <Users className="h-8 w-8 mx-auto mb-2 text-primary/50" />
                        <p>No matches yet</p>
                        <p className="text-sm mt-1">
                          Click "Start Matching" to find potential ride partners
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}