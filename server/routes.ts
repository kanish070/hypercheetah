import type { Express, Request, Response } from "express";
import { createServer } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertRideSchema, 
  insertRideMatchSchema, 
  insertMessageSchema, 
  insertUserRatingSchema,
  insertAchievementSchema,
  insertUserAchievementSchema,
  insertSavedLocationSchema,
  Location,
  Route,
  SavedLocation,
  User
} from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { setupAuth } from "./auth";

// WebSocket clients and connection management
interface WebSocketClient extends WebSocket {
  userId?: number;
  isAlive: boolean;
}

export async function registerRoutes(app: Express) {
  // Setup auth routes with Passport
  setupAuth(app);
  
  // User routes - auth routes are now handled by setupAuth in auth.ts

  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Don't return the password hash
      const { passwordHash, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });
  
  // Get nearby users
  app.get("/api/users/nearby", async (req, res) => {
    try {
      const radiusStr = req.query.radius as string;
      const radius = radiusStr ? parseInt(radiusStr) : 10; // Default 10km radius
      
      // If authenticated, use the current user's location
      if (req.isAuthenticated()) {
        const currentUserId = (req.user as any).id;
        
        // In a real app, we would get the user's current location from a database or cache
        // For now, we'll use a simulated location for Vadodara
        const currentUserLocation = { lat: 22.3072, lng: 73.1812 }; // Alkapuri, Vadodara
        
        // Get all users within the radius
        const users = await storage.getNearbyUsers(currentUserLocation, radius);
        
        // Filter out the current user
        const nearbyUsers = users
          .filter((user: User) => user.id !== currentUserId)
          .map((user: User) => {
            // Don't return password hashes
            const { passwordHash, ...userWithoutPassword } = user;
            return userWithoutPassword;
          });
        
        res.json(nearbyUsers);
      } else {
        res.status(401).json({ error: "Not authenticated" });
      }
    } catch (error) {
      console.error("Error getting nearby users:", error);
      res.status(500).json({ error: "Failed to fetch nearby users" });
    }
  });

  // Ride routes
  app.post("/api/rides", async (req, res) => {
    try {
      // Parse and validate the ride data
      const rideData = insertRideSchema.parse(req.body);
      const route = req.body.route as Route;
      
      if (!route) {
        return res.status(400).json({ error: "Route data is required" });
      }
      
      const ride = await storage.createRide({ ...rideData, route });
      res.status(201).json(ride);
    } catch (error) {
      res.status(400).json({ error: "Invalid ride data" });
    }
  });

  app.get("/api/rides/:id", async (req, res) => {
    try {
      const rideId = parseInt(req.params.id);
      const ride = await storage.getRide(rideId);
      
      if (!ride) {
        return res.status(404).json({ error: "Ride not found" });
      }
      
      res.json(ride);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ride" });
    }
  });

  app.get("/api/users/:userId/rides", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const rides = await storage.getUserRides(userId);
      res.json(rides);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user rides" });
    }
  });

  app.patch("/api/rides/:id/status", async (req, res) => {
    try {
      const { status } = z.object({
        status: z.string()
      }).parse(req.body);

      const rideId = parseInt(req.params.id);
      const updatedRide = await storage.updateRideStatus(rideId, status);
      res.json(updatedRide);
    } catch (error) {
      res.status(400).json({ error: "Invalid status update" });
    }
  });

  app.get("/api/rides/nearby", async (req, res) => {
    try {
      const locationStr = req.query.location as string;
      const type = req.query.type as string;
      const radiusStr = req.query.radius as string;
      
      if (!locationStr || !type) {
        return res.status(400).json({ error: "Location and type are required" });
      }
      
      const location = JSON.parse(locationStr) as Location;
      const radius = radiusStr ? parseInt(radiusStr) : 10; // Default 10km radius
      
      const nearbyRides = await storage.getNearbyRides(location, type, radius);
      res.json(nearbyRides);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch nearby rides" });
    }
  });

  app.post("/api/rides/match", async (req, res) => {
    try {
      const { route, type } = req.body;
      
      if (!route || !type) {
        return res.status(400).json({ error: "Route and type are required" });
      }
      
      const matches = await storage.findRideMatches(route, type);
      res.json(matches);
    } catch (error) {
      res.status(500).json({ error: "Failed to find ride matches" });
    }
  });

  // Ride Match routes
  app.post("/api/ride-matches", async (req, res) => {
    try {
      const matchData = insertRideMatchSchema.parse(req.body);
      const match = await storage.createRideMatch(matchData);
      res.status(201).json(match);
    } catch (error) {
      res.status(400).json({ error: "Invalid ride match data" });
    }
  });

  app.get("/api/rides/:rideId/matches", async (req, res) => {
    try {
      const rideId = parseInt(req.params.rideId);
      const matches = await storage.getRideMatches(rideId);
      res.json(matches);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ride matches" });
    }
  });

  app.patch("/api/ride-matches/:id/status", async (req, res) => {
    try {
      const { status } = z.object({
        status: z.string()
      }).parse(req.body);

      const matchId = parseInt(req.params.id);
      const updatedMatch = await storage.updateRideMatchStatus(matchId, status);
      res.json(updatedMatch);
    } catch (error) {
      res.status(400).json({ error: "Invalid status update" });
    }
  });

  // Message routes
  app.get("/api/messages/:rideMatchId", async (req, res) => {
    try {
      const rideMatchId = parseInt(req.params.rideMatchId);
      const messages = await storage.getMessages(rideMatchId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Rating routes
  app.post("/api/ratings", async (req, res) => {
    try {
      const ratingData = insertUserRatingSchema.parse(req.body);
      const rating = await storage.createRating(ratingData);
      res.status(201).json(rating);
    } catch (error) {
      res.status(400).json({ error: "Invalid rating data" });
    }
  });

  app.get("/api/users/:userId/ratings", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const ratings = await storage.getUserRatings(userId);
      res.json(ratings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user ratings" });
    }
  });
  
  // Achievement routes
  app.get("/api/achievements", async (req, res) => {
    try {
      const category = req.query.category as string;
      let achievements;
      
      if (category) {
        achievements = await storage.getAchievementsByCategory(category);
      } else {
        achievements = await storage.getAllAchievements();
      }
      
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch achievements" });
    }
  });
  
  app.get("/api/achievements/:id", async (req, res) => {
    try {
      const achievementId = parseInt(req.params.id);
      const achievement = await storage.getAchievement(achievementId);
      
      if (!achievement) {
        return res.status(404).json({ error: "Achievement not found" });
      }
      
      res.json(achievement);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch achievement" });
    }
  });
  
  app.post("/api/achievements", async (req, res) => {
    try {
      const achievementData = insertAchievementSchema.parse(req.body);
      const achievement = await storage.createAchievement(achievementData);
      res.status(201).json(achievement);
    } catch (error) {
      res.status(400).json({ error: "Invalid achievement data" });
    }
  });
  
  // User Achievement routes
  app.get("/api/users/:userId/achievements", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const achievements = await storage.getUserAchievements(userId);
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user achievements" });
    }
  });
  
  app.post("/api/users/:userId/achievements", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { achievementId, progress, unlocked } = z.object({
        achievementId: z.number(),
        progress: z.number().default(0),
        unlocked: z.boolean().default(false)
      }).parse(req.body);
      
      const userAchievement = await storage.createUserAchievement({
        userId,
        achievementId,
        progress,
        unlocked
      });
      
      res.status(201).json(userAchievement);
    } catch (error) {
      res.status(400).json({ error: "Invalid user achievement data" });
    }
  });
  
  app.patch("/api/user-achievements/:id", async (req, res) => {
    try {
      const userAchievementId = parseInt(req.params.id);
      const { progress, unlocked } = z.object({
        progress: z.number(),
        unlocked: z.boolean().optional()
      }).parse(req.body);
      
      const updatedUserAchievement = await storage.updateUserAchievementProgress(
        userAchievementId,
        progress,
        unlocked
      );
      
      res.json(updatedUserAchievement);
    } catch (error) {
      res.status(400).json({ error: "Invalid user achievement update" });
    }
  });

  // Create HTTP server and WebSocket server
  const httpServer = createServer(app);
  
  // Use WebSocketServer with a specific path to avoid conflicts with Vite
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws-chat'
  });
  
  // WebSocket connection handling
  wss.on("connection", (ws: WebSocketClient) => {
    ws.isAlive = true;
    
    // Handle WebSocket messages
    ws.on("message", async (message: string) => {
      try {
        const data = JSON.parse(message);
        
        // Initialize connection with user ID
        if (data.type === "init") {
          ws.userId = data.userId;
        }
        
        // Handle chat messages
        if (data.type === "chat") {
          const { rideId, senderId, content } = data;
          
          // In a real app, store the message in DB
          const newMessage = await storage.createMessage({
            rideMatchId: rideId,
            senderId,
            content
          });
          
          // Broadcast the message to all connected clients
          wss.clients.forEach((client) => {
            const wsClient = client as WebSocketClient;
            if (wsClient.readyState === WebSocket.OPEN) {
              wsClient.send(JSON.stringify({
                type: "chat",
                message: newMessage
              }));
            }
          });
        }
      } catch (err) {
        console.error("WebSocket message error:", err);
      }
    });
    
    // Handle WebSocket ping/pong for connection health
    ws.on("pong", () => {
      ws.isAlive = true;
    });
    
    // Handle WebSocket close
    ws.on("close", () => {
      // Clean up any resources if needed
    });
  });
  
  // Eco impact routes
  app.get("/api/users/:userId/eco-impact", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      // This would typically come from analyzing the user's rides
      // For now, we'll return structured data
      res.json({
        co2Saved: 135,
        treesEquivalent: 6,
        milesDriven: 842,
        fuelSaved: 56,
        singleUseRides: 13,
        sharedRides: 21,
        plasticSaved: 42,
        waterSaved: 320,
        energySaved: 178,
        carbonFootprint: 245
      });
    } catch (error) {
      console.error("Error getting eco impact:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  
  // Green achievements endpoints
  app.get("/api/users/:userId/eco-achievements", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      // Get all user achievements first
      const allAchievements = await storage.getUserAchievements(userId);
      // Filter only eco-related achievements
      const ecoAchievements = allAchievements.filter(
        achievement => achievement.achievement.category === 'eco'
      );
      res.json(ecoAchievements);
    } catch (error) {
      console.error("Error getting eco achievements:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  
  // Eco goals endpoints
  app.get("/api/users/:userId/eco-goals", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      // For this demo, we'll return structured sample data
      res.json([
        {
          id: 1,
          name: "Reduce CO2 emissions",
          target: 200,
          current: 135,
          unit: "kg",
          dueDate: "Apr 30, 2025",
          category: "carbon",
          completed: false
        },
        {
          id: 2,
          name: "Share more rides",
          target: 30,
          current: 21,
          unit: "rides",
          dueDate: "May 15, 2025",
          category: "carbon",
          completed: false
        },
        {
          id: 3,
          name: "Plant trees equivalence",
          target: 10,
          current: 6,
          unit: "trees",
          dueDate: "Jun 20, 2025",
          category: "trees",
          completed: false
        },
        {
          id: 4,
          name: "Save fuel",
          target: 50,
          current: 56,
          unit: "L",
          dueDate: "Apr 10, 2025",
          category: "energy",
          completed: true
        }
      ]);
    } catch (error) {
      console.error("Error getting eco goals:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Leaderboard route
  app.get("/api/leaderboard", async (req, res) => {
    try {
      // This would typically come from analyzing all users' achievements
      // For now, we'll return mock data
      res.json([
        {
          id: 2,
          name: "Emily Chen",
          avatar: "https://randomuser.me/api/portraits/women/44.jpg",
          points: 1250,
          rank: 1,
          level: 8,
          achievements: 15,
          isCurrentUser: false
        },
        {
          id: 3,
          name: "Michael Rodriguez",
          avatar: "https://randomuser.me/api/portraits/men/32.jpg",
          points: 980,
          rank: 2,
          level: 7,
          achievements: 12,
          isCurrentUser: false
        },
        {
          id: 1,
          name: "Kanish",
          avatar: "/images/kanish-profile.jpg",
          points: 850,
          rank: 3,
          level: 4,
          achievements: 9,
          isCurrentUser: true
        },
        {
          id: 4,
          name: "Sarah Johnson",
          avatar: "https://randomuser.me/api/portraits/women/22.jpg",
          points: 720,
          rank: 4,
          level: 5,
          achievements: 8,
          isCurrentUser: false
        },
        {
          id: 5,
          name: "David Kim",
          avatar: "https://randomuser.me/api/portraits/men/62.jpg",
          points: 650,
          rank: 5,
          level: 4,
          achievements: 7,
          isCurrentUser: false
        }
      ]);
    } catch (error) {
      console.error("Error getting leaderboard:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Rewards route
  app.get("/api/rewards", async (req, res) => {
    try {
      // This would typically come from a database
      // For now, we'll return mock data
      res.json([
        {
          id: 1,
          name: "Free Ride Credit",
          description: "Get a $15 credit towards your next ride",
          cost: 300,
          type: "free_ride",
          expiry: null,
          image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZHJpdmluZ3xlbnwwfHwwfHx8MA%3D%3D",
          isNew: true,
          isFeatured: true
        },
        {
          id: 2,
          name: "Coffee Discount",
          description: "20% off at participating coffee shops",
          cost: 150,
          type: "partner",
          expiry: "2025-06-30",
          image: "https://images.unsplash.com/photo-1509042239860-f0ca3bf6d889?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y29mZmVlfGVufDB8fDB8fHww",
          isNew: false,
          isFeatured: false,
          partner: "Local Brew"
        },
        {
          id: 3,
          name: "Premium Features",
          description: "Unlock premium app features for 30 days",
          cost: 500,
          type: "upgrade",
          expiry: null,
          image: "https://images.unsplash.com/photo-1556155092-490a1ba16284?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dXBncmFkZXxlbnwwfHwwfHx8MA%3D%3D",
          isNew: false,
          isFeatured: true
        },
        {
          id: 4,
          name: "Gas Discount",
          description: "10% off at participating gas stations",
          cost: 250,
          type: "partner",
          expiry: "2025-05-15",
          image: "https://images.unsplash.com/photo-1545235617-9465d2a55698?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z2FzJTIwc3RhdGlvbnxlbnwwfHwwfHx8MA%3D%3D",
          isNew: true,
          isFeatured: false,
          partner: "QuickFuel"
        }
      ]);
    } catch (error) {
      console.error("Error getting rewards:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  
  // Ping all clients every 30 seconds to keep connections alive
  const interval = setInterval(() => {
    wss.clients.forEach((client) => {
      const ws = client as WebSocketClient;
      if (!ws.isAlive) return ws.terminate();
      
      ws.isAlive = false;
      ws.ping(() => {});
    });
  }, 30000);
  
  // Clean up interval on server close
  wss.on("close", () => {
    clearInterval(interval);
  });
  
  // Saved Location routes
  app.get("/api/users/:userId/locations", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const category = req.query.category as string;
      
      let locations;
      if (category) {
        locations = await storage.getUserSavedLocationsByCategory(userId, category);
      } else {
        locations = await storage.getUserSavedLocations(userId);
      }
      
      res.json(locations);
    } catch (error) {
      console.error("Error getting user saved locations:", error);
      res.status(500).json({ error: "Failed to fetch saved locations" });
    }
  });
  
  app.get("/api/locations/:id", async (req, res) => {
    try {
      const locationId = parseInt(req.params.id);
      const location = await storage.getSavedLocation(locationId);
      
      if (!location) {
        return res.status(404).json({ error: "Saved location not found" });
      }
      
      res.json(location);
    } catch (error) {
      console.error("Error getting saved location:", error);
      res.status(500).json({ error: "Failed to fetch saved location" });
    }
  });
  
  app.post("/api/locations", async (req, res) => {
    try {
      const locationData = insertSavedLocationSchema.parse(req.body);
      
      // Validate location data
      if (!locationData.locationData) {
        return res.status(400).json({ error: "Location data is required" });
      }
      
      const savedLocation = await storage.createSavedLocation(locationData);
      res.status(201).json(savedLocation);
    } catch (error) {
      console.error("Error creating saved location:", error);
      res.status(400).json({ error: "Invalid location data" });
    }
  });
  
  app.patch("/api/locations/:id", async (req, res) => {
    try {
      const locationId = parseInt(req.params.id);
      const locationUpdate = req.body as Partial<SavedLocation>;
      
      const updatedLocation = await storage.updateSavedLocation(locationId, locationUpdate);
      res.json(updatedLocation);
    } catch (error) {
      console.error("Error updating saved location:", error);
      res.status(400).json({ error: "Invalid location update data" });
    }
  });
  
  app.delete("/api/locations/:id", async (req, res) => {
    try {
      const locationId = parseInt(req.params.id);
      const success = await storage.deleteSavedLocation(locationId);
      
      if (!success) {
        return res.status(404).json({ error: "Saved location not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting saved location:", error);
      res.status(500).json({ error: "Failed to delete saved location" });
    }
  });
  
  return httpServer;
}