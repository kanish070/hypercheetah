import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Trophy, 
  Award, 
  Star, 
  Crown, 
  Medal, 
  Gift, 
  Heart, 
  Flower2, 
  Leaf, 
  Zap,
  User,
  Users,
  Clock,
  Calendar,
  Car,
  MapPin,
  Footprints,
  Sparkles,
  BadgeCheck,
  Flame,
  Check,
  Lock,
  ChevronRight,
  Share2
} from "lucide-react";
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";

// Types for gamification
interface Achievement {
  id: number;
  name: string;
  description: string;
  points: number;
  icon: string;
  unlocked: boolean;
  progress: number; // 0-100
  criteria: string;
  category: 'ride' | 'social' | 'eco' | 'milestone';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

interface Milestone {
  id: number;
  name: string;
  description: string;
  value: number;
  target: number;
  reward: string;
  unit: string;
  category: 'rides' | 'distance' | 'co2' | 'social';
  icon: string;
}

interface LeaderboardEntry {
  id: number;
  name: string;
  avatar: string;
  points: number;
  rank: number;
  level: number;
  achievements: number;
  isCurrentUser: boolean;
}

interface Reward {
  id: number;
  name: string;
  description: string;
  cost: number;
  type: 'discount' | 'free_ride' | 'partner' | 'upgrade';
  expiry: string | null;
  image: string;
  isNew: boolean;
  isFeatured: boolean;
  partner?: string;
}

interface EcoImpact {
  co2Saved: number;
  treesEquivalent: number;
  milesDriven: number;
  fuelSaved: number;
  singleUseRides: number;
  sharedRides: number;
}

// Helper function to get achievement icon component
const getAchievementIcon = (icon: string) => {
  const props = { className: "h-6 w-6" };
  
  switch(icon) {
    case 'trophy': return <Trophy {...props} />;
    case 'award': return <Award {...props} />;
    case 'star': return <Star {...props} />;
    case 'crown': return <Crown {...props} />;
    case 'medal': return <Medal {...props} />;
    case 'gift': return <Gift {...props} />;
    case 'heart': return <Heart {...props} />;
    case 'flower': return <Flower2 {...props} />;
    case 'leaf': return <Leaf {...props} />;
    case 'zap': return <Zap {...props} />;
    case 'car': return <Car {...props} />;
    case 'user': return <User {...props} />;
    case 'users': return <Users {...props} />;
    case 'footprints': return <Footprints {...props} />;
    case 'flame': return <Flame {...props} />;
    default: return <Award {...props} />;
  }
};

// Helper function to get tier badge style
const getTierBadgeStyle = (tier: Achievement['tier']) => {
  switch(tier) {
    case 'bronze': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'silver': return 'bg-slate-100 text-slate-800 border-slate-200';
    case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'platinum': return 'bg-purple-100 text-purple-800 border-purple-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

interface GamificationProps {
  userId: number;
}

export function Gamification({ userId }: GamificationProps) {
  // State for active tabs
  const [activeTab, setActiveTab] = useState('achievements');
  const [activeAchievementCategory, setActiveAchievementCategory] = useState<Achievement['category'] | 'all'>('all');
  
  // State for achievements
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 1,
      name: "Early Bird",
      description: "Complete 5 rides before 8 AM",
      points: 100,
      icon: "zap",
      unlocked: true,
      progress: 100,
      criteria: "Complete 5 early morning rides",
      category: 'ride',
      tier: 'bronze'
    },
    {
      id: 2,
      name: "Road Warrior",
      description: "Complete 50 rides in total",
      points: 200,
      icon: "trophy",
      unlocked: true,
      progress: 100,
      criteria: "Complete 50 rides",
      category: 'milestone',
      tier: 'silver'
    },
    {
      id: 3,
      name: "Carbon Saver",
      description: "Save 100kg of CO2 through ride sharing",
      points: 300,
      icon: "leaf",
      unlocked: false,
      progress: 65,
      criteria: "Reduce carbon emissions by 100kg",
      category: 'eco',
      tier: 'gold'
    },
    {
      id: 4,
      name: "Social Butterfly",
      description: "Connect with 10 different ride partners",
      points: 150,
      icon: "users",
      unlocked: false,
      progress: 80,
      criteria: "Connect with 10 unique ride partners",
      category: 'social',
      tier: 'bronze'
    },
    {
      id: 5,
      name: "Marathon Rider",
      description: "Travel a total of 1000km using the app",
      points: 400,
      icon: "car",
      unlocked: false,
      progress: 48,
      criteria: "Complete 1000km of journeys",
      category: 'milestone',
      tier: 'gold'
    },
    {
      id: 6,
      name: "Consistent Commuter",
      description: "Use the app for commuting 20 days in a row",
      points: 250,
      icon: "calendar",
      unlocked: false,
      progress: 35,
      criteria: "20 consecutive days of commuting",
      category: 'ride',
      tier: 'silver'
    },
    {
      id: 7,
      name: "Eco Warrior",
      description: "Choose eco-friendly routes 30 times",
      points: 200,
      icon: "leaf",
      unlocked: false,
      progress: 25,
      criteria: "Select eco-friendly route option 30 times",
      category: 'eco',
      tier: 'bronze'
    },
    {
      id: 8,
      name: "Community Builder",
      description: "Start or join 5 group rides",
      points: 350,
      icon: "users",
      unlocked: false,
      progress: 60,
      criteria: "Participate in 5 group rides",
      category: 'social',
      tier: 'silver'
    }
  ]);
  
