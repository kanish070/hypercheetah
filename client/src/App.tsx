import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Passenger from "@/pages/passenger";
import Rider from "@/pages/rider";
import Social from "@/pages/social";
import Profile from "@/pages/profile";
import EcoTracker from "@/pages/eco-tracker";
import { SavedLocationsPage } from "@/pages/saved-locations-page";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/passenger" component={Passenger} />
      <Route path="/rider" component={Rider} />
      <Route path="/social" component={Social} />
      <Route path="/profile" component={Profile} />
      <Route path="/eco-tracker" component={EcoTracker} />
      <Route path="/locations" component={SavedLocationsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;