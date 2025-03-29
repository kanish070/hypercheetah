import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Award,
  Star, 
  Leaf, 
  Zap,
  Users, 
  Calendar,
  Gauge,
  Gift,
  ChevronDown, 
  ChevronUp,
  Info,
  Car
} from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";

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

// Helper function to get the icon component based on string
const getIconComponent = (iconName: string) => {
  const icons: Record<string, React.ReactNode> = {
    'trophy': <Trophy className="h-5 w-5" />,
    'award': <Award className="h-5 w-5" />,
    'star': <Star className="h-5 w-5" />,
    'leaf': <Leaf className="h-5 w-5" />,
    'zap': <Zap className="h-5 w-5" />,
    'users': <Users className="h-5 w-5" />,
    'calendar': <Calendar className="h-5 w-5" />,
    'gauge': <Gauge className="h-5 w-5" />,
    'car': <Car className="h-5 w-5" />,
  };
  
  return icons[iconName] || <Trophy className="h-5 w-5" />;
};

// Helper function to get tier color
const getTierColor = (tier: string) => {
  const colors: Record<string, { bg: string, text: string, border: string }> = {
    'bronze': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
    'silver': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
    'gold': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
    'platinum': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
  };
  
  return colors[tier] || { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
};

// Helper function to get category icon and color
const getCategoryDetails = (category: string) => {
  const details: Record<string, { icon: React.ReactNode, color: string }> = {
    'ride': { icon: <Car className="h-4 w-4" />, color: 'text-blue-500' },
    'social': { icon: <Users className="h-4 w-4" />, color: 'text-purple-500' },
    'eco': { icon: <Leaf className="h-4 w-4" />, color: 'text-green-500' },
    'milestone': { icon: <Trophy className="h-4 w-4" />, color: 'text-amber-500' },
  };
  
  return details[category] || { icon: <Trophy className="h-4 w-4" />, color: 'text-gray-500' };
};

interface GamificationProps {
  userId: number;
}

export function Gamification({ userId }: GamificationProps) {
  const [activeTab, setActiveTab] = useState("achievements");
  const [expandedAchievement, setExpandedAchievement] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Mock data - in a real app, this would come from the API
  const { data: userAchievementsData, isLoading: isAchievementsLoading } = useQuery({
    queryKey: ['/api/users', userId, 'achievements'],
    queryFn: () => fetch(`/api/users/${userId}/achievements`).then(res => res.json()),
  });
  
  // Process the data from the API to match our Achievement interface
  const userAchievements = userAchievementsData?.map((item: any) => ({
    id: item.id,
    name: item.achievement.name,
    description: item.achievement.description,
    points: item.achievement.points,
    icon: item.achievement.icon,
    unlocked: item.unlocked,
    progress: item.progress,
    criteria: item.achievement.criteria,
    category: item.achievement.category,
    tier: item.achievement.tier
  }));
  
  const { data: leaderboard, isLoading: isLeaderboardLoading } = useQuery({
    queryKey: ['/api/leaderboard'],
    queryFn: () => fetch('/api/leaderboard').then(res => res.json()),
  });
  
  const { data: rewards, isLoading: isRewardsLoading } = useQuery({
    queryKey: ['/api/rewards'],
    queryFn: () => fetch('/api/rewards').then(res => res.json()),
  });
  
  const { data: ecoImpact, isLoading: isEcoImpactLoading } = useQuery({
    queryKey: ['/api/users', userId, 'eco-impact'],
    queryFn: () => fetch(`/api/users/${userId}/eco-impact`).then(res => res.json()),
  });
  
  const filteredAchievements = userAchievements?.filter((achievement: Achievement) => 
    selectedCategory === "all" || achievement.category === selectedCategory
  );
  
  const handleAchievementClick = (achievement: Achievement) => {
    setExpandedAchievement(expandedAchievement === achievement.id ? null : achievement.id);
  };
  
  const handleRedeemReward = (reward: Reward) => {
    // In a real app, this would call an API to redeem the reward
    console.log("Redeeming reward:", reward);
    alert(`Redeeming ${reward.name} for ${reward.cost} points`);
  };
  
  const renderCategoryIcon = (category: string) => {
    const icons: Record<string, JSX.Element> = {
      'ride': <Car className="h-4 w-4" />,
      'social': <Users className="h-4 w-4" />,
      'eco': <Leaf className="h-4 w-4" />,
      'milestone': <Trophy className="h-4 w-4" />
    };
    return icons[category] || <Trophy className="h-4 w-4" />;
  };
  
  return (
    <div className="space-y-6 pr-1">
      {/* Added right padding to ensure content doesn't get cut off */}
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Rewards
          </TabsTrigger>
          <TabsTrigger value="impact" className="flex items-center gap-2">
            <Leaf className="h-4 w-4" />
            Eco Impact
          </TabsTrigger>
        </TabsList>
        
        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <Button 
              variant={selectedCategory === "all" ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              All
            </Button>
            <Button 
              variant={selectedCategory === "ride" ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedCategory("ride")}
              className="flex items-center gap-2"
            >
              <Car className="h-4 w-4" />
              Ride
            </Button>
            <Button 
              variant={selectedCategory === "social" ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedCategory("social")}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Social
            </Button>
            <Button 
              variant={selectedCategory === "eco" ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedCategory("eco")}
              className="flex items-center gap-2"
            >
              <Leaf className="h-4 w-4" />
              Eco
            </Button>
            <Button 
              variant={selectedCategory === "milestone" ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedCategory("milestone")}
              className="flex items-center gap-2"
            >
              <Trophy className="h-4 w-4" />
              Milestone
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-x-hidden w-full">
            {/* Added overflow-x-hidden and w-full to prevent content from extending beyond container */}
            {isAchievementsLoading ? (
              <div className="col-span-full flex justify-center py-10">
                <div className="flex flex-col items-center">
                  <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                  <p className="text-muted-foreground">Loading achievements...</p>
                </div>
              </div>
            ) : filteredAchievements?.length === 0 ? (
              <div className="col-span-full flex justify-center py-10">
                <div className="flex flex-col items-center">
                  <Trophy className="h-12 w-12 text-muted-foreground opacity-40 mb-2" />
                  <p className="text-muted-foreground">No achievements in this category yet</p>
                </div>
              </div>
            ) : (
              filteredAchievements?.map((achievement: Achievement) => {
                const tierColors = getTierColor(achievement.tier);
                const categoryDetails = getCategoryDetails(achievement.category);
                
                return (
                  <motion.div 
                    key={achievement.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`border rounded-lg overflow-hidden hover:shadow-md transition-all ${achievement.unlocked ? '' : 'opacity-70'}`}
                  >
                    <div 
                      className={`p-4 cursor-pointer ${tierColors.bg}`}
                      onClick={() => handleAchievementClick(achievement)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                          <div className={`p-2 rounded-full ${achievement.unlocked ? 'bg-primary/10' : 'bg-gray-200'}`}>
                            {getIconComponent(achievement.icon)}
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{achievement.name}</h3>
                              <Badge variant="outline" className={`${tierColors.text} ${tierColors.border} ${tierColors.bg}`}>
                                {achievement.tier.charAt(0).toUpperCase() + achievement.tier.slice(1)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            {achievement.points}
                          </Badge>
                          {expandedAchievement === achievement.id ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <div className="flex items-center gap-1">
                            {categoryDetails.icon}
                            <span className={categoryDetails.color}>
                              {achievement.category.charAt(0).toUpperCase() + achievement.category.slice(1)}
                            </span>
                          </div>
                          <span className="text-muted-foreground">
                            {achievement.progress}%
                          </span>
                        </div>
                        <Progress value={achievement.progress} className="h-2" />
                      </div>
                      
                      <AnimatePresence>
                        {expandedAchievement === achievement.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 text-sm"
                          >
                            <div className="p-3 bg-background rounded-md">
                              <div className="font-medium mb-1">Criteria to Earn</div>
                              <p className="text-muted-foreground">{achievement.criteria}</p>
                              
                              {!achievement.unlocked && (
                                <div className="mt-3 flex justify-between items-center">
                                  <span className="text-primary font-medium">
                                    {`${Math.round(achievement.progress)}% complete`}
                                  </span>
                                  
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                          <Info className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Keep working toward this achievement</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              )}
                              
                              {achievement.unlocked && (
                                <div className="mt-3 flex items-center gap-2 text-green-600">
                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                    Achieved
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    Mar 15, 2025
                                  </span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </TabsContent>
        
        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                This Month's Top Riders
              </CardTitle>
              <CardDescription>
                See how you rank against other riders
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLeaderboardLoading ? (
                <div className="flex justify-center py-10">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                    <p className="text-muted-foreground">Loading leaderboard...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboard?.map((entry: LeaderboardEntry) => (
                    <div 
                      key={entry.id} 
                      className={`flex items-center gap-4 p-3 rounded-lg ${
                        entry.isCurrentUser ? 'bg-primary/5 border border-primary/20' : 'hover:bg-muted/50'
                      } transition-colors`}
                    >
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                        entry.rank <= 3 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {entry.rank}
                      </div>
                      
                      <div className="flex items-center gap-3 flex-1">
                        <img 
                          src={entry.avatar} 
                          alt={entry.name} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        
                        <div>
                          <div className="flex items-center">
                            <span className="font-medium">{entry.name}</span>
                            {entry.isCurrentUser && (
                              <Badge variant="outline" className="ml-2 bg-primary/5 text-primary">
                                You
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Level {entry.level} • {entry.achievements} achievements
                          </div>
                        </div>
                      </div>
                      
                      <div className="font-semibold text-lg">{entry.points}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button variant="outline">View Full Leaderboard</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Rewards Tab */}
        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                Rewards Store
              </CardTitle>
              <CardDescription>
                Redeem your points for special rewards and discounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-3 bg-primary/5 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <span className="font-medium">Your Points</span>
                </div>
                <span className="text-xl font-bold">850</span>
              </div>
              
              {isRewardsLoading ? (
                <div className="flex justify-center py-10">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                    <p className="text-muted-foreground">Loading rewards...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-x-hidden w-full">
                  {/* Added overflow-x-hidden and w-full to prevent content from extending beyond container */}
                  {rewards?.map((reward: Reward) => (
                    <div key={reward.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-all">
                      <div className="h-32 overflow-hidden">
                        <img 
                          src={reward.image} 
                          alt={reward.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{reward.name}</h3>
                            <p className="text-sm text-muted-foreground">{reward.description}</p>
                          </div>
                          
                          {reward.isNew && (
                            <Badge className="bg-green-100 text-green-800">New</Badge>
                          )}
                        </div>
                        
                        {reward.partner && (
                          <div className="text-xs text-muted-foreground mb-2">
                            Partner: {reward.partner}
                          </div>
                        )}
                        
                        {reward.expiry && (
                          <div className="text-xs text-muted-foreground mb-3">
                            Expires: {reward.expiry}
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center mt-3">
                          <div className="flex items-center gap-1">
                            <Zap className="h-4 w-4 text-primary" />
                            <span className="font-medium">{reward.cost} points</span>
                          </div>
                          
                          <Button 
                            size="sm" 
                            disabled={850 < reward.cost}
                            onClick={() => handleRedeemReward(reward)}
                          >
                            Redeem
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Eco Impact Tab */}
        <TabsContent value="impact">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-primary" />
                Your Environmental Impact
              </CardTitle>
              <CardDescription>
                See how your ride-sharing contributes to a greener planet
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEcoImpactLoading ? (
                <div className="flex justify-center py-10">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                    <p className="text-muted-foreground">Loading impact data...</p>
                  </div>
                </div>
              ) : ecoImpact && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-4 text-center">
                    <div className="flex-1 p-4 bg-green-50 rounded-lg">
                      <Leaf className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <div className="text-2xl font-bold text-green-700">{ecoImpact.co2Saved} kg</div>
                      <div className="text-sm text-green-600">CO2 Emissions Saved</div>
                    </div>
                    
                    <div className="flex-1 p-4 bg-blue-50 rounded-lg">
                      <Trophy className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <div className="text-2xl font-bold text-blue-700">{ecoImpact.treesEquivalent}</div>
                      <div className="text-sm text-blue-600">Trees Equivalent</div>
                    </div>
                    
                    <div className="flex-1 p-4 bg-amber-50 rounded-lg">
                      <Gauge className="h-8 w-8 mx-auto mb-2 text-amber-600" />
                      <div className="text-2xl font-bold text-amber-700">{ecoImpact.fuelSaved} L</div>
                      <div className="text-sm text-amber-600">Fuel Saved</div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-3">Ride Statistics</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Total Distance</span>
                          <span className="font-medium">{ecoImpact.milesDriven} km</span>
                        </div>
                        <Progress value={ecoImpact.milesDriven / 10} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Shared Rides vs Single Rides</span>
                          <span className="font-medium">
                            {ecoImpact.sharedRides} / {ecoImpact.singleUseRides}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ 
                              width: `${(ecoImpact.sharedRides / (ecoImpact.sharedRides + ecoImpact.singleUseRides)) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                          <span>Shared ({Math.round((ecoImpact.sharedRides / (ecoImpact.sharedRides + ecoImpact.singleUseRides)) * 100)}%)</span>
                          <span>Single ({Math.round((ecoImpact.singleUseRides / (ecoImpact.sharedRides + ecoImpact.singleUseRides)) * 100)}%)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">Environmental Goals</h3>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        2/4 Completed
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-green-50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-full">
                            <Leaf className="h-4 w-4 text-green-700" />
                          </div>
                          <div>
                            <div className="font-medium text-green-800">Save 100kg CO2</div>
                            <div className="text-xs text-green-700">Completed on Mar 12, 2025</div>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Completed</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 rounded-lg bg-green-50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-full">
                            <Users className="h-4 w-4 text-green-700" />
                          </div>
                          <div>
                            <div className="font-medium text-green-800">Share 20 rides</div>
                            <div className="text-xs text-green-700">Completed on Mar 20, 2025</div>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Completed</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Leaf className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">Save 500kg CO2</div>
                            <div className="text-xs text-muted-foreground">27% complete</div>
                          </div>
                        </div>
                        <Progress value={27} className="w-20 h-2" />
                      </div>
                      
                      <div className="flex items-center justify-between p-2 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Gauge className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">Save 100L of fuel</div>
                            <div className="text-xs text-muted-foreground">56% complete</div>
                          </div>
                        </div>
                        <Progress value={56} className="w-20 h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}