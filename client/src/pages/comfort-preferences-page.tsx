import { ComfortPreferencesForm } from "@/components/comfort-preferences-form";
import { useComfortPreferences } from "@/hooks/use-comfort-preferences";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function ComfortPreferencesPage() {
  const { user } = useAuth();
  const { preferences, isLoading, error, updatePreferencesMutation } = useComfortPreferences();

  if (!user) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
          <h1 className="text-2xl font-bold">Sign In Required</h1>
          <p className="text-muted-foreground text-center max-w-md">
            You need to sign in to access and manage your ride comfort preferences.
          </p>
          <Button asChild>
            <Link href="/auth">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="bg-destructive/10 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-destructive">Error loading preferences</h2>
          <p className="mt-2">{error.message}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Ride Comfort Preferences</h1>
        <p className="text-muted-foreground mt-2">
          Customize your default preferences for all rides. These settings will be applied automatically
          unless you specify different preferences for a specific ride.
        </p>
      </div>

      <div className="grid gap-8">
        <ComfortPreferencesForm 
          initialValues={preferences} 
          isSaving={updatePreferencesMutation.isPending}
        />

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">About Comfort Preferences</h2>
          <p>
            Your comfort preferences will be remembered and automatically applied to all your future rides.
            You can always override these settings for individual rides.
          </p>
          
          <h3 className="text-lg font-medium mt-4">Benefits:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Save time by not having to set preferences for each ride</li>
            <li>Enjoy a consistent experience across all your journeys</li>
            <li>Drivers can prepare for your preferences before picking you up</li>
            <li>Increase your overall satisfaction with the service</li>
          </ul>

          <p className="text-sm text-muted-foreground mt-4">
            Note: Some preferences may not be available with all vehicle types or drivers.
            The app will always try to match you with the best available options.
          </p>
        </div>
      </div>
    </div>
  );
}