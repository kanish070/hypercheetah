import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Car, 
  Users, 
  Star, 
  MapPin, 
  Clock, 
  CalendarDays,
  Leaf,
  Gauge
} from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface UserStatsProps {
  userId: number;
}

// Ride data interface
interface Ride {
  id: number;
  userId: number;
  type: "offer" | "request";
  route?: {
    estimatedDistance?: number;
    estimatedDuration?: number;
  };
}

// Mock stats data shape
interface UserStatsData {
  totalRides: number;
  totalDistance: number;
  ridesAsDriver: number;
  ridesAsPassenger: number;
  averageRating: number;
  favoriteLocation: string;
  co2Saved: number;
  memberSince: string;
  hoursInApp: number;
  totalRideTime: number;
}

export function UserStats({ userId }: UserStatsProps) {
  // State for tracking animation
  const [progress, setProgress] = useState(0);
  
  // Query the user data
  const { data: user } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
  });
  
  // Query the user rides to calculate stats
  const { data: rides, isLoading } = useQuery<Ride[]>({
    queryKey: [`/api/users/${userId}/rides`],
  });

  // In a real app, we'd calculate these values from rides and other data
  // For now we'll use mock data since we're just showing the UI
  const stats: UserStatsData = {
    totalRides: (rides || []).length,
    totalDistance: (rides || []).reduce((acc: number, ride: Ride) => acc + (ride.route?.estimatedDistance || 0), 0) / 1000,
    ridesAsDriver: (rides || []).filter((ride: Ride) => ride.type === "offer").length,
    ridesAsPassenger: (rides || []).filter((ride: Ride) => ride.type === "request").length,
    averageRating: 4.8, // This would be calculated from ratings
    favoriteLocation: "Alkapuri",
    co2Saved: 182.5, // In kg
    memberSince: new Date().toLocaleDateString(),
    hoursInApp: 67,
    totalRideTime: 43, // In hours
  };

  // Animate the progress bar on load
  useEffect(() => {
    const timer = setTimeout(() => setProgress(100), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-3/4 bg-gray-200 animate-pulse rounded-md"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Your Ride Stats</h2>
        <p className="text-muted-foreground">
          Track your progress and achievements
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Rides" 
          value={stats.totalRides.toString()} 
          icon={<Car className="h-4 w-4" />}
          description="Rides completed"
          progress={Math.min(stats.totalRides / 100 * 100, 100)}
          goal="100 rides"
        />
        
        <StatCard 
          title="Distance Traveled" 
          value={`${stats.totalDistance.toFixed(1)} km`}
          icon={<Gauge className="h-4 w-4" />}
          description="Total kilometers"
          progress={Math.min(stats.totalDistance / 1000 * 100, 100)}
          goal="1,000 km"
        />

        <StatCard 
          title="CO₂ Saved" 
          value={`${stats.co2Saved.toFixed(1)} kg`}
          icon={<Leaf className="h-4 w-4" />}
          description="Carbon footprint reduced"
          progress={Math.min(stats.co2Saved / 500 * 100, 100)}
          goal="500 kg CO₂"
        />

        <StatCard 
          title="Rider Rating" 
          value={stats.averageRating.toFixed(1)}
          icon={<Star className="h-4 w-4" />}
          description={`Based on ${stats.totalRides} rides`}
          progress={stats.averageRating / 5 * 100}
          goal="5.0 rating"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="Favorite Location" 
          value={stats.favoriteLocation}
          icon={<MapPin className="h-4 w-4" />}
          description="Most visited destination"
          hideProgress
        />
        
        <StatCard 
          title="Time in Rides" 
          value={`${stats.totalRideTime} hrs`}
          icon={<Clock className="h-4 w-4" />}
          description="Total time in vehicles"
          hideProgress
        />
        
        <StatCard 
          title="Member Since" 
          value={stats.memberSince}
          icon={<CalendarDays className="h-4 w-4" />}
          description="Account creation date"
          hideProgress
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard 
          title="Rides as Driver" 
          value={stats.ridesAsDriver.toString()}
          icon={<Car className="h-4 w-4" />}
          description="Rides you've offered"
          progress={Math.min(stats.ridesAsDriver / 50 * 100, 100)}
          goal="50 rides"
        />
        
        <StatCard 
          title="Rides as Passenger" 
          value={stats.ridesAsPassenger.toString()}
          icon={<Users className="h-4 w-4" />}
          description="Rides you've taken"
          progress={Math.min(stats.ridesAsPassenger / 50 * 100, 100)}
          goal="50 rides"
        />
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  progress?: number;
  goal?: string;
  hideProgress?: boolean;
}

function StatCard({ 
  title, 
  value, 
  icon, 
  description, 
  progress, 
  goal,
  hideProgress = false
}: StatCardProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  useEffect(() => {
    if (progress !== undefined) {
      const timer = setTimeout(() => setAnimatedProgress(progress), 500);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <div className="h-4 w-4 text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground pt-1">
          {description}
        </p>
        {!hideProgress && progress !== undefined && goal && (
          <div className="mt-3">
            <Progress value={animatedProgress} className="h-1" />
            <p className="text-xs text-muted-foreground mt-1 flex justify-between">
              <span>{animatedProgress.toFixed(0)}%</span>
              <span>Goal: {goal}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}