import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type Ride } from "@shared/schema";
import { Clock, MapPin } from "lucide-react";

interface RideMatchesProps {
  matches: Ride[];
  onSelectMatch: (ride: Ride) => void;
}

export function RideMatches({ matches, onSelectMatch }: RideMatchesProps) {
  if (matches.length === 0) {
    return (
      <Card className="bg-muted">
        <CardContent className="p-6 text-center text-muted-foreground">
          No matching rides found. Try adjusting your route or wait for new riders.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <Card key={match.id} className="overflow-hidden">
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
                onClick={() => onSelectMatch(match)}
              >
                Select Match
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
