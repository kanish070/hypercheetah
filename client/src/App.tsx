import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AppNavigation } from "@/components/app-navigation";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Passenger from "@/pages/passenger";
import Rider from "@/pages/rider";
import Social from "@/pages/social";
import Profile from "@/pages/profile";
import ProfilePage from "@/pages/profile-page";
import UserProfile from "@/pages/user-profile";
import EcoTracker from "@/pages/eco-tracker";
import { SavedLocationsPage } from "@/pages/saved-locations-page";
import ComfortPreferencesPage from "@/pages/comfort-preferences-page";
import AuthPage from "@/pages/auth-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <ProtectedRoute path="/passenger" component={Passenger} />
      <ProtectedRoute path="/rider" component={Rider} />
      <ProtectedRoute path="/social" component={Social} />
      <ProtectedRoute path="/profile" component={UserProfile} />
      <ProtectedRoute path="/profile-old" component={Profile} />
      <ProtectedRoute path="/profile-v2" component={ProfilePage} />
      <ProtectedRoute path="/eco-tracker" component={EcoTracker} />
      <ProtectedRoute path="/locations" component={SavedLocationsPage} />
      <ProtectedRoute path="/preferences" component={ComfortPreferencesPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <AppNavigation />
          <main className="flex-1">
            <Router />
          </main>
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;