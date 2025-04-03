import { Link, useLocation } from "wouter";
import {
  Home,
  User,
  Car,
  Users,
  Leaf,
  MapPin,
  Menu,
  LogIn,
  LogOut,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AppLogo } from "@/components/app-logo";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AppNavigation() {
  const [location] = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user, isLoading, logoutMutation } = useAuth();

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
            
            <div className="pt-2 border-t border-border">
              {user ? (
                <>
                  <div className="flex items-center space-x-2 py-2 px-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || undefined} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start mt-2"
                    onClick={() => {
                      logoutMutation.mutate();
                      setShowMobileMenu(false);
                    }}
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="mr-2 h-4 w-4" />
                    )}
                    Log out
                  </Button>
                </>
              ) : (
                <Link href="/auth">
                  <Button
                    variant="default"
                    className="w-full justify-start mt-2"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Login / Register
                  </Button>
                </Link>
              )}
            </div>
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
          <Link href="/" className="mr-4 flex items-center">
            <AppLogo size="sm" headerLogo={true} />
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <DesktopNav />
          <MobileNav />
          
          {isLoading ? (
            <Button size="sm" variant="ghost" disabled>
              <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || undefined} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profile">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="mr-2 h-4 w-4" />
                  )}
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth">
              <Button size="sm" variant="ghost">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}