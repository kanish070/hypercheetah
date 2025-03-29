import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/hooks/use-toast";
import {
  Car, Calendar as CalendarIcon, Clock, MapPin, User, Settings, Sparkles,
  Zap, Repeat, Users, Flame, MessageSquare, Heart, Star, BarChart, Filter,
  Music, Coffee, Book, Bookmark, CheckCheck, Info, Plus, ListChecks, LucideIcon,
  Award, Cpu, Map, Search, ChevronDown, SmilePlus, Shuffle, RefreshCw, CalendarClock
} from "lucide-react";
import { Location, Route } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

// Compatibility algorithm scores 
type CompatibilityFactor = 
  | 'travelPreferences' 
  | 'schedule' 
  | 'musicTastes' 
  | 'chattiness' 
  | 'smoking' 
  | 'pace';

interface UserPreferences {
  // Travel preferences
  travelPreferences: string[]; // comfort, speed, scenic, economical
  preferredDepartureTime: string[];
  routeTypes: string[]; // highway, local roads, etc.
  
  // Personal preferences
  musicPreferences: string[];
  chattiness: number; // 1-10
  smokingTolerance: boolean;
  prefersSameGender: boolean;
  pet_friendly: boolean;
  
  // Rating preferences
  minimumRating: number; // 1-5
  
  // Scheduling
  flexibility: number; // 1-10
  punctuality: number; // 1-10
  
  // Compatibility importance weights (how much this factor matters to the user)
  importanceWeights: Record<CompatibilityFactor, number>;
}

interface MatchedRider {
  id: number;
  name: string;
  avatar: string;
  age: number;
  gender: string;
  bio: string;
  rating: number;
  reviews: number;
  compatibilityScore: number; // 0-100
  factorScores: Record<CompatibilityFactor, number>;
  rideCount: number;
  verificationStatus: 'verified' | 'unverified';
  interests: string[];
  preferredMusic: string[];
  languages: string[];
  occupation: string;
  commonConnections: number;
}

// Recurring ride interval options
type RecurringInterval = 'daily' | 'weekdays' | 'weekly' | 'custom';

interface RecurringRideSchedule {
  interval: RecurringInterval;
  selectedDays: number[]; // 0-6 for Sunday-Saturday
  startDate: Date;
  endDate: Date | null;
  selectedTimes: string[];
}

interface MultiStopRide {
  id: number;
  mainDestination: string;
  stops: Array<{
    id: number;
    name: string;
    location: Location;
    arrivalTime: string;
    stayDuration: number; // minutes
  }>;
  totalDistance: number;
  totalDuration: number;
}

// Mock data for interests and music preferences
const interestOptions = [
  'Reading', 'Sports', 'Travel', 'Movies', 'Music', 'Food', 'Technology', 
  'Art', 'Fashion', 'Gaming', 'Photography', 'Fitness', 'Cooking', 'Nature',
  'Politics', 'Science', 'History', 'Languages', 'Dancing', 'Writing'
];

const musicGenres = [
  'Pop', 'Rock', 'Hip Hop', 'R&B', 'Country', 'Jazz', 'Classical', 'EDM',
  'Metal', 'Folk', 'Indie', 'Reggae', 'Blues', 'Alternative', 'K-pop'
];

// Match explanation text helper function
function getMatchExplanationText(factor: CompatibilityFactor, score: number): string {
  switch(factor) {
    case 'travelPreferences':
      return score > 80 
        ? "You both prefer similar routes and driving styles" 
        : "You have somewhat different travel preferences";
    case 'schedule':
      return score > 80 
        ? "Your schedules align perfectly" 
        : "Your schedules have some conflicts";
    case 'musicTastes':
      return score > 80 
        ? "You enjoy similar music genres" 
        : "Your music preferences differ somewhat";
    case 'chattiness':
      return score > 80 
        ? "You have compatible conversation preferences" 
        : "You have different conversation styles";
    case 'smoking':
      return score > 80 
        ? "You have compatible preferences regarding smoking" 
        : "You have different preferences regarding smoking";
    case 'pace':
      return score > 80 
        ? "You prefer similar travel paces" 
        : "You have different preferences for travel pace";
    default:
      return "Compatibility factor";
  }
}

// Helper function to get an icon for different compatibility factors
function getFactorIcon(factor: CompatibilityFactor): LucideIcon {
  switch(factor) {
    case 'travelPreferences': return Car;
    case 'schedule': return Clock;
    case 'musicTastes': return Music;
    case 'chattiness': return MessageSquare;
    case 'smoking': return Flame;
    case 'pace': return Zap;
    default: return Info;
  }
}

interface AdvancedMatchingProps {
  userId: number;
  onMatchSelect?: (match: MatchedRider) => void;
}

export function AdvancedMatching({ userId, onMatchSelect }: AdvancedMatchingProps) {
  // State for user preferences
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    travelPreferences: ['comfort', 'economical'],
    preferredDepartureTime: ['morning', 'evening'],
    routeTypes: ['highway'],
    musicPreferences: ['Pop', 'Rock', 'Indie'],
    chattiness: 6,
    smokingTolerance: false,
    prefersSameGender: false,
    pet_friendly: true,
    minimumRating: 4,
    flexibility: 7,
    punctuality: 8,
    importanceWeights: {
      travelPreferences: 8,
      schedule: 9,
      musicTastes: 6,
      chattiness: 7,
      smoking: 10,
      pace: 5
    }
  });
  
  // State for matched riders
  const [matchedRiders, setMatchedRiders] = useState<MatchedRider[]>([
    {
      id: 101,
      name: "Alex Johnson",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      age: 29,
      gender: "Male",
      bio: "Tech professional who enjoys photography and hiking on weekends.",
      rating: 4.8,
      reviews: 42,
      compatibilityScore: 92,
      factorScores: {
        travelPreferences: 85,
        schedule: 95,
        musicTastes: 90,
        chattiness: 88,
        smoking: 100,
        pace: 87
      },
      rideCount: 156,
      verificationStatus: 'verified',
      interests: ['Photography', 'Hiking', 'Technology', 'Travel'],
      preferredMusic: ['Rock', 'Indie', 'Electronic'],
      languages: ['English', 'Spanish'],
      occupation: "Software Engineer",
      commonConnections: 3
    },
    {
      id: 102,
      name: "Emma Lewis",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      age: 31,
      gender: "Female",
      bio: "Marketing professional and food enthusiast. Love discovering new restaurants.",
      rating: 4.6,
      reviews: 28,
      compatibilityScore: 85,
      factorScores: {
        travelPreferences: 80,
        schedule: 92,
        musicTastes: 75,
        chattiness: 90,
        smoking: 100,
        pace: 76
      },
      rideCount: 87,
      verificationStatus: 'verified',
      interests: ['Food', 'Marketing', 'Music', 'Travel'],
      preferredMusic: ['Pop', 'R&B', 'Jazz'],
      languages: ['English', 'French'],
      occupation: "Marketing Manager",
      commonConnections: 1
    },
    {
      id: 103,
      name: "David Chen",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg",
      age: 27,
      gender: "Male",
      bio: "Grad student studying environmental science. Passionate about sustainability.",
      rating: 4.9,
      reviews: 19,
      compatibilityScore: 78,
      factorScores: {
        travelPreferences: 90,
        schedule: 65,
        musicTastes: 60,
        chattiness: 70,
        smoking: 100,
        pace: 95
      },
      rideCount: 42,
      verificationStatus: 'verified',
      interests: ['Environment', 'Science', 'Reading', 'Cycling'],
      preferredMusic: ['Classical', 'Folk', 'Ambient'],
      languages: ['English', 'Mandarin'],
      occupation: "Graduate Student",
      commonConnections: 0
    }
  ]);
  
  // State for active tabs
  const [activeTab, setActiveTab] = useState('matches');
  const [preferencesTab, setPreferencesTab] = useState('travel');
  
  // State for multi-stop ride
  const [multiStopRide, setMultiStopRide] = useState<MultiStopRide>({
    id: 1,
    mainDestination: "Downtown Business District",
    stops: [
      {
        id: 1,
        name: "Coffee Shop",
        location: { lat: 40.7128, lng: -74.0060 },
        arrivalTime: "8:15 AM",
        stayDuration: 10
      },
      {
        id: 2,
        name: "Post Office",
        location: { lat: 40.7328, lng: -74.0060 },
        arrivalTime: "8:40 AM",
        stayDuration: 15
      }
    ],
    totalDistance: 12.5,
    totalDuration: 65
  });
  
  // State for adding a new stop
  const [newStop, setNewStop] = useState({
    name: "",
    arrivalTime: "",
    stayDuration: 10
  });
  
  // State for recurring rides
  const [recurringSchedule, setRecurringSchedule] = useState<RecurringRideSchedule>({
    interval: 'weekdays',
    selectedDays: [1, 2, 3, 4, 5], // Monday to Friday
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 30)), // 30 days from now
    selectedTimes: ["08:00", "17:30"]
  });
  
  // State for searching/filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRider, setSelectedRider] = useState<MatchedRider | null>(null);
  
  // Functions for managing multi-stop rides
  const handleAddStop = () => {
    if (!newStop.name || !newStop.arrivalTime) {
      toast({
        title: "Missing information",
        description: "Please provide a name and arrival time for the stop.",
        variant: "destructive"
      });
      return;
    }
    
    const newStopId = multiStopRide.stops.length > 0 
      ? Math.max(...multiStopRide.stops.map(s => s.id)) + 1 
      : 1;
    
    // In a real app, would need to geocode the location
    const mockLocation = { 
      lat: 40.7128 + (Math.random() * 0.05), 
      lng: -74.0060 + (Math.random() * 0.05) 
    };
    
    const updatedStops = [
      ...multiStopRide.stops,
      {
        id: newStopId,
        name: newStop.name,
        location: mockLocation,
        arrivalTime: newStop.arrivalTime,
        stayDuration: newStop.stayDuration
      }
    ];
    
    setMultiStopRide({
      ...multiStopRide,
      stops: updatedStops,
      // In a real app, would recalculate these based on the actual route
      totalDistance: multiStopRide.totalDistance + 2.1,
      totalDuration: multiStopRide.totalDuration + 10 + newStop.stayDuration
    });
    
    setNewStop({
      name: "",
      arrivalTime: "",
      stayDuration: 10
    });
    
    toast({
      title: "Stop added",
      description: `${newStop.name} has been added to your multi-stop ride.`
    });
  };
  
  const handleRemoveStop = (stopId: number) => {
    const updatedStops = multiStopRide.stops.filter(stop => stop.id !== stopId);
    
    // In a real app, would recalculate these based on the actual route
    setMultiStopRide({
      ...multiStopRide,
      stops: updatedStops,
      totalDistance: Math.max(multiStopRide.totalDistance - 2.1, 0),
      totalDuration: Math.max(multiStopRide.totalDuration - 15, 0)
    });
    
    toast({
      title: "Stop removed",
      description: "The stop has been removed from your route."
    });
  };
  
  // Functions for recurring schedule
  const handleIntervalChange = (value: RecurringInterval) => {
    let selectedDays: number[] = [];
    
    switch(value) {
      case 'daily':
        selectedDays = [0, 1, 2, 3, 4, 5, 6]; // All days
        break;
      case 'weekdays':
        selectedDays = [1, 2, 3, 4, 5]; // Monday to Friday
        break;
      case 'weekly':
        selectedDays = [new Date().getDay()]; // Current day of week
        break;
      case 'custom':
        // Keep existing selection for custom
        selectedDays = recurringSchedule.selectedDays;
        break;
    }
    
    setRecurringSchedule({
      ...recurringSchedule,
      interval: value,
      selectedDays
    });
  };
  
  const toggleDay = (day: number) => {
    const updatedDays = recurringSchedule.selectedDays.includes(day)
      ? recurringSchedule.selectedDays.filter(d => d !== day)
      : [...recurringSchedule.selectedDays, day];
    
    setRecurringSchedule({
      ...recurringSchedule,
      selectedDays: updatedDays
    });
  };
  
  const handleAddTime = (time: string) => {
    if (!time || recurringSchedule.selectedTimes.includes(time)) return;
    
    setRecurringSchedule({
      ...recurringSchedule,
      selectedTimes: [...recurringSchedule.selectedTimes, time].sort()
    });
  };
  
  const handleRemoveTime = (time: string) => {
    setRecurringSchedule({
      ...recurringSchedule,
      selectedTimes: recurringSchedule.selectedTimes.filter(t => t !== time)
    });
  };
  
  // Function to handle matched rider selection
  const handleSelectRider = (rider: MatchedRider) => {
    setSelectedRider(rider);
    if (onMatchSelect) {
      onMatchSelect(rider);
    }
  };
  
  // Function to handle preference updates
  const handlePreferenceChange = (
    category: keyof UserPreferences,
    value: any
  ) => {
    setUserPreferences({
      ...userPreferences,
      [category]: value
    });
  };
  
  // Function to handle importance weight changes
  const handleImportanceChange = (factor: CompatibilityFactor, value: number) => {
    setUserPreferences({
      ...userPreferences,
      importanceWeights: {
        ...userPreferences.importanceWeights,
        [factor]: value
      }
    });
  };
  
  // Function to optimize matches
  const handleOptimizeMatches = () => {
    // In a real app, this would make an API call to run the matching algorithm
    toast({
      title: "Finding optimal matches",
      description: "Our AI is analyzing compatibility factors to find your best matches."
    });
    
    // Simulate API call delay
    setTimeout(() => {
      // Random update to compatibility scores to simulate reranking
      const updatedRiders = [...matchedRiders].map(rider => ({
        ...rider,
        compatibilityScore: Math.min(Math.max(rider.compatibilityScore + (Math.random() * 10 - 5), 50), 99)
      }));
      
      // Sort by compatibility score
      updatedRiders.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
      
      setMatchedRiders(updatedRiders);
      
      toast({
        title: "Matches optimized!",
        description: "We've found your most compatible ride partners based on your preferences."
      });
    }, 1500);
  };
  
  // Helper function to get formatted dates for recurring rides
  const getFormattedDateRange = () => {
    const start = format(recurringSchedule.startDate, 'PPP');
    const end = recurringSchedule.endDate ? format(recurringSchedule.endDate, 'PPP') : 'Ongoing';
    return `${start} to ${end}`;
  };
  
  // Helper function to get day names
  const getDayName = (day: number) => {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day];
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-xl">
          <Sparkles className="h-5 w-5 mr-2 text-primary" />
          Advanced Ride Matching
        </CardTitle>
        <CardDescription>
          AI-powered compatibility matching, multi-stop rides, and flexible scheduling
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <div className="border-b px-4">
            <TabsList className="h-14">
              <TabsTrigger value="matches" className="flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                AI Matches
              </TabsTrigger>
              <TabsTrigger value="multi-stop" className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Multi-Stop
              </TabsTrigger>
              <TabsTrigger value="recurring" className="flex items-center">
                <Repeat className="h-4 w-4 mr-2" />
                Recurring
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Preferences
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* AI Matches Tab */}
          <TabsContent value="matches" className="p-4 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div className="flex-1">
                <h3 className="text-lg font-medium flex items-center">
                  <Cpu className="h-5 w-5 mr-2 text-primary" />
                  AI-Powered Match Recommendations
                </h3>
                <p className="text-sm text-muted-foreground">
                  Our advanced algorithm finds compatible ride partners based on your preferences
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <Button 
                  size="sm"
                  onClick={handleOptimizeMatches}
                  className="flex items-center"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Optimize Matches
                </Button>
              </div>
            </div>
            
            {/* Search and filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name, interests, or location..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {showFilters && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border rounded-md p-3 space-y-3"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="filter-rating" className="text-sm mb-1 block">
                        Minimum Rating
                      </Label>
                      <Select 
                        value={userPreferences.minimumRating.toString()} 
                        onValueChange={(v) => handlePreferenceChange('minimumRating', parseInt(v))}
                      >
                        <SelectTrigger id="filter-rating">
                          <SelectValue placeholder="Select minimum rating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3+ stars</SelectItem>
                          <SelectItem value="3.5">3.5+ stars</SelectItem>
                          <SelectItem value="4">4+ stars</SelectItem>
                          <SelectItem value="4.5">4.5+ stars</SelectItem>
                          <SelectItem value="5">5 stars only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm mb-1 block">
                        Verification Status
                      </Label>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue placeholder="Verification status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="verified">Verified only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm mb-1 block">
                        Match by Interest
                      </Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an interest" />
                        </SelectTrigger>
                        <SelectContent>
                          {interestOptions.map(interest => (
                            <SelectItem key={interest} value={interest.toLowerCase()}>
                              {interest}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Label className="flex items-center space-x-2 text-sm">
                      <Switch 
                        checked={userPreferences.prefersSameGender}
                        onCheckedChange={(checked) => handlePreferenceChange('prefersSameGender', checked)}
                      />
                      <span>Same gender only</span>
                    </Label>
                    
                    <Label className="flex items-center space-x-2 text-sm">
                      <Switch 
                        checked={!userPreferences.smokingTolerance}
                        onCheckedChange={(checked) => handlePreferenceChange('smokingTolerance', !checked)}
                      />
                      <span>Non-smoking only</span>
                    </Label>
                    
                    <Label className="flex items-center space-x-2 text-sm">
                      <Switch 
                        checked={userPreferences.pet_friendly}
                        onCheckedChange={(checked) => handlePreferenceChange('pet_friendly', checked)}
                      />
                      <span>Pet friendly</span>
                    </Label>
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Riders list */}
            <div className="space-y-4">
              <AnimatePresence>
                {matchedRiders
                  .filter(rider => 
                    rider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    rider.interests.some(i => i.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    rider.occupation.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((rider, index) => (
                    <motion.div
                      key={rider.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="relative"
                    >
                      <Card 
                        className={`
                          border overflow-hidden transition-all duration-300 
                          hover:shadow-md hover:border-primary/30
                          ${selectedRider?.id === rider.id ? 'border-primary bg-primary/5' : ''}
                        `}
                      >
                        {/* Compatibility score badge */}
                        <div className="absolute top-4 right-4">
                          <div className="relative h-14 w-14">
                            <svg className="h-full w-full" viewBox="0 0 36 36">
                              <path
                                className="stroke-primary/20 fill-none"
                                strokeWidth="3"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <path
                                className="stroke-primary fill-none"
                                strokeWidth="3"
                                strokeDasharray={`${rider.compatibilityScore}, 100`}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <text
                                x="18"
                                y="20.5"
                                className="text-lg font-semibold fill-primary"
                                textAnchor="middle"
                              >
                                {rider.compatibilityScore}%
                              </text>
                            </svg>
                          </div>
                        </div>
                        
                        <CardContent className="p-4">
                          <div className="flex">
                            <motion.div 
                              whileHover={{ scale: 1.05 }}
                              transition={{ type: "spring", stiffness: 300, damping: 15 }}
                              className="relative"
                            >
                              <Avatar className="h-16 w-16">
                                <AvatarImage src={rider.avatar} />
                                <AvatarFallback>{rider.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              {rider.verificationStatus === 'verified' && (
                                <Badge className="absolute -bottom-1 -right-1 bg-green-100 border-green-200 text-green-800 text-xs px-1">
                                  <CheckCheck className="h-3 w-3 mr-0.5" />
                                  Verified
                                </Badge>
                              )}
                            </motion.div>
                            
                            <div className="ml-4 flex-1 mr-14">
                              <div className="flex items-center justify-between">
                                <div>
                                  <motion.h3 
                                    className="font-medium text-lg"
                                    whileHover={{ color: "var(--primary)" }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    {rider.name}
                                  </motion.h3>
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <User className="h-3.5 w-3.5 mr-1" />
                                    {rider.age}, {rider.gender}
                                  </div>
                                </div>
                                
                                <div className="flex items-center">
                                  <div className="flex items-center mr-3">
                                    <Star className="h-4 w-4 text-amber-500 mr-1" />
                                    <span className="font-medium">{rider.rating}</span>
                                    <span className="text-xs text-muted-foreground ml-1">({rider.reviews})</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {rider.rideCount} rides
                                  </div>
                                </div>
                              </div>
                              
                              <p className="text-sm mt-1 mb-2 line-clamp-1">{rider.bio}</p>
                              
                              {/* Compatibility breakdown */}
                              <div className="grid grid-cols-3 md:grid-cols-6 gap-1 mb-2">
                                {(Object.entries(rider.factorScores) as [CompatibilityFactor, number][]).map(([factor, score]) => {
                                  const FactorIcon = getFactorIcon(factor);
                                  return (
                                    <Popover key={factor}>
                                      <PopoverTrigger asChild>
                                        <div className="cursor-pointer">
                                          <div
                                            className="h-1 rounded-full bg-gray-200 mb-1 overflow-hidden"
                                          >
                                            <div
                                              className={`h-full rounded-full ${
                                                score >= 80 ? 'bg-green-500' : 
                                                score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                              }`}
                                              style={{ width: `${score}%` }}
                                            />
                                          </div>
                                          <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center">
                                              <FactorIcon className="h-3 w-3 mr-0.5" />
                                              <span className="capitalize">{factor.replace(/([A-Z])/g, ' $1').trim()}</span>
                                            </div>
                                            <span>{score}%</span>
                                          </div>
                                        </div>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-60 p-3" side="top">
                                        <div className="space-y-2">
                                          <h4 className="font-medium text-sm">
                                            <FactorIcon className="h-4 w-4 inline-block mr-1" />
                                            <span className="capitalize">{factor.replace(/([A-Z])/g, ' $1').trim()}</span>
                                          </h4>
                                          <p className="text-xs text-muted-foreground">
                                            {getMatchExplanationText(factor, score)}
                                          </p>
                                          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                                            <div
                                              className={`h-full rounded-full ${
                                                score >= 80 ? 'bg-green-500' : 
                                                score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                              }`}
                                              style={{ width: `${score}%` }}
                                            />
                                          </div>
                                        </div>
                                      </PopoverContent>
                                    </Popover>
                                  );
                                })}
                              </div>
                              
                              {/* Interests and music */}
                              <div className="flex flex-wrap gap-1 mt-2">
                                {rider.interests.slice(0, 3).map(interest => (
                                  <Badge 
                                    key={interest} 
                                    variant="outline" 
                                    className="text-xs px-1.5 py-0 bg-primary/5"
                                  >
                                    {interest}
                                  </Badge>
                                ))}
                                
                                {rider.preferredMusic.slice(0, 2).map(genre => (
                                  <Badge 
                                    key={genre} 
                                    variant="outline" 
                                    className="text-xs px-1.5 py-0 bg-blue-50 text-blue-700 border-blue-200"
                                  >
                                    <Music className="h-2.5 w-2.5 mr-0.5" />
                                    {genre}
                                  </Badge>
                                ))}
                                
                                {rider.commonConnections > 0 && (
                                  <Badge 
                                    variant="outline" 
                                    className="text-xs px-1.5 py-0 bg-green-50 text-green-700 border-green-200"
                                  >
                                    <Users className="h-2.5 w-2.5 mr-0.5" />
                                    {rider.commonConnections} mutual connection{rider.commonConnections > 1 ? 's' : ''}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between mt-3 pt-3 border-t">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-xs"
                            >
                              <MessageSquare className="h-3.5 w-3.5 mr-1" />
                              Message
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-xs"
                              onClick={() => window.open(`#rider-profile/${rider.id}`, '_blank')}
                            >
                              <User className="h-3.5 w-3.5 mr-1" />
                              View Profile
                            </Button>
                            <Button
                              size="sm"
                              className="text-xs"
                              onClick={() => handleSelectRider(rider)}
                            >
                              <Sparkles className="h-3.5 w-3.5 mr-1" />
                              Select Match
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </AnimatePresence>
              
              {matchedRiders.filter(rider => 
                rider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rider.interests.some(i => i.toLowerCase().includes(searchTerm.toLowerCase())) ||
                rider.occupation.toLowerCase().includes(searchTerm.toLowerCase())
              ).length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Shuffle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-lg font-medium">No matches found</p>
                  <p className="text-sm mt-1">Try adjusting your preferences or search criteria</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Multi-Stop Tab */}
          <TabsContent value="multi-stop" className="p-4 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div className="flex-1">
                <h3 className="text-lg font-medium flex items-center">
                  <Map className="h-5 w-5 mr-2 text-primary" />
                  Multi-Stop Ride Planning
                </h3>
                <p className="text-sm text-muted-foreground">
                  Create optimized routes with multiple stops along your journey
                </p>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">Clear All Stops</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove all stops?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove all stops from your multi-stop ride. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => setMultiStopRide({
                        ...multiStopRide,
                        stops: [],
                        totalDistance: 0,
                        totalDuration: 0
                      })}
                    >
                      Clear All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-primary" />
                  Main Destination: {multiStopRide.mainDestination}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center text-sm">
                    <Badge variant="outline" className="mr-2">
                      <MapPin className="h-3.5 w-3.5 mr-1" />
                      {multiStopRide.stops.length} stops
                    </Badge>
                    <div className="text-muted-foreground flex items-center mr-3">
                      <Car className="h-3.5 w-3.5 mr-1" />
                      {multiStopRide.totalDistance} km
                    </div>
                    <div className="text-muted-foreground flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {multiStopRide.totalDuration} min
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <RefreshCw className="h-3.5 w-3.5 inline-block mr-1" />
                    Auto-optimized
                  </div>
                </div>
                
                {/* Stops list */}
                <div className="space-y-3">
                  {multiStopRide.stops.length > 0 ? (
                    <div className="relative pl-6 border-l-2 border-dotted border-gray-300 space-y-6 ml-3">
                      {multiStopRide.stops.map((stop, index) => (
                        <motion.div
                          key={stop.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.3 }}
                          className="relative"
                        >
                          <div className="absolute -left-8 -top-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center text-white font-medium text-xs">
                            {index + 1}
                          </div>
                          
                          <Card className="bg-muted/40">
                            <CardContent className="p-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">{stop.name}</h4>
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-muted-foreground mt-1">
                                    <div className="flex items-center">
                                      <Clock className="h-3.5 w-3.5 mr-1" />
                                      Arrival: {stop.arrivalTime}
                                    </div>
                                    <div className="flex items-center">
                                      <Clock className="h-3.5 w-3.5 mr-1" />
                                      Stay: {stop.stayDuration} min
                                    </div>
                                  </div>
                                </div>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-destructive"
                                  onClick={() => handleRemoveStop(stop.id)}
                                >
                                  <AlertTriangle className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <MapPin className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p>No stops added yet</p>
                      <p className="text-sm">Add stops to create a multi-stop ride</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Add a Stop</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="stop-name" className="text-sm mb-1 block">
                      Stop Name
                    </Label>
                    <Input 
                      id="stop-name" 
                      placeholder="Coffee shop, gas station, etc." 
                      value={newStop.name}
                      onChange={(e) => setNewStop({ ...newStop, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="arrival-time" className="text-sm mb-1 block">
                      Expected Arrival
                    </Label>
                    <Input 
                      id="arrival-time" 
                      placeholder="e.g. 9:15 AM" 
                      value={newStop.arrivalTime}
                      onChange={(e) => setNewStop({ ...newStop, arrivalTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="stay-duration" className="text-sm mb-1 block">
                      Stay Duration (minutes)
                    </Label>
                    <div className="flex items-center space-x-3">
                      <Slider
                        defaultValue={[10]}
                        max={60}
                        min={5}
                        step={5}
                        value={[newStop.stayDuration]}
                        onValueChange={(value) => setNewStop({ ...newStop, stayDuration: value[0] })}
                        className="flex-1"
                      />
                      <span className="w-9 text-right text-sm">{newStop.stayDuration}m</span>
                    </div>
                  </div>
                </div>
                <Button 
                  className="w-full mt-3"
                  onClick={handleAddStop}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stop to Journey
                </Button>
              </CardContent>
            </Card>
            
            <div className="bg-primary/5 border border-primary/20 rounded-md p-4">
              <h4 className="font-medium text-sm flex items-center mb-2">
                <Info className="h-4 w-4 mr-2 text-primary" />
                Benefits of Multi-Stop Rides
              </h4>
              <ul className="space-y-1 text-sm">
                <li className="flex items-start">
                  <CheckCheck className="h-4 w-4 mr-2 text-primary shrink-0 mt-0.5" />
                  <span>Optimize your journey by completing multiple errands in one trip</span>
                </li>
                <li className="flex items-start">
                  <CheckCheck className="h-4 w-4 mr-2 text-primary shrink-0 mt-0.5" />
                  <span>Reduce total travel time with intelligently planned routes</span>
                </li>
                <li className="flex items-start">
                  <CheckCheck className="h-4 w-4 mr-2 text-primary shrink-0 mt-0.5" />
                  <span>Share rides more efficiently with people going to nearby destinations</span>
                </li>
                <li className="flex items-start">
                  <CheckCheck className="h-4 w-4 mr-2 text-primary shrink-0 mt-0.5" />
                  <span>Lower your environmental impact by combining trips</span>
                </li>
              </ul>
            </div>
          </TabsContent>
          
          {/* Recurring Rides Tab */}
          <TabsContent value="recurring" className="p-4 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div className="flex-1">
                <h3 className="text-lg font-medium flex items-center">
                  <Repeat className="h-5 w-5 mr-2 text-primary" />
                  Recurring Ride Schedule
                </h3>
                <p className="text-sm text-muted-foreground">
                  Set up regular rides for your commute or consistent travel needs
                </p>
              </div>
              
              <Badge variant="outline" className="bg-primary/5 text-primary">
                <CalendarClock className="h-3.5 w-3.5 mr-1" />
                {getFormattedDateRange()}
              </Badge>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Schedule Pattern</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm mb-2 block">Recurrence Pattern</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <Button
                        variant={recurringSchedule.interval === 'daily' ? 'default' : 'outline'}
                        className="w-full justify-start"
                        onClick={() => handleIntervalChange('daily')}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Daily
                      </Button>
                      <Button
                        variant={recurringSchedule.interval === 'weekdays' ? 'default' : 'outline'}
                        className="w-full justify-start"
                        onClick={() => handleIntervalChange('weekdays')}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Weekdays
                      </Button>
                      <Button
                        variant={recurringSchedule.interval === 'weekly' ? 'default' : 'outline'}
                        className="w-full justify-start"
                        onClick={() => handleIntervalChange('weekly')}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Weekly
                      </Button>
                      <Button
                        variant={recurringSchedule.interval === 'custom' ? 'default' : 'outline'}
                        className="w-full justify-start"
                        onClick={() => handleIntervalChange('custom')}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Custom
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm mb-2 block">Days of Week</Label>
                    <div className="grid grid-cols-7 gap-1">
                      {[0, 1, 2, 3, 4, 5, 6].map(day => (
                        <Button
                          key={day}
                          variant={recurringSchedule.selectedDays.includes(day) ? 'default' : 'outline'}
                          className={`
                            h-10 min-w-10 px-0 rounded-full
                            ${day === 0 || day === 6 ? 'bg-primary/10 hover:bg-primary/20' : ''}
                            ${recurringSchedule.selectedDays.includes(day) && (day === 0 || day === 6) ? 'bg-primary hover:bg-primary/90' : ''}
                          `}
                          disabled={
                            recurringSchedule.interval === 'daily' || 
                            (recurringSchedule.interval === 'weekdays' && (day === 0 || day === 6)) ||
                            (recurringSchedule.interval === 'weekly' && day !== recurringSchedule.selectedDays[0])
                          }
                          onClick={() => toggleDay(day)}
                        >
                          {getDayName(day)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm block">Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            {format(recurringSchedule.startDate, 'PPP')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={recurringSchedule.startDate}
                            onSelect={(date) => setRecurringSchedule({
                              ...recurringSchedule,
                              startDate: date || new Date()
                            })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">End Date</Label>
                        <Label className="flex items-center text-xs gap-1.5">
                          <span>No end date</span>
                          <Switch 
                            checked={recurringSchedule.endDate === null}
                            onCheckedChange={(checked) => setRecurringSchedule({
                              ...recurringSchedule,
                              endDate: checked ? null : new Date(new Date().setDate(new Date().getDate() + 30))
                            })}
                          />
                        </Label>
                      </div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            disabled={recurringSchedule.endDate === null}
                          >
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            {recurringSchedule.endDate ? format(recurringSchedule.endDate, 'PPP') : 'Ongoing'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={recurringSchedule.endDate || undefined}
                            onSelect={(date) => setRecurringSchedule({
                              ...recurringSchedule,
                              endDate: date
                            })}
                            disabled={(date) => date < recurringSchedule.startDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm block">Schedule Times</Label>
                      <div className="flex flex-wrap gap-2">
                        {recurringSchedule.selectedTimes.map((time) => (
                          <Badge 
                            key={time} 
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            <Clock className="h-3 w-3" />
                            {time}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 ml-1 rounded-full text-muted-foreground hover:text-destructive"
                              onClick={() => handleRemoveTime(time)}
                            >
                              <AlertTriangle className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-7">
                              <Plus className="h-3.5 w-3.5 mr-1" />
                              Add
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-3">
                            <div className="space-y-2">
                              <Label>Add Time</Label>
                              <Input 
                                type="time"
                                onChange={(e) => e.target.value && handleAddTime(e.target.value)}
                                className="w-32"
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-primary/5 border border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <ListChecks className="h-4 w-4 mr-2 text-primary" />
                  Recurring Ride Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-primary/10">
                        <Repeat className="h-3.5 w-3.5 mr-1" />
                        {recurringSchedule.interval === 'daily' ? 'Daily' : 
                         recurringSchedule.interval === 'weekdays' ? 'Weekdays' :
                         recurringSchedule.interval === 'weekly' ? 'Weekly' : 'Custom'}
                      </Badge>
                      
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {recurringSchedule.selectedDays.map(day => getDayName(day)).join(', ')}
                      </Badge>
                      
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        {recurringSchedule.selectedTimes.length} time{recurringSchedule.selectedTimes.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    
                    <p className="text-sm">
                      This schedule will create {recurringSchedule.selectedDays.length * recurringSchedule.selectedTimes.length} rides per week, 
                      running from {format(recurringSchedule.startDate, 'PPP')} 
                      {recurringSchedule.endDate ? ` to ${format(recurringSchedule.endDate, 'PPP')}` : ' with no end date'}.
                    </p>
                  </div>
                  
                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <div className="text-blue-700 text-sm">
                      <p>Matching will automatically find compatible ride partners for all your scheduled rides.</p>
                      <p className="mt-1">You'll be notified 24 hours before each scheduled ride with match details.</p>
                    </div>
                  </Alert>
                  
                  <div className="flex justify-end">
                    <Button>
                      <CalendarClock className="h-4 w-4 mr-2" />
                      Create Recurring Schedule
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Preferences Tab */}
          <TabsContent value="preferences" className="p-4 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div className="flex-1">
                <h3 className="text-lg font-medium flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-primary" />
                  Matching Preferences
                </h3>
                <p className="text-sm text-muted-foreground">
                  Customize how our AI finds your ideal ride matches
                </p>
              </div>
            </div>
            
            <Tabs 
              value={preferencesTab} 
              onValueChange={setPreferencesTab} 
              className="w-full"
            >
              <TabsList className="w-full grid grid-cols-3 mb-4">
                <TabsTrigger value="travel" className="flex items-center">
                  <Car className="h-4 w-4 mr-2" />
                  Travel
                </TabsTrigger>
                <TabsTrigger value="personal" className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Personal
                </TabsTrigger>
                <TabsTrigger value="compatibility" className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Compatibility
                </TabsTrigger>
              </TabsList>
              
              {/* Travel Preferences */}
              <TabsContent value="travel" className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Travel Preferences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm mb-2 block">
                          Travel Style Priorities
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {['comfort', 'speed', 'scenic', 'economical'].map(pref => (
                            <Label
                              key={pref}
                              className={`
                                flex items-center justify-center gap-2 border rounded-md p-2 cursor-pointer
                                ${userPreferences.travelPreferences.includes(pref) 
                                  ? 'bg-primary/10 border-primary' 
                                  : 'bg-white hover:bg-muted'}
                              `}
                              onClick={() => {
                                const updated = userPreferences.travelPreferences.includes(pref)
                                  ? userPreferences.travelPreferences.filter(p => p !== pref)
                                  : [...userPreferences.travelPreferences, pref];
                                handlePreferenceChange('travelPreferences', updated);
                              }}
                            >
                              <span className="capitalize">{pref}</span>
                              {userPreferences.travelPreferences.includes(pref) && (
                                <CheckCheck className="h-4 w-4 text-primary" />
                              )}
                            </Label>
                          ))}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <Label className="text-sm mb-2 block">
                          Preferred Departure Times
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {['morning', 'afternoon', 'evening', 'night'].map(time => (
                            <Label
                              key={time}
                              className={`
                                flex items-center justify-center gap-2 border rounded-md p-2 cursor-pointer
                                ${userPreferences.preferredDepartureTime.includes(time) 
                                  ? 'bg-primary/10 border-primary' 
                                  : 'bg-white hover:bg-muted'}
                              `}
                              onClick={() => {
                                const updated = userPreferences.preferredDepartureTime.includes(time)
                                  ? userPreferences.preferredDepartureTime.filter(p => p !== time)
                                  : [...userPreferences.preferredDepartureTime, time];
                                handlePreferenceChange('preferredDepartureTime', updated);
                              }}
                            >
                              <span className="capitalize">{time}</span>
                              {userPreferences.preferredDepartureTime.includes(time) && (
                                <CheckCheck className="h-4 w-4 text-primary" />
                              )}
                            </Label>
                          ))}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <Label className="text-sm mb-2 block">
                          Route Type Preferences
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {['highway', 'local roads', 'shortest', 'least traffic'].map(type => (
                            <Label
                              key={type}
                              className={`
                                flex items-center justify-center gap-2 border rounded-md p-2 cursor-pointer
                                ${userPreferences.routeTypes.includes(type) 
                                  ? 'bg-primary/10 border-primary' 
                                  : 'bg-white hover:bg-muted'}
                              `}
                              onClick={() => {
                                const updated = userPreferences.routeTypes.includes(type)
                                  ? userPreferences.routeTypes.filter(p => p !== type)
                                  : [...userPreferences.routeTypes, type];
                                handlePreferenceChange('routeTypes', updated);
                              }}
                            >
                              <span className="capitalize">{type}</span>
                              {userPreferences.routeTypes.includes(type) && (
                                <CheckCheck className="h-4 w-4 text-primary" />
                              )}
                            </Label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Scheduling Flexibility</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <Label className="text-sm">Flexibility</Label>
                          <span className="text-sm text-muted-foreground">
                            {userPreferences.flexibility < 4 ? 'Not flexible' : 
                             userPreferences.flexibility < 7 ? 'Somewhat flexible' : 'Very flexible'}
                          </span>
                        </div>
                        <Slider
                          defaultValue={[userPreferences.flexibility]}
                          max={10}
                          min={1}
                          step={1}
                          value={[userPreferences.flexibility]}
                          onValueChange={(value) => handlePreferenceChange('flexibility', value[0])}
                          className="mb-4"
                        />
                        <p className="text-xs text-muted-foreground">
                          How flexible are you with departure and arrival times? Higher flexibility increases match chances.
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <Label className="text-sm">Punctuality Importance</Label>
                          <span className="text-sm text-muted-foreground">
                            {userPreferences.punctuality < 4 ? 'Not important' : 
                             userPreferences.punctuality < 7 ? 'Somewhat important' : 'Very important'}
                          </span>
                        </div>
                        <Slider
                          defaultValue={[userPreferences.punctuality]}
                          max={10}
                          min={1}
                          step={1}
                          value={[userPreferences.punctuality]}
                          onValueChange={(value) => handlePreferenceChange('punctuality', value[0])}
                          className="mb-4"
                        />
                        <p className="text-xs text-muted-foreground">
                          How important is punctuality to you? Higher values match you with more punctual riders.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Personal Preferences */}
              <TabsContent value="personal" className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Personal Preferences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm mb-2 block">
                          Music Preferences
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {musicGenres.slice(0, 9).map(genre => (
                            <Label
                              key={genre}
                              className={`
                                flex items-center justify-center gap-2 border rounded-md p-2 cursor-pointer
                                ${userPreferences.musicPreferences.includes(genre) 
                                  ? 'bg-primary/10 border-primary' 
                                  : 'bg-white hover:bg-muted'}
                              `}
                              onClick={() => {
                                const updated = userPreferences.musicPreferences.includes(genre)
                                  ? userPreferences.musicPreferences.filter(p => p !== genre)
                                  : [...userPreferences.musicPreferences, genre];
                                handlePreferenceChange('musicPreferences', updated);
                              }}
                            >
                              <Music className="h-3.5 w-3.5 mr-1" />
                              <span>{genre}</span>
                              {userPreferences.musicPreferences.includes(genre) && (
                                <CheckCheck className="h-4 w-4 text-primary" />
                              )}
                            </Label>
                          ))}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <Label className="text-sm">Conversation Preference</Label>
                          <span className="text-sm text-muted-foreground">
                            {userPreferences.chattiness < 4 ? 'Quiet, minimal talking' : 
                             userPreferences.chattiness < 7 ? 'Occasional conversation' : 'Chatty, enjoy talking'}
                          </span>
                        </div>
                        <Slider
                          defaultValue={[userPreferences.chattiness]}
                          max={10}
                          min={1}
                          step={1}
                          value={[userPreferences.chattiness]}
                          onValueChange={(value) => handlePreferenceChange('chattiness', value[0])}
                          className="mb-4"
                        />
                        <p className="text-xs text-muted-foreground">
                          How much do you enjoy conversation during rides? We'll match your chattiness level.
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid gap-4 pt-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-sm flex items-center">
                            <SmilePlus className="h-4 w-4 mr-2 text-primary" />
                            Match with same gender
                          </Label>
                          <Switch 
                            checked={userPreferences.prefersSameGender}
                            onCheckedChange={(checked) => handlePreferenceChange('prefersSameGender', checked)}
                          />
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <Label className="text-sm flex items-center">
                            <Flame className="h-4 w-4 mr-2 text-primary" />
                            Accept smoking in vehicle
                          </Label>
                          <Switch 
                            checked={userPreferences.smokingTolerance}
                            onCheckedChange={(checked) => handlePreferenceChange('smokingTolerance', checked)}
                          />
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <Label className="text-sm flex items-center">
                            <Award className="h-4 w-4 mr-2 text-primary" />
                            Match with pets allowed
                          </Label>
                          <Switch 
                            checked={userPreferences.pet_friendly}
                            onCheckedChange={(checked) => handlePreferenceChange('pet_friendly', checked)}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Compatibility Weights */}
              <TabsContent value="compatibility" className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <BarChart className="h-4 w-4 mr-2 text-primary" />
                      Compatibility Factor Importance
                    </CardTitle>
                    <CardDescription>
                      Adjust how important each factor is in finding your ideal matches
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(Object.entries(userPreferences.importanceWeights) as [CompatibilityFactor, number][]).map(([factor, weight]) => {
                        const FactorIcon = getFactorIcon(factor);
                        return (
                          <div key={factor} className="space-y-1">
                            <div className="flex justify-between items-center mb-1">
                              <Label className="text-sm flex items-center">
                                <FactorIcon className="h-4 w-4 mr-2 text-primary" />
                                <span className="capitalize">{factor.replace(/([A-Z])/g, ' $1').trim()}</span>
                              </Label>
                              <Badge variant="outline">
                                {weight}/10
                              </Badge>
                            </div>
                            <Slider
                              defaultValue={[weight]}
                              max={10}
                              min={1}
                              step={1}
                              value={[weight]}
                              onValueChange={(value) => handleImportanceChange(factor, value[0])}
                            />
                            <p className="text-xs text-muted-foreground pt-1">
                              {factor === 'travelPreferences' && "How important is it that your ride partner shares your travel style preferences?"}
                              {factor === 'schedule' && "How important is schedule alignment in your matches?"}
                              {factor === 'musicTastes' && "How important is having similar music preferences during the ride?"}
                              {factor === 'chattiness' && "How important is matching conversation styles with your ride partner?"}
                              {factor === 'smoking' && "How important is matching your smoking preferences?"}
                              {factor === 'pace' && "How important is a similar travel pace preference?"}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-primary/5 border border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <Cpu className="h-4 w-4 mr-2 text-primary" />
                      AI Matching Technology
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm mb-3">
                      Our advanced AI matching algorithm analyzes over 50 compatibility factors to find your ideal ride partners.
                      The weights you set help prioritize what matters most to you.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
                      <div className="bg-white p-3 rounded-md">
                        <Sparkles className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <h4 className="font-medium text-sm">Personalized Matching</h4>
                        <p className="text-xs text-muted-foreground mt-1">Learns your preferences from each ride</p>
                      </div>
                      
                      <div className="bg-white p-3 rounded-md">
                        <BarChart className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <h4 className="font-medium text-sm">Compatibility Scoring</h4>
                        <p className="text-xs text-muted-foreground mt-1">Calculates detailed compatibility profiles</p>
                      </div>
                      
                      <div className="bg-white p-3 rounded-md">
                        <RefreshCw className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <h4 className="font-medium text-sm">Continuous Optimization</h4>
                        <p className="text-xs text-muted-foreground mt-1">Adapts to improve your experience</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-end">
                  <Button onClick={handleOptimizeMatches}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Apply Preferences & Find Matches
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="border-t px-4 py-3">
        <div className="w-full flex flex-col md:flex-row justify-between gap-2 text-center md:text-left">
          <div className="text-sm text-muted-foreground flex items-center justify-center md:justify-start">
            <Cpu className="h-4 w-4 mr-2 text-primary" />
            <span>Powered by AI for smarter ride matching</span>
          </div>
          
          <div className="flex items-center justify-center md:justify-end">
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs"
              onClick={() => setActiveTab('preferences')}
            >
              <Settings className="h-3.5 w-3.5 mr-1.5" />
              Adjust Preferences
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}