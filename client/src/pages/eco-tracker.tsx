import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf,
  Trophy,
  ChevronLeft,
  Star,
  Trees,
  Droplets,
  BarChart,
  Calendar,
  Car,
  Gauge,
  CircleDot,
  Trash2,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Zap,
  Filter,
  RefreshCw,
  Users,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EcoImpact {
  co2Saved: number;
  treesEquivalent: number;
  milesDriven: number;
  fuelSaved: number;
  singleUseRides: number;
  sharedRides: number;
  plasticSaved: number;
  waterSaved: number;
  energySaved: number;
  carbonFootprint: number;
}

interface EcoGoal {
  id: number;
  name: string;
  target: number;
  current: number;
  unit: string;
  dueDate: string;
  category: 'carbon' | 'energy' | 'water' | 'plastic' | 'trees';
  completed: boolean;
}

interface GreenTip {
  id: number;
  title: string;
  description: string;
  impactLevel: 'low' | 'medium' | 'high';
  category: 'ride' | 'general' | 'home' | 'office';
  icon: string;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  points: number;
  icon: string;
  unlocked: boolean;
  progress: number;
  category: 'ride' | 'social' | 'eco' | 'milestone';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

interface CommunityAction {
  id: number;
  title: string;
  description: string;
  participants: number;
  co2Impact: number;
  date: string;
  location: string;
  imageUrl: string;
}

interface MonthlyStats {
  month: string;
  co2Saved: number;
  ridesShared: number;
}

export default function EcoTracker() {
  const [activeTab, setActiveTab] = useState("overview");
  const [timePeriod, setTimePeriod] = useState("all-time");
  const userId = 1; // Hardcoded for demo
  
  const { data: ecoImpact, isLoading: isEcoImpactLoading } = useQuery({
    queryKey: ['/api/users', userId, 'eco-impact'],
    queryFn: () => fetch(`/api/users/${userId}/eco-impact`).then(res => res.json()),
  });
  
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['/api/users', userId],
    queryFn: () => fetch(`/api/users/${userId}`).then(res => res.json()),
  });
  
  const { data: ecoAchievements, isLoading: isAchievementsLoading } = useQuery({
    queryKey: ['/api/users', userId, 'achievements'],
    queryFn: () => fetch(`/api/users/${userId}/achievements`).then(res => res.json())
      .then(achievements => achievements.filter((a: any) => a.achievement.category === 'eco')),
  });
  
  // Sample data for this demo
  const ecoGoals: EcoGoal[] = [
    {
      id: 1,
      name: "Reduce CO2 emissions",
      target: 200,
      current: 135,
      unit: "kg",
      dueDate: "Apr 30, 2025",
      category: "carbon",
      completed: false
    },
    {
      id: 2,
      name: "Share more rides",
      target: 30,
      current: 21,
      unit: "rides",
      dueDate: "May 15, 2025",
      category: "carbon",
      completed: false
    },
    {
      id: 3,
      name: "Plant trees equivalence",
      target: 10,
      current: 6,
      unit: "trees",
      dueDate: "Jun 20, 2025",
      category: "trees",
      completed: false
    },
    {
      id: 4,
      name: "Save fuel",
      target: 50,
      current: 56,
      unit: "L",
      dueDate: "Apr 10, 2025",
      category: "energy",
      completed: true
    }
  ];
  
  const greenTips: GreenTip[] = [
    {
      id: 1,
      title: "Optimal Departure Times",
      description: "Schedule your rides outside peak traffic hours to reduce idle time and emissions.",
      impactLevel: "medium",
      category: "ride",
      icon: "clock"
    },
    {
      id: 2,
      title: "Car Maintenance",
      description: "Regularly service your vehicle to maintain optimal fuel efficiency and reduce emissions.",
      impactLevel: "high",
      category: "ride",
      icon: "settings"
    },
    {
      id: 3,
      title: "Route Planning",
      description: "Plan the most efficient route to minimize distance and avoid traffic congestion.",
      impactLevel: "high",
      category: "ride",
      icon: "map"
    },
    {
      id: 4,
      title: "Tire Pressure",
      description: "Keep your tires properly inflated to improve fuel efficiency by up to 3%.",
      impactLevel: "medium",
      category: "ride",
      icon: "activity"
    }
  ];
  
  const communityActions: CommunityAction[] = [
    {
      id: 1,
      title: "City Park Cleanup",
      description: "Join us for a community cleanup at Central Park. Every piece of trash matters!",
      participants: 45,
      co2Impact: 120,
      date: "Apr 15, 2025",
      location: "Central Park, San Francisco",
      imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80"
    },
    {
      id: 2,
      title: "Community Bike Share",
      description: "Promote eco-friendly transportation with our neighborhood bike sharing initiative.",
      participants: 32,
      co2Impact: 350,
      date: "May 5, 2025",
      location: "Mission District, San Francisco",
      imageUrl: "https://images.unsplash.com/photo-1519806141769-a0e58011caa1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80"
    }
  ];
  
  const monthlyStats: MonthlyStats[] = [
    { month: "Jan", co2Saved: 42, ridesShared: 8 },
    { month: "Feb", co2Saved: 58, ridesShared: 12 },
    { month: "Mar", co2Saved: 35, ridesShared: 6 },
    { month: "Apr", co2Saved: 0, ridesShared: 0 },
    { month: "May", co2Saved: 0, ridesShared: 0 },
    { month: "Jun", co2Saved: 0, ridesShared: 0 }
  ];
  
  // Helper functions
  const getImpactLevelBadge = (level: string) => {
    const styles = {
      low: "bg-blue-100 text-blue-800 border-blue-200",
      medium: "bg-amber-100 text-amber-800 border-amber-200",
      high: "bg-green-100 text-green-800 border-green-200"
    };
    return styles[level as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };
  
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case "carbon":
        return <Leaf className="h-5 w-5 text-green-600" />;
      case "trees":
        return <Trees className="h-5 w-5 text-green-600" />;
      case "energy":
        return <Zap className="h-5 w-5 text-amber-600" />;
      case "water":
        return <Droplets className="h-5 w-5 text-blue-600" />;
      case "plastic":
        return <Trash2 className="h-5 w-5 text-purple-600" />;
      default:
        return <CircleDot className="h-5 w-5 text-primary" />;
    }
  };
  
  // Calculate stats based on data
  const totalCO2Saved = monthlyStats.reduce((sum, month) => sum + month.co2Saved, 0);
  const totalRidesShared = monthlyStats.reduce((sum, month) => sum + month.ridesShared, 0);
  const completedGoals = ecoGoals.filter(goal => goal.completed).length;
  const inProgressGoals = ecoGoals.length - completedGoals;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-green-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ChevronLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Button>
          </Link>
          
          <div className="flex items-center gap-3">
            <Select defaultValue={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-time">All Time</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
              </SelectContent>
            </Select>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {/* Page Title */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-green-800">Eco-Impact Tracker</h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto px-4">
            Track your environmental contributions and earn rewards for eco-friendly ride-sharing
          </p>
        </div>
        
        {/* Impact Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - User Stats */}
          <div className="space-y-6">
            {/* User Card */}
            <Card className="overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-green-600 to-green-400"></div>
              <div className="p-6 -mt-12">
                <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                  <AvatarImage src="/profile-photo.jpeg" alt="User Profile" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                
                <div className="mt-4">
                  <h3 className="text-xl font-bold">{isUserLoading ? "Loading..." : user?.name}</h3>
                  <p className="text-muted-foreground">Eco Warrior Level 3</p>
                </div>
                
                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Eco Points</span>
                    <span className="font-medium">{250} pts</span>
                  </div>
                  <Progress value={250 / 5} className="h-2" />
                  
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-sm">Rank</span>
                    <Badge variant="outline" className="bg-green-50 text-green-800">
                      Top 10%
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-6">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">{completedGoals}</div>
                    <div className="text-xs text-muted-foreground">Goals Met</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xl font-bold text-amber-600">{inProgressGoals}</div>
                    <div className="text-xs text-muted-foreground">In Progress</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">{ecoAchievements?.length || 0}</div>
                    <div className="text-xs text-muted-foreground">Achievements</div>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Green Achievements */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Leaf className="h-5 w-5 mr-2 text-green-600" />
                  Green Achievements
                </CardTitle>
                <CardDescription>Eco-friendly badges you've earned</CardDescription>
              </CardHeader>
              <CardContent>
                {isAchievementsLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-2"></div>
                      <p className="text-sm text-muted-foreground">Loading achievements...</p>
                    </div>
                  </div>
                ) : ecoAchievements?.length > 0 ? (
                  <div className="space-y-3">
                    {ecoAchievements.map((item: any) => (
                      <div key={item.id} className="flex items-start gap-3 p-2 border rounded-lg hover:bg-green-50 transition-colors">
                        <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
                          <Leaf className="h-5 w-5 text-green-700" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-green-900 truncate">{item.achievement.name}</h4>
                            <Badge variant="outline" className="bg-green-50 text-green-800">
                              {item.achievement.tier}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{item.achievement.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Leaf className="h-12 w-12 text-muted-foreground opacity-40 mb-2" />
                    <p className="text-muted-foreground">No eco achievements yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Complete eco goals to earn badges</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" size="sm">
                  View All Achievements
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Middle and Right Columns - Impact Stats & Goals */}
          <div className="md:col-span-2 space-y-6">
            {/* Main Tabs */}
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="goals">Goals</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="community">Community</TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 mt-6">
                {/* Impact Summary */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Environmental Impact</CardTitle>
                    <CardDescription>
                      Your contribution to a greener planet through ride-sharing
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
                    ) : (
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                          <div className="p-4 bg-green-50 rounded-lg text-center">
                            <Leaf className="h-8 w-8 mx-auto mb-2 text-green-600" />
                            <div className="text-2xl font-bold text-green-700">{ecoImpact?.co2Saved} kg</div>
                            <div className="text-sm text-green-600">CO₂ Saved</div>
                          </div>
                          
                          <div className="p-4 bg-emerald-50 rounded-lg text-center">
                            <Trees className="h-8 w-8 mx-auto mb-2 text-emerald-600" />
                            <div className="text-2xl font-bold text-emerald-700">{ecoImpact?.treesEquivalent}</div>
                            <div className="text-sm text-emerald-600">Trees Equivalent</div>
                          </div>
                          
                          <div className="p-4 bg-blue-50 rounded-lg text-center">
                            <Droplets className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                            <div className="text-2xl font-bold text-blue-700">{ecoImpact?.fuelSaved} L</div>
                            <div className="text-sm text-blue-600">Fuel Saved</div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">Rides Statistics</span>
                              <span className="text-sm text-muted-foreground">
                                {ecoImpact?.sharedRides} shared, {ecoImpact?.singleUseRides} solo
                              </span>
                            </div>
                            <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500"
                                style={{ 
                                  width: `${(ecoImpact?.sharedRides / (ecoImpact?.sharedRides + ecoImpact?.singleUseRides)) * 100}%` 
                                }}
                              ></div>
                            </div>
                            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                              <span>Shared Rides: {Math.round((ecoImpact?.sharedRides / (ecoImpact?.sharedRides + ecoImpact?.singleUseRides)) * 100)}%</span>
                              <span>Total: {ecoImpact?.sharedRides + ecoImpact?.singleUseRides} rides</span>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">Distance Covered</span>
                              <span className="text-sm text-muted-foreground">{ecoImpact?.milesDriven} km</span>
                            </div>
                            <Progress value={(ecoImpact?.milesDriven / 1000) * 100} className="h-2.5" />
                            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                              <span>Your distance</span>
                              <span>Goal: 1000 km</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
                
                {/* Green Tips */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center">
                      <Leaf className="h-5 w-5 mr-2 text-green-600" />
                      Green Riding Tips
                    </CardTitle>
                    <CardDescription>
                      Eco-friendly tips to enhance your environmental impact
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {greenTips.slice(0, 3).map(tip => (
                        <div key={tip.id} className="p-3 border rounded-lg hover:bg-green-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium">{tip.title}</h3>
                            <Badge variant="outline" className={getImpactLevelBadge(tip.impactLevel)}>
                              {tip.impactLevel.charAt(0).toUpperCase() + tip.impactLevel.slice(1)} Impact
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{tip.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="w-full" size="sm">
                      View More Tips
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Goals Tab */}
              <TabsContent value="goals" className="space-y-6 mt-6">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle>Eco Goals</CardTitle>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                    </div>
                    <CardDescription>
                      Track your progress toward environmental goals
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-5">
                      {ecoGoals.map(goal => (
                        <div key={goal.id} className={`border rounded-lg p-4 ${goal.completed ? 'bg-green-50' : ''}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-full ${goal.completed ? 'bg-green-100' : 'bg-primary/10'}`}>
                                {getCategoryIcon(goal.category)}
                              </div>
                              
                              <div>
                                <h3 className="font-medium">{goal.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Target: {goal.target} {goal.unit} • Due: {goal.dueDate}
                                </p>
                              </div>
                            </div>
                            
                            {goal.completed ? (
                              <Badge className="bg-green-100 text-green-800">Completed</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                                In Progress
                              </Badge>
                            )}
                          </div>
                          
                          <div className="mt-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span>{goal.current} {goal.unit}</span>
                              <span>{goal.target} {goal.unit}</span>
                            </div>
                            <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                            
                            <div className="flex justify-between mt-3 text-sm">
                              <div className="flex items-center">
                                <span className="text-muted-foreground">Progress:</span>
                                <span className="ml-1 font-medium">
                                  {Math.round((goal.current / goal.target) * 100)}%
                                </span>
                              </div>
                              
                              {!goal.completed && (
                                <div className="flex items-center text-muted-foreground">
                                  <span>Remaining:</span>
                                  <span className="ml-1 font-medium">
                                    {goal.target - goal.current} {goal.unit}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">
                      View All Goals
                    </Button>
                    <Button>
                      Set New Goal
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* History Tab */}
              <TabsContent value="history" className="space-y-6 mt-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Impact History</CardTitle>
                    <CardDescription>
                      Track your environmental impact over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Monthly progress chart */}
                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium mb-4">Monthly CO₂ Savings (kg)</h3>
                        <div className="h-48 flex items-end justify-between gap-2">
                          {monthlyStats.map(month => (
                            <div key={month.month} className="flex flex-col items-center gap-1">
                              <div 
                                className="w-12 bg-green-400 hover:bg-green-500 transition-colors rounded-t"
                                style={{ height: `${(month.co2Saved / 60) * 100}%` }}
                              ></div>
                              <span className="text-xs font-medium">{month.month}</span>
                              <span className="text-xs text-muted-foreground">{month.co2Saved}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Summary stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <BarChart className="h-5 w-5 text-primary" />
                            <h3 className="font-medium">Total Impact</h3>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">CO₂ Saved:</span>
                              <span className="font-medium">{totalCO2Saved} kg</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Rides Shared:</span>
                              <span className="font-medium">{totalRidesShared}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Goals Completed:</span>
                              <span className="font-medium">{completedGoals}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            <h3 className="font-medium">Recent Activity</h3>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-green-500"></div>
                              <span className="text-sm">Completed ride sharing goal</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-green-500"></div>
                              <span className="text-sm">Earned 'Eco Pioneer' badge</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-green-500"></div>
                              <span className="text-sm">Saved 15kg CO₂ this week</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Community Tab */}
              <TabsContent value="community" className="space-y-6 mt-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Community Actions</CardTitle>
                    <CardDescription>
                      Join local environmental initiatives with other HyperCheetah users
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {communityActions.map(action => (
                        <motion.div 
                          key={action.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border rounded-lg overflow-hidden"
                        >
                          <div className="h-48 overflow-hidden">
                            <img 
                              src={action.imageUrl} 
                              alt={action.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="p-4">
                            <h3 className="text-lg font-medium">{action.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                            
                            <div className="grid grid-cols-2 gap-4 mt-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{action.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm truncate">{action.location}</span>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{action.participants} participants</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Leaf className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{action.co2Impact} kg CO₂ impact</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex justify-end mt-4">
                              <Button>Join Initiative</Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
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