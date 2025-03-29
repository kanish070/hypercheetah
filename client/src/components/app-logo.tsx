import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, MapPin, Navigation, Search } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLocation } from 'wouter';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  showTooltip?: boolean;
}

export function AppLogo({ 
  size = 'md', 
  interactive = true,
  showTooltip = true
}: AppLogoProps) {
  const [isActive, setIsActive] = useState(false);
  const [_, navigate] = useLocation();
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const dimensions = {
    sm: { width: 40, height: 40 },
    md: { width: 60, height: 60 },
    lg: { width: 100, height: 100 }
  };

  const { width, height } = dimensions[size];

  // Quick route finder functionality
  const handleQuickRoute = () => {
    if (!interactive) return;
    
    setIsActive(true);
    
    // Show tooltip with the quick route functionality
    setTooltipOpen(true);
    
    // Auto close tooltip after 3 seconds
    setTimeout(() => {
      setTooltipOpen(false);
    }, 3000);
  };

  // Navigate to direct route finding page
  const goToQuickRouteFind = () => {
    navigate('/passenger?quick=true');
  };

  return (
    <div className="relative">
      <TooltipProvider delayDuration={300}>
        <Tooltip open={tooltipOpen && showTooltip}>
          <TooltipTrigger asChild>
            <div 
              className={`relative cursor-pointer ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
              onClick={handleQuickRoute}
            >
              <motion.div
                initial={{ scale: 1 }}
                whileHover={interactive ? { scale: 1.05 } : {}}
                whileTap={interactive ? { scale: 0.95 } : {}}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="relative">
                  <div 
                  className="flex items-center justify-center bg-primary/10 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                  style={{ width: width * 0.8, height: height * 0.8 }}
                >
                  <div className="font-mono text-[10px] leading-none whitespace-pre text-primary transform hover:scale-105 transition-transform">
                    {`^..^`}
                  </div>
                </div>
                  
                  <AnimatePresence>
                    {isActive && (
                      <motion.div 
                        className="absolute inset-0 bg-primary/10 rounded-lg flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ delay: 0.1, type: "spring" }}
                          className="flex items-center justify-center gap-1 bg-white p-2 rounded-full shadow-lg"
                          onClick={goToQuickRouteFind}
                        >
                          <Search className="h-4 w-4 text-primary" />
                          <span className="text-xs font-medium">Quick Find</span>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
              
              {/* Floating elements for visual interest */}
              <motion.div 
                className="absolute -right-2 -top-2"
                animate={{ 
                  y: [0, -4, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  repeatType: "reverse" 
                }}
              >
                <Zap className="h-5 w-5 text-primary" />
              </motion.div>
              
              <motion.div 
                className="absolute -left-2 -bottom-2"
                animate={{ 
                  y: [0, 3, 0],
                  x: [0, 2, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  repeatType: "reverse"
                }}
              >
                <MapPin className="h-4 w-4 text-primary/80" />
              </motion.div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-primary text-primary-foreground">
            <div className="p-1 text-center">
              <p className="font-medium">Quick Route Finder</p>
              <p className="text-xs opacity-90">Click to instantly find the fastest route</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}