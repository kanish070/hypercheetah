import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Ride } from '@shared/schema';
import { 
  Share2, Download, QrCode, Copy, CalendarPlus, Check, 
  Smartphone, Mail, MessageSquare, Clipboard
} from 'lucide-react';

interface RideShareQRProps {
  ride: Ride;
  userName?: string;
}

export function RideShareQR({ ride, userName = "Rider" }: RideShareQRProps) {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('qr');
  
  // Generate a unique ride sharing link
  const baseUrl = window.location.origin;
  const shareUrl = `${baseUrl}/share-ride/${ride.id}`;
  
  // Generate ride details for sharing
  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return 'Flexible';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      weekday: 'short',
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  
  const formatLocation = (loc: any) => {
    if (typeof loc === 'string') {
      try {
        const parsed = JSON.parse(loc);
        return parsed?.name || "Location";
      } catch (e) {
        return "Location";
      }
    }
    return "Location";
  };
  
  // Safely extract start and end locations
  const getRouteData = () => {
    if (!ride.routeData) return { start: null, end: null };
    
    // If routeData is a string, try to parse it
    if (typeof ride.routeData === 'string') {
      try {
        const parsed = JSON.parse(ride.routeData);
        return {
          start: parsed.start || null,
          end: parsed.end || null
        };
      } catch (e) {
        return { start: null, end: null };
      }
    }
    
    // If routeData is an object, extract start and end
    return {
      start: (ride.routeData as any).start || null,
      end: (ride.routeData as any).end || null
    };
  };
  
  const routeData = getRouteData();
  const startLocation = routeData.start ? formatLocation(routeData.start) : "Starting Point";
  const endLocation = routeData.end ? formatLocation(routeData.end) : "Destination";
  const departureTime = formatDate(ride.departureTime);
  
  const rideDetails = `
🚗 Ride Details from ${userName}:

📍 From: ${startLocation}
📍 To: ${endLocation}
🕒 Time: ${departureTime}
💰 Price: ₹${ride.price || 'Free'}
🚶 Seats: ${ride.availableSeats || 1}

📱 Book this ride: ${shareUrl}
  `;
  
  // Copy to clipboard function
  const copyToClipboard = () => {
    navigator.clipboard.writeText(rideDetails).then(() => {
      setCopied(true);
      toast({
        title: "Copied to clipboard!",
        description: "Ride details have been copied to your clipboard."
      });
      setTimeout(() => setCopied(false), 3000);
    });
  };
  
  // Generate shareable message
  const whatsappShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(rideDetails)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const smsShare = () => {
    const smsUrl = `sms:?body=${encodeURIComponent(rideDetails)}`;
    window.open(smsUrl, '_blank');
  };
  
  const emailShare = () => {
    const subject = `Ride Share from ${userName}`;
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(rideDetails)}`;
    window.open(emailUrl, '_blank');
  };
  
  // Download QR code as image
  const downloadQRCode = () => {
    const canvas = document.getElementById('ride-qr-code')?.querySelector('canvas');
    if (canvas) {
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `ride-share-${ride.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "QR code downloaded!",
        description: "You can share this QR code with others to quickly share ride details."
      });
    }
  };
  
  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-1"
        onClick={() => setShowQR(true)}
      >
        <Share2 className="h-4 w-4" />
        Share
      </Button>
      
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Share2 className="h-5 w-5 mr-2 text-primary" />
              Share Ride Details
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="qr" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="qr" className="flex items-center gap-1">
                <QrCode className="h-4 w-4" />
                QR Code
              </TabsTrigger>
              <TabsTrigger value="link" className="flex items-center gap-1">
                <Clipboard className="h-4 w-4" />
                Text
              </TabsTrigger>
              <TabsTrigger value="app" className="flex items-center gap-1">
                <Smartphone className="h-4 w-4" />
                Apps
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="qr" className="pt-4">
              <div className="flex flex-col items-center">
                <Card className="w-full">
                  <CardContent className="pt-6 flex flex-col items-center">
                    <div 
                      id="ride-qr-code" 
                      className="bg-white p-4 rounded-lg shadow-sm mb-4"
                    >
                      <QRCodeSVG 
                        value={shareUrl}
                        size={200}
                        bgColor={"#ffffff"}
                        fgColor={"#000000"}
                        level={"H"}
                        includeMargin={false}
                        imageSettings={{
                          src: "/images/logo-small.png",
                          x: undefined,
                          y: undefined,
                          height: 40,
                          width: 40,
                          excavate: true,
                        }}
                      />
                    </div>
                    
                    <div className="text-center text-sm text-muted-foreground mb-4">
                      <p>Scan this QR code to view and book this ride</p>
                      <p className="text-xs">From {startLocation} to {endLocation}</p>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center gap-2"
                      onClick={downloadQRCode}
                    >
                      <Download className="h-4 w-4" />
                      Download QR Code
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="link" className="pt-4">
              <Card className="w-full">
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <div className="text-sm text-muted-foreground mb-2">
                      Share this ride details via text
                    </div>
                    <div className="bg-muted p-3 rounded-md text-sm font-mono whitespace-pre-wrap mb-4">
                      {rideDetails}
                    </div>
                    <Button 
                      onClick={copyToClipboard} 
                      className="w-full flex items-center gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy to Clipboard
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="app" className="pt-4">
              <Card className="w-full">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant="outline" 
                      className="flex flex-col items-center p-4 h-auto"
                      onClick={whatsappShare}
                    >
                      <div className="h-8 w-8 bg-[#25D366] text-white rounded-full flex items-center justify-center mb-2">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <span className="text-xs">WhatsApp</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="flex flex-col items-center p-4 h-auto"
                      onClick={smsShare}
                    >
                      <div className="h-8 w-8 bg-blue-500 text-white rounded-full flex items-center justify-center mb-2">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <span className="text-xs">SMS</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="flex flex-col items-center p-4 h-auto"
                      onClick={emailShare}
                    >
                      <div className="h-8 w-8 bg-gray-700 text-white rounded-full flex items-center justify-center mb-2">
                        <Mail className="h-4 w-4" />
                      </div>
                      <span className="text-xs">Email</span>
                    </Button>
                  </div>
                  
                  <div className="mt-4">
                    <div className="text-sm text-muted-foreground mb-2">
                      Share link directly
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        readOnly 
                        value={shareUrl}
                        className="font-mono text-xs"
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText(shareUrl);
                          toast({
                            title: "Link copied!",
                            description: "Share link has been copied to clipboard."
                          });
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}