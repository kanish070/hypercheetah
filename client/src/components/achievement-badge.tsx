import { cn } from "@/lib/utils";
import { 
  Car, 
  Users, 
  Leaf, 
  Trophy, 
  Star, 
  Gauge,
  LucideIcon
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

// Achievement Category Type
type AchievementCategory = 'ride' | 'social' | 'eco' | 'milestone';
// Achievement Tier Type
type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

interface Achievement {
  id: number;
  name: string;
  description: string;
  points: number;
  icon: string;
  criteria: string;
  category: AchievementCategory;
  tier: AchievementTier;
}

interface UserAchievementData {
  id: number;
  userId: number;
  achievementId: number;
  progress: number;
  unlocked: boolean;
  unlockedAt: string | null;
  achievement: Achievement;
}

interface AchievementBadgeProps {
  userAchievement: UserAchievementData;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  className?: string;
}

export function AchievementBadge({
  userAchievement,
  size = 'md',
  showProgress = true,
  className
}: AchievementBadgeProps) {
  const { achievement, progress, unlocked } = userAchievement;

  // Map the icon string to a Lucide icon component
  const getIconComponent = (iconName: string): LucideIcon => {
    const iconMap: Record<string, LucideIcon> = {
      car: Car,
      users: Users,
      leaf: Leaf,
      trophy: Trophy,
      star: Star,
      gauge: Gauge
    };
    
    return iconMap[iconName] || Trophy;
  };

  const IconComponent = getIconComponent(achievement.icon);

  // Determine badge size
  const badgeSize = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  }[size];

  // Determine icon size
  const iconSize = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  }[size];

  // Get tier-based styles
  const getTierStyles = (tier: AchievementTier) => {
    const baseStyle = "rounded-full flex items-center justify-center drop-shadow-lg";
    
    if (!unlocked) {
      return `${baseStyle} bg-gray-200 text-gray-400 grayscale`;
    }
    
    switch (tier) {
      case 'bronze':
        return `${baseStyle} bg-gradient-to-br from-amber-500 to-amber-700 text-amber-100`;
      case 'silver':
        return `${baseStyle} bg-gradient-to-br from-slate-300 to-slate-500 text-slate-100`;
      case 'gold':
        return `${baseStyle} bg-gradient-to-br from-yellow-300 to-yellow-600 text-yellow-100`;
      case 'platinum':
        return `${baseStyle} bg-gradient-to-br from-indigo-300 to-indigo-600 text-indigo-100`;
      default:
        return `${baseStyle} bg-gradient-to-br from-amber-500 to-amber-700 text-amber-100`;
    }
  };

  // Get category-based styles
  const getCategoryStyles = (category: AchievementCategory) => {
    if (!unlocked) return "";
    
    switch (category) {
      case 'ride':
        return "ring-2 ring-blue-500";
      case 'social':
        return "ring-2 ring-pink-500";
      case 'eco':
        return "ring-2 ring-green-500";
      case 'milestone':
        return "ring-2 ring-purple-500";
      default:
        return "ring-2 ring-blue-500";
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex flex-col items-center", className)}>
            <div
              className={cn(
                badgeSize,
                getTierStyles(achievement.tier),
                getCategoryStyles(achievement.category)
              )}
            >
              <IconComponent className={iconSize} />
            </div>
            {showProgress && (
              <div className="w-full mt-2">
                <Progress className="h-1" value={progress} />
                <div className="text-xs mt-1 text-center">
                  {progress}%
                </div>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px]">
          <div className="space-y-1">
            <div className="font-semibold">{achievement.name}</div>
            <div className="text-xs text-muted-foreground">{achievement.description}</div>
            <div className="text-xs">
              {unlocked ? (
                <span className="text-green-500">Unlocked</span>
              ) : (
                <span className="text-muted-foreground">Progress: {progress}%</span>
              )}
            </div>
            <div className="text-xs flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              <span>{achievement.points} points</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}