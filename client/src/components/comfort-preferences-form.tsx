import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ComfortPreferences } from "@shared/schema";
import { useComfortPreferences } from "@/hooks/use-comfort-preferences";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Form schema for comfort preferences
const comfortPreferencesSchema = z.object({
  temperature: z.number().min(16).max(28).optional(),
  music: z.object({
    genre: z.string().optional(),
    volume: z.number().min(0).max(10).optional(),
    allowDriverChoice: z.boolean().optional(),
  }).optional(),
  conversation: z.string().optional(),
  seatingPreference: z.string().optional(),
  smoking: z.boolean().optional(),
  petsAllowed: z.boolean().optional(),
  airConditioning: z.string().optional(),
  windowPreference: z.string().optional(),
  luggageSpace: z.number().optional(),
  accessibility: z.array(z.string()).optional(),
  childSeat: z.string().optional(),
  additionalStops: z.boolean().optional(),
  maxWaitTime: z.number().optional(),
  routePreference: z.string().optional(),
  paymentMethod: z.string().optional(),
  foodDrink: z.boolean().optional(),
  phoneCharger: z.array(z.string()).optional(),
  safetyPreferences: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

type ComfortPreferencesFormProps = {
  initialValues?: ComfortPreferences;
  rideId?: number;
  onSave?: (preferences: ComfortPreferences) => void;
  isSaving?: boolean;
  simplified?: boolean; // Show simplified form for quick settings
};

export function ComfortPreferencesForm({
  initialValues,
  rideId,
  onSave,
  isSaving = false,
  simplified = false,
}: ComfortPreferencesFormProps) {
  const { preferences, updatePreferencesMutation, updateRidePreferencesMutation } = useComfortPreferences();
  
  // For full form vs. quick settings toggle
  const [showDetailedSettings, setShowDetailedSettings] = useState(!simplified);

  // Use either provided initial values, or fallback to current user preferences
  const defaultValues = initialValues || preferences || {};

  // Define the form with validation
  const form = useForm<ComfortPreferences>({
    resolver: zodResolver(comfortPreferencesSchema),
    defaultValues,
  });

  // Handle form submission
  const onSubmit = (values: ComfortPreferences) => {
    if (onSave) {
      // Use custom save handler if provided
      onSave(values);
    } else if (rideId) {
      // Save as ride-specific preferences
      updateRidePreferencesMutation.mutate({ rideId, preferences: values });
    } else {
      // Save as user default preferences
      updatePreferencesMutation.mutate(values);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Ride Comfort Preferences</CardTitle>
        <CardDescription>
          Customize your ride experience. These preferences will be remembered for future rides.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {simplified && (
              <div className="flex justify-end mb-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDetailedSettings(!showDetailedSettings)}
                >
                  {showDetailedSettings ? "Show Quick Settings" : "Show All Settings"}
                </Button>
              </div>
            )}

            {/* Quick settings (always shown) */}
            <div className="space-y-4">
              {/* Temperature */}
              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperature (°C)</FormLabel>
                    <div className="flex flex-col space-y-2">
                      <Slider
                        value={[field.value || 22]}
                        min={16}
                        max={28}
                        step={1}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Cool (16°C)</span>
                        <span>Moderate (22°C)</span>
                        <span>Warm (28°C)</span>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Smoking */}
              <FormField
                control={form.control}
                name="smoking"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Allow Smoking</FormLabel>
                      <FormDescription>
                        Do you allow smoking in the vehicle?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Air Conditioning */}
              <FormField
                control={form.control}
                name="airConditioning"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Air Conditioning</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select AC preference" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="off">Off</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Detailed settings (conditionally shown) */}
            {showDetailedSettings && (
              <div className="space-y-4 pt-4 border-t">
                {/* Music preferences */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Music Preferences</h3>
                  
                  {/* Music Genre */}
                  <FormField
                    control={form.control}
                    name="music.genre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Music Genre</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select music genre" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pop">Pop</SelectItem>
                            <SelectItem value="rock">Rock</SelectItem>
                            <SelectItem value="classical">Classical</SelectItem>
                            <SelectItem value="jazz">Jazz</SelectItem>
                            <SelectItem value="hip_hop">Hip Hop</SelectItem>
                            <SelectItem value="bollywood">Bollywood</SelectItem>
                            <SelectItem value="instrumental">Instrumental</SelectItem>
                            <SelectItem value="driver_choice">Driver's Choice</SelectItem>
                            <SelectItem value="no_music">No Music</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Music Volume */}
                  <FormField
                    control={form.control}
                    name="music.volume"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Music Volume</FormLabel>
                        <div className="flex flex-col space-y-2">
                          <Slider
                            value={[field.value || 5]}
                            min={0}
                            max={10}
                            step={1}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Off</span>
                            <span>Quiet</span>
                            <span>Medium</span>
                            <span>Loud</span>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Allow Driver Choice */}
                  <FormField
                    control={form.control}
                    name="music.allowDriverChoice"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Allow Driver's Music Choice</FormLabel>
                          <FormDescription>
                            Allow the driver to choose music if your preference isn't available
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Conversation Preference */}
                <FormField
                  control={form.control}
                  name="conversation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conversation Preference</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select conversation preference" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="chatty">Chatty - I enjoy conversation</SelectItem>
                          <SelectItem value="quiet">Quiet - I prefer minimal talking</SelectItem>
                          <SelectItem value="professional">Professional - Business conversation only</SelectItem>
                          <SelectItem value="minimal">Minimal - Only necessary communication</SelectItem>
                          <SelectItem value="driver_choice">Driver's Choice</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Seating Preference */}
                <FormField
                  control={form.control}
                  name="seatingPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seating Preference</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select seating preference" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="front">Front Passenger Seat</SelectItem>
                          <SelectItem value="back_left">Back Left</SelectItem>
                          <SelectItem value="back_right">Back Right</SelectItem>
                          <SelectItem value="back_middle">Back Middle</SelectItem>
                          <SelectItem value="no_preference">No Preference</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Pets Allowed */}
                <FormField
                  control={form.control}
                  name="petsAllowed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Allow Pets</FormLabel>
                        <FormDescription>
                          Are you comfortable traveling with pets?
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Window Preference */}
                <FormField
                  control={form.control}
                  name="windowPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Window Preference</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select window preference" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="closed">Closed</SelectItem>
                          <SelectItem value="cracked">Slightly Open</SelectItem>
                          <SelectItem value="half_open">Half Open</SelectItem>
                          <SelectItem value="fully_open">Fully Open</SelectItem>
                          <SelectItem value="driver_choice">Driver's Choice</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Additional Stops */}
                <FormField
                  control={form.control}
                  name="additionalStops"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Additional Stops</FormLabel>
                        <FormDescription>
                          Are you okay with the driver making additional stops?
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Maximum Wait Time */}
                <FormField
                  control={form.control}
                  name="maxWaitTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Wait Time (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        How long are you willing to wait for your driver?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Route Preference */}
                <FormField
                  control={form.control}
                  name="routePreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Route Preference</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select route preference" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fastest">Fastest Route</SelectItem>
                          <SelectItem value="scenic">Scenic Route</SelectItem>
                          <SelectItem value="least_traffic">Least Traffic</SelectItem>
                          <SelectItem value="highway">Highway Preferred</SelectItem>
                          <SelectItem value="no_highway">Avoid Highways</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone Charger Types */}
                <FormField
                  control={form.control}
                  name="phoneCharger"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Charger Types Needed</FormLabel>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="usb_c"
                            checked={field.value?.includes("usb_c")}
                            onCheckedChange={(checked) => {
                              const current = field.value || [];
                              if (checked) {
                                field.onChange([...current, "usb_c"]);
                              } else {
                                field.onChange(current.filter(v => v !== "usb_c"));
                              }
                            }}
                          />
                          <label htmlFor="usb_c">USB-C</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="lightning"
                            checked={field.value?.includes("lightning")}
                            onCheckedChange={(checked) => {
                              const current = field.value || [];
                              if (checked) {
                                field.onChange([...current, "lightning"]);
                              } else {
                                field.onChange(current.filter(v => v !== "lightning"));
                              }
                            }}
                          />
                          <label htmlFor="lightning">Lightning (iPhone)</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="micro_usb"
                            checked={field.value?.includes("micro_usb")}
                            onCheckedChange={(checked) => {
                              const current = field.value || [];
                              if (checked) {
                                field.onChange([...current, "micro_usb"]);
                              } else {
                                field.onChange(current.filter(v => v !== "micro_usb"));
                              }
                            }}
                          />
                          <label htmlFor="micro_usb">Micro USB</label>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any other preferences or requirements..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <CardFooter className="flex justify-between px-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset(defaultValues)}
              >
                Reset
              </Button>
              <Button type="submit" disabled={isSaving || updatePreferencesMutation.isPending || updateRidePreferencesMutation.isPending}>
                {isSaving || updatePreferencesMutation.isPending || updateRidePreferencesMutation.isPending
                  ? "Saving..."
                  : "Save Preferences"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}