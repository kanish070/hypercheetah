import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TooltipHelperProps {
  content: string;
  side?: "top" | "right" | "bottom" | "left";
  size?: "sm" | "md";
}

export function TooltipHelper({ content, side = "top", size = "sm" }: TooltipHelperProps) {
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className={`${iconSize} text-muted-foreground hover:text-primary cursor-pointer`} />
        </TooltipTrigger>
        <TooltipContent side={side}>
          <p className="max-w-xs">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}