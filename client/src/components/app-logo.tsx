import { cn } from "@/lib/utils";

interface AppLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AppLogo({ size = "md", className }: AppLogoProps) {
  const sizeClasses = {
    sm: "h-8",
    md: "h-10",
    lg: "h-14",
  };

  return (
    <div className={cn("flex items-center", className)}>
      <img 
        src="/images/logo.jpeg" 
        alt="RideLink Logo" 
        className={cn("object-contain", sizeClasses[size])}
      />
    </div>
  );
}