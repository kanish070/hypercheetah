import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, MapPin, Navigation, Search, Car, Users, Leaf } from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
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
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Added isOpen state

  const dimensions = {
    sm: { width: 40, height: 40 },
    md: { width: 60, height: 60 },
    lg: { width: 100, height: 100 }
  };

  const { width, height } = dimensions[size];

  // Enhanced quick actions functionality
  const handleQuickAction = () => {
    if (!interactive) return;

    setIsActive(true);
    setShowQuickMenu(true);
    setIsOpen(true); // Set isOpen to true when quick actions are triggered

    // Show tooltip briefly before showing the full quick menu
    setTooltipOpen(true);

    // Auto close tooltip after a short delay
    setTimeout(() => {
      setTooltipOpen(false);
    }, 1000);
  };

  // Reset active state when menu closes
  const handleMenuClose = () => {
    setIsActive(false);
    setShowQuickMenu(false);
    setIsOpen(false); // Set isOpen to false when menu closes
  };

  // Quick actions
  const goToQuickRouteFind = () => {
    navigate('/passenger?quick=true');
    handleMenuClose();
  };

  const goToRiderMode = () => {
    navigate('/rider');
    handleMenuClose();
  };

  const goToSocialConnect = () => {
    navigate('/social');
    handleMenuClose();
  };

  const goToEcoTracker = () => {
    navigate('/eco-tracker');
    handleMenuClose();
  };

  return (
    <div className="relative">
      <Popover open={showQuickMenu} onOpenChange={setShowQuickMenu}>
        <TooltipProvider delayDuration={300}>
          <Tooltip open={tooltipOpen && showTooltip && !showQuickMenu}>
            <PopoverTrigger asChild>
              <TooltipTrigger asChild>
                <div 
                  className={`relative ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
                  onClick={handleQuickAction}
                >
                  <motion.div
                    initial={{ scale: 1 }}
                    whileHover={interactive ? { scale: 1.05 } : {}}
                    whileTap={interactive ? { scale: 0.95 } : {}}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <div className="relative">
                      <picture>
                        <source srcSet="/images/app-logo.jpeg" type="image/jpeg" />
                        <img 
                          src="/images/app-logo.jpeg" 
                          alt="HyperCheetah Logo" 
                          width={width} 
                          height={height}
                          onError={(e) => {
                            // Fallback to text-based logo if image fails to load
                            const target = e.target as HTMLImageElement;
                            const parent = target.parentElement;
                            if (parent) {
                              const div = document.createElement('div');
                              div.className = "flex items-center justify-center bg-primary/10 rounded-lg shadow-md";
                              div.style.width = `${width}px`;
                              div.style.height = `${height}px`;

                              const textDiv = document.createElement('div');
                              textDiv.className = "font-mono text-3xl leading-none whitespace-pre text-primary";
                              textDiv.textContent = "^..^";

                              div.appendChild(textDiv);
                              parent.replaceChild(div, target);
                            }
                          }}
                          className="rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 object-cover"
                        />
                      </picture>

                      <AnimatePresence>
                        {isActive && !showQuickMenu && isOpen && (
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
                              >
                                <Zap className="h-4 w-4 text-primary" />
                                <span className="text-xs font-medium">Quick Actions</span>
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
            </PopoverTrigger>
            <TooltipContent side="bottom" className="bg-primary text-primary-foreground">
              <div className="p-1 text-center">
                <p className="font-medium">Quick Actions Hub</p>
                <p className="text-xs opacity-90">Access all app features instantly</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <PopoverContent 
          className="w-64 p-3 z-50" 
          align="center"
          onEscapeKeyDown={handleMenuClose}
          onInteractOutside={handleMenuClose}
        >
          <div className="space-y-2">
            <h3 className="font-bold text-center text-lg mb-3 bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
              Quick Actions
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center h-24 hover:bg-primary/5 hover:border-primary transition-colors duration-200"
                onClick={goToQuickRouteFind}
              >
                <div className="bg-primary/10 p-2 rounded-full mb-2">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium">Quick Route</span>
                <span className="text-xs text-muted-foreground">Fastest route</span>
              </Button>

              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center h-24 hover:bg-primary/5 hover:border-primary transition-colors duration-200"
                onClick={goToRiderMode}
              >
                <div className="bg-primary/10 p-2 rounded-full mb-2">
                  <Car className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium">Offer Ride</span>
                <span className="text-xs text-muted-foreground">Driver mode</span>
              </Button>

              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center h-24 hover:bg-primary/5 hover:border-primary transition-colors duration-200"
                onClick={goToEcoTracker}
              >
                <div className="bg-green-100 p-2 rounded-full mb-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-sm font-medium">Eco Impact</span>
                <span className="text-xs text-muted-foreground">Track savings</span>
              </Button>

              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center h-24 hover:bg-primary/5 hover:border-primary transition-colors duration-200"
                onClick={goToSocialConnect}
              >
                <div className="bg-primary/10 p-2 rounded-full mb-2">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium">Social</span>
                <span className="text-xs text-muted-foreground">Connect</span>
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}