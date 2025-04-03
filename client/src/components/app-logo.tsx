import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

interface AppLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showTagline?: boolean;
}

export function AppLogo({ size = "md", className, showTagline = false }: AppLogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
  };

  const iconSizeClasses = {
    sm: "h-6 w-6",
    md: "h-7 w-7",
    lg: "h-10 w-10",
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative">
        <div className="bg-green-100/80 rounded-lg p-3 mb-2 w-20 h-20 flex items-center justify-center">
          <div className="text-green-600 text-2xl font-bold">^  ·  ·  ^</div>
        </div>
        <MapPin className="absolute bottom-0 left-3 text-green-600" size={20} />
        <div className="absolute top-0 right-0 text-green-500">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 3L14.5 1.5L16 3L17.5 1.5L19 3L20.5 1.5L22 3V7L20.5 8.5L19 7L17.5 8.5L16 7L14.5 8.5L13 7V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 9.5V16.5C21 19.5 19.5 21 16.5 21H7.5C4.5 21 3 19.5 3 16.5V7.5C3 4.5 4.5 3 7.5 3H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      
      <h1 className={cn("font-bold tracking-tight leading-none mt-2", sizeClasses[size])}>
        <span className="text-green-500">Hyper</span>
        <span className="text-green-300">Cheetah</span>
      </h1>
      
      {showTagline && (
        <p className="text-muted-foreground text-sm mt-1">
          Lightning-fast rides with social connections
        </p>
      )}
    </div>
  );
}