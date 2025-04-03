import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription,
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

// Dummy interface for leaderboard entry
interface LeaderboardEntry {
  userId: number;
  name: string;
  avatar?: string;
  points: number;
  rank: number;
  achievements: number;
  specialAchievement?: string;
}

interface LeaderboardProps {
  userId: number; // Current user id to highlight
  limit?: number;
}

export function AchievementLeaderboard({ userId, limit = 5 }: LeaderboardProps) {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'allTime'>('allTime');
  
  // In a real app, this would query the backend based on the timeframe
  const { data: leaderboardData, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: [`/api/leaderboard`, timeframe],
    enabled: false, // Disable this query since we don't have a real endpoint yet
  });

  // Mock data for demonstration
  const mockLeaderboard: LeaderboardEntry[] = [
    {
      userId: 1,
      name: "Kanish",
      avatar: "/images/kanish-selfie.jpg",
      points: 2350,
      rank: 1,
      achievements: 12,
      specialAchievement: "Road Warrior",
    },
    {
      userId: 2,
      name: "Priya",
      avatar: "/images/priya-avatar.jpg",
      points: 1980,
      rank: 2,
      achievements: 9,
    },
    {
      userId: 3,
      name: "Raj",
      points: 1650,
      rank: 3,
      achievements: 8,
      specialAchievement: "Green Commuter",
    },
    {
      userId: 4,
      name: "Ananya",
      points: 1420,
      rank: 4,
      achievements: 7,
    },
    {
      userId: 5,
      name: "Vikram",
      points: 1280,
      rank: 5,
      achievements: 6,
    },
    {
      userId: 6,
      name: "Meera",
      points: 1100,
      rank: 6,
      achievements: 5,
    },
    {
      userId: 7,
      name: "Arjun",
      points: 950,
      rank: 7,
      achievements: 4,
    }
  ];

  // Get data to display
  const displayData = leaderboardData || mockLeaderboard;
  const limitedData = displayData.slice(0, limit);
  
  // Find the current user's rank
  const currentUserEntry = displayData.find(entry => entry.userId === userId);
  const userRank = currentUserEntry?.rank || '—';
  
  if (isLoading) {
    return <LeaderboardSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">Leaderboard</CardTitle>
            <CardDescription>Top achievers in the community</CardDescription>
          </div>
          <Select 
            defaultValue={timeframe} 
            onValueChange={(value: 'weekly' | 'monthly' | 'allTime') => setTimeframe(value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">This Week</SelectItem>
              <SelectItem value="monthly">This Month</SelectItem>
              <SelectItem value="allTime">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current user's ranking summary */}
          <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Your Rank</p>
                <p className="text-xs text-muted-foreground">Keep earning points!</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg"># {userRank}</span>
              <Badge variant="outline">{currentUserEntry?.points || 0} pts</Badge>
            </div>
          </div>

          {/* Leaderboard entries */}
          <div className="space-y-2">
            {limitedData.map((entry, index) => (
              <div 
                key={entry.userId}
                className={`flex items-center justify-between p-2 rounded-md ${
                  entry.userId === userId ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'
                }`}
              >
                {/* Rank indicator */}
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 flex justify-center">
                    {index === 0 ? (
                      <Crown className="h-5 w-5 text-yellow-500" />
                    ) : index === 1 ? (
                      <Medal className="h-5 w-5 text-gray-400" />
                    ) : index === 2 ? (
                      <Medal className="h-5 w-5 text-amber-700" />
                    ) : (
                      <span className="text-sm font-medium text-muted-foreground">
                        {entry.rank}
                      </span>
                    )}
                  </div>
                  
                  {/* User info */}
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={entry.avatar} />
                      <AvatarFallback>
                        {entry.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium line-clamp-1">{entry.name}</p>
                      {entry.specialAchievement && (
                        <p className="text-xs text-primary">{entry.specialAchievement}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Score */}
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm font-semibold">{entry.points} pts</p>
                    <p className="text-xs text-muted-foreground">{entry.achievements} achievements</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LeaderboardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48 mt-1" />
          </div>
          <Skeleton className="h-9 w-[140px]" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}