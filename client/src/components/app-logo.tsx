import { cn } from "@/lib/utils";

interface AppLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AppLogo({ size = "md", className }: AppLogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <div className={cn("flex items-center font-bold", sizeClasses[size], className)}>
      <span className="text-primary">Ride</span>
      <span className="text-foreground">Link</span>
    </div>
  );
}