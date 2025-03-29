import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ride } from "@shared/schema";
import { formatDistance, formatTime, getDistanceInKm, getEstimatedTime } from "@/lib/maps";
import { Clock, MapPin, Users } from "lucide-react";

interface RideMatchesProps {
  matches: Ride[];
  onSelectMatch: (ride: Ride) => void;
}

export function RideMatches({ matches, onSelectMatch }: RideMatchesProps) {
  if (!matches.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No matches found. Try adjusting your route or try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Matches ({matches.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {matches.map((ride) => (
            <div key={ride.id} className="p-4 hover:bg-accent transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">
                    {ride.type === "offer" ? "Ride Offer" : "Ride Request"}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Users className="h-4 w-4 mr-1" />
                    <span>
                      {ride.type === "offer" 
                        ? `${ride.availableSeats} seats available` 
                        : "1 passenger"}
                    </span>
                  </div>
                </div>
                {ride.price !== null && (
                  <Badge variant="outline" className="ml-2">
                    ${ride.price.toFixed(2)}
                  </Badge>
                )}
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-start gap-1">
                  <MapPin className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                  <div className="text-sm">
                    <p>Pick-up: Location name for {ride.route.start.lat.toFixed(2)}, {ride.route.start.lng.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-1">
                  <MapPin className="h-4 w-4 text-red-500 mt-1 shrink-0" />
                  <div className="text-sm">
                    <p>Drop-off: Location name for {ride.route.end.lat.toFixed(2)}, {ride.route.end.lng.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>
                      {formatTime(getEstimatedTime(ride.route.start, ride.route.end))}
                    </span>
                  </div>
                  <div>
                    {formatDistance(getDistanceInKm(ride.route.start, ride.route.end))}
                  </div>
                </div>
                <Button size="sm" onClick={() => onSelectMatch(ride)}>
                  Select
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}