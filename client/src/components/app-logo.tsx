import { cn } from "@/lib/utils";
import { MapPin, Zap } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";

interface AppLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showTagline?: boolean;
  headerLogo?: boolean;
  actionButton?: boolean;
  actionTarget?: string;
}

export function AppLogo({ 
  size = "md", 
  className, 
  showTagline = false, 
  headerLogo = false,
  actionButton = false,
  actionTarget = "/matches"
}: AppLogoProps) {
  const [_, navigate] = useLocation();
  const [mapPinHovered, setMapPinHovered] = useState(false);
  const [zapHovered, setZapHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  const containerClasses = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  };

  const textClasses = {
    sm: "text-sm",
    md: "text-xl",
    lg: "text-2xl",
  };
  
  const handleLogoClick = () => {
    if (actionButton) {
      setIsActive(true);
      setTimeout(() => {
        setIsActive(false);
        navigate(actionTarget);
      }, 600);
    }
  };

  if (headerLogo) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <motion.div 
          initial={{ y: 0 }} 
          animate={{ y: [0, -2, 0] }} 
          transition={{ repeat: Infinity, duration: 2, repeatType: "mirror" }}
          className="text-green-500 text-lg"
        >
          ^
        </motion.div>
        <motion.div 
          initial={{ y: 0 }} 
          animate={{ y: [0, -1, 0] }} 
          transition={{ repeat: Infinity, duration: 2, delay: 0.5, repeatType: "mirror" }}
          className="text-green-500 text-lg"
        >
          ·
        </motion.div>
        <motion.div 
          initial={{ y: 0 }} 
          animate={{ y: [0, -1, 0] }} 
          transition={{ repeat: Infinity, duration: 2, delay: 1, repeatType: "mirror" }}
          className="text-green-500 text-lg"
        >
          ·
        </motion.div>
        <motion.div 
          initial={{ y: 0 }} 
          animate={{ y: [0, -2, 0] }} 
          transition={{ repeat: Infinity, duration: 2, delay: 1.5, repeatType: "mirror" }}
          className="text-green-500 text-lg"
        >
          ^
        </motion.div>
        <span className="font-semibold tracking-tight ml-1 whitespace-nowrap">
          <span className="text-green-500">Hyper</span>
          <span className="text-green-300">Cheetah</span>
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative">
        <motion.div 
          className={cn(
            "bg-green-100/80 rounded-lg p-3 mb-2 flex items-center justify-center relative", 
            containerClasses[size],
            actionButton && "cursor-pointer"
          )}
          initial={{ scale: 1 }}
          animate={isActive ? { 
            scale: [1, 1.2, 0.9, 1.1, 1],
            rotate: [0, 5, -5, 3, 0],
            boxShadow: ["0 0 0 rgba(74, 222, 128, 0)", "0 0 20px rgba(74, 222, 128, 0.5)", "0 0 10px rgba(74, 222, 128, 0.3)"] 
          } : { scale: 1 }}
          whileHover={actionButton ? { scale: 1.08, boxShadow: "0 0 10px rgba(74, 222, 128, 0.3)" } : { scale: 1.05 }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 10
          }}
          onClick={handleLogoClick}
        >
          <div className={cn("text-green-600 font-bold", textClasses[size])}>^ · · ^</div>
          
          <motion.div 
            className="absolute top-0 right-0 cursor-pointer"
            onHoverStart={() => setZapHovered(true)}
            onHoverEnd={() => setZapHovered(false)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <Zap 
              className={cn(
                "mt-1 mr-1", 
                isActive ? "text-green-600" : "text-green-500"
              )} 
              size={size === "sm" ? 16 : size === "md" ? 20 : 24} 
            />
            <AnimatePresence>
              {zapHovered && (
                <motion.div 
                  className="absolute inset-0 rounded-full border-2 border-red-500"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                />
              )}
            </AnimatePresence>
          </motion.div>
          
          <motion.div 
            className="absolute bottom-0 left-2 cursor-pointer"
            onHoverStart={() => setMapPinHovered(true)}
            onHoverEnd={() => setMapPinHovered(false)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <MapPin 
              className={cn(
                "mb-1",
                isActive ? "text-green-700" : "text-green-600"
              )} 
              size={size === "sm" ? 16 : size === "md" ? 20 : 24} 
            />
            <AnimatePresence>
              {mapPinHovered && (
                <motion.div 
                  className="absolute inset-0 rounded-full border-2 border-red-500"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                />
              )}
            </AnimatePresence>
          </motion.div>
          
          {actionButton && (
            <AnimatePresence>
              {isActive && (
                <motion.div 
                  className="absolute inset-0 bg-green-400/20 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </AnimatePresence>
          )}
        </motion.div>
        
        {actionButton && (
          <motion.div 
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0, y: -5 }}
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: -5 }}
            transition={{ delay: 0.1 }}
          >
            <Badge className="bg-green-500 text-white text-xs px-2 py-0.5 shadow-md">
              Activating...
            </Badge>
          </motion.div>
        )}
      </div>
      
      <h1 className={cn("font-bold tracking-tight leading-none mt-2", sizeClasses[size])}>
        <span className="text-green-500">Hyper</span>
        <span className="text-green-300">Cheetah</span>
      </h1>
      
      {showTagline && (
        <motion.p 
          className="text-muted-foreground text-sm mt-1"
          animate={isActive ? { color: "#22c55e" } : {}}
        >
          {isActive ? "Finding matches nearby..." : "Lightning-fast rides with social connections"}
        </motion.p>
      )}
    </div>
  );
}