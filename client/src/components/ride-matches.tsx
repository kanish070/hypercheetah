import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type Ride } from "@shared/schema";
import { Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";

interface RideMatchesProps {
  matches: Ride[];
  onSelectMatch: (ride: Ride) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function RideMatches({ matches, onSelectMatch }: RideMatchesProps) {
  if (matches.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-muted border-dashed">
          <CardContent className="p-6 text-center text-muted-foreground">
            <p className="mb-2">No matching rides found.</p>
            <p className="text-sm">Try adjusting your route or wait for new riders.</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      {matches.map((match) => (
        <motion.div key={match.id} variants={item}>
          <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
            <CardHeader className="p-4 bg-primary/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium">
                    {Math.round(
                      window.google.maps.geometry.spherical.computeLength(
                        match.route.waypoints.map(
                          (p) => new window.google.maps.LatLng(p.lat, p.lng)
                        )
                      ) / 1000
                    )} km shared route
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    {new Date(match.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-medium">Starting Point</div>
                  <div className="text-sm text-muted-foreground">
                    {match.route.start.lat.toFixed(4)}, {match.route.start.lng.toFixed(4)}
                  </div>
                </div>
                <Button
                  variant="secondary"
                  className="transition-all duration-300 hover:scale-105"
                  onClick={() => onSelectMatch(match)}
                >
                  Select Match
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}