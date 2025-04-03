import { useState } from "react";
import { AchievementBadge } from "./achievement-badge";
import { 
  Car, 
  Users, 
  Leaf, 
  Trophy, 
  Medal 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

// Achievement Category Type
type AchievementCategory = 'ride' | 'social' | 'eco' | 'milestone';

// User Achievement interface to match our API data
interface UserAchievementData {
  id: number;
  userId: number;
  achievementId: number;
  progress: number;
  unlocked: boolean;
  unlockedAt: string | null;
  achievement: {
    id: number;
    name: string;
    description: string;
    points: number;
    icon: string;
    criteria: string;
    category: AchievementCategory;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  };
}

interface AchievementGalleryProps {
  userId: number;
}

export function AchievementGallery({ userId }: AchievementGalleryProps) {
  // State for current filter
  const [filter, setFilter] = useState<AchievementCategory | 'all'>('all');
  
  // Fetch user achievements
  const { data: achievements, isLoading, error } = useQuery<UserAchievementData[]>({
    queryKey: [`/api/users/${userId}/achievements`],
  });

  // Get the total points earned
  const totalPoints = achievements?.reduce((total: number, achievement: UserAchievementData) => {
    if (achievement.unlocked) {
      return total + achievement.achievement.points;
    }
    return total;
  }, 0) || 0;

  // Calculate completion percentage
  const totalAchievements = achievements?.length || 0;
  const unlockedAchievements = achievements?.filter((a: UserAchievementData) => a.unlocked).length || 0;
  const completionPercentage = totalAchievements ? Math.round((unlockedAchievements / totalAchievements) * 100) : 0;

  // Filter achievements by category
  const filteredAchievements = achievements?.filter((achievement: UserAchievementData) => {
    if (filter === 'all') return true;
    return achievement.achievement.category === filter;
  });

  // Split achievements by unlock status
  const unlockedAchievementsList = filteredAchievements?.filter((a: UserAchievementData) => a.unlocked) || [];
  const inProgressAchievementsList = filteredAchievements?.filter((a: UserAchievementData) => !a.unlocked) || [];

  if (isLoading) {
    return <AchievementGallerySkeleton />;
  }

  if (error) {
    return <div className="text-red-500">Error loading achievements</div>;
  }

  return (
    <div className="w-full space-y-6">
      {/* Points Overview */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg">
        <div>
          <h3 className="text-lg font-semibold">Achievement Progress</h3>
          <p className="text-sm text-muted-foreground">
            {unlockedAchievements} of {totalAchievements} achievements unlocked ({completionPercentage}%)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Medal className="h-5 w-5 text-primary" />
          <span className="text-2xl font-bold">{totalPoints}</span>
          <span className="text-sm text-muted-foreground">points</span>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <Tabs defaultValue="all" onValueChange={(value) => setFilter(value as any)}>
        <TabsList className="w-full grid grid-cols-5">
          <TabsTrigger value="all" className="flex items-center gap-1">
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">All</span>
          </TabsTrigger>
          <TabsTrigger value="ride" className="flex items-center gap-1">
            <Car className="w-4 h-4" />
            <span className="hidden sm:inline">Rides</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Social</span>
          </TabsTrigger>
          <TabsTrigger value="eco" className="flex items-center gap-1">
            <Leaf className="w-4 h-4" />
            <span className="hidden sm:inline">Eco</span>
          </TabsTrigger>
          <TabsTrigger value="milestone" className="flex items-center gap-1">
            <Medal className="w-4 h-4" />
            <span className="hidden sm:inline">Milestone</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-4">
          <ScrollArea className="h-[350px] rounded-md border p-4">
            {/* Unlocked Achievements */}
            {unlockedAchievementsList.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Unlocked</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 mb-6">
                  {unlockedAchievementsList.map((userAchievement: UserAchievementData) => (
                    <AchievementBadge 
                      key={userAchievement.id} 
                      userAchievement={userAchievement}
                      showProgress={false}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* In Progress Achievements */}
            {inProgressAchievementsList.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">In Progress</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                  {inProgressAchievementsList.map((userAchievement: UserAchievementData) => (
                    <AchievementBadge 
                      key={userAchievement.id} 
                      userAchievement={userAchievement}
                    />
                  ))}
                </div>
              </div>
            )}

            {filteredAchievements?.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40">
                <Trophy className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground">No achievements found in this category</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AchievementGallerySkeleton() {
  return (
    <div className="w-full space-y-6">
      <Skeleton className="h-20 w-full rounded-lg" />
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-2 w-16 mt-2" />
              <Skeleton className="h-2 w-10 mt-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}