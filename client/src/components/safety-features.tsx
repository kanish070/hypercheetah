import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Textarea 
} from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  ShieldAlert, Users, BadgeCheck, Video, Phone, MessageSquare, Share2, User, 
  Clock, Calendar, Lock, Shield, AlertTriangle, CheckCircle2, FileText, 
  UserCheck, Heart, BellRing, PhoneCall, Star, Fingerprint, Share, Info
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

interface EmergencyContact {
  id: number;
  name: string;
  relationship: string;
  phone: string;
}

interface RideRecording {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  status: 'active' | 'completed';
  sharedWith: string[];
}

interface SafetyFeaturesProps {
  userId: number;
  isVerified?: boolean;
  verificationProgress?: number;
}

export function SafetyFeatures({ userId, isVerified = false, verificationProgress = 0 }: SafetyFeaturesProps) {
  // States
  const [activeTab, setActiveTab] = useState('emergency');
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { id: 1, name: "John Smith", relationship: "Family", phone: "(555) 123-4567" },
    { id: 2, name: "Sarah Wilson", relationship: "Friend", phone: "(555) 987-6543" }
  ]);
  const [newContact, setNewContact] = useState<Omit<EmergencyContact, 'id'>>({
    name: "",
    relationship: "",
    phone: ""
  });
  const [shareLocationWith, setShareLocationWith] = useState<string[]>([]);
  const [autoRecordRide, setAutoRecordRide] = useState(true);
  const [enableEmergencyAlerts, setEnableEmergencyAlerts] = useState(true);
  const [shareRideDetails, setShareRideDetails] = useState(true);
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);
  const [emergencyDescription, setEmergencyDescription] = useState("");
  const [emergencyType, setEmergencyType] = useState("medical");
  const [rideRecordings, setRideRecordings] = useState<RideRecording[]>([
    {
      id: 1,
      date: "2025-03-27",
      startTime: "09:15 AM",
      endTime: "09:48 AM",
      status: "completed",
      sharedWith: ["John Smith"]
    },
    {
      id: 2,
      date: "2025-03-29",
      startTime: "02:30 PM",
      endTime: "03:05 PM",
      status: "completed",
      sharedWith: []
    }
  ]);
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState(false);
  
  // Handlers
  const handleAddEmergencyContact = () => {
    if (!newContact.name || !newContact.phone) {
      toast({
        title: "Missing information",
        description: "Please provide a name and phone number for your emergency contact.",
        variant: "destructive"
      });
      return;
    }
    
    const newId = emergencyContacts.length > 0 
      ? Math.max(...emergencyContacts.map(c => c.id)) + 1 
      : 1;
    
    setEmergencyContacts([...emergencyContacts, { ...newContact, id: newId }]);
    setNewContact({ name: "", relationship: "", phone: "" });
    
    toast({
      title: "Contact added",
      description: `${newContact.name} has been added to your emergency contacts.`
    });
  };
  
  const handleRemoveContact = (id: number) => {
    setEmergencyContacts(emergencyContacts.filter(contact => contact.id !== id));
    toast({
      title: "Contact removed",
      description: "Emergency contact has been removed successfully."
    });
  };
  
  const handleShareLocationChange = (contact: string) => {
    if (shareLocationWith.includes(contact)) {
      setShareLocationWith(shareLocationWith.filter(c => c !== contact));
    } else {
      setShareLocationWith([...shareLocationWith, contact]);
    }
  };
  
  const handleEmergencyAlert = () => {
    // In a real app, this would trigger actual emergency protocols
    toast({
      title: "Emergency Alert Sent",
      description: "Your emergency contacts have been notified with your location and situation.",
      variant: "destructive"
    });
    setIsEmergencyDialogOpen(false);
  };
  
  const handleStartVerification = () => {
    // In a real app, this would initiate the verification process
    toast({
      title: "Verification Started",
      description: "Please follow the steps to complete your identity verification."
    });
    setIsVerificationDialogOpen(false);
  };
  
  const handleShareRideRecording = (recordingId: number) => {
    // In a real app, this would open a sharing dialog
    toast({
      title: "Sharing Options",
      description: "You can now select contacts to share this ride recording with."
    });
  };
  
  const handleDeleteRideRecording = (recordingId: number) => {
    setRideRecordings(rideRecordings.filter(recording => recording.id !== recordingId));
    toast({
      title: "Recording deleted",
      description: "The ride recording has been deleted successfully."
    });
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-xl">
          <Shield className="h-5 w-5 mr-2 text-primary" />
          Safety & Security Center
        </CardTitle>
        <CardDescription>
          Manage your safety features, emergency contacts, and ride security
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="emergency">
              <ShieldAlert className="h-4 w-4 mr-2 md:mr-1" />
              <span className="hidden md:inline">Emergency</span>
            </TabsTrigger>
            <TabsTrigger value="verification">
              <BadgeCheck className="h-4 w-4 mr-2 md:mr-1" />
              <span className="hidden md:inline">Verification</span>
            </TabsTrigger>
            <TabsTrigger value="recording">
              <Video className="h-4 w-4 mr-2 md:mr-1" />
              <span className="hidden md:inline">Recording</span>
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Shield className="h-4 w-4 mr-2 md:mr-1" />
              <span className="hidden md:inline">Settings</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Emergency Contacts Tab */}
          <TabsContent value="emergency" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Emergency Contacts</h3>
              
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setIsEmergencyDialogOpen(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Emergency Alert
              </Button>
            </div>
            
            <Alert className="bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Important</AlertTitle>
              <AlertDescription className="text-amber-700">
                Emergency contacts will be notified with your location and ride details if you trigger an emergency alert.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              {emergencyContacts.map(contact => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="relative">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="absolute top-2 right-2 h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveContact(contact.id)}
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </Button>
                    
                    <CardContent className="p-4 pt-3">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="ml-3 flex-1">
                          <div className="font-medium">{contact.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Phone className="h-3.5 w-3.5 mr-1" />
                            {contact.phone}
                          </div>
                          <div className="flex items-center mt-1">
                            <Badge variant="outline" className="mr-2 text-xs">
                              {contact.relationship}
                            </Badge>
                            
                            <div className="flex items-center ml-auto">
                              <Label className="text-xs flex items-center mr-2">
                                <span className="mr-2">Share location</span>
                                <Switch 
                                  checked={shareLocationWith.includes(contact.name)}
                                  onCheckedChange={() => handleShareLocationChange(contact.name)}
                                />
                              </Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              
              {emergencyContacts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p>No emergency contacts added yet.</p>
                </div>
              )}
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-2">Add New Emergency Contact</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="contact-name">Name</Label>
                  <Input 
                    id="contact-name" 
                    placeholder="Contact name" 
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="contact-relation">Relationship</Label>
                  <Select 
                    value={newContact.relationship}
                    onValueChange={(value) => setNewContact({ ...newContact, relationship: value })}
                  >
                    <SelectTrigger id="contact-relation">
                      <SelectValue placeholder="Select relation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Family">Family</SelectItem>
                      <SelectItem value="Friend">Friend</SelectItem>
                      <SelectItem value="Partner">Partner</SelectItem>
                      <SelectItem value="Relative">Relative</SelectItem>
                      <SelectItem value="Colleague">Colleague</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="contact-phone">Phone Number</Label>
                  <Input 
                    id="contact-phone" 
                    placeholder="(555) 123-4567" 
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  />
                </div>
              </div>
              
              <Button className="mt-3 w-full" onClick={handleAddEmergencyContact}>
                Add Emergency Contact
              </Button>
            </div>
          </TabsContent>
          
          {/* Verification Tab */}
          <TabsContent value="verification" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Identity Verification</h3>
              
              <Badge 
                variant={isVerified ? "default" : "outline"}
                className={isVerified ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
              >
                {isVerified ? (
                  <span className="flex items-center">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    Verified
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Info className="h-3.5 w-3.5 mr-1" />
                    Not Verified
                  </span>
                )}
              </Badge>
            </div>
            
            {isVerified ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Identity Verified</AlertTitle>
                <AlertDescription className="text-green-700">
                  Your identity has been verified. This helps us ensure a safe community for all users.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Verification Recommended</AlertTitle>
                <AlertDescription className="text-blue-700">
                  Verify your identity to unlock all safety features and build trust with ride partners.
                </AlertDescription>
              </Alert>
            )}
            
            {!isVerified && (
              <Card className="border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Complete Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Verification Progress</span>
                        <span className="text-sm">{verificationProgress}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${verificationProgress}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className={`h-5 w-5 rounded-full mr-2 flex items-center justify-center ${verificationProgress >= 20 ? 'bg-green-100' : 'bg-gray-100'}`}>
                          {verificationProgress >= 20 ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                          ) : (
                            <span className="text-xs text-gray-500">1</span>
                          )}
                        </div>
                        <span className={`text-sm ${verificationProgress >= 20 ? 'text-green-700' : 'text-gray-700'}`}>Basic Profile Information</span>
                      </div>
                      
                      <div className="flex items-center">
                        <div className={`h-5 w-5 rounded-full mr-2 flex items-center justify-center ${verificationProgress >= 40 ? 'bg-green-100' : 'bg-gray-100'}`}>
                          {verificationProgress >= 40 ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                          ) : (
                            <span className="text-xs text-gray-500">2</span>
                          )}
                        </div>
                        <span className={`text-sm ${verificationProgress >= 40 ? 'text-green-700' : 'text-gray-700'}`}>Email Verification</span>
                      </div>
                      
                      <div className="flex items-center">
                        <div className={`h-5 w-5 rounded-full mr-2 flex items-center justify-center ${verificationProgress >= 60 ? 'bg-green-100' : 'bg-gray-100'}`}>
                          {verificationProgress >= 60 ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                          ) : (
                            <span className="text-xs text-gray-500">3</span>
                          )}
                        </div>
                        <span className={`text-sm ${verificationProgress >= 60 ? 'text-green-700' : 'text-gray-700'}`}>Phone Verification</span>
                      </div>
                      
                      <div className="flex items-center">
                        <div className={`h-5 w-5 rounded-full mr-2 flex items-center justify-center ${verificationProgress >= 80 ? 'bg-green-100' : 'bg-gray-100'}`}>
                          {verificationProgress >= 80 ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                          ) : (
                            <span className="text-xs text-gray-500">4</span>
                          )}
                        </div>
                        <span className={`text-sm ${verificationProgress >= 80 ? 'text-green-700' : 'text-gray-700'}`}>ID Upload</span>
                      </div>
                      
                      <div className="flex items-center">
                        <div className={`h-5 w-5 rounded-full mr-2 flex items-center justify-center ${verificationProgress >= 100 ? 'bg-green-100' : 'bg-gray-100'}`}>
                          {verificationProgress >= 100 ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                          ) : (
                            <span className="text-xs text-gray-500">5</span>
                          )}
                        </div>
                        <span className={`text-sm ${verificationProgress >= 100 ? 'text-green-700' : 'text-gray-700'}`}>Review & Approval</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={() => setIsVerificationDialogOpen(true)}
                    >
                      <Fingerprint className="h-4 w-4 mr-2" />
                      Start Verification
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {isVerified && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <BadgeCheck className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Verification Complete</h4>
                        <p className="text-sm text-muted-foreground">Verified on March 15, 2025</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      View Certificate
                    </Button>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 p-3 rounded-md text-center">
                      <BadgeCheck className="h-5 w-5 mx-auto mb-1 text-green-600" />
                      <p className="text-sm font-medium">Identity</p>
                      <p className="text-xs text-muted-foreground">Verified</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md text-center">
                      <UserCheck className="h-5 w-5 mx-auto mb-1 text-green-600" />
                      <p className="text-sm font-medium">Background</p>
                      <p className="text-xs text-muted-foreground">Checked</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md text-center">
                      <Star className="h-5 w-5 mx-auto mb-1 text-amber-500" />
                      <p className="text-sm font-medium">Trust Score</p>
                      <p className="text-xs text-muted-foreground">98%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-2">Community Trust Guidelines</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>Verified users have completed our identity check process</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>All uploads are encrypted and securely stored</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>Verification increases trust and safety for all users</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>We never share your personal documents with other users</span>
                </li>
              </ul>
            </div>
          </TabsContent>
          
          {/* Recording Tab */}
          <TabsContent value="recording" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Ride Recording & Sharing</h3>
              
              <Label className="flex items-center text-sm space-x-2">
                <span>Auto-record rides</span>
                <Switch 
                  checked={autoRecordRide}
                  onCheckedChange={setAutoRecordRide}
                />
              </Label>
            </div>
            
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">About Ride Recording</AlertTitle>
              <AlertDescription className="text-blue-700">
                Ride recordings are stored securely and can be shared with trusted contacts or authorities if needed.
                All data is encrypted and automatically deleted after 30 days.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Current Ride</CardTitle>
                </CardHeader>
                <CardContent>
                  {autoRecordRide ? (
                    <div className="space-y-3">
                      <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="relative mr-3">
                            <Video className="h-5 w-5 text-green-600" />
                            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                          </div>
                          <div>
                            <p className="font-medium text-green-800">Recording Active</p>
                            <p className="text-xs text-green-700">Started at 2:30 PM</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          00:42:15
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Auto-delete after 30 days</span>
                        <Badge variant="outline" className="text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          Encrypted
                        </Badge>
                      </div>
                      
                      <Button variant="outline" className="w-full">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Journey Details
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Video className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-40" />
                      <p className="text-muted-foreground">Ride recording is turned off</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => setAutoRecordRide(true)}
                      >
                        Enable Recording
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Journey Sharing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Label className="flex items-center justify-between">
                      <span className="flex items-center text-sm">
                        <Share className="h-4 w-4 mr-2 text-primary" />
                        Share ride details with trusted contacts
                      </span>
                      <Switch 
                        checked={shareRideDetails}
                        onCheckedChange={setShareRideDetails}
                      />
                    </Label>
                    
                    {shareRideDetails && (
                      <div className="pt-1 space-y-2">
                        {emergencyContacts.map(contact => (
                          <div key={contact.id} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="ml-2 text-sm">{contact.name}</span>
                            </div>
                            <Switch 
                              checked={shareLocationWith.includes(contact.name)}
                              onCheckedChange={() => handleShareLocationChange(contact.name)}
                            />
                          </div>
                        ))}
                        
                        {emergencyContacts.length === 0 && (
                          <div className="text-center py-2 text-muted-foreground text-sm">
                            <p>No contacts available. Add emergency contacts first.</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="pt-1">
                      <p className="text-sm text-muted-foreground">
                        Shared information includes your route, ETA, and driver/rider details.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-2">Recent Ride Recordings</h4>
              
              {rideRecordings.length > 0 ? (
                <div className="space-y-3">
                  {rideRecordings.map(recording => (
                    <Card key={recording.id} className="bg-gray-50">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                              <Calendar className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">{recording.date}</h4>
                              <p className="text-sm text-muted-foreground">
                                {recording.startTime} - {recording.endTime}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8"
                              onClick={() => handleShareRideRecording(recording.id)}
                            >
                              <Share2 className="h-3.5 w-3.5 mr-1" />
                              Share
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteRideRecording(recording.id)}
                            >
                              <AlertTriangle className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        
                        {recording.sharedWith.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <div className="flex items-center">
                              <Share2 className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                Shared with: {recording.sharedWith.join(", ")}
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Video className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p>No recordings available yet</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Safety Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Safety Settings</h3>
            </div>
            
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                      <BellRing className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium">Emergency Alerts</p>
                      <p className="text-sm text-muted-foreground">Notify contacts in emergencies</p>
                    </div>
                  </div>
                  <Switch 
                    checked={enableEmergencyAlerts}
                    onCheckedChange={setEnableEmergencyAlerts}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <PhoneCall className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Emergency Call Button</p>
                      <p className="text-sm text-muted-foreground">One-tap emergency call</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Ride With Friends</p>
                      <p className="text-sm text-muted-foreground">Prioritize trusted connections</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <BadgeCheck className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Match with Verified Riders Only</p>
                      <p className="text-sm text-muted-foreground">Higher safety standards</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                      <MessageSquare className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium">Safety Check Messages</p>
                      <p className="text-sm text-muted-foreground">Periodic ride status updates</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-primary/5 border border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-primary/80" />
                  Trust & Safety Commitment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  We prioritize your safety and well-being with industry-leading security measures. 
                  All rides are monitored in real-time, and our 24/7 safety team is always available. 
                  Your peace of mind is our top priority.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    <Shield className="h-3.5 w-3.5 mr-1" />
                    Safety Center
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    <User className="h-3.5 w-3.5 mr-1" />
                    Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* Emergency Dialog */}
      <Dialog open={isEmergencyDialogOpen} onOpenChange={setIsEmergencyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-red-600 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Emergency Alert
            </DialogTitle>
            <DialogDescription className="text-center">
              This will immediately notify your emergency contacts with your location and ride details.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <Select 
              value={emergencyType}
              onValueChange={setEmergencyType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select emergency type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="medical">Medical Emergency</SelectItem>
                <SelectItem value="safety">Safety Concern</SelectItem>
                <SelectItem value="accident">Accident</SelectItem>
                <SelectItem value="other">Other Emergency</SelectItem>
              </SelectContent>
            </Select>
            
            <Textarea 
              placeholder="Briefly describe your situation (optional)"
              value={emergencyDescription}
              onChange={(e) => setEmergencyDescription(e.target.value)}
              className="min-h-[80px]"
            />
            
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Attention</AlertTitle>
              <AlertDescription>
                Use this feature only for genuine emergencies. Your contacts and local authorities may be alerted.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => setIsEmergencyDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              className="bg-red-600 hover:bg-red-700"
              onClick={handleEmergencyAlert}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Send Emergency Alert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Verification Dialog */}
      <Dialog open={isVerificationDialogOpen} onOpenChange={setIsVerificationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Identity Verification</DialogTitle>
            <DialogDescription>
              Complete the verification process to unlock all safety features and build trust with ride partners.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="id-type">ID Type</Label>
              <Select>
                <SelectTrigger id="id-type">
                  <SelectValue placeholder="Select ID type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="license">Driver's License</SelectItem>
                  <SelectItem value="id-card">National ID Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Upload ID Document</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">Click to upload or drag and drop</p>
                <Button variant="outline" size="sm">
                  Choose File
                </Button>
              </div>
            </div>
            
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700 text-sm">
                Your ID will be securely encrypted and will only be used for verification purposes.
                We do not share your documents with other users or third parties.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsVerificationDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleStartVerification}>
              <Fingerprint className="h-4 w-4 mr-2" />
              Begin Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}