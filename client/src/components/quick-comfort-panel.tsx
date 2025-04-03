import { useState } from "react";
import { ComfortPreferences } from "@shared/schema";
import { useComfortPreferences } from "@/hooks/use-comfort-preferences";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ComfortPreferencesForm } from "./comfort-preferences-form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { 
  ThermometerIcon, 
  MusicIcon, 
  MessageCircleIcon, 
  CigaretteIcon,
  WindIcon,
  BedIcon,
  TimerIcon,
  BabyIcon
} from "lucide-react";

type QuickComfortPanelProps = {
  rideId?: number;
  onApply?: (preferences: ComfortPreferences) => void;
  simplified?: boolean;
};

export function QuickComfortPanel({ 
  rideId, 
  onApply,
  simplified = true 
}: QuickComfortPanelProps) {
  const { preferences, getDefaultPreferences, updatePreferencesMutation } = useComfortPreferences();
  const [showFullForm, setShowFullForm] = useState(false);
  const [currentPreferences, setCurrentPreferences] = useState<ComfortPreferences>(
    preferences || getDefaultPreferences()
  );

  // Handle quick temperature change
  const handleTemperatureChange = (value: number[]) => {
    setCurrentPreferences({
      ...currentPreferences,
      temperature: value[0]
    });
  };

  // Handle toggle switches
  const handleToggleChange = (field: keyof ComfortPreferences, value: boolean) => {
    setCurrentPreferences({
      ...currentPreferences,
      [field]: value
    });
  };

  // Apply the current preferences
  const applyPreferences = () => {
    if (onApply) {
      onApply(currentPreferences);
    } else {
      updatePreferencesMutation.mutate(currentPreferences);
    }
  };

  // Save as defaults and apply
  const saveAsDefaultAndApply = () => {
    updatePreferencesMutation.mutate(currentPreferences);
    if (onApply) {
      onApply(currentPreferences);
    }
  };

  if (showFullForm) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => setShowFullForm(false)}>
          Back to Quick Settings
        </Button>
        <ComfortPreferencesForm 
          initialValues={currentPreferences}
          rideId={rideId}
          onSave={(prefs) => {
            setCurrentPreferences(prefs);
            setShowFullForm(false);
            if (onApply) {
              onApply(prefs);
            }
          }}
        />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>Comfort Preferences</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setShowFullForm(true)}>
            All Settings
          </Button>
        </div>
        <CardDescription>
          Quick adjustments for your ride
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Temperature */}
          <div className="flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ThermometerIcon className="h-5 w-5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>Temperature</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex-1">
              <Slider 
                value={[currentPreferences.temperature || 22]}
                min={16}
                max={28}
                step={1}
                onValueChange={handleTemperatureChange}
              />
            </div>
            <span className="w-9 text-center">{currentPreferences.temperature || 22}°C</span>
          </div>
          
          {/* Air Conditioning */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <WindIcon className="h-5 w-5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>Air Conditioning</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span>A/C</span>
            </div>
            <Switch 
              checked={currentPreferences.airConditioning !== 'off'}
              onCheckedChange={(checked) => 
                setCurrentPreferences({
                  ...currentPreferences, 
                  airConditioning: checked ? 'auto' : 'off'
                })
              }
            />
          </div>
          
          {/* Music */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <MusicIcon className="h-5 w-5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>Music</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span>Music</span>
            </div>
            <Switch 
              checked={currentPreferences.music?.volume !== 0}
              onCheckedChange={(checked) => 
                setCurrentPreferences({
                  ...currentPreferences, 
                  music: {
                    ...currentPreferences.music,
                    volume: checked ? 5 : 0
                  }
                })
              }
            />
          </div>

          {/* Smoking */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CigaretteIcon className="h-5 w-5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>Allow Smoking</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span>Smoking</span>
            </div>
            <Switch 
              checked={currentPreferences.smoking}
              onCheckedChange={(checked) => 
                handleToggleChange('smoking', checked)
              }
            />
          </div>

          {/* Conversation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <MessageCircleIcon className="h-5 w-5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>Conversation Mode</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span>Chat</span>
            </div>
            <Switch 
              checked={currentPreferences.conversation === 'chatty'}
              onCheckedChange={(checked) => 
                setCurrentPreferences({
                  ...currentPreferences, 
                  conversation: checked ? 'chatty' : 'quiet'
                })
              }
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-3">
        <Button variant="outline" onClick={saveAsDefaultAndApply}>
          Save as Default
        </Button>
        <Button onClick={applyPreferences}>
          Apply to This Ride
        </Button>
      </CardFooter>
    </Card>
  );
}