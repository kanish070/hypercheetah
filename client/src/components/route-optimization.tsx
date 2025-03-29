import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { toast } from '@/hooks/use-toast';
import { Location, Route } from "@shared/schema";
import {
  Car, MapPin, LocateFixed, Clock, BarChart, Map, Calendar,
  CheckCircle, AlertTriangle, ArrowRight, ArrowLeft, ArrowDown,
  Bookmark, Plus, Trash2, Road, Wind, CloudRain, Droplets, Zap,
  Info, Leaf, BarChart3, Activity, Star, SunMedium, RotateCcw, Filter,
  PanelLeft, PanelRight
} from "lucide-react";
import { motion } from "framer-motion";
import { RouteMap } from './route-map';

// Types for route optimization
interface TrafficCondition {
  location: Location;
  level: 'light' | 'moderate' | 'heavy' | 'severe';
  delay: number; // minutes
  cause?: string;
}

interface WeatherCondition {
  location: Location;
  condition: 'clear' | 'cloudy' | 'rain' | 'snow' | 'fog';
  severity: 'light' | 'moderate' | 'severe';
  impact: number; // 0-10 scale of impact on driving
}

interface RouteAlternative {
  id: number;
  name: string;
  route: Route;
  distance: number; // km
  duration: number; // minutes
  trafficConditions: TrafficCondition[];
  trafficDelayTotal: number; // minutes
  tolls: number; // cost in dollars
  fuelUsage: number; // liters
  co2Emissions: number; // kg
  recommendationScore: number; // 0-100 scale
  weatherConditions: WeatherCondition[];
  weatherImpact: number; // 0-10 scale
  tags: string[]; // fastest, eco, scenic, etc.
}

interface SavedRoute {
  id: number;
  name: string;
  startLocation: string;
  endLocation: string;
  distance: number;
  duration: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'rarely';
  lastUsed: string;
  favorite: boolean;
}

interface TravelPattern {
  id: number;
  route: string;
  timeOfDay: string;
  dayOfWeek: string[];
  averageDuration: number;
  frequency: number; // times per month
}

// Helper functions
const getTrafficLevelColor = (level: TrafficCondition['level']) => {
  switch(level) {
    case 'light': return 'bg-green-100 text-green-800 border-green-200';
    case 'moderate': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'heavy': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'severe': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getWeatherIcon = (condition: WeatherCondition['condition']) => {
  switch(condition) {
    case 'clear': return <SunMedium className="h-4 w-4" />;
    case 'cloudy': return <Cloud className="h-4 w-4" />;
    case 'rain': return <CloudRain className="h-4 w-4" />;
    case 'snow': return <Snowflake className="h-4 w-4" />;
    case 'fog': return <Droplets className="h-4 w-4" />;
    default: return <SunMedium className="h-4 w-4" />;
  }
};

// Custom icons
const Cloud = (props: any) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
  </svg>
);

const Snowflake = (props: any) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M2 12h20" />
    <path d="M12 2v20" />
    <path d="m4.93 4.93 14.14 14.14" />
    <path d="m19.07 4.93-14.14 14.14" />
  </svg>
);

interface RouteOptimizationProps {
  userId: number;
  origin?: Location;
  destination?: Location;
  onRouteSelect?: (route: RouteAlternative) => void;
}

