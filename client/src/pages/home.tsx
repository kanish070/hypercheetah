import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserIcon, Car, Zap } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const [_, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">
              HyperCheetah
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Lightning-fast rides with smart route matching
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="relative overflow-hidden group">
            <CardContent className="p-6">
              <div className="mb-4">
                <UserIcon className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Passenger Mode</h2>
              <p className="text-muted-foreground mb-6">
                Find rides along your route and save on travel costs
              </p>
              <Button
                className="w-full"
                size="lg"
                onClick={() => setLocation("/passenger")}
              >
                Ride as Passenger
              </Button>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group">
            <CardContent className="p-6">
              <div className="mb-4">
                <Car className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Rider Mode</h2>
              <p className="text-muted-foreground mb-6">
                Offer rides and share your journey with others
              </p>
              <Button
                className="w-full"
                size="lg"
                onClick={() => setLocation("/rider")}
              >
                Drive as Rider
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}