  // State for milestones
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: 1,
      name: "Ride Count",
      description: "Total rides completed",
      value: 78,
      target: 100,
      reward: "Silver Member Status",
      unit: "rides",
      category: 'rides',
      icon: "car"
    },
    {
      id: 2,
      name: "Distance Traveled",
      description: "Total distance traveled",
      value: 782,
      target: 1000,
      reward: "500 Bonus Points",
      unit: "km",
      category: 'distance',
      icon: "mapPin"
    },
    {
      id: 3,
      name: "CO2 Saved",
      description: "Carbon emissions prevented",
      value: 65,
      target: 100,
      reward: "Tree Planted In Your Name",
      unit: "kg",
      category: 'co2',
      icon: "leaf"
    },
    {
      id: 4,
      name: "Social Connections",
      description: "Unique ride partners",
      value: 8,
      target: 10,
      reward: "Social Badge",
      unit: "people",
      category: 'social',
      icon: "users"
    }
  ]);
  
  // State for leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    {
      id: 1,
      name: "Alex Johnson",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      points: 2450,
      rank: 1,
      level: 12,
      achievements: 15,
      isCurrentUser: false
    },
    {
      id: 2,
      name: "Emma Davis",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      points: 2120,
      rank: 2,
      level: 10,
      achievements: 12,
      isCurrentUser: false
    },
    {
      id: 3,
      name: "You",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg",
      points: 1950,
      rank: 3,
      level: 9,
      achievements: 11,
      isCurrentUser: true
    },
    {
      id: 4,
      name: "Sarah Wilson",
      avatar: "https://randomuser.me/api/portraits/women/17.jpg",
      points: 1830,
      rank: 4,
      level: 8,
      achievements: 9,
      isCurrentUser: false
    },
    {
      id: 5,
      name: "Michael Brown",
      avatar: "https://randomuser.me/api/portraits/men/94.jpg",
      points: 1680,
      rank: 5,
      level: 7,
      achievements: 8,
      isCurrentUser: false
    }
  ]);
  
  // State for rewards
  const [rewards, setRewards] = useState<Reward[]>([
    {
      id: 1,
      name: "Free Ride",
      description: "One free ride up to 15km",
      cost: 500,
      type: 'free_ride',
      expiry: "2025-04-15",
      image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      isNew: true,
      isFeatured: true
    },
    {
      id: 2,
      name: "Coffee Shop Discount",
      description: "15% off at partner coffee shops",
      cost: 300,
      type: 'partner',
      expiry: "2025-05-01",
      image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      isNew: false,
      isFeatured: false,
      partner: "BeanTown Coffee"
    },
    {
      id: 3,
      name: "Premium Features",
      description: "1 month of premium features",
      cost: 800,
      type: 'upgrade',
      expiry: null,
      image: "https://images.unsplash.com/photo-1565043666747-69f6646db940?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      isNew: false,
      isFeatured: true
    },
    {
      id: 4,
      name: "Restaurant Voucher",
      description: "$20 off at select restaurants",
      cost: 600,
      type: 'partner',
      expiry: "2025-06-30",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      isNew: true,
      isFeatured: false,
      partner: "Local Eats Network"
    }
  ]);
  
  // State for eco impact
  const [ecoImpact, setEcoImpact] = useState<EcoImpact>({
    co2Saved: 65,
    treesEquivalent: 3,
    milesDriven: 250,
    fuelSaved: 27.5,
    singleUseRides: 12,
    sharedRides: 66
  });
  
  // State for user stats
  const [userStats, setUserStats] = useState({
    points: 1950,
    level: 9,
    nextLevelPoints: 2500,
    achievements: 11,
    unlocked: 2,
    inProgress: 6,
    daysStreak: 15
  });
  
  // Handler for clicking an achievement
  const handleAchievementClick = (achievement: Achievement) => {
    if (achievement.unlocked) {
      toast({
        title: achievement.name,
        description: `Achievement unlocked! +${achievement.points} points`
      });
    } else {
      toast({
        title: achievement.name,
        description: `${achievement.progress}% progress - ${achievement.criteria}`
      });
    }
  };
  
  // Handler for redeeming rewards
  const handleRedeemReward = (reward: Reward) => {
    if (userStats.points >= reward.cost) {
      toast({
        title: "Reward Redeemed!",
        description: `You have successfully redeemed: ${reward.name}`
      });
      
      // In a real app, would update user points on the server
      setUserStats({
        ...userStats,
        points: userStats.points - reward.cost
      });
    } else {
      toast({
        title: "Not Enough Points",
        description: `You need ${reward.cost - userStats.points} more points to redeem this reward.`,
        variant: "destructive"
      });
    }
  };
  
  // Calculate user level progress percentage
  const levelProgressPercentage = Math.min(
    100, 
    ((userStats.points - (userStats.nextLevelPoints - 550)) / 550) * 100
  );
  
  // Filter achievements by category
  const filteredAchievements = activeAchievementCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === activeAchievementCategory);
  
  // Get user rank info from leaderboard
  const userRankInfo = leaderboard.find(entry => entry.isCurrentUser);
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-xl">
          <Trophy className="h-5 w-5 mr-2 text-primary" />
          Rewards & Achievements
        </CardTitle>
        <CardDescription>
          Track your progress, earn rewards, and compete with other riders
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* User Status Bar */}
        <div className="px-4 py-3 bg-primary/5 border-y flex flex-col md:flex-row justify-between gap-3">
          <div className="flex items-center">
            <div className="relative">
              <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                {userStats.level}
              </div>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white text-xs">
                <Trophy className="h-3.5 w-3.5" />
              </div>
            </div>
            
            <div className="ml-3">
              <div className="flex items-center gap-1">
                <h3 className="font-medium">Level {userStats.level}</h3>
                <Badge variant="outline" className="bg-primary/10 text-xs">
                  <Flame className="h-3 w-3 mr-1" />
                  {userStats.daysStreak} day streak
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Star className="h-3.5 w-3.5 mr-1 text-amber-500" />
                  <span>{userStats.points} points</span>
                </div>
                <span>•</span>
                <div className="flex items-center">
                  <Trophy className="h-3.5 w-3.5 mr-1 text-primary" />
                  <span>{userStats.achievements} achievements</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 max-w-xs">
            <div className="flex justify-between text-xs mb-1">
              <span>Level {userStats.level}</span>
              <span>Level {userStats.level + 1}</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full" 
                style={{ width: `${levelProgressPercentage}%` }} 
              />
            </div>
            <div className="text-xs text-muted-foreground mt-1 text-center">
              {userStats.nextLevelPoints - userStats.points} points to next level
            </div>
          </div>
        </div>
        
        {/* Main Content Tabs */}
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="px-4 py-2 border-b">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="achievements" className="text-xs md:text-sm">
                <Trophy className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden md:inline">Achievements</span>
                <span className="inline md:hidden">Awards</span>
              </TabsTrigger>
              <TabsTrigger value="milestones" className="text-xs md:text-sm">
                <Footprints className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden md:inline">Milestones</span>
                <span className="inline md:hidden">Goals</span>
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="text-xs md:text-sm">
                <Medal className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden md:inline">Leaderboard</span>
                <span className="inline md:hidden">Ranks</span>
              </TabsTrigger>
              <TabsTrigger value="rewards" className="text-xs md:text-sm">
                <Gift className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden md:inline">Rewards</span>
                <span className="inline md:hidden">Perks</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Achievements Tab */}
          <TabsContent value="achievements" className="p-4 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <h3 className="text-lg font-medium flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-primary" />
                  Your Achievements
                </h3>
                <p className="text-sm text-muted-foreground">
                  Unlock achievements by meeting specific goals and milestones
                </p>
              </div>
              
              <div className="grid grid-cols-5 gap-1 bg-muted p-1 rounded-md">
                <Button 
                  size="sm" 
                  variant={activeAchievementCategory === 'all' ? 'default' : 'ghost'}
                  className="h-8 text-xs"
                  onClick={() => setActiveAchievementCategory('all')}
                >
                  All
                </Button>
                <Button 
                  size="sm" 
                  variant={activeAchievementCategory === 'ride' ? 'default' : 'ghost'}
                  className="h-8 text-xs"
                  onClick={() => setActiveAchievementCategory('ride')}
                >
                  Rides
                </Button>
                <Button 
                  size="sm" 
                  variant={activeAchievementCategory === 'social' ? 'default' : 'ghost'}
                  className="h-8 text-xs"
                  onClick={() => setActiveAchievementCategory('social')}
                >
                  Social
                </Button>
                <Button 
                  size="sm" 
                  variant={activeAchievementCategory === 'eco' ? 'default' : 'ghost'}
                  className="h-8 text-xs"
                  onClick={() => setActiveAchievementCategory('eco')}
                >
                  Eco
                </Button>
                <Button 
                  size="sm" 
                  variant={activeAchievementCategory === 'milestone' ? 'default' : 'ghost'}
                  className="h-8 text-xs"
                  onClick={() => setActiveAchievementCategory('milestone')}
                >
                  Milestones
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredAchievements.map(achievement => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleAchievementClick(achievement)}
                    className="cursor-pointer"
                  >
                    <Card 
                      className={`
                        overflow-hidden border transition-all duration-300
                        ${achievement.unlocked 
                          ? 'border-primary/30 bg-primary/5' 
                          : 'hover:border-gray-300'}
                      `}
                    >
                      <div 
                        className={`
                          absolute top-0 right-0 left-0 h-1
                          ${achievement.unlocked ? 'bg-primary' : 'bg-gray-200'}
                        `}
                      />
                      
                      <CardContent className="p-4 pt-5">
                        <div className="flex items-start">
                          <div 
                            className={`
                              h-14 w-14 rounded-full flex items-center justify-center
                              ${achievement.unlocked 
                                ? 'bg-primary/20 text-primary' 
                                : 'bg-gray-100 text-gray-500'}
                            `}
                          >
                            {getAchievementIcon(achievement.icon)}
                          </div>
                          
                          <div className="ml-3 flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{achievement.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {achievement.description}
                                </p>
                              </div>
                              
                              <Badge 
                                variant="outline" 
                                className={`
                                  text-xs capitalize
                                  ${getTierBadgeStyle(achievement.tier)}
                                `}
                              >
                                {achievement.tier}
                              </Badge>
                            </div>
                            
                            <div className="mt-2 space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Progress</span>
                                <span>
                                  {achievement.unlocked ? (
                                    <span className="text-primary font-medium flex items-center">
                                      <Check className="h-3 w-3 mr-1" />
                                      Completed
                                    </span>
                                  ) : (
                                    `${achievement.progress}%`
                                  )}
                                </span>
                              </div>
                              
                              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className={`
                                    h-full rounded-full
                                    ${achievement.unlocked 
                                      ? 'bg-primary' 
                                      : achievement.progress > 60 
                                      ? 'bg-amber-500' 
                                      : 'bg-gray-300'}
                                  `}
                                  style={{ width: `${achievement.progress}%` }} 
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-2 border-t flex justify-between items-center">
                          <div className="flex items-center text-sm font-medium">
                            <Star className="h-4 w-4 mr-1 text-amber-500" />
                            +{achievement.points} points
                          </div>
                          
                          {achievement.unlocked ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <Check className="h-3 w-3 mr-1" />
                              Unlocked
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              <Zap className="h-3 w-3 mr-1" />
                              In progress
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {filteredAchievements.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-lg font-medium">No achievements found</p>
                <p className="text-sm mt-1">Try selecting a different category</p>
              </div>
            )}
            
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-primary" />
                  Achievement Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-3 rounded-md text-center">
                    <Trophy className="h-6 w-6 mx-auto mb-1 text-primary" />
                    <div className="text-2xl font-bold">{userStats.achievements}</div>
                    <div className="text-xs text-muted-foreground">Total achievements</div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-md text-center">
                    <Check className="h-6 w-6 mx-auto mb-1 text-green-600" />
                    <div className="text-2xl font-bold">{userStats.unlocked}</div>
                    <div className="text-xs text-muted-foreground">Unlocked</div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-md text-center">
                    <Zap className="h-6 w-6 mx-auto mb-1 text-amber-500" />
                    <div className="text-2xl font-bold">{userStats.inProgress}</div>
                    <div className="text-xs text-muted-foreground">In progress</div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-md text-center">
                    <Star className="h-6 w-6 mx-auto mb-1 text-amber-500" />
                    <div className="text-2xl font-bold">{userStats.points}</div>
                    <div className="text-xs text-muted-foreground">Total points</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Milestones Tab */}
          <TabsContent value="milestones" className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium flex items-center">
                  <Footprints className="h-5 w-5 mr-2 text-primary" />
                  Your Milestones
                </h3>
                <p className="text-sm text-muted-foreground">
                  Track your progress towards key milestones and earn rewards
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Milestones */}
              <div className="space-y-4">
                {milestones.map(milestone => {
                  const progressPercentage = Math.min(100, (milestone.value / milestone.target) * 100);
                  const MilestoneIcon = milestone.icon === 'car' ? Car :
                                      milestone.icon === 'mapPin' ? MapPin :
                                      milestone.icon === 'leaf' ? Leaf :
                                      milestone.icon === 'users' ? Users : Footprints;
                  
                  return (
                    <Card key={milestone.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                            <MilestoneIcon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <div>
                                <h4 className="font-medium">{milestone.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {milestone.description}
                                </p>
                              </div>
                              <Badge 
                                variant="outline" 
                                className={
                                  progressPercentage === 100 
                                    ? 'bg-green-50 text-green-700 border-green-200' 
                                    : progressPercentage >= 60
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-gray-100'
                                }
                              >
                                {progressPercentage === 100 ? (
                                  <span className="flex items-center">
                                    <Check className="h-3.5 w-3.5 mr-1" />
                                    Complete
                                  </span>
                                ) : (
                                  <span className="flex items-center">
                                    <Zap className="h-3.5 w-3.5 mr-1" />
                                    In progress
                                  </span>
                                )}
                              </Badge>
                            </div>
                            
                            <div className="mt-3 space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground flex items-center">
                                  <Gift className="h-3.5 w-3.5 mr-1" />
                                  Reward: {milestone.reward}
                                </span>
                                <span>
                                  <span className="font-medium">{milestone.value}</span>
                                  <span className="text-muted-foreground">/{milestone.target} {milestone.unit}</span>
                                </span>
                              </div>
                              
                              <Progress value={progressPercentage} className="h-2" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              {/* Eco impact */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <Leaf className="h-4 w-4 mr-2 text-primary" />
                      Environmental Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-green-50 border border-green-100 p-3 rounded-md">
                        <div className="text-xs text-green-700 mb-1">CO2 Emissions Saved</div>
                        <div className="text-xl font-medium text-green-800">{ecoImpact.co2Saved} kg</div>
                        <div className="text-xs text-green-700 mt-1">
                          Equivalent to {ecoImpact.treesEquivalent} trees planted
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-100 p-3 rounded-md">
                        <div className="text-xs text-blue-700 mb-1">Fuel Saved</div>
                        <div className="text-xl font-medium text-blue-800">{ecoImpact.fuelSaved} L</div>
                        <div className="text-xs text-blue-700 mt-1">
                          Through ride sharing
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <div className="text-sm font-medium">Ride Sharing Ratio</div>
                          <div className="text-xs text-muted-foreground">
                            {ecoImpact.sharedRides} shared / {ecoImpact.singleUseRides} single
                          </div>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full" 
                            style={{ 
                              width: `${(ecoImpact.sharedRides / (ecoImpact.sharedRides + ecoImpact.singleUseRides)) * 100}%` 
                            }} 
                          />
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Miles not driven:</span>
                        <span className="font-medium">{ecoImpact.milesDriven} mi</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Tips */}
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Milestone Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-primary mr-2 mt-0.5" />
                        <span>Complete your profile to unlock the "Complete Profile" milestone</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-primary mr-2 mt-0.5" />
                        <span>Share your rides to earn extra points and reach milestones faster</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-primary mr-2 mt-0.5" />
                        <span>Choose eco-friendly routes to boost your environmental impact stats</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-primary mr-2 mt-0.5" />
                        <span>Connect with new ride partners to increase your social connections</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium flex items-center">
                  <Medal className="h-5 w-5 mr-2 text-primary" />
                  Leaderboard
                </h3>
                <p className="text-sm text-muted-foreground">
                  See how you rank against other riders in your area
                </p>
              </div>
              
              <Badge variant="outline" className="bg-primary/5">
                Weekly Rankings
              </Badge>
            </div>
            
            {/* Leaderboard Podium */}
            <div className="grid grid-cols-3 md:max-w-xl md:mx-auto gap-2 mb-2">
              {/* 2nd Place */}
              <div className="flex flex-col items-center order-1">
                <div className="h-[100px] bg-slate-100 rounded-t-md w-full relative flex flex-col items-center justify-end pb-4">
                  <Avatar className="h-12 w-12 border-2 border-white absolute -top-6">
                    <AvatarImage src={leaderboard[1]?.avatar} />
                    <AvatarFallback>{leaderboard[1]?.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-slate-500 font-bold text-sm">2nd</div>
                  <div className="truncate text-xs max-w-[90%] text-center">
                    {leaderboard[1]?.name}
                  </div>
                  <div className="text-xs mt-1 text-muted-foreground">
                    {leaderboard[1]?.points} pts
                  </div>
                </div>
                <div className="h-3 w-full rounded-b-md bg-slate-500" />
              </div>
              
              {/* 1st Place */}
              <div className="flex flex-col items-center order-0">
                <Badge className="mb-1 bg-amber-100 text-amber-800 border-amber-200">
                  <Crown className="h-3 w-3 mr-1" />
                  Leader
                </Badge>
                <div className="h-[130px] bg-amber-100 rounded-t-md w-full relative flex flex-col items-center justify-end pb-4">
                  <Avatar className="h-14 w-14 border-2 border-white absolute -top-7">
                    <AvatarImage src={leaderboard[0]?.avatar} />
                    <AvatarFallback>{leaderboard[0]?.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-amber-700 font-bold">1st</div>
                  <div className="truncate text-sm max-w-[90%] text-center font-medium">
                    {leaderboard[0]?.name}
                  </div>
                  <div className="text-xs mt-1 text-amber-800">
                    {leaderboard[0]?.points} pts
                  </div>
                </div>
                <div className="h-3 w-full rounded-b-md bg-amber-500" />
              </div>
              
              {/* 3rd Place */}
              <div className="flex flex-col items-center order-2">
                <div className="h-[80px] bg-amber-50 rounded-t-md w-full relative flex flex-col items-center justify-end pb-4">
                  <Avatar className="h-10 w-10 border-2 border-white absolute -top-5">
                    <AvatarImage src={leaderboard[2]?.avatar} />
                    <AvatarFallback>{leaderboard[2]?.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-amber-600 font-bold text-sm">3rd</div>
                  <div className="truncate text-xs max-w-[90%] text-center">
                    {leaderboard[2]?.name}
                  </div>
                  <div className="text-xs mt-1 text-muted-foreground">
                    {leaderboard[2]?.points} pts
                  </div>
                </div>
                <div className="h-3 w-full rounded-b-md bg-amber-300" />
              </div>
            </div>
            
            {/* Full Leaderboard */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Top Riders</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid divide-y">
                  {leaderboard.map((entry, index) => (
                    <div 
                      key={entry.id}
                      className={`
                        p-3 flex items-center
                        ${entry.isCurrentUser ? 'bg-primary/5' : ''}
                        ${index < 3 ? 'hidden' : ''} // Hide the top 3 already shown in podium
                      `}
                    >
                      <div className="w-7 text-center font-bold text-muted-foreground mr-3">
                        {entry.rank}
                      </div>
                      
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={entry.avatar} />
                        <AvatarFallback>{entry.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <div className="font-medium flex items-center">
                              {entry.name}
                              {entry.isCurrentUser && (
                                <Badge variant="outline" className="ml-2 text-xs bg-primary/10">You</Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center">
                              <Trophy className="h-3 w-3 mr-1" />
                              {entry.achievements} achievements
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-bold">{entry.points}</div>
                            <div className="text-xs text-muted-foreground">points</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Your Rank Card */}
            {userRankInfo && (
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <Trophy className="h-4 w-4 mr-2 text-primary" />
                    Your Ranking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="text-3xl font-bold text-primary mr-4">
                      #{userRankInfo.rank}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div className="font-medium">Level {userRankInfo.level}</div>
                        <div className="text-sm">{userRankInfo.points} points</div>
                      </div>
                      
                      <div className="mt-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Current Rank</span>
                          <span>Next Rank</span>
                        </div>
                        <Progress value={70} className="h-2" />
                        <div className="text-xs text-muted-foreground mt-1">
                          {userRankInfo.rank === 1 
                            ? 'You are at the top of the leaderboard!'
                            : `Need ${leaderboard[userRankInfo.rank - 2].points - userRankInfo.points} more points to reach rank #${userRankInfo.rank - 1}`
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t text-sm">
                    <div className="flex justify-between">
                      <Button variant="outline" size="sm" className="text-xs">
                        <Share2 className="h-3.5 w-3.5 mr-1.5" />
                        Share Ranking
                      </Button>
                      
                      <Button size="sm" className="text-xs">
                        <Trophy className="h-3.5 w-3.5 mr-1.5" />
                        View Full Leaderboard
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Rewards Tab */}
          <TabsContent value="rewards" className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium flex items-center">
                  <Gift className="h-5 w-5 mr-2 text-primary" />
                  Redeem Rewards
                </h3>
                <p className="text-sm text-muted-foreground">
                  Use your earned points to claim exclusive rewards and perks
                </p>
              </div>
              
              <div className="flex items-center">
                <Star className="h-4 w-4 text-amber-500 mr-1" />
                <span className="font-bold">{userStats.points}</span>
                <span className="text-sm text-muted-foreground ml-1">points available</span>
              </div>
            </div>
            
            {/* Featured Rewards */}
            {rewards.filter(r => r.isFeatured).length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-primary" />
                  Featured Rewards
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rewards.filter(r => r.isFeatured).map(reward => (
                    <motion.div
                      key={reward.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ y: -5 }}
                    >
                      <Card className="overflow-hidden h-full">
                        <div className="relative h-32 w-full overflow-hidden">
                          <img 
                            src={reward.image} 
                            alt={reward.name} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          
                          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                            <div className="flex justify-between items-end">
                              <div>
                                <h4 className="font-medium text-lg">{reward.name}</h4>
                                {reward.partner && (
                                  <div className="text-xs text-white/80">
                                    By {reward.partner}
                                  </div>
                                )}
                              </div>
                              
                              <Badge className="bg-amber-400 text-amber-900 border-amber-500">
                                <Star className="h-3 w-3 mr-1" />
                                {reward.cost} points
                              </Badge>
                            </div>
                          </div>
                          
                          {reward.isNew && (
                            <Badge className="absolute top-2 left-2 bg-green-500 text-white border-green-600">
                              New
                            </Badge>
                          )}
                        </div>
                        
                        <CardContent className="p-3">
                          <p className="text-sm">{reward.description}</p>
                          
                          {reward.expiry && (
                            <div className="text-xs text-muted-foreground mt-1 flex items-center">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              Expires: {reward.expiry}
                            </div>
                          )}
                          
                          <div className="mt-3 pt-2 border-t flex justify-between items-center">
                            <Badge 
                              variant="outline" 
                              className={`
                                capitalize text-xs
                                ${reward.type === 'free_ride' 
                                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                  : reward.type === 'partner'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'}
                              `}
                            >
                              {reward.type.replace('_', ' ')}
                            </Badge>
                            
                            <Button
                              size="sm"
                              disabled={userStats.points < reward.cost}
                              onClick={() => handleRedeemReward(reward)}
                            >
                              {userStats.points >= reward.cost ? (
                                <>
                                  <Gift className="h-3.5 w-3.5 mr-1.5" />
                                  Redeem
                                </>
                              ) : (
                                <>
                                  <Lock className="h-3.5 w-3.5 mr-1.5" />
                                  Not enough points
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            {/* All Rewards */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center">
                <Gift className="h-4 w-4 mr-2 text-primary" />
                All Rewards
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {rewards.map(reward => (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -3 }}
                  >
                    <Card className="overflow-hidden">
                      <div className="relative h-24 w-full overflow-hidden">
                        <img 
                          src={reward.image} 
                          alt={reward.name} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        
                        <div className="absolute bottom-0 left-0 right-0 p-2">
                          <h4 className="font-medium text-white">{reward.name}</h4>
                        </div>
                        
                        {reward.isNew && (
                          <Badge className="absolute top-2 right-2 bg-green-500 text-white border-green-600">
                            New
                          </Badge>
                        )}
                      </div>
                      
                      <CardContent className="p-3">
                        <div className="flex justify-between items-center mb-2">
                          <Badge 
                            variant="outline" 
                            className={`
                              capitalize text-xs
                              ${reward.type === 'free_ride' 
                                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                : reward.type === 'partner'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'}
                            `}
                          >
                            {reward.type.replace('_', ' ')}
                          </Badge>
                          
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                            <Star className="h-3 w-3 mr-1" />
                            {reward.cost}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {reward.description}
                        </p>
                        
                        <Button
                          size="sm"
                          className="w-full"
                          disabled={userStats.points < reward.cost}
                          onClick={() => handleRedeemReward(reward)}
                        >
                          {userStats.points >= reward.cost ? "Redeem Now" : "Not Enough Points"}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Points Explainer */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Star className="h-4 w-4 mr-2 text-primary" />
                  How to Earn Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Complete a ride</span>
                      <Badge variant="outline" className="bg-primary/10">+10 points</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Ride with a new partner</span>
                      <Badge variant="outline" className="bg-primary/10">+25 points</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Choose eco-friendly route</span>
                      <Badge variant="outline" className="bg-primary/10">+15 points</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Daily ride streak</span>
                      <Badge variant="outline" className="bg-primary/10">+5 per day</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Unlock achievement</span>
                      <Badge variant="outline" className="bg-primary/10">+50-400 points</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Reach a milestone</span>
                      <Badge variant="outline" className="bg-primary/10">+100 points</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Share ride on social</span>
                      <Badge variant="outline" className="bg-primary/10">+20 points</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Rate your ride</span>
                      <Badge variant="outline" className="bg-primary/10">+5 points</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="border-t px-4 py-3">
        <div className="w-full flex flex-col md:flex-row justify-between gap-2 text-center md:text-left">
          <div className="text-sm text-muted-foreground flex items-center justify-center md:justify-start">
            <BadgeCheck className="h-4 w-4 mr-2 text-primary" />
            <span>Keep riding to unlock more achievements and rewards</span>
          </div>
          
          <div className="flex items-center justify-center md:justify-end">
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs"
              onClick={() => setActiveTab('rewards')}
            >
              <Gift className="h-3.5 w-3.5 mr-1.5" />
              View Rewards
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}