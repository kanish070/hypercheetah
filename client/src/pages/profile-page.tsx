import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  CopyPlus, 
  Gauge, 
  Gift, 
  Medal, 
  SendHorizontal, 
  Settings, 
  Trophy, 
  UserCheck
} from "lucide-react";
import { AchievementGallery } from "@/components/achievement-gallery";
import { UserStats } from "@/components/user-stats";
import { AchievementLeaderboard } from "@/components/achievement-leaderboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("achievements");
  
  // Defining a type for our user data
  interface UserData {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar: string;
    bio: string;
    level: number;
    joinDate: string;
  }
  
  // Query the user data - in a real app, this would come from a /me or /user/:id endpoint
  const { data: user, isLoading } = useQuery<UserData>({
    queryKey: ["/api/user"],
    enabled: false, // Disable for demo since we don't have auth yet
  });
  
  // Mock user for demonstration
  const mockUser: UserData = {
    id: 1,
    name: "Kanish",
    email: "kanish@example.com",
    role: "user",
    avatar: "/images/kanish-selfie.jpg",
    bio: "Tech enthusiast and eco-friendly traveler",
    level: 17,
    joinDate: "January 2024",
  };

  // Use mock user data
  const userData: UserData = user || mockUser;

  const MotionTabsContent = motion(TabsContent);
  
  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Profile header */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex flex-col sm:flex-row gap-6 items-center">
          <div className="relative">
            <Avatar className="w-24 h-24 border-4 border-background">
              <AvatarImage src={userData.avatar} alt={userData.name} />
              <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs font-bold">
              Lvl {userData.level}
            </div>
          </div>
          
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold">{userData.name}</h1>
            <p className="text-muted-foreground">{userData.bio}</p>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
              <div className="text-xs bg-muted rounded-full px-2 py-1 flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                <span>Joined {userData.joinDate}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex justify-center md:justify-end gap-2 mt-4 md:mt-0">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <SendHorizontal className="w-4 h-4" />
            <span>Message</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Settings className="w-4 h-4" />
            <span>Profile Settings</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs 
        defaultValue="achievements" 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="achievements" className="flex items-center gap-1">
            <Trophy className="w-4 h-4" />
            <span className="hidden md:inline">Achievements</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-1">
            <Gauge className="w-4 h-4" />
            <span className="hidden md:inline">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-1">
            <Medal className="w-4 h-4" />
            <span className="hidden md:inline">Leaderboard</span>
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-1">
            <Gift className="w-4 h-4" />
            <span className="hidden md:inline">Rewards</span>
          </TabsTrigger>
        </TabsList>

        <MotionTabsContent 
          value="achievements"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <AchievementGallery userId={userData.id} />
        </MotionTabsContent>

        <MotionTabsContent 
          value="stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <UserStats userId={userData.id} />
        </MotionTabsContent>

        <MotionTabsContent 
          value="leaderboard"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <AchievementLeaderboard userId={userData.id} limit={7} />
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Badges</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center text-center space-y-2">
                    <Trophy className="h-16 w-16 text-primary" />
                    <h3 className="font-bold text-lg">Road Warrior</h3>
                    <p className="text-sm text-muted-foreground">
                      Highest achievement earned so far
                    </p>
                    <Badge className="flex items-center gap-1 mt-2">
                      <p>Silver Tier</p>
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Next Challenge</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center text-center space-y-2">
                    <CopyPlus className="h-10 w-10 text-muted-foreground" />
                    <h3 className="font-bold">Perfect Rating</h3>
                    <p className="text-sm text-muted-foreground">
                      Receive 10 five-star ratings
                    </p>
                    <div className="w-full mt-2">
                      <div className="text-xs flex justify-between">
                        <span>Progress: 80%</span>
                        <span>8/10 ratings</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </MotionTabsContent>

        <MotionTabsContent 
          value="rewards"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <RewardCard 
              title="Free Ride Coupon"
              description="Get one free ride up to ₹150"
              points={500}
              imagePath="/images/reward-ride.svg"
            />
            <RewardCard 
              title="Coffee Voucher"
              description="20% off at Caf Coffee Day"
              points={350}
              imagePath="/images/reward-coffee.svg"
            />
            <RewardCard 
              title="Priority Matching"
              description="Get priority in ride matching for 1 week"
              points={750}
              imagePath="/images/reward-priority.svg"
            />
            <RewardCard 
              title="Movie Tickets"
              description="Buy 1 Get 1 movie ticket at INOX"
              points={900}
              imagePath="/images/reward-movie.svg"
            />
            <RewardCard 
              title="Carbon Credits"
              description="Plant a tree in your name"
              points={1200}
              imagePath="/images/reward-tree.svg"
            />
            <RewardCard 
              title="Profile Boost"
              description="Featured profile for 3 days"
              points={600}
              imagePath="/images/reward-boost.svg"
            />
          </div>
        </MotionTabsContent>
      </Tabs>
    </div>
  );
}

interface RewardCardProps {
  title: string;
  description: string;
  points: number;
  imagePath: string;
}

function RewardCard({ title, description, points, imagePath }: RewardCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="h-32 bg-muted flex items-center justify-center">
        <Gift className="h-16 w-16 text-primary/30" />
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-1 text-sm">
            <Trophy className="h-4 w-4 text-primary" />
            <span>{points} points</span>
          </div>
          <Button size="sm" variant="outline">Redeem</Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

function Badge({ children, className }: BadgeProps) {
  return (
    <div className={`bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium ${className}`}>
      {children}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex flex-col sm:flex-row gap-6 items-center">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="text-center sm:text-left">
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-48 mb-2" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
        <div className="flex-1 flex justify-center md:justify-end gap-2 mt-4 md:mt-0">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
      
      <Skeleton className="h-10 w-64" />
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}