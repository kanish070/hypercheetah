import { cn } from "@/lib/utils";
import { MapPin, Zap } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface AppLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showTagline?: boolean;
  headerLogo?: boolean;
}

export function AppLogo({ size = "md", className, showTagline = false, headerLogo = false }: AppLogoProps) {
  const [mapPinHovered, setMapPinHovered] = useState(false);
  const [zapHovered, setZapHovered] = useState(false);
  
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
          className={cn("bg-green-100/80 rounded-lg p-3 mb-2 flex items-center justify-center relative", containerClasses[size])}
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
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
              className="text-green-500 mt-1 mr-1" 
              size={size === "sm" ? 16 : size === "md" ? 20 : 24} 
            />
            {zapHovered && (
              <motion.div 
                className="absolute inset-0 rounded-full border-2 border-red-500"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              />
            )}
          </motion.div>
          
          <motion.div 
            className="absolute bottom-0 left-2 cursor-pointer"
            onHoverStart={() => setMapPinHovered(true)}
            onHoverEnd={() => setMapPinHovered(false)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <MapPin 
              className="text-green-600 mb-1" 
              size={size === "sm" ? 16 : size === "md" ? 20 : 24} 
            />
            {mapPinHovered && (
              <motion.div 
                className="absolute inset-0 rounded-full border-2 border-red-500"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              />
            )}
          </motion.div>
        </motion.div>
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