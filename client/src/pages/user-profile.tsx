import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Star, User, Car, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function UserProfile() {
  const { user: authUser } = useAuth();
  const userId = authUser?.id;
  const [activeTab, setActiveTab] = useState("overview");
  
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

  const username = userDetails?.name || authUser?.name || "Guest";
  const joinDate = "Joined Jan 2025";
  const rating = 4.8;
  const ratingCount = ratings?.length || 0;
  const isVerified = true;
  
  // Stats for new users
  const stats = {
    totalRides: 34,
    distance: 842,
    co2Saved: 135,
    points: 850,
    level: 4,
    maxXP: 1000,
    currentXP: 850
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Profile header */}
      <div className="bg-green-50/50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col items-center">
            <Avatar className="h-24 w-24 border-4 border-white shadow">
              <AvatarImage src="/images/cheetah-avatar.png" />
              <AvatarFallback>{username.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <h1 className="text-2xl font-bold mt-4">{username}</h1>
            <p className="text-muted-foreground text-sm">{joinDate}</p>
            
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-medium ml-1">{rating}</span>
                <span className="text-muted-foreground text-sm ml-1">({ratingCount})</span>
              </div>
              {isVerified && (
                <div className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                  Verified
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button size="sm" className="bg-green-500 hover:bg-green-600">
                Message
              </Button>
              <Button size="sm" variant="outline">
                Share
              </Button>
            </div>
          </div>
          
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="text-2xl font-bold text-green-500">{stats.totalRides}</div>
              <div className="text-sm text-muted-foreground">Total Rides</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="text-2xl font-bold text-green-500">{stats.distance} km</div>
              <div className="text-sm text-muted-foreground">Distance</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="text-2xl font-bold text-green-500">{stats.co2Saved} kg</div>
              <div className="text-sm text-muted-foreground">CO2 Saved</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="text-2xl font-bold text-green-500">{stats.points}</div>
              <div className="text-sm text-muted-foreground">Points Earned</div>
            </div>
          </div>
          
          {/* Level progress */}
          <div className="bg-white p-4 rounded-lg shadow-sm mt-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-500 text-xs font-bold">⚡</span>
                </div>
                <span className="font-medium">Level {stats.level}</span>
              </div>
              <span className="text-sm text-muted-foreground">{stats.currentXP}/{stats.maxXP} XP</span>
            </div>
            <Progress value={(stats.currentXP / stats.maxXP) * 100} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Earn 150 more points to reach Level 5
            </p>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex-1 max-w-2xl mx-auto w-full p-4">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="flex items-center justify-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center justify-center gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Achievements</span>
            </TabsTrigger>
            <TabsTrigger value="rides" className="flex items-center justify-center gap-2">
              <Car className="h-4 w-4" />
              <span className="hidden sm:inline">Rides</span>
            </TabsTrigger>
            <TabsTrigger value="ratings" className="flex items-center justify-center gap-2">
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Ratings</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Profile Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Profile information will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle>Your Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Achievements will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="rides">
            <Card>
              <CardHeader>
                <CardTitle>Your Rides</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Ride history will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="ratings">
            <Card>
              <CardHeader>
                <CardTitle>Your Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Ratings will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}