export function RouteOptimization({ userId, origin, destination, onRouteSelect }: RouteOptimizationProps) {
  // State for active tabs
  const [activeTab, setActiveTab] = useState('alternatives');
  
  // State for route alternatives
  const [routeAlternatives, setRouteAlternatives] = useState<RouteAlternative[]>([
    {
      id: 1,
      name: "Fastest Route",
      route: {
        start: { lat: 40.7128, lng: -74.0060 }, // NYC
        end: { lat: 40.7614, lng: -73.9776 }, // NYK midtown
        waypoints: []
      },
      distance: 8.2,
      duration: 28,
      trafficConditions: [
        {
          location: { lat: 40.7400, lng: -73.9900 },
          level: 'moderate',
          delay: 5,
          cause: 'Construction'
        }
      ],
      trafficDelayTotal: 5,
      tolls: 0,
      fuelUsage: 0.8,
      co2Emissions: 1.6,
      recommendationScore: 87,
      weatherConditions: [
        {
          location: { lat: 40.7400, lng: -73.9900 },
          condition: 'clear',
          severity: 'light',
          impact: 1
        }
      ],
      weatherImpact: 1,
      tags: ['fastest', 'direct']
    },
    {
      id: 2,
      name: "Eco-Friendly Route",
      route: {
        start: { lat: 40.7128, lng: -74.0060 },
        end: { lat: 40.7614, lng: -73.9776 },
        waypoints: [
          { lat: 40.7300, lng: -74.0000 }
        ]
      },
      distance: 8.9,
      duration: 32,
      trafficConditions: [],
      trafficDelayTotal: 0,
      tolls: 0,
      fuelUsage: 0.6,
      co2Emissions: 1.2,
      recommendationScore: 82,
      weatherConditions: [
        {
          location: { lat: 40.7300, lng: -74.0000 },
          condition: 'clear',
          severity: 'light',
          impact: 1
        }
      ],
      weatherImpact: 1,
      tags: ['eco-friendly', 'low emissions', 'fuel efficient']
    },
    {
      id: 3,
      name: "Scenic Route",
      route: {
        start: { lat: 40.7128, lng: -74.0060 },
        end: { lat: 40.7614, lng: -73.9776 },
        waypoints: [
          { lat: 40.7340, lng: -73.9900 },
          { lat: 40.7580, lng: -73.9850 }
        ]
      },
      distance: 11.3,
      duration: 46,
      trafficConditions: [
        {
          location: { lat: 40.7340, lng: -73.9900 },
          level: 'light',
          delay: 2
        }
      ],
      trafficDelayTotal: 2,
      tolls: 0,
      fuelUsage: 1.1,
      co2Emissions: 2.1,
      recommendationScore: 68,
      weatherConditions: [
        {
          location: { lat: 40.7580, lng: -73.9850 },
          condition: 'cloudy',
          severity: 'light',
          impact: 2
        }
      ],
      weatherImpact: 2,
      tags: ['scenic', 'tourist attractions', 'parks']
    }
  ]);
  
  // State for saved routes
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([
    {
      id: 1,
      name: "Home to Work",
      startLocation: "123 Home St",
      endLocation: "456 Work Ave",
      distance: 15.3,
      duration: 32,
      frequency: 'daily',
      lastUsed: "Today",
      favorite: true
    },
    {
      id: 2,
      name: "Gym Route",
      startLocation: "123 Home St",
      endLocation: "789 Gym Blvd",
      distance: 7.1,
      duration: 18,
      frequency: 'weekly',
      lastUsed: "Yesterday",
      favorite: false
    },
    {
      id: 3,
      name: "Weekend Market",
      startLocation: "123 Home St",
      endLocation: "101 Market St",
      distance: 12.8,
      duration: 25,
      frequency: 'weekly',
      lastUsed: "Last week",
      favorite: true
    }
  ]);
  
  // State for travel patterns
  const [travelPatterns, setTravelPatterns] = useState<TravelPattern[]>([
    {
      id: 1,
      route: "Home to Work",
      timeOfDay: "8:00 AM - 9:00 AM",
      dayOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      averageDuration: 35,
      frequency: 20
    },
    {
      id: 2,
      route: "Work to Home",
      timeOfDay: "5:00 PM - 6:00 PM",
      dayOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      averageDuration: 42,
      frequency: 20
    },
    {
      id: 3,
      route: "Home to Gym",
      timeOfDay: "6:30 PM - 7:00 PM",
      dayOfWeek: ["Mon", "Wed", "Fri"],
      averageDuration: 22,
      frequency: 12
    }
  ]);
  
  // State for route preferences
  const [routePreferences, setRoutePreferences] = useState({
    prioritizeFastestRoute: true,
    avoidTolls: false,
    avoidHighways: false,
    preferScenicRoutes: false,
    ecoFriendlyRouting: true,
    trafficAvoidanceLevel: 8 // 1-10 scale
  });
  
  // State for selected route
  const [selectedRoute, setSelectedRoute] = useState<RouteAlternative | null>(routeAlternatives[0]);
  
  // State for route comparison
  const [comparisonRoutes, setComparisonRoutes] = useState<number[]>([1, 2]);
  
  // Toggle route selection for comparison
  const toggleRouteForComparison = (routeId: number) => {
    if (comparisonRoutes.includes(routeId)) {
      // Only allow deselection if more than 2 routes are selected
      if (comparisonRoutes.length > 2) {
        setComparisonRoutes(comparisonRoutes.filter(id => id !== routeId));
      } else {
        toast({
          description: "At least 2 routes must be selected for comparison"
        });
      }
    } else {
      // Only allow selection if less than 4 routes are selected
      if (comparisonRoutes.length < 4) {
        setComparisonRoutes([...comparisonRoutes, routeId]);
      } else {
        toast({
          description: "Maximum 4 routes can be compared at once"
        });
      }
    }
  };
  
  // Handle route selection
  const handleRouteSelect = (route: RouteAlternative) => {
    setSelectedRoute(route);
    if (onRouteSelect) {
      onRouteSelect(route);
    }
    toast({
      title: "Route selected",
      description: `${route.name} has been selected as your preferred route.`
    });
  };
  
  // Handle saving a route
  const handleSaveRoute = (routeId: number) => {
    const route = routeAlternatives.find(r => r.id === routeId);
    if (!route) return;
    
    toast({
      title: "Route saved",
      description: `${route.name} has been saved to your routes.`
    });
  };
  
  // Handle deleting a saved route
  const handleDeleteSavedRoute = (routeId: number) => {
    setSavedRoutes(savedRoutes.filter(route => route.id !== routeId));
    toast({
      title: "Route deleted",
      description: "The route has been removed from your saved routes."
    });
  };
  
  // Handle toggling favorite status
  const handleToggleFavorite = (routeId: number) => {
    setSavedRoutes(savedRoutes.map(route => 
      route.id === routeId ? { ...route, favorite: !route.favorite } : route
    ));
  };
  
  // Handle preference changes
  const handlePreferenceChange = (
    preference: keyof typeof routePreferences,
    value: any
  ) => {
    setRoutePreferences({
      ...routePreferences,
      [preference]: value
    });
    
    // In a real app, this would trigger a re-fetch of route alternatives
    toast({
      title: "Preferences updated",
      description: "Route alternatives have been updated based on your preferences."
    });
  };
  
  // Function to get route comparison data
  const getComparisonData = () => {
    return routeAlternatives.filter(route => comparisonRoutes.includes(route.id));
  };
  
  // Get currently displayed route for map
  const currentRouteForMap = selectedRoute?.route || routeAlternatives[0].route;
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-xl">
          <Map className="h-5 w-5 mr-2 text-primary" />
          Route Optimization & Analysis
        </CardTitle>
        <CardDescription>
          Smart route suggestions, traffic awareness, and historical travel patterns
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
              <TabsTrigger value="alternatives" className="flex items-center">
                <Road className="h-4 w-4 mr-2" />
                Alternatives
              </TabsTrigger>
              <TabsTrigger value="saved" className="flex items-center">
                <Bookmark className="h-4 w-4 mr-2" />
                Saved Routes
              </TabsTrigger>
              <TabsTrigger value="patterns" className="flex items-center">
                <BarChart className="h-4 w-4 mr-2" />
                Travel Patterns
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Preferences
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Route Alternatives Tab */}
          <TabsContent value="alternatives" className="space-y-4 p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Route List */}
              <div className="lg:col-span-1 space-y-3">
                <h3 className="text-lg font-medium flex items-center">
                  <Road className="h-5 w-5 mr-2 text-primary" />
                  Route Options
                </h3>
                
                {routeAlternatives.map(route => (
                  <motion.div
                    key={route.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -2 }}
                  >
                    <Card 
                      className={`
                        border overflow-hidden transition-all duration-300 
                        hover:shadow-md hover:border-primary/30 cursor-pointer
                        ${selectedRoute?.id === route.id ? 'border-primary bg-primary/5' : ''}
                      `}
                      onClick={() => setSelectedRoute(route)}
                    >
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Badge variant="outline" className="text-xs p-1 h-6">
                          <input 
                            type="checkbox"
                            className="mr-1"
                            checked={comparisonRoutes.includes(route.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleRouteForComparison(route.id);
                            }}
                          />
                          Compare
                        </Badge>
                      </div>
                      
                      <CardContent className="p-3">
                        <div className="mb-2 flex items-center">
                          <h4 className="font-medium text-base flex-1">{route.name}</h4>
                          <Badge 
                            variant="outline" 
                            className={`text-xs px-1.5 py-0 
                              ${route.recommendationScore > 80 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : route.recommendationScore > 60 
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-gray-50'}
                            `}
                          >
                            {route.recommendationScore}% match
                          </Badge>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-primary mr-1" />
                            <span className="text-sm">{route.duration} min</span>
                            {route.trafficDelayTotal > 0 && (
                              <Badge variant="outline" className="ml-1 text-xs px-1 py-0 bg-red-50 text-red-700 border-red-200">
                                +{route.trafficDelayTotal}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-primary mr-1" />
                            <span className="text-sm">{route.distance} km</span>
                          </div>
                          
                          {route.tolls > 0 && (
                            <div className="flex items-center">
                              <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
                              <span className="text-sm">${route.tolls.toFixed(2)} toll</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-2 flex flex-wrap gap-1">
                          {route.trafficConditions.length > 0 && (
                            <Badge
                              variant="outline"
                              className={`text-xs px-1.5 py-0 ${getTrafficLevelColor(
                                route.trafficConditions.sort((a, b) => b.delay - a.delay)[0].level
                              )}`}
                            >
                              <Activity className="h-3 w-3 mr-0.5" />
                              {route.trafficConditions.sort((a, b) => b.delay - a.delay)[0].level} traffic
                            </Badge>
                          )}
                          
                          {route.weatherConditions.length > 0 && route.weatherImpact > 3 && (
                            <Badge
                              variant="outline"
                              className="text-xs px-1.5 py-0 bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {getWeatherIcon(route.weatherConditions[0].condition)}
                              <span className="ml-0.5">{route.weatherConditions[0].condition}</span>
                            </Badge>
                          )}
                          
                          {route.tags.slice(0, 2).map(tag => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs px-1.5 py-0 bg-primary/5"
                            >
                              {tag === 'fastest' && <Zap className="h-3 w-3 mr-0.5" />}
                              {tag === 'eco-friendly' && <Leaf className="h-3 w-3 mr-0.5" />}
                              {tag === 'scenic' && <Map className="h-3 w-3 mr-0.5" />}
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        {/* Traffic info */}
                        {route.trafficConditions.length > 0 && (
                          <div className="mt-2 pt-1.5 border-t text-xs text-muted-foreground">
                            <div className="flex items-start">
                              <Activity className="h-3.5 w-3.5 mr-1 mt-0.5 shrink-0" />
                              <span>
                                {route.trafficConditions[0].cause 
                                  ? `${route.trafficConditions[0].cause} causing delay` 
                                  : 'Traffic delay'}: +{route.trafficDelayTotal} min
                              </span>
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-3 pt-2 border-t flex justify-between">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveRoute(route.id);
                            }}
                          >
                            <Bookmark className="h-3.5 w-3.5 mr-1" />
                            Save
                          </Button>
                          
                          <Button
                            size="sm"
                            className="text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRouteSelect(route);
                            }}
                          >
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            Select
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
              
              {/* Map and Details */}
              <div className="lg:col-span-2 space-y-4">
                {/* Map */}
                <RouteMap 
                  center={currentRouteForMap.start}
                  route={currentRouteForMap}
                  className="h-[350px]"
                />
                
                {/* Selected Route Details */}
                {selectedRoute && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex justify-between">
                        <span className="flex items-center">
                          <Road className="h-4 w-4 mr-2 text-primary" />
                          {selectedRoute.name} Details
                        </span>
                        <Badge 
                          variant="outline" 
                          className={`
                            text-xs px-1.5 py-0
                            ${selectedRoute.recommendationScore > 80 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : selectedRoute.recommendationScore > 60 
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-gray-50'}
                          `}
                        >
                          {selectedRoute.recommendationScore}% match
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4">
                        <div className="p-2 bg-muted/40 rounded-md">
                          <div className="text-sm text-muted-foreground">Duration</div>
                          <div className="font-medium flex items-center">
                            <Clock className="h-4 w-4 text-primary mr-1" />
                            {selectedRoute.duration} min
                            {selectedRoute.trafficDelayTotal > 0 && (
                              <Badge variant="outline" className="ml-1 text-xs px-1 py-0 bg-red-50 text-red-700 border-red-200">
                                +{selectedRoute.trafficDelayTotal}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="p-2 bg-muted/40 rounded-md">
                          <div className="text-sm text-muted-foreground">Distance</div>
                          <div className="font-medium flex items-center">
                            <MapPin className="h-4 w-4 text-primary mr-1" />
                            {selectedRoute.distance} km
                          </div>
                        </div>
                        
                        <div className="p-2 bg-muted/40 rounded-md">
                          <div className="text-sm text-muted-foreground">Fuel Usage</div>
                          <div className="font-medium flex items-center">
                            <Droplets className="h-4 w-4 text-primary mr-1" />
                            {selectedRoute.fuelUsage} L
                          </div>
                        </div>
                        
                        <div className="p-2 bg-muted/40 rounded-md">
                          <div className="text-sm text-muted-foreground">CO2 Emissions</div>
                          <div className="font-medium flex items-center">
                            <Leaf className="h-4 w-4 text-primary mr-1" />
                            {selectedRoute.co2Emissions} kg
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {/* Traffic conditions */}
                        {selectedRoute.trafficConditions.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center">
                              <Activity className="h-4 w-4 mr-1.5 text-primary" />
                              Traffic Conditions
                            </h4>
                            <div className="space-y-2">
                              {selectedRoute.trafficConditions.map((condition, index) => (
                                <div 
                                  key={index}
                                  className={`text-xs p-2 rounded-md ${getTrafficLevelColor(condition.level)}`}
                                >
                                  <div className="flex justify-between">
                                    <span className="font-medium capitalize">{condition.level} Traffic</span>
                                    <span>+{condition.delay} min delay</span>
                                  </div>
                                  {condition.cause && (
                                    <div className="mt-1">Cause: {condition.cause}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Weather conditions */}
                        {selectedRoute.weatherConditions.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center">
                              <Cloud className="h-4 w-4 mr-1.5 text-primary" />
                              Weather Conditions
                            </h4>
                            <div className="space-y-2">
                              {selectedRoute.weatherConditions.map((condition, index) => (
                                <div 
                                  key={index}
                                  className="text-xs p-2 rounded-md bg-blue-50 text-blue-700 border border-blue-200"
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium capitalize flex items-center">
                                      {getWeatherIcon(condition.condition)}
                                      <span className="ml-1">
                                        {condition.severity} {condition.condition}
                                      </span>
                                    </span>
                                    <span>Impact: {condition.impact}/10</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Route features */}
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1.5 text-primary" />
                            Route Features
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedRoute.tags.map(tag => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs px-2 py-1 bg-primary/5"
                              >
                                {tag === 'fastest' && <Zap className="h-3.5 w-3.5 mr-1" />}
                                {tag === 'eco-friendly' && <Leaf className="h-3.5 w-3.5 mr-1" />}
                                {tag === 'scenic' && <Map className="h-3.5 w-3.5 mr-1" />}
                                {tag === 'direct' && <ArrowRight className="h-3.5 w-3.5 mr-1" />}
                                {tag === 'low emissions' && <Wind className="h-3.5 w-3.5 mr-1" />}
                                {tag === 'fuel efficient' && <Droplets className="h-3.5 w-3.5 mr-1" />}
                                {tag === 'tourist attractions' && <MapPin className="h-3.5 w-3.5 mr-1" />}
                                {tag === 'parks' && <Leaf className="h-3.5 w-3.5 mr-1" />}
                                <span className="capitalize">{tag}</span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t flex justify-end">
                        <Button
                          onClick={() => handleRouteSelect(selectedRoute)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Select This Route
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
            
            {/* Route Comparison Section */}
            {comparisonRoutes.length >= 2 && (
              <Card className="mt-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2 text-primary" />
                    Route Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Route</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Distance</TableHead>
                        <TableHead>Traffic</TableHead>
                        <TableHead>Fuel</TableHead>
                        <TableHead>CO2</TableHead>
                        <TableHead>Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getComparisonData().map(route => (
                        <TableRow key={route.id}>
                          <TableCell className="font-medium">{route.name}</TableCell>
                          <TableCell>
                            {route.duration} min
                            {route.trafficDelayTotal > 0 && (
                              <Badge variant="outline" className="ml-1 text-xs px-1 py-0 bg-red-50 text-red-700 border-red-200">
                                +{route.trafficDelayTotal}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{route.distance} km</TableCell>
                          <TableCell>
                            {route.trafficConditions.length > 0 ? (
                              <Badge
                                variant="outline"
                                className={`text-xs px-1.5 py-0 ${getTrafficLevelColor(
                                  route.trafficConditions[0].level
                                )}`}
                              >
                                {route.trafficConditions[0].level}
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-xs px-1.5 py-0 bg-green-100 text-green-800 border-green-200"
                              >
                                clear
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{route.fuelUsage} L</TableCell>
                          <TableCell>{route.co2Emissions} kg</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={`
                                text-xs px-1.5 py-0
                                ${route.recommendationScore > 80 
                                  ? 'bg-green-50 text-green-700 border-green-200' 
                                  : route.recommendationScore > 60 
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-gray-50'}
                              `}
                            >
                              {route.recommendationScore}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Saved Routes Tab */}
          <TabsContent value="saved" className="space-y-4 p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-medium flex items-center">
                  <Bookmark className="h-5 w-5 mr-2 text-primary" />
                  Your Saved Routes
                </h3>
                <p className="text-sm text-muted-foreground">
                  Quick access to your frequently used routes
                </p>
              </div>
              
              <div className="flex items-center">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Route
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedRoutes.map(route => (
                <motion.div
                  key={route.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -2 }}
                >
                  <Card className="overflow-hidden">
                    <div className="h-2 bg-primary" />
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{route.name}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-7 w-7 p-0 ${route.favorite ? 'text-amber-500' : 'text-muted-foreground'}`}
                          onClick={() => handleToggleFavorite(route.id)}
                        >
                          <Star className="h-4 w-4" fill={route.favorite ? 'currentColor' : 'none'} />
                        </Button>
                      </div>
                      
                      <div className="space-y-1 mt-1 text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 mr-1 text-primary" />
                          <span>From: {route.startLocation}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 mr-1 text-primary" />
                          <span>To: {route.endLocation}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-2">
                        <div className="flex items-center text-sm">
                          <Clock className="h-3.5 w-3.5 mr-1 text-primary" />
                          <span>{route.duration} min</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Road className="h-3.5 w-3.5 mr-1 text-primary" />
                          <span>{route.distance} km</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center mt-2 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        <span>Used: {route.lastUsed} • Frequency: {route.frequency}</span>
                      </div>
                      
                      <div className="flex gap-2 mt-3 pt-3 border-t">
                        <Button variant="outline" size="sm" className="flex-1 text-xs">
                          <Map className="h-3.5 w-3.5 mr-1" />
                          Navigate
                        </Button>
                        <Button size="sm" className="flex-1 text-xs">
                          <ArrowRight className="h-3.5 w-3.5 mr-1" />
                          Use
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="px-2 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete saved route?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{route.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteSavedRoute(route.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            
            {savedRoutes.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                <Bookmark className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-lg font-medium">No saved routes yet</p>
                <p className="text-sm mt-1">Save your favorite routes for quick access</p>
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Route
                </Button>
              </div>
            )}
          </TabsContent>
          
          {/* Travel Patterns Tab */}
          <TabsContent value="patterns" className="space-y-4 p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-medium flex items-center">
                  <BarChart className="h-5 w-5 mr-2 text-primary" />
                  Your Travel Patterns
                </h3>
                <p className="text-sm text-muted-foreground">
                  Insights based on your historical travel data
                </p>
              </div>
              
              <Badge variant="outline" className="bg-primary/5">
                <BarChart3 className="h-3.5 w-3.5 mr-1" />
                Last 30 days analysis
              </Badge>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Most Frequent Routes</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Route</TableHead>
                      <TableHead>Time of Day</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {travelPatterns.map(pattern => (
                      <TableRow key={pattern.id}>
                        <TableCell className="font-medium">{pattern.route}</TableCell>
                        <TableCell>{pattern.timeOfDay}</TableCell>
                        <TableCell>
                          {pattern.dayOfWeek.map(day => (
                            <Badge key={day} variant="outline" className="mr-1 text-xs">
                              {day}
                            </Badge>
                          ))}
                        </TableCell>
                        <TableCell>{pattern.averageDuration} min</TableCell>
                        <TableCell>{pattern.frequency}x/month</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            <RotateCcw className="h-3.5 w-3.5 mr-1" />
                            Schedule
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    Traffic Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Commute Time Variation</h4>
                      <div className="bg-muted h-40 rounded-md flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-40" />
                          <span className="text-sm">
                            Traffic data visualization chart would appear here
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1 pt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Busiest time:</span>
                        <span className="font-medium">Weekdays 8:00-9:00 AM</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Best time to travel:</span>
                        <span className="font-medium">Weekdays 10:30-11:30 AM</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Avg. delay in peak hours:</span>
                        <span className="font-medium">+12 minutes</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <Leaf className="h-4 w-4 mr-2 text-primary" />
                    Environmental Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-green-50 border border-green-100 rounded-md p-3">
                        <div className="text-xs text-green-700">CO2 Saved</div>
                        <div className="text-xl font-medium text-green-800 flex items-center">
                          <Leaf className="h-4 w-4 mr-1 text-green-600" />
                          34.5 kg
                        </div>
                        <div className="text-xs text-green-700 mt-1">
                          vs. driving alone
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
                        <div className="text-xs text-blue-700">Fuel Saved</div>
                        <div className="text-xl font-medium text-blue-800 flex items-center">
                          <Droplets className="h-4 w-4 mr-1 text-blue-600" />
                          18.2 L
                        </div>
                        <div className="text-xs text-blue-700 mt-1">
                          through ride sharing
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Eco Score</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Very Good
                        </Badge>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '76%' }} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Your ride sharing habits are helping reduce carbon emissions. Keep up the good work!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-4 p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-medium flex items-center">
                  <Filter className="h-5 w-5 mr-2 text-primary" />
                  Route Preferences
                </h3>
                <p className="text-sm text-muted-foreground">
                  Customize how routes are chosen and displayed
                </p>
              </div>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Routing Priorities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 pt-1">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-primary" />
                      Prioritize fastest routes
                    </Label>
                    <Switch 
                      checked={routePreferences.prioritizeFastestRoute}
                      onCheckedChange={(checked) => handlePreferenceChange('prioritizeFastestRoute', checked)}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Label className="text-sm flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2 text-primary" />
                      Avoid toll roads
                    </Label>
                    <Switch 
                      checked={routePreferences.avoidTolls}
                      onCheckedChange={(checked) => handlePreferenceChange('avoidTolls', checked)}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Label className="text-sm flex items-center">
                      <Road className="h-4 w-4 mr-2 text-primary" />
                      Avoid highways
                    </Label>
                    <Switch 
                      checked={routePreferences.avoidHighways}
                      onCheckedChange={(checked) => handlePreferenceChange('avoidHighways', checked)}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Label className="text-sm flex items-center">
                      <Map className="h-4 w-4 mr-2 text-primary" />
                      Prefer scenic routes
                    </Label>
                    <Switch 
                      checked={routePreferences.preferScenicRoutes}
                      onCheckedChange={(checked) => handlePreferenceChange('preferScenicRoutes', checked)}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Label className="text-sm flex items-center">
                      <Leaf className="h-4 w-4 mr-2 text-primary" />
                      Eco-friendly routing
                    </Label>
                    <Switch 
                      checked={routePreferences.ecoFriendlyRouting}
                      onCheckedChange={(checked) => handlePreferenceChange('ecoFriendlyRouting', checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <Label className="text-sm">Traffic Avoidance Level</Label>
                      <span className="text-sm text-muted-foreground">
                        {routePreferences.trafficAvoidanceLevel < 4 ? 'Low priority' : 
                         routePreferences.trafficAvoidanceLevel < 7 ? 'Medium priority' : 'High priority'}
                      </span>
                    </div>
                    <Slider
                      defaultValue={[routePreferences.trafficAvoidanceLevel]}
                      max={10}
                      min={1}
                      step={1}
                      value={[routePreferences.trafficAvoidanceLevel]}
                      onValueChange={(value) => handlePreferenceChange('trafficAvoidanceLevel', value[0])}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Higher values prioritize routes with less traffic, even if they're longer.
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 pt-2 border-t flex justify-end">
                  <Button onClick={() => {
                    toast({
                      title: "Preferences saved",
                      description: "Your route preferences have been updated.",
                    });
                  }}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Info className="h-4 w-4 mr-2 text-primary" />
                  About Traffic Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Route optimization uses real-time traffic data, historical patterns, and current weather 
                  conditions to provide the most efficient routes. Traffic data is updated every 2-5 minutes.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  <div className="bg-white p-2 rounded-md text-center">
                    <Activity className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <div className="text-xs font-medium">Real-time Traffic</div>
                  </div>
                  <div className="bg-white p-2 rounded-md text-center">
                    <BarChart className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <div className="text-xs font-medium">Historical Patterns</div>
                  </div>
                  <div className="bg-white p-2 rounded-md text-center">
                    <Cloud className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <div className="text-xs font-medium">Weather Impact</div>
                  </div>
                  <div className="bg-white p-2 rounded-md text-center">
                    <LocateFixed className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <div className="text-xs font-medium">User Reports</div>
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
            <LocateFixed className="h-4 w-4 mr-2 text-primary" />
            <span>Using real-time traffic data to provide optimal routes</span>
          </div>
          
          <div className="flex items-center justify-center md:justify-end">
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs"
              onClick={() => setActiveTab('alternatives')}
            >
              <Road className="h-3.5 w-3.5 mr-1.5" />
              Route Alternatives
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}