import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card, CardContent, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MapPin, Clock, Users, Check, X, Zap, 
  UserCheck, Shield, Star, Calendar, Loader2
} from 'lucide-react';
import { useWebSocket } from '@/hooks/use-websocket';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface MatchingUser {
  id: number;
  name: string;
  avatar?: string;
  location?: {
    lat: number;
    lng: number;
  };
  rating?: number;
  verificationStatus?: string;
}

interface MatchStep {
  match: MatchingUser;
  matchScore: number;
  result: 'matched' | 'rejected' | 'pending';
  stepIndex: number;
}

interface RealTimeRideMatchingProps {
  onMatchingComplete?: (matches: MatchingUser[]) => void;
  startLocation?: any;
  endLocation?: any;
  className?: string;
}

export function RealTimeRideMatching({
  onMatchingComplete,
  startLocation,
  endLocation,
  className
}: RealTimeRideMatchingProps) {
  const { connected, sendMessage, addMessageListener } = useWebSocket();
  const [matchingState, setMatchingState] = useState<'idle' | 'matching' | 'complete' | 'error'>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [matchSteps, setMatchSteps] = useState<MatchStep[]>([]);
  const [finalMatches, setFinalMatches] = useState<MatchingUser[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const currentMatchRef = useRef<HTMLDivElement>(null);

  // Scroll current match into view
  useEffect(() => {
    if (currentMatchRef.current) {
      currentMatchRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentStep]);

  // Initialize WebSocket message listener for ride matching
  useEffect(() => {
    const removeListener = addMessageListener((message) => {
      if (message.type === 'ride_matching_started') {
        console.log('Ride matching process started:', message);
        setMatchingState('matching');
        setTotalSteps(message.totalSteps);
        setMatchSteps([]);
        setCurrentStep(0);
      } 
      else if (message.type === 'ride_matching_step') {
        console.log('Ride matching step:', message);
        
        setCurrentStep(message.step);
        
        // Add the step to our steps array
        setMatchSteps(prev => {
          const newSteps = [...prev];
          const stepIndex = message.step;
          
          // Create new step if it doesn't exist
          if (!newSteps[stepIndex]) {
            newSteps[stepIndex] = {
              match: message.match,
              matchScore: message.matchScore,
              result: message.result,
              stepIndex: stepIndex
            };
          }
          
          return newSteps;
        });
      } 
      else if (message.type === 'ride_matching_complete') {
        console.log('Ride matching process complete:', message);
        setMatchingState('complete');
        setFinalMatches(message.matches);
        
        if (onMatchingComplete) {
          onMatchingComplete(message.matches);
        }
      }
      else if (message.type === 'ride_matching_error') {
        console.error('Ride matching error:', message);
        setMatchingState('error');
        setErrorMessage(message.error || 'An error occurred during matching');
        
        toast({
          variant: 'destructive',
          title: 'Matching Error',
          description: message.error || 'An error occurred during ride matching'
        });
      }
    });
    
    return removeListener;
  }, [addMessageListener, onMatchingComplete]);

  // Start the matching process
  const startMatching = () => {
    if (!connected) {
      toast({
        variant: 'destructive',
        title: 'Connection Error',
        description: 'WebSocket is not connected. Please try again.'
      });
      return;
    }
    
    setMatchingState('matching');
    setMatchSteps([]);
    setCurrentStep(0);
    setTotalSteps(0);
    setFinalMatches([]);
    setErrorMessage(null);
    
    // Request ride matches from server
    sendMessage({
      type: 'find_ride_matches',
      route: {
        startLocation: startLocation || { lat: 22.3072, lng: 73.1812 }, // Alkapuri, Vadodara
        endLocation: endLocation || { lat: 22.3220, lng: 73.2131 } // Railway Station, Vadodara
      },
      rideType: 'ride_request'
    });
    
    toast({
      title: 'Matching Started',
      description: 'Finding your ideal ride matches...'
    });
  };

  return (
    <Card className={cn("shadow-md overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span>Dynamic Ride Matching</span>
          </div>
          {matchingState === 'matching' && (
            <Badge variant="outline" className="bg-amber-50 text-amber-600 animate-pulse">
              Matching in progress
            </Badge>
          )}
          {matchingState === 'complete' && (
            <Badge variant="outline" className="bg-green-50 text-green-600">
              Matching complete
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pb-2">
        {/* Matching progress */}
        {matchingState === 'matching' && totalSteps > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Analyzing potential matches</span>
              <span>{currentStep + 1} of {totalSteps}</span>
            </div>
            <Progress value={((currentStep + 1) / totalSteps) * 100} className="h-2" />
          </div>
        )}
        
        {/* Matching status message */}
        <div className="text-center mb-6 text-muted-foreground text-sm">
          {matchingState === 'idle' && (
            <div>Click 'Start Matching' to find your ride partners</div>
          )}
          {matchingState === 'matching' && (
            <div className="flex items-center justify-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
              Analyzing compatibility factors...
            </div>
          )}
          {matchingState === 'complete' && (
            <div>
              Found {finalMatches.length} matches for your route
            </div>
          )}
          {matchingState === 'error' && (
            <div className="text-destructive">
              {errorMessage || 'An error occurred during matching'}
            </div>
          )}
        </div>
        
        {/* Connection visualization */}
        <div className="relative flex items-stretch" style={{minHeight: '250px'}} ref={containerRef}>
          {/* Left column: Origin */}
          <div className="w-1/4 pr-2 relative">
            <div className="absolute top-0 left-0 w-full">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-primary/5 rounded-lg border border-primary/10 mb-3"
              >
                <div className="font-medium mb-1 flex items-center">
                  <MapPin className="h-3 w-3 mr-1 text-primary" /> Origin
                </div>
                <div className="text-xs text-muted-foreground">
                  {startLocation?.name || 'Alkapuri, Vadodara'}
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Center: Animation */}
          <div className="w-1/2 px-2 flex flex-col items-center justify-center">
            {matchingState === 'idle' ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-muted/30 rounded-full p-10"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 border-2 border-primary/20 border-dashed rounded-full flex items-center justify-center"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-8 w-8 text-primary/80" />
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Animated connection lines would be drawn here */}
                <svg className="absolute inset-0 w-full h-full">
                  {matchingState === 'matching' && currentStep < matchSteps.length && (
                    <motion.line 
                      x1="10%" 
                      y1="50%" 
                      x2="90%" 
                      y2="50%" 
                      stroke={matchSteps[currentStep]?.result === 'matched' ? '#16a34a' : matchSteps[currentStep]?.result === 'rejected' ? '#dc2626' : '#d1d5db'} 
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5 }}
                    />
                  )}
                  
                  {matchingState === 'complete' && finalMatches.map((match, index) => (
                    <motion.line 
                      key={`line-${match.id}`}
                      x1="10%" 
                      y1={`${(index / finalMatches.length) * 70 + 15}%`} 
                      x2="90%" 
                      y2={`${(index / finalMatches.length) * 70 + 15}%`} 
                      stroke="#16a34a" 
                      strokeWidth="2"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                    />
                  ))}
                </svg>
                
                {/* Central matching hub */}
                <motion.div 
                  animate={{ 
                    scale: matchingState === 'matching' ? [1, 1.1, 1] : 1,
                    rotate: 360
                  }}
                  transition={{ 
                    scale: { duration: 1.5, repeat: matchingState === 'matching' ? Infinity : 0 },
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" }
                  }}
                  className="relative z-10"
                >
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                    <div className="w-10 h-10 bg-primary/30 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 bg-primary rounded-full" />
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
          
          {/* Right column: Potential matches */}
          <div className="w-1/4 pl-2 relative">
            <div className="absolute top-0 right-0 w-full h-full overflow-y-auto" style={{maxHeight: '300px'}}>
              <AnimatePresence>
                {matchingState === 'matching' && matchSteps.map((step, index) => (
                  <motion.div
                    key={`step-${index}`}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ 
                      opacity: index <= currentStep ? 1 : 0,
                      x: index <= currentStep ? 0 : 50,
                      scale: index === currentStep ? 1.05 : 1
                    }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "p-3 bg-card border rounded-lg mb-3 transition-all",
                      index === currentStep ? "border-primary shadow-md" : "border-primary/10",
                      step.result === 'matched' ? "border-green-500 bg-green-50" :
                      step.result === 'rejected' ? "border-red-300 bg-red-50" : ""
                    )}
                    ref={index === currentStep ? currentMatchRef : null}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{step.match.name.charAt(0)}</AvatarFallback>
                        {step.match.avatar && <AvatarImage src={step.match.avatar} />}
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm leading-tight">{step.match.name}</div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                          {step.match.rating || 4.8}
                        </div>
                      </div>
                      {index <= currentStep && (
                        <div className="ml-auto">
                          {step.result === 'matched' && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="bg-green-100 text-green-600 h-6 w-6 rounded-full flex items-center justify-center"
                            >
                              <Check className="h-4 w-4" />
                            </motion.div>
                          )}
                          {step.result === 'rejected' && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="bg-red-100 text-red-600 h-6 w-6 rounded-full flex items-center justify-center"
                            >
                              <X className="h-4 w-4" />
                            </motion.div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {index === currentStep && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-xs space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <span>Compatibility Score</span>
                          <span className="font-medium">{step.matchScore}%</span>
                        </div>
                        <Progress 
                          value={step.matchScore} 
                          className="h-1.5"
                        />
                        
                        <div className="flex items-center gap-1 mt-2">
                          {step.match.verificationStatus === 'verified' && (
                            <Badge variant="outline" className="text-[10px] h-4 bg-blue-50 text-blue-600 gap-1">
                              <Shield className="h-2 w-2" /> Verified
                            </Badge>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
                
                {matchingState === 'complete' && finalMatches.map((match, index) => (
                  <motion.div
                    key={`match-${match.id}`}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-3 bg-green-50 border border-green-200 rounded-lg mb-3"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{match.name.charAt(0)}</AvatarFallback>
                        {match.avatar && <AvatarImage src={match.avatar} />}
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{match.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center">
                          <Check className="h-3 w-3 mr-1 text-green-500" />
                          Matched
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setMatchingState('idle');
            setMatchSteps([]);
            setFinalMatches([]);
          }}
          disabled={matchingState === 'matching'}
        >
          Reset
        </Button>
        
        <Button
          size="sm"
          onClick={startMatching}
          disabled={matchingState === 'matching'}
        >
          {matchingState === 'idle' ? 'Start Matching' : 'Rematch'}
        </Button>
      </CardFooter>
    </Card>
  );
}