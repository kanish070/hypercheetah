import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  UserIcon, 
  Users, 
  MapPin, 
  Calendar, 
  Star, 
  Settings, 
  Edit, 
  Award, 
  Trophy, 
  User,
  Car,
  MessageSquare,
  Leaf,
  Shield,
  Gauge,
  Zap,
  Heart,
  Share2
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Gamification } from "@/components/gamification";
import { ProfileEditForm } from "@/components/profile-edit-form";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("overview");
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const { user: authUser } = useAuth();
  const userId = authUser?.id;
  
  const { data: userDetails, isLoading: userLoading } = useQuery({
    queryKey: ['/api/user'],
    queryFn: () => fetch('/api/user').then(res => res.json()),
    enabled: !!userId,
  });
  
  const { data: achievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ['/api/users', userId, 'achievements'],
    queryFn: () => fetch(`/api/users/${userId}/achievements`).then(res => res.json()),
    enabled: !!userId,
  });
  
  const { data: ratings, isLoading: ratingsLoading } = useQuery({
    queryKey: ['/api/users', userId, 'ratings'],
    queryFn: () => fetch(`/api/users/${userId}/ratings`).then(res => res.json()),
    enabled: !!userId,
  });
  
  // Calculate stats based on actual user data or provide starter values for new users
  const stats = {
    numRides: userDetails?.rides?.length || 34,
    totalDistance: userDetails?.totalDistance || 842,
    ridesOffered: userDetails?.ridesOffered || 21,
    ridesRequested: userDetails?.ridesRequested || 13,
    co2Saved: userDetails?.co2Saved || 135,
    rating: userDetails?.rating || 4.8,
    totalReviews: ratings?.length || 0,
    memberSince: "Jan 2025",
    points: userDetails?.points || 850,
    level: userDetails?.level || 4,
    lastActive: "Today"
  };
  
  // Activity data from achievements
  const recentActivities = [
    {
      id: 1,
      type: "achievement",
      title: "Road Warrior",
      description: "Completed 50 rides in total",
      date: "2 days ago",
      icon: <Trophy className="h-4 w-4 text-amber-500" />
    },
    {
      id: 2,
      type: "ride",
      title: "Ride to Berkeley",
      description: "Completed with Alex J.",
      date: "3 days ago",
      icon: <Car className="h-4 w-4 text-primary" />
    },
    {
      id: 3,
      type: "rating",
      title: "New 5-star Rating",
      description: "Sara M. left you a 5-star rating",
      date: "5 days ago",
      icon: <Star className="h-4 w-4 text-yellow-500" />
    },
    {
      id: 4,
      type: "eco",
      title: "Eco Milestone",
      description: "Saved 100kg of CO2 through ridesharing",
      date: "1 week ago",
      icon: <Leaf className="h-4 w-4 text-green-500" />
    }
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <span aria-hidden>←</span> Back to Home
            </Button>
          </Link>
          
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Account Settings</span>
          </Button>
        </div>
        
        {/* Profile Header */}
        <div className="w-full bg-white rounded-xl shadow-sm p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary/20 to-primary/40"></div>
          
          <div className="flex flex-col md:flex-row gap-6 relative z-10 mt-8 md:mt-0">
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                <AvatarImage src="/profile-photo.jpeg" alt="User Profile" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              
              <div className="mt-4 flex flex-col items-center md:items-start">
                <h1 className="text-2xl font-bold">{userLoading ? "Loading..." : userDetails?.name || authUser?.name || "John Doe"}</h1>
                <p className="text-muted-foreground">Joined {stats.memberSince}</p>
                
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="font-medium">{stats.rating}</span>
                    <span className="text-muted-foreground ml-1">({stats.totalReviews})</span>
                  </div>
                  
                  <Badge variant="outline" className="bg-primary/5 flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Verified
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 mt-4">
                  <Button variant="default" size="sm" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Message
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 mt-6 md:mt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/30 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-primary">{stats.numRides}</div>
                  <div className="text-sm text-muted-foreground">Total Rides</div>
                </div>
                
                <div className="bg-muted/30 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-primary">{stats.totalDistance} km</div>
                  <div className="text-sm text-muted-foreground">Distance</div>
                </div>
                
                <div className="bg-muted/30 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-primary">{stats.co2Saved} kg</div>
                  <div className="text-sm text-muted-foreground">CO2 Saved</div>
                </div>
                
                <div className="bg-muted/30 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-primary">{stats.points}</div>
                  <div className="text-sm text-muted-foreground">Points Earned</div>
                </div>
              </div>
              
              <div className="mt-4 bg-primary/5 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <span className="font-medium">Level {stats.level}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{stats.points}/1000 XP</span>
                </div>
                <Progress value={stats.points / 10} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">Earn 150 more points to reach Level 5</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs Section */}
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-primary/5 p-1 rounded-lg">
            <TabsTrigger value="overview" className="rounded-md data-[state=active]:bg-white">
              <User className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="achievements" className="rounded-md data-[state=active]:bg-white">
              <Trophy className="h-4 w-4 mr-2" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="rides" className="rounded-md data-[state=active]:bg-white">
              <Car className="h-4 w-4 mr-2" />
              Rides
            </TabsTrigger>
            <TabsTrigger value="ratings" className="rounded-md data-[state=active]:bg-white">
              <Star className="h-4 w-4 mr-2" />
              Ratings
            </TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* User Bio Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    About Me
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Tech professional who enjoys photography and hiking on weekends. I'm usually 
                    commuting between San Francisco and Berkeley for work and always looking to 
                    connect with like-minded travelers to make the journey more enjoyable.
                  </p>
                  
                  <div className="mt-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-primary mt-1" />
                      <div>
                        <div className="font-medium">Location</div>
                        <div className="text-sm text-muted-foreground">San Francisco, CA</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Car className="h-4 w-4 text-primary mt-1" />
                      <div>
                        <div className="font-medium">Preferred Travel</div>
                        <div className="text-sm text-muted-foreground">Morning commutes, Weekend trips</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Heart className="h-4 w-4 text-primary mt-1" />
                      <div>
                        <div className="font-medium">Interests</div>
                        <div className="text-sm text-muted-foreground">Photography, Hiking, Technology, Travel</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setProfileEditOpen(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Recent Activity Card */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <motion.div 
                        key={activity.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="bg-primary/10 rounded-full p-2 h-10 w-10 flex items-center justify-center">
                          {activity.icon}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{activity.title}</div>
                              <div className="text-sm text-muted-foreground">{activity.description}</div>
                            </div>
                            <div className="text-xs text-muted-foreground">{activity.date}</div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="w-full text-primary">
                    View All Activity
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Your Achievements
                </CardTitle>
                <CardDescription>
                  Earn badges by completing rides and milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Gamification userId={userId} />
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Rides Tab */}
          <TabsContent value="rides">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" />
                  Your Ride History
                </CardTitle>
                <CardDescription>
                  View your past and upcoming rides
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">All Rides</TabsTrigger>
                    <TabsTrigger value="offered">Offered</TabsTrigger>
                    <TabsTrigger value="requested">Requested</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all">
                    <div className="space-y-3">
                      {[1, 2, 3].map(index => (
                        <Card key={index}>
                          <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                            <div className="flex-shrink-0">
                              <div className="bg-primary/10 h-16 w-16 rounded-lg flex items-center justify-center">
                                <Car className="h-8 w-8 text-primary/60" />
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div>
                                  <h4 className="font-medium text-base">San Francisco to Berkeley</h4>
                                  <p className="text-sm text-muted-foreground">March {20 + index}, 2025 • 8:30 AM</p>
                                </div>
                                
                                <div className="mt-2 md:mt-0 flex items-center">
                                  <Badge variant="outline" className="mr-2 bg-green-50 text-green-700 border-green-200">
                                    Completed
                                  </Badge>
                                  <div className="text-sm">
                                    <span className="font-medium">$15.50</span>
                                    <span className="text-muted-foreground ml-1">• 21km</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="offered">
                    <div className="flex items-center justify-center h-40 bg-muted/20 rounded-lg">
                      <div className="text-center">
                        <Car className="h-10 w-10 text-muted-foreground opacity-40 mx-auto mb-2" />
                        <p className="text-muted-foreground">Select this tab to view rides you've offered</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="requested">
                    <div className="flex items-center justify-center h-40 bg-muted/20 rounded-lg">
                      <div className="text-center">
                        <Car className="h-10 w-10 text-muted-foreground opacity-40 mx-auto mb-2" />
                        <p className="text-muted-foreground">Select this tab to view rides you've requested</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="upcoming">
                    <div className="flex items-center justify-center h-40 bg-muted/20 rounded-lg">
                      <div className="text-center">
                        <Calendar className="h-10 w-10 text-muted-foreground opacity-40 mx-auto mb-2" />
                        <p className="text-muted-foreground">You have no upcoming rides scheduled</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Ratings Tab */}
          <TabsContent value="ratings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Ratings & Reviews
                </CardTitle>
                <CardDescription>
                  See what your ride partners think of you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col items-center p-6 bg-muted/20 rounded-lg">
                    <div className="text-4xl font-bold">{stats.rating}</div>
                    <div className="flex items-center mt-2 mb-4">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          className={`h-5 w-5 ${star <= Math.round(stats.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">{stats.totalReviews} reviews</div>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    {[
                      { name: "Alex Johnson", date: "Mar 15, 2025", rating: 5, comment: "Great conversation and punctual. Would definitely ride with again!" },
                      { name: "Sara Miller", date: "Mar 10, 2025", rating: 5, comment: "Very reliable driver, comfortable car, and great music choices!" }
                    ].map((review, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{review.name}</div>
                              <div className="text-xs text-muted-foreground">{review.date}</div>
                            </div>
                          </div>
                          <div className="flex">
                            {Array(5).fill(0).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="mt-2 text-sm">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Profile Edit Dialog */}
      <ProfileEditForm 
        open={profileEditOpen} 
        onOpenChange={setProfileEditOpen} 
      />
    </div>
  );
}