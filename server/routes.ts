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
  Location,
  Route 
} from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";

// WebSocket clients and connection management
interface WebSocketClient extends WebSocket {
  userId?: number;
  isAlive: boolean;
}

export async function registerRoutes(app: Express) {
  // User routes
  app.post("/api/users/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(409).json({ error: "User with this email already exists" });
      }
      
      // Hash password and create user
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(data.password, salt);
      
      // Remove password field (not in User type) and add passwordHash
      const { password, ...userWithoutPassword } = data;
      
      const user = await storage.createUser({
        ...userWithoutPassword,
        passwordHash,
        role: data.role || 'user'
      });
      
      res.status(201).json({ 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      });
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.post("/api/users/login", async (req, res) => {
    try {
      const { email, password } = z.object({
        email: z.string().email(),
        password: z.string()
      }).parse(req.body);

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      res.json({ 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      });
    } catch (error) {
      res.status(400).json({ error: "Invalid login data" });
    }
  });

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
  
  return httpServer;
}