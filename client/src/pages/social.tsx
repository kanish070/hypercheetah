import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Users, 
  Search, 
  User, 
  MapPin, 
  Clock, 
  Coffee, 
  Music, 
  Book, 
  Film,
  MessageSquare,
  Heart,
  Share2,
  Plus,
  Filter,
  Car
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { RouteMap } from "@/components/route-map";
import { Location } from "@shared/schema";

// Sample user data
const users = [
  {
    id: 1,
    name: "Alex Johnson",
    username: "alex_j",
    avatar: "https://i.pravatar.cc/150?img=1",
    bio: "Professional commuter, always looking for ride buddies!",
    interests: ["Music", "Coffee", "Reading"],
    location: "New York City",
    rating: 4.8,
    reviewCount: 24,
    commonRoutes: 3
  },
  {
    id: 2,
    name: "Samantha Chen",
    username: "sam_chen",
    avatar: "https://i.pravatar.cc/150?img=5",
    bio: "Software developer by day, explorer by night.",
    interests: ["Technology", "Hiking", "Photography"],
    location: "San Francisco",
    rating: 4.9,
    reviewCount: 37,
    commonRoutes: 2
  },
  {
    id: 3,
    name: "Marcus Wilson",
    username: "mwilson",
    avatar: "https://i.pravatar.cc/150?img=3",
    bio: "Friendly driver with great music playlists for long rides!",
    interests: ["Music", "Travel", "Food"],
    location: "Chicago",
    rating: 4.7,
    reviewCount: 18,
    commonRoutes: 1
  },
  {
    id: 4,
    name: "Priya Patel",
    username: "priya_p",
    avatar: "https://i.pravatar.cc/150?img=9",
    bio: "Medical student, early riser, caffeine enthusiast.",
    interests: ["Health", "Coffee", "Reading"],
    location: "Boston",
    rating: 4.6,
    reviewCount: 12,
    commonRoutes: 4
  }
];

// Sample posts
const posts = [
  {
    id: 1,
    user: users[0],
    content: "Just had the most amazing ride-share experience! My driver was a jazz musician and we had the best conversation about Miles Davis all the way to downtown.",
    timestamp: "2 hours ago",
    likes: 24,
    comments: 5,
    hasRoute: true,
    route: {
      start: { lat: 40.7128, lng: -74.0060 },
      end: { lat: 40.7831, lng: -73.9712 },
      waypoints: [
        { lat: 40.7306, lng: -73.9352 },
        { lat: 40.7589, lng: -73.9851 }
      ]
    }
  },
  {
    id: 2,
    user: users[2],
    content: "Looking for regular commute buddies from Brooklyn to Manhattan! I drive every weekday, leaving around 8 AM. Great playlist, good conversation, or comfortable silence if that's your preference. #CommuteShare",
    timestamp: "5 hours ago",
    likes: 18,
    comments: 12,
    hasRoute: true,
    route: {
      start: { lat: 40.6782, lng: -73.9442 },
      end: { lat: 40.7831, lng: -73.9712 },
      waypoints: [
        { lat: 40.7064, lng: -73.9966 }
      ]
    }
  },
  {
    id: 3,
    user: users[1],
    content: "Pro tip for ride-sharers: Create a shared playlist where passengers and drivers can contribute songs. Makes for a fun, collaborative ride atmosphere!",
    timestamp: "Yesterday",
    likes: 42,
    comments: 8,
    hasRoute: false
  },
  {
    id: 4,
    user: users[3],
    content: "I've been ride-sharing for 6 months now and have made 3 genuine friends. Never expected this app would actually help me expand my social circle in such a meaningful way!",
    timestamp: "2 days ago",
    likes: 65,
    comments: 17,
    hasRoute: false
  }
];

// Sample friend suggestions based on common routes
const friendSuggestions = [
  {
    id: 101,
    name: "David Park",
    avatar: "https://i.pravatar.cc/150?img=6",
    commonInterests: ["Music", "Film"],
    mutualConnections: 3,
    location: "Manhattan",
    commonRoutes: 2
  },
  {
    id: 102,
    name: "Lisa Garcia",
    avatar: "https://i.pravatar.cc/150?img=25",
    commonInterests: ["Coffee", "Books"],
    mutualConnections: 1,
    location: "Brooklyn",
    commonRoutes: 4
  },
  {
    id: 103,
    name: "Tarun Mehta",
    avatar: "https://i.pravatar.cc/150?img=11",
    commonInterests: ["Technology", "Music"],
    mutualConnections: 2,
    location: "Queens",
    commonRoutes: 3
  }
];

// Sample chat data
const chatConversations = [
  {
    id: 201,
    user: users[0],
    lastMessage: "Are we still meeting at the coffee shop?",
    timestamp: "2 mins ago",
    unread: 2,
    isRidePartner: true,
    routeMatch: "Brooklyn to Manhattan",
    status: "Active",
    departureTime: "Today, 5:30 PM",
    rideType: "Commute"
  },
  {
    id: 202,
    user: users[1],
    lastMessage: "Thanks for the ride yesterday!",
    timestamp: "Yesterday",
    unread: 0,
    isRidePartner: true,
    routeMatch: "Queens to Midtown",
    status: "Completed",
    departureTime: "Yesterday, 8:15 AM",
    rideType: "Morning Commute"
  },
  {
    id: 205,
    user: users[2],
    lastMessage: "I'll be at the pickup spot in 10 minutes.",
    timestamp: "5 mins ago",
    unread: 3,
    isRidePartner: true,
    routeMatch: "Central Park to Downtown",
    status: "Active",
    departureTime: "Today, 6:00 PM",
    rideType: "Evening Ride"
  },
  {
    id: 203,
    user: friendSuggestions[0],
    lastMessage: "Hey, nice to connect with you!",
    timestamp: "2 days ago",
    unread: 0,
    isRidePartner: false,
    status: "Active"
  },
  {
    id: 204,
    user: friendSuggestions[1],
    lastMessage: "I saw we have the same commute route!",
    timestamp: "1 week ago",
    unread: 1,
    isRidePartner: false,
    status: "Active"
  }
];

// Sample messages for an active chat
const sampleChatMessages = [
  {
    id: 1001,
    senderId: 1, // Alex Johnson
    text: "Hey! Are we still meeting for coffee before our ride?",
    timestamp: "10:30 AM",
    media: null
  },
  {
    id: 1002,
    senderId: 0, // Current user
    text: "Yes! I'll be there around 8:45am if that works for you?",
    timestamp: "10:35 AM",
    media: null
  },
  {
    id: 1003,
    senderId: 1,
    text: "Perfect! I'll be there. By the way, I found this cool shortcut for our route.",
    timestamp: "10:38 AM",
    media: null
  },
  {
    id: 1004,
    senderId: 1,
    text: "Here's the map I was talking about.",
    timestamp: "10:40 AM",
    media: {
      type: "route",
      route: {
        start: { lat: 40.7128, lng: -74.0060 },
        end: { lat: 40.7831, lng: -73.9712 },
        waypoints: [{ lat: 40.7306, lng: -73.9352 }]
      }
    }
  },
  {
    id: 1005,
    senderId: 0,
    text: "That looks great! Should save us about 15 minutes.",
    timestamp: "10:42 AM",
    media: null
  },
  {
    id: 1006,
    senderId: 0,
    text: "Looking forward to meeting you tomorrow!",
    timestamp: "10:45 AM",
    media: null
  },
  {
    id: 1007,
    senderId: 1,
    text: "Same here! It's always more fun to travel with someone.",
    timestamp: "10:47 AM",
    media: null
  }
];

// Sample communities
const communities = [
  {
    id: 201,
    name: "NYC Commuters",
    members: 1243,
    activity: "Very Active",
    description: "A group for regular commuters around NYC to share rides, stories, and tips."
  },
  {
    id: 202,
    name: "Eco-friendly Riders",
    members: 827,
    activity: "Active",
    description: "Join others who are committed to reducing their carbon footprint through ride sharing."
  },
  {
    id: 203,
    name: "Music Lovers Carpool",
    members: 562,
    activity: "Somewhat Active",
    description: "Share rides and playlists. For people who believe a good soundtrack makes any journey better."
  }
];

// Interest icons mapping
const interestIcons: Record<string, any> = {
  Music: <Music className="h-3 w-3" />,
  Coffee: <Coffee className="h-3 w-3" />,
  Reading: <Book className="h-3 w-3" />,
  Film: <Film className="h-3 w-3" />,
  Technology: <Car className="h-3 w-3" />,
  Travel: <MapPin className="h-3 w-3" />,
  Food: <Coffee className="h-3 w-3" />,
  Health: <Heart className="h-3 w-3" />,
  Hiking: <MapPin className="h-3 w-3" />,
  Photography: <Film className="h-3 w-3" />,
  Books: <Book className="h-3 w-3" />
};

export default function Social() {
  const [_, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("feed");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingRoutePost, setViewingRoutePost] = useState<number | null>(null);
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  
  // Filter users based on search query
  const filteredUsers = users.filter(
    user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.interests.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Filter chats based on search query
  const filteredChats = searchQuery 
    ? chatConversations.filter(
        chat => chat.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (chat.routeMatch && chat.routeMatch.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : chatConversations;
  
  // Get the currently viewed route if any
  const currentlyViewedPost = posts.find(post => post.id === viewingRoutePost && post.hasRoute);
  const currentlyViewedRoute = currentlyViewedPost?.route;
  
  // Get the selected chat
  const currentChat = chatConversations.find(chat => chat.id === selectedChat);
  
  // Handlers
  const handleConnectUser = (userId: number) => {
    toast({
      title: "Connection Request Sent",
      description: "Your connection request has been sent successfully."
    });
  };
  
  const handleJoinCommunity = (communityId: number) => {
    toast({
      title: "Community Joined",
      description: "You have successfully joined the community."
    });
  };
  
  const handlePostLike = (postId: number) => {
    toast({
      description: "Post liked"
    });
  };
  
  const handlePostComment = (postId: number) => {
    // Implement comment functionality
    toast({
      description: "Comment feature coming soon!"
    });
  };
  
  const handlePostShare = (postId: number) => {
    toast({
      description: "Share feature coming soon!"
    });
  };
  
  const handleViewRoute = (postId: number) => {
    setViewingRoutePost(viewingRoutePost === postId ? null : postId);
  };
  
  const handleSelectChat = (chatId: number) => {
    setSelectedChat(chatId);
  };
  
  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    toast({
      description: "Message sent"
    });
    
    setMessageText("");
  };
  
  const handleAttachRoute = () => {
    toast({
      description: "Route attached to message"
    });
  };
  
  const handleAttachMedia = () => {
    toast({
      description: "Media attachment feature coming soon!"
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent flex items-center">
            <Users className="mr-3 h-6 w-6 text-primary" />
            HYPERCHEETAH Social
          </h1>
        </motion.div>
        
        {/* Main Tabs */}
        <Tabs defaultValue="feed" className="w-full" onValueChange={setActiveTab}>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
            {/* Mobile scrollable tabs for small screens */}
            <div className="md:hidden w-full overflow-x-auto pb-1">
              <TabsList className="w-max space-x-1">
                <TabsTrigger value="feed">Feed</TabsTrigger>
                <TabsTrigger value="network">Network</TabsTrigger>
                <TabsTrigger value="chats">Chats</TabsTrigger>
                <TabsTrigger value="communities">Communities</TabsTrigger>
                <TabsTrigger value="discover">Discover</TabsTrigger>
              </TabsList>
            </div>
            
            {/* Desktop tabs for larger screens */}
            <div className="hidden md:block">
              <TabsList>
                <TabsTrigger value="feed">Feed</TabsTrigger>
                <TabsTrigger value="network">Network</TabsTrigger>
                <TabsTrigger value="chats">Chats</TabsTrigger>
                <TabsTrigger value="communities">Communities</TabsTrigger>
                <TabsTrigger value="discover">Discover</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="relative flex items-center w-full md:w-auto">
              <Search className="absolute left-2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search people or posts..." 
                className="pl-8 w-full md:w-[240px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Feed Tab Content */}
          <TabsContent value="feed" className="space-y-4">
            {/* Post creation card */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarImage src="https://i.pravatar.cc/150?img=10" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Input 
                      placeholder="Share your ride experience or thoughts..." 
                      className="mb-3"
                    />
                    <div className="flex justify-between">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          Add Route
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          <Film className="h-3 w-3 mr-1" />
                          Add Media
                        </Button>
                      </div>
                      <Button size="sm">
                        Post
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Posts feed */}
            {posts.map(post => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3 pt-4">
                    <div className="flex justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={post.user.avatar} />
                          <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{post.user.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {post.timestamp}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-3">
                    <p className="mb-3">{post.content}</p>
                    
                    {post.hasRoute && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-primary mr-1" />
                            <span className="text-sm font-medium">Route Shared</span>
                          </div>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="h-7 p-0 text-primary"
                            onClick={() => handleViewRoute(post.id)}
                          >
                            {viewingRoutePost === post.id ? "Hide Route" : "View Route"}
                          </Button>
                        </div>
                        
                        {viewingRoutePost === post.id && post.route && (
                          <div className="mt-3 rounded-md overflow-hidden border">
                            <RouteMap
                              center={post.route.start}
                              route={post.route}
                              className="h-[300px]"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="border-t px-4 py-2.5">
                    <div className="flex justify-between w-full">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-muted-foreground h-8"
                        onClick={() => handlePostLike(post.id)}
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        {post.likes}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-muted-foreground h-8"
                        onClick={() => handlePostComment(post.id)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {post.comments}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-muted-foreground h-8"
                        onClick={() => handlePostShare(post.id)}
                      >
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
          
          {/* Network Tab Content */}
          <TabsContent value="network" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary" />
                  Your Network
                </h2>
                
                {filteredUsers.map(user => (
                  <motion.div 
                    key={user.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    className="mb-4"
                  >
                    <Card className="overflow-hidden border transition-all duration-300 hover:shadow-md hover:border-primary/30">
                      <CardContent className="p-4">
                        <div className="flex items-start">
                          <motion.div 
                            whileHover={{ scale: 1.1 }} 
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                          >
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          </motion.div>
                          
                          <div className="ml-4 flex-1">
                            <div className="flex justify-between">
                              <div>
                                <motion.h3 
                                  className="font-medium"
                                  initial={{ color: "inherit" }}
                                  whileHover={{ color: "var(--primary)" }}
                                  transition={{ duration: 0.2 }}
                                >
                                  {user.name}
                                </motion.h3>
                                <div className="text-sm text-muted-foreground">@{user.username}</div>
                              </div>
                              <div className="flex items-center">
                                <motion.div 
                                  className="flex items-center mr-2"
                                  whileHover={{ scale: 1.05 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Car className="h-3.5 w-3.5 text-primary mr-1" />
                                  <span className="text-xs">{user.commonRoutes} common routes</span>
                                </motion.div>
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                                  <Button size="sm" variant="outline">
                                    Message
                                  </Button>
                                </motion.div>
                              </div>
                            </div>
                            
                            <p className="text-sm mt-2">{user.bio}</p>
                            
                            <div className="flex flex-wrap gap-1 mt-2">
                              {user.interests.map(interest => (
                                <motion.div
                                  key={interest}
                                  whileHover={{ 
                                    scale: 1.1, 
                                    backgroundColor: "var(--primary-50)",
                                    borderColor: "var(--primary)" 
                                  }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Badge variant="outline" className="text-xs transition-colors duration-200">
                                    {interestIcons[interest]} {interest}
                                  </Badge>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
              
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  Suggested Connections
                </h2>
                
                {friendSuggestions.map(suggestion => (
                  <motion.div 
                    key={suggestion.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ 
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                    className="mb-4"
                  >
                    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/30">
                      <CardContent className="p-4">
                        <div className="flex">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                          >
                            <Avatar>
                              <AvatarImage src={suggestion.avatar} />
                              <AvatarFallback>{suggestion.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          </motion.div>
                          
                          <div className="ml-4 flex-1">
                            <div className="flex justify-between">
                              <motion.h3 
                                className="font-medium"
                                initial={{ color: "inherit" }}
                                whileHover={{ color: "var(--primary)" }}
                                transition={{ duration: 0.2 }}
                              >
                                {suggestion.name}
                              </motion.h3>
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                              >
                                <Button 
                                  size="sm" 
                                  onClick={() => handleConnectUser(suggestion.id)}
                                  className="transition-colors duration-300 hover:bg-primary hover:text-primary-foreground"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Connect
                                </Button>
                              </motion.div>
                            </div>
                          
                            <div className="flex flex-col gap-1 mt-2 text-sm">
                              <motion.div 
                                className="flex items-center text-muted-foreground"
                                whileHover={{ x: 3 }}
                                transition={{ duration: 0.2 }}
                              >
                                <MapPin className="h-3.5 w-3.5 mr-1 text-primary/70" />
                                {suggestion.location}
                              </motion.div>
                              <motion.div 
                                className="flex items-center text-muted-foreground"
                                whileHover={{ x: 3 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Car className="h-3.5 w-3.5 mr-1 text-primary/70" />
                                {suggestion.commonRoutes} common routes
                              </motion.div>
                              <motion.div 
                                className="flex items-center text-muted-foreground"
                                whileHover={{ x: 3 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Users className="h-3.5 w-3.5 mr-1 text-primary/70" />
                                {suggestion.mutualConnections} mutual connections
                              </motion.div>
                            </div>
                          
                            <div className="flex flex-wrap gap-1 mt-2">
                              {suggestion.commonInterests.map(interest => (
                                <motion.div
                                  key={interest}
                                  whileHover={{ 
                                    scale: 1.1, 
                                    backgroundColor: "var(--primary-50)",
                                    borderColor: "var(--primary)" 
                                  }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Badge variant="outline" className="text-xs bg-primary/5 transition-colors duration-200">
                                    {interestIcons[interest]} {interest}
                                  </Badge>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          {/* Communities Tab Content */}
          <TabsContent value="communities" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold mb-3">Popular Communities</h2>
                
                {communities.map(community => (
                  <motion.div
                    key={community.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ 
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                    className="mb-4"
                  >
                    <Card className="overflow-hidden border transition-all duration-300 hover:shadow-md hover:border-primary/30">
                      <CardHeader className="pb-2">
                        <motion.div
                          initial={{ x: 0 }}
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <CardTitle className="text-xl">{community.name}</CardTitle>
                        </motion.div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex justify-between text-sm text-muted-foreground mb-2">
                          <motion.div 
                            className="flex items-center"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Users className="h-4 w-4 mr-1 text-primary" />
                            {community.members} members
                          </motion.div>
                          <motion.div
                            whileHover={{ 
                              scale: 1.05,
                              color: "var(--primary)"
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            {community.activity}
                          </motion.div>
                        </div>
                        <p className="text-sm">{community.description}</p>
                      </CardContent>
                      <CardFooter>
                        <motion.div
                          className="w-full"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <Button 
                            className="w-full transition-colors duration-300 hover:bg-primary hover:text-primary-foreground" 
                            variant="outline"
                            onClick={() => handleJoinCommunity(community.id)}
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Join Community
                          </Button>
                        </motion.div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Create a New Community</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Share your interests with fellow travelers and build a community around your favorite routes or topics.
                    </p>
                    <Input placeholder="Community Name" className="mb-3" />
                    <Input placeholder="Short Description" className="mb-3" />
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Community
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-primary/5 border border-primary/10">
                  <CardHeader>
                    <CardTitle className="text-lg">Community Guidelines</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                          <span className="text-xs font-bold">1</span>
                        </div>
                        Be respectful and inclusive to all community members
                      </li>
                      <li className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                          <span className="text-xs font-bold">2</span>
                        </div>
                        Share constructive and relevant content
                      </li>
                      <li className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                          <span className="text-xs font-bold">3</span>
                        </div>
                        Report inappropriate behavior or content
                      </li>
                      <li className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                          <span className="text-xs font-bold">4</span>
                        </div>
                        Help create a safe and enjoyable environment for everyone
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Discover Tab Content */}
          <TabsContent value="discover" className="space-y-4">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Explore More</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-primary/20 to-primary/5">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center mb-4">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Travel Groups</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Find groups of people who regularly travel your routes
                    </p>
                    <Button variant="secondary">Explore Groups</Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-blue-100 to-blue-50">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center mb-4">
                      <MapPin className="h-6 w-6 text-blue-500" />
                    </div>
                    <h3 className="font-semibold mb-2">Events Near You</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Discover meetups and events with your ride connections
                    </p>
                    <Button 
                      variant="outline" 
                      className="border-blue-500 text-blue-500 hover:bg-blue-50"
                    >
                      Find Events
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-green-100 to-green-50">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center mb-4">
                      <Coffee className="h-6 w-6 text-green-500" />
                    </div>
                    <h3 className="font-semibold mb-2">Travel Stories</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Read interesting stories from your commute community
                    </p>
                    <Button 
                      variant="outline" 
                      className="border-green-500 text-green-500 hover:bg-green-50"
                    >
                      Read Stories
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h2 className="text-lg font-semibold mb-3">Trending Hashtags</h2>
              <div className="flex flex-wrap gap-2">
                {["#RideShareStories", "#MorningCommute", "#NewConnections", "#TravelBuddies", "#CarpoolKaraoke", "#GreenCommute", "#RideSharingTips", "#CityExplorer"].map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-primary/20">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>
          
          {/* Chats Tab Content */}
          <TabsContent value="chats" className="space-y-4">
            {/* Ride Partners Section */}
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Car className="h-5 w-5 mr-2 text-primary" />
                  Your Ride Partners
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Chat with your upcoming and past ride companions
                </p>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {chatConversations
                    .filter(chat => chat.isRidePartner && chat.status === 'Active')
                    .map(chat => (
                      <motion.div
                        key={chat.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ 
                          scale: 1.03, 
                          transition: { duration: 0.2 } 
                        }}
                      >
                        <Card 
                          className={`border cursor-pointer transition-all duration-300 hover:border-primary/50 hover:shadow-md ${
                            selectedChat === chat.id ? 'border-primary/50 bg-primary/5' : ''
                          }`}
                          onClick={() => handleSelectChat(chat.id)}
                        >
                          <CardContent className="p-3 flex flex-col h-full">
                            <div className="flex items-center gap-3 mb-2">
                              <motion.div 
                                className="relative"
                                whileHover={{ scale: 1.1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                              >
                                <Avatar>
                                  <AvatarImage src={chat.user.avatar} />
                                  <AvatarFallback>{chat.user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                {chat.unread > 0 && (
                                  <motion.div 
                                    className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 2, repeatType: "loop" }}
                                  >
                                    {chat.unread}
                                  </motion.div>
                                )}
                              </motion.div>
                              <div>
                                <motion.div 
                                  className="font-medium"
                                  initial={{ color: "inherit" }}
                                  whileHover={{ color: "var(--primary)" }}
                                  transition={{ duration: 0.2 }}
                                >
                                  {chat.user.name}
                                </motion.div>
                                <div className="text-xs text-muted-foreground">
                                  {chat.timestamp}
                                </div>
                              </div>
                            </div>
                            
                            <motion.div 
                              className="bg-primary/5 rounded-md p-2 mb-2 flex-1"
                              whileHover={{ backgroundColor: "var(--primary-10)" }}
                              transition={{ duration: 0.3 }}
                            >
                              <motion.div 
                                className="flex items-center gap-1 mb-1"
                                whileHover={{ x: 3 }}
                                transition={{ duration: 0.2 }}
                              >
                                <MapPin className="h-3.5 w-3.5 text-primary" />
                                <span className="text-xs font-medium">{chat.routeMatch}</span>
                              </motion.div>
                              <motion.div 
                                className="flex items-center gap-1 mb-1"
                                whileHover={{ x: 3 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Clock className="h-3.5 w-3.5 text-primary" />
                                <span className="text-xs">{chat.departureTime}</span>
                              </motion.div>
                              <motion.div 
                                className="flex items-center gap-1"
                                whileHover={{ x: 3 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Car className="h-3.5 w-3.5 text-primary" />
                                <span className="text-xs">{chat.rideType}</span>
                              </motion.div>
                            </motion.div>
                            
                            <div className="text-xs text-muted-foreground line-clamp-2 mb-2">
                              {chat.lastMessage}
                            </div>
                            
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            >
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full mt-auto text-xs transition-colors duration-300 hover:bg-primary hover:text-primary-foreground"
                                onClick={() => handleSelectChat(chat.id)}
                              >
                                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                                Chat
                              </Button>
                            </motion.div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                    
                  {chatConversations.filter(chat => chat.isRidePartner && chat.status === 'Active').length === 0 && (
                    <div className="col-span-3 text-center p-6 text-muted-foreground">
                      No active ride partners at the moment
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <div className="flex flex-col md:flex-row gap-6 h-[600px]">
              {/* Chat list sidebar */}
              <Card className="md:w-1/3 w-full overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                    All Conversations
                  </CardTitle>
                </CardHeader>
                
                <div className="overflow-y-auto" style={{ maxHeight: "calc(600px - 64px)" }}>
                  {filteredChats.length === 0 ? (
                    <div className="text-center p-4 text-muted-foreground">
                      No conversations found
                    </div>
                  ) : (
                    <>
                      {/* Ride Partners */}
                      {filteredChats.some(chat => chat.isRidePartner) && (
                        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/40">
                          Ride Partners
                        </div>
                      )}
                      {filteredChats
                        .filter(chat => chat.isRidePartner)
                        .map(chat => (
                          <div 
                            key={chat.id} 
                            className={`p-3 border-b cursor-pointer transition-colors hover:bg-primary/5 ${selectedChat === chat.id ? 'bg-primary/10' : ''}`}
                            onClick={() => handleSelectChat(chat.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <Avatar>
                                  <AvatarImage src={chat.user.avatar} />
                                  <AvatarFallback>{chat.user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                
                                {chat.unread > 0 && (
                                  <div className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {chat.unread}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                  <div className="font-medium truncate">{chat.user.name}</div>
                                  <div className="text-xs text-muted-foreground">{chat.timestamp}</div>
                                </div>
                                <div className="text-sm text-muted-foreground truncate">
                                  {chat.lastMessage}
                                </div>
                                
                                <div className="flex items-center mt-1">
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs py-0 px-1.5 ${chat.status === 'Active' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}
                                  >
                                    <Car className="h-3 w-3 mr-1" />
                                    {chat.status}
                                  </Badge>
                                  
                                  {chat.routeMatch && (
                                    <div className="text-xs ml-2 text-muted-foreground flex items-center">
                                      <MapPin className="h-3 w-3 mr-1" />
                                      {chat.routeMatch}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      
                      {/* Friends and Connections */}
                      {filteredChats.some(chat => !chat.isRidePartner) && (
                        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/40">
                          Friends & Connections
                        </div>
                      )}
                      {filteredChats
                        .filter(chat => !chat.isRidePartner)
                        .map(chat => (
                          <div 
                            key={chat.id} 
                            className={`p-3 border-b cursor-pointer transition-colors hover:bg-primary/5 ${selectedChat === chat.id ? 'bg-primary/10' : ''}`}
                            onClick={() => handleSelectChat(chat.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <Avatar>
                                  <AvatarImage src={chat.user.avatar} />
                                  <AvatarFallback>{chat.user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                
                                {chat.unread > 0 && (
                                  <div className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {chat.unread}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                  <div className="font-medium truncate">{chat.user.name}</div>
                                  <div className="text-xs text-muted-foreground">{chat.timestamp}</div>
                                </div>
                                <div className="text-sm text-muted-foreground truncate">
                                  {chat.lastMessage}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </>
                  )}
                </div>
              </Card>
              
              {/* Chat content */}
              <Card className="flex-1 flex flex-col overflow-hidden">
                {selectedChat ? (
                  <>
                    {/* Chat header */}
                    <CardHeader className="p-4 pb-3 border-b">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={currentChat?.user.avatar} />
                            <AvatarFallback>{currentChat?.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <div className="font-medium">{currentChat?.user.name}</div>
                            
                            {currentChat?.isRidePartner && (
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs py-0 px-1.5 ${currentChat.status === 'Active' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}
                                >
                                  <Car className="h-3 w-3 mr-1" />
                                  {currentChat.status} Ride
                                </Badge>
                                
                                {currentChat.routeMatch && (
                                  <div className="text-xs text-muted-foreground flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {currentChat.routeMatch}
                                  </div>
                                )}
                                
                                {currentChat.departureTime && (
                                  <div className="text-xs text-muted-foreground flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {currentChat.departureTime}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    {/* Chat messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: "calc(600px - 144px)" }}>
                      {sampleChatMessages.map(message => (
                        <div 
                          key={message.id}
                          className={`flex ${message.senderId === 0 ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[80%] ${
                              message.senderId === 0 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            } rounded-2xl px-4 py-2`}
                          >
                            <div className="mb-1">
                              {message.text}
                            </div>
                            
                            {message.media && message.media.type === 'route' && (
                              <div className="mt-2 rounded-md overflow-hidden border bg-background">
                                <div className="p-2 text-xs font-medium border-b bg-muted/50 text-foreground">
                                  <MapPin className="h-3 w-3 inline-block mr-1 text-primary" />
                                  Shared Route
                                </div>
                                <div className="h-[200px]">
                                  <RouteMap
                                    center={message.media.route.start}
                                    route={message.media.route}
                                    className="h-full"
                                  />
                                </div>
                              </div>
                            )}
                            
                            <div className={`text-xs ${message.senderId === 0 ? 'text-primary-foreground/70' : 'text-muted-foreground'} text-right`}>
                              {message.timestamp}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Chat input */}
                    <div className="p-3 border-t">
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <Input 
                            placeholder="Type a message..." 
                            className="bg-muted/50 border-0"
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                          />
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-full"
                            onClick={handleAttachRoute}
                            title="Share Route"
                          >
                            <MapPin className="h-5 w-5 text-primary" />
                          </Button>
                          <Button 
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-full"
                            onClick={handleAttachMedia}
                            title="Attach Media"
                          >
                            <Film className="h-5 w-5 text-primary" />
                          </Button>
                          <Button 
                            size="icon"
                            className="h-10 w-10 rounded-full"
                            onClick={handleSendMessage}
                            title="Send Message"
                          >
                            <ArrowLeft className="h-5 w-5 rotate-180" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <MessageSquare className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Your Messages</h3>
                    <p className="text-muted-foreground max-w-sm mb-6">
                      Connect with your ride partners and friends. Select a conversation from the list to start chatting.
                    </p>
                    <Button>
                      <Users className="h-4 w-4 mr-2" />
                      Find New Connections
                    </Button>
                  </div>
                )}
              </Card>
            </div>
            
            <Card className="bg-primary/5 border border-primary/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Make the Most of Your Ride Connections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-2 mt-0.5">
                      <Users className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium">Connect Before Rides</span>
                      <p className="text-muted-foreground">Chat with your ride partner before meeting to coordinate pickup details and arrival times</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-2 mt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium">Share Routes & Tips</span>
                      <p className="text-muted-foreground">Exchange favorite routes, shortcuts, and local knowledge with fellow travelers</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-2 mt-0.5">
                      <Heart className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium">Turn Rides into Friendships</span>
                      <p className="text-muted-foreground">Build lasting connections with compatible ride partners who share your interests</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}