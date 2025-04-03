import { Link, useLocation } from "wouter";
import {
  Home,
  User,
  Car,
  Users,
  Leaf,
  MapPin,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AppLogo } from "@/components/app-logo";

export function AppNavigation() {
  const [location] = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const navLinks = [
    {
      name: "Home",
      path: "/",
      icon: <Home className="h-4 w-4 mr-2" />,
    },
    {
      name: "Passenger",
      path: "/passenger",
      icon: <User className="h-4 w-4 mr-2" />,
    },
    {
      name: "Rider",
      path: "/rider",
      icon: <Car className="h-4 w-4 mr-2" />,
    },
    {
      name: "Social",
      path: "/social",
      icon: <Users className="h-4 w-4 mr-2" />,
    },
    {
      name: "Locations",
      path: "/locations",
      icon: <MapPin className="h-4 w-4 mr-2" />,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <User className="h-4 w-4 mr-2" />,
    },
    {
      name: "Eco Tracker",
      path: "/eco-tracker",
      icon: <Leaf className="h-4 w-4 mr-2" />,
    },
  ];

  // Mobile navigation dropdown
  const MobileNav = () => (
    <div className="md:hidden">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        className="md:hidden"
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      {showMobileMenu && (
        <div className="absolute left-0 right-0 top-14 z-50 bg-background border-b p-4">
          <div className="space-y-2">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <Button
                  variant={location === link.path ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setShowMobileMenu(false)}
                >
                  {link.icon}
                  {link.name}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Desktop navigation
  const DesktopNav = () => (
    <div className="hidden md:flex space-x-1">
      {navLinks.map((link) => (
        <Link key={link.path} href={link.path}>
          <Button
            variant={location === link.path ? "default" : "ghost"}
            size="sm"
            className={cn(
              "text-sm",
              location === link.path && "bg-primary text-primary-foreground"
            )}
          >
            {link.icon}
            {link.name}
          </Button>
        </Link>
      ))}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="mr-4 flex items-center space-x-2">
            <AppLogo size="sm" interactive={true} />
          </Link>
        </div>
        
        <div className="flex items-center">
          <DesktopNav />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}