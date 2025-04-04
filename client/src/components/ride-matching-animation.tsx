import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Car, Users, Clock, Check, X } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RiderInfo {
  id: number;
  name: string;
  avatar?: string;
  rating: number;
  origin: {
    name: string;
    lat: number;
    lng: number;
  };
  destination: {
    name: string;
    lat: number;
    lng: number;
  };
  departureTime: Date;
  vehicleType: string;
  price: number;
  seatsAvailable: number;
}

interface PassengerInfo {
  id: number;
  name: string;
  avatar?: string;
  origin: {
    name: string;
    lat: number;
    lng: number;
  };
  destination: {
    name: string;
    lat: number;
    lng: number;
  };
  departureTime: Date;
  preferences: string[];
}

interface MatchResult {
  riderId: number;
  passengerId: number;
  matchScore: number;
  status: 'pending' | 'matched' | 'rejected';
}

interface RideMatchingAnimationProps {
  riders?: RiderInfo[];
  passengers?: PassengerInfo[];
  onMatchComplete?: (matches: MatchResult[]) => void;
  autoPlay?: boolean;
  className?: string;
}

export function RideMatchingAnimation({
  riders = [],
  passengers = [],
  onMatchComplete,
  autoPlay = true,
  className
}: RideMatchingAnimationProps) {
  const [activeRider, setActiveRider] = useState<number | null>(null);
  const [activePassenger, setActivePassenger] = useState<number | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [lines, setLines] = useState<{start: {x: number, y: number}, end: {x: number, y: number}, quality: number}[]>([]);
  const [step, setStep] = useState<'idle' | 'matching' | 'results'>('idle');
  const [matchIndex, setMatchIndex] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);
  
  const riderRefs = useRef<(HTMLDivElement | null)[]>([]);
  const passengerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Function to calculate match score between rider and passenger
  const calculateMatchScore = (rider: RiderInfo, passenger: PassengerInfo): number => {
    // Start with a base score
    let score = 80;
    
    // Time compatibility (closer departure times get higher scores)
    const timeDiff = Math.abs(rider.departureTime.getTime() - passenger.departureTime.getTime());
    const timeDiffMinutes = timeDiff / (1000 * 60);
    if (timeDiffMinutes < 15) {
      score += 10;
    } else if (timeDiffMinutes > 60) {
      score -= 15;
    } else if (timeDiffMinutes > 30) {
      score -= 5;
    }
    
    // Route similarity (using basic distance calculation)
    const originDist = calculateDistance(
      rider.origin.lat, 
      rider.origin.lng, 
      passenger.origin.lat, 
      passenger.origin.lng
    );
    
    const destDist = calculateDistance(
      rider.destination.lat, 
      rider.destination.lng, 
      passenger.destination.lat, 
      passenger.destination.lng
    );
    
    // Close origins and destinations are good matches
    if (originDist < 2) score += 8;
    else if (originDist > 5) score -= 10;
    
    if (destDist < 2) score += 8;
    else if (destDist > 5) score -= 10;
    
    // Add some randomness to make it interesting
    score += Math.floor(Math.random() * 10) - 3;
    
    // Cap score between 0 and 100
    return Math.min(100, Math.max(0, score));
  };
  
  // Haversine formula to calculate distance between coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  };
  
  const deg2rad = (deg: number): number => {
    return deg * (Math.PI/180)
  };
  
  // Function to generate connection lines between riders and passengers
  const generateLines = () => {
    if (!containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLines: {start: {x: number, y: number}, end: {x: number, y: number}, quality: number}[] = [];
    
    riders.forEach((rider, riderIndex) => {
      passengers.forEach((passenger, passengerIndex) => {
        const riderEl = riderRefs.current[riderIndex];
        const passengerEl = passengerRefs.current[passengerIndex];
        
        if (riderEl && passengerEl) {
          const riderRect = riderEl.getBoundingClientRect();
          const passengerRect = passengerEl.getBoundingClientRect();
          
          const quality = calculateMatchScore(rider, passenger);
          
          // Only connect if the match quality is decent
          if (quality > 50) {
            const startX = (riderRect.left + riderRect.right) / 2 - containerRect.left;
            const startY = (riderRect.top + riderRect.bottom) / 2 - containerRect.top;
            const endX = (passengerRect.left + passengerRect.right) / 2 - containerRect.left;
            const endY = (passengerRect.top + passengerRect.bottom) / 2 - containerRect.top;
            
            newLines.push({
              start: { x: startX, y: startY },
              end: { x: endX, y: endY },
              quality
            });
          }
        }
      });
    });
    
    setLines(newLines);
  };
  
  // Setup the initial matches
  useEffect(() => {
    if (riders.length && passengers.length) {
      const calculatedMatches: MatchResult[] = [];
      
      riders.forEach(rider => {
        passengers.forEach(passenger => {
          const score = calculateMatchScore(rider, passenger);
          if (score > 50) {  // Only consider decent matches
            calculatedMatches.push({
              riderId: rider.id,
              passengerId: passenger.id,
              matchScore: score,
              status: 'pending'
            });
          }
        });
      });
      
      // Sort matches by score (highest first)
      calculatedMatches.sort((a, b) => b.matchScore - a.matchScore);
      setMatches(calculatedMatches);
    }
  }, [riders, passengers]);
  
  // Auto-play animation if enabled
  useEffect(() => {
    if (autoPlay && matches.length > 0 && step === 'idle') {
      // Start the animation after a short delay
      const timer = setTimeout(() => {
        setStep('matching');
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [autoPlay, matches, step]);
  
  // Animation sequence for the matching process
  useEffect(() => {
    if (step === 'matching' && matchIndex < matches.length) {
      const match = matches[matchIndex];
      
      // Set active rider and passenger
      setActiveRider(match.riderId);
      setActivePassenger(match.passengerId);
      
      // Update the lines between riders and passengers
      generateLines();
      
      // After a pause, mark this match as complete and move to the next
      const timer = setTimeout(() => {
        setMatches(prev => prev.map((m, i) => {
          if (i === matchIndex) {
            return { ...m, status: m.matchScore >= 70 ? 'matched' : 'rejected' };
          }
          return m;
        }));
        
        setMatchIndex(prev => prev + 1);
      }, 1200);
      
      return () => clearTimeout(timer);
    } else if (step === 'matching' && matchIndex >= matches.length) {
      // All matches processed, show results
      setStep('results');
      setAnimationComplete(true);
      
      if (onMatchComplete) {
        onMatchComplete(matches);
      }
    }
  }, [step, matchIndex, matches, onMatchComplete]);
  
  // Render connection lines
  const renderLines = () => {
    return lines.map((line, index) => {
      // Skip lines that don't connect the active rider and passenger
      if (step === 'matching') {
        const match = matches[matchIndex];
        if (!match) return null;
        
        const activeRiderIndex = riders.findIndex(r => r.id === match.riderId);
        const activePassengerIndex = passengers.findIndex(p => p.id === match.passengerId);
        
        const riderEl = riderRefs.current[activeRiderIndex];
        const passengerEl = passengerRefs.current[activePassengerIndex];
        
        if (!riderEl || !passengerEl) return null;
        
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (!containerRect) return null;
        
        const riderRect = riderEl.getBoundingClientRect();
        const passengerRect = passengerEl.getBoundingClientRect();
        
        const startX = (riderRect.left + riderRect.right) / 2 - containerRect.left;
        const startY = (riderRect.top + riderRect.bottom) / 2 - containerRect.top;
        const endX = (passengerRect.left + passengerRect.right) / 2 - containerRect.left;
        const endY = (passengerRect.top + passengerRect.bottom) / 2 - containerRect.top;
        
        // Color based on match quality
        const quality = match.matchScore;
        const colorClass = quality >= 90 ? 'stroke-green-500' : 
                          quality >= 70 ? 'stroke-primary' : 
                          quality >= 60 ? 'stroke-yellow-500' : 'stroke-red-500';
        
        return (
          <motion.path 
            key={`line-${index}-active`}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            d={`M ${startX} ${startY} L ${endX} ${endY}`}
            className={cn("fill-none", colorClass)}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray="0 10"
            style={{ filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.1))' }}
          />
        );
      }
      
      return null;
    });
  };
  
  // Restart the animation
  const restartAnimation = () => {
    setStep('idle');
    setMatchIndex(0);
    setActiveRider(null);
    setActivePassenger(null);
    setLines([]);
    setAnimationComplete(false);
    
    // Reset match statuses to pending
    setMatches(prev => prev.map(m => ({ ...m, status: 'pending' })));
    
    // Start the animation again after a short delay
    if (autoPlay) {
      setTimeout(() => {
        setStep('matching');
      }, 500);
    }
  };
  
  // Get the style class for a rider or passenger card based on the match
  const getCardClass = (id: number, type: 'rider' | 'passenger') => {
    if (step === 'matching') {
      const isActive = type === 'rider' ? id === activeRider : id === activePassenger;
      if (isActive) return 'ring-2 ring-primary shadow-lg shadow-primary/20';
    } else if (step === 'results') {
      // Find if this entity is in a successful match
      const entityMatches = matches.filter(m => 
        type === 'rider' ? m.riderId === id : m.passengerId === id
      );
      
      const hasSuccessfulMatch = entityMatches.some(m => m.status === 'matched');
      const hasRejectedMatch = entityMatches.some(m => m.status === 'rejected');
      
      if (hasSuccessfulMatch) return 'ring-2 ring-green-400 shadow-lg shadow-green-400/20';
      if (hasRejectedMatch && !hasSuccessfulMatch) return 'ring-2 ring-red-400 shadow-lg shadow-red-400/20';
    }
    
    return '';
  };
  
  // Render matched pairs in the results view
  const renderMatchResults = () => {
    const successfulMatches = matches.filter(m => m.status === 'matched');
    
    return (
      <div className="space-y-4 mt-6">
        <h3 className="text-lg font-medium text-center">Match Results</h3>
        <div className="grid gap-4">
          {successfulMatches.length > 0 ? (
            successfulMatches.map((match, index) => {
              const rider = riders.find(r => r.id === match.riderId);
              const passenger = passengers.find(p => p.id === match.passengerId);
              
              if (!rider || !passenger) return null;
              
              return (
                <motion.div
                  key={`match-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow p-4 border border-green-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{passenger.name}</div>
                        <div className="text-sm text-muted-foreground">{passenger.origin.name} → {passenger.destination.name}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Badge className="bg-green-100 text-green-800 mr-2">
                        {match.matchScore}% Match
                      </Badge>
                      <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-2">
                      <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <Car className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{rider.name}</div>
                        <div className="text-sm text-muted-foreground">
                          <span className="text-yellow-500">★</span> {rider.rating} • ₹{rider.price}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{rider.departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <Users className="h-4 w-4 ml-2" />
                      <span>{rider.seatsAvailable} seats</span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No matches found. Try adjusting your search criteria.
            </div>
          )}
        </div>
        
        <div className="flex justify-center mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={restartAnimation}
            className="px-4 py-2 bg-primary text-white rounded-md shadow hover:shadow-lg"
          >
            Run Matching Again
          </motion.button>
        </div>
      </div>
    );
  };
  
  return (
    <div className={cn("relative border rounded-lg p-4 bg-background overflow-hidden", className)} ref={containerRef}>
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* Riders column */}
        <div className="flex-1">
          <h3 className="text-center font-medium mb-4 flex items-center justify-center gap-2">
            <Car className="h-4 w-4" />
            <span>Available Riders</span>
            <Badge variant="outline">{riders.length}</Badge>
          </h3>
          
          <div className="space-y-3">
            {riders.map((rider, index) => (
              <motion.div
                key={`rider-${rider.id}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                ref={el => riderRefs.current[index] = el}
                className={cn(
                  "p-3 border rounded-lg cursor-pointer transition-all duration-300 hover:shadow",
                  getCardClass(rider.id, 'rider')
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <Car className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{rider.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center">
                        <span className="text-yellow-500 mr-1">★</span> {rider.rating}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">₹{rider.price}</div>
                    <div className="text-xs text-muted-foreground">{rider.seatsAvailable} seats</div>
                  </div>
                </div>
                
                <div className="mt-2 text-xs flex justify-between text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{rider.origin.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{rider.departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Middle section with connection lines */}
        <div className="flex-0 relative flex items-center justify-center">
          <div className="p-4 bg-primary/5 rounded-full">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-10 h-10 border-2 border-primary/50 border-dashed rounded-full flex items-center justify-center">
                <motion.div
                  animate={{ scale: step === 'matching' ? [1, 1.1, 1] : 1 }}
                  transition={{ duration: 1.5, repeat: step === 'matching' ? Infinity : 0 }}
                  className="w-6 h-6 bg-primary/30 rounded-full flex items-center justify-center"
                >
                  <div className="w-3 h-3 bg-primary rounded-full" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Passengers column */}
        <div className="flex-1">
          <h3 className="text-center font-medium mb-4 flex items-center justify-center gap-2">
            <User className="h-4 w-4" />
            <span>Passengers Looking for Rides</span>
            <Badge variant="outline">{passengers.length}</Badge>
          </h3>
          
          <div className="space-y-3">
            {passengers.map((passenger, index) => (
              <motion.div
                key={`passenger-${passenger.id}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                ref={el => passengerRefs.current[index] = el}
                className={cn(
                  "p-3 border rounded-lg cursor-pointer transition-all duration-300 hover:shadow",
                  getCardClass(passenger.id, 'passenger')
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{passenger.name}</div>
                      <div className="flex gap-1 mt-1">
                        {passenger.preferences.slice(0, 2).map((pref, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs px-1 py-0">
                            {pref}
                          </Badge>
                        ))}
                        {passenger.preferences.length > 2 && (
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            +{passenger.preferences.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-2 text-xs flex justify-between text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{passenger.origin.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{passenger.departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* SVG layer for connection lines */}
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
        <g>
          <AnimatePresence>
            {renderLines()}
          </AnimatePresence>
        </g>
      </svg>
      
      {/* Status bar */}
      <div className="p-3 mt-4 bg-primary/5 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">
            {step === 'idle' && 'Ready to start matching...'}
            {step === 'matching' && `Matching rider with passenger... (${matchIndex + 1}/${matches.length})`}
            {step === 'results' && `Found ${matches.filter(m => m.status === 'matched').length} matches!`}
          </div>
          
          {step === 'idle' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStep('matching')}
              className="px-3 py-1 text-sm bg-primary text-white rounded-md"
            >
              Start Matching
            </motion.button>
          )}
          
          {step === 'matching' && (
            <div className="flex h-2 w-40 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${(matchIndex / Math.max(1, matches.length)) * 100}%` }}
                className="bg-primary"
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Results section */}
      <AnimatePresence>
        {step === 'results' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderMatchResults()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}