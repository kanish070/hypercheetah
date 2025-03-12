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
    // In a real app, get this from environment variables
    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
    loadGoogleMaps(GOOGLE_MAPS_API_KEY).catch(console.error);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
