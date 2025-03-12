import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Passenger from "@/pages/passenger";
import Rider from "@/pages/rider";
import { useEffect } from "react";
import { loadGoogleMaps } from "./lib/maps";
import { toast } from "@/hooks/use-toast";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/passenger" component={Passenger} />
      <Route path="/rider" component={Rider} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    const initMaps = async () => {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          throw new Error("Google Maps API key is not configured");
        }
        await loadGoogleMaps(apiKey);
      } catch (error) {
        console.error("Failed to initialize Google Maps:", error);
        toast({
          title: "Maps Error",
          description: "Failed to load Google Maps. Some features may not work correctly.",
          variant: "destructive",
        });
      }
    };

    initMaps();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;