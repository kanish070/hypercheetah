import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, type WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertRideSchema, insertMessageSchema, LocationSchema, RouteSchema } from "@shared/schema";
import { z } from "zod";

// WebSocket message types
const wsMessageSchema = z.object({
  type: z.enum(["chat"]),
  rideId: z.number(),
  senderId: z.number(),
  content: z.string()
});

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const user = await storage.createUser(data);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.patch("/api/users/:id/mode", async (req, res) => {
    try {
      const { mode } = z.object({ mode: z.enum(["passenger", "rider"]) }).parse(req.body);
      const user = await storage.updateUserMode(parseInt(req.params.id), mode);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid mode" });
    }
  });

  app.patch("/api/users/:id/location", async (req, res) => {
    try {
      const location = LocationSchema.parse(req.body);
      const user = await storage.updateUserLocation(parseInt(req.params.id), location);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid location data" });
    }
  });

  app.patch("/api/users/:id/active", async (req, res) => {
    try {
      const { active } = z.object({ active: z.boolean() }).parse(req.body);
      const user = await storage.setUserActive(parseInt(req.params.id), active);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid active status" });
    }
  });

  // Ride routes
  app.post("/api/rides", async (req, res) => {
    try {
      const data = insertRideSchema.parse(req.body);
      const ride = await storage.createRide(data);
      res.json(ride);
    } catch (error) {
      res.status(400).json({ error: "Invalid ride data" });
    }
  });

  app.get("/api/rides/nearby", async (req, res) => {
    try {
      const { location, type } = z.object({
        location: LocationSchema,
        type: z.enum(["offer", "request"])
      }).parse(req.query);

      const rides = await storage.getNearbyRides(location, type);
      res.json(rides);
    } catch (error) {
      res.status(400).json({ error: "Invalid search parameters" });
    }
  });

  app.post("/api/rides/match", async (req, res) => {
    try {
      const { route } = z.object({ route: RouteSchema }).parse(req.body);
      const matches = await storage.findMatchingRides(route);
      res.json(matches);
    } catch (error) {
      res.status(400).json({ error: "Invalid route data" });
    }
  });

  app.patch("/api/rides/:id/status", async (req, res) => {
    try {
      const { status } = z.object({
        status: z.enum(["active", "matched", "completed"])
      }).parse(req.body);

      const ride = await storage.updateRideStatus(parseInt(req.params.id), status);
      res.json(ride);
    } catch (error) {
      res.status(400).json({ error: "Invalid status" });
    }
  });

  // Message routes
  app.get("/api/messages/:rideId", async (req, res) => {
    try {
      const messages = await storage.getMessages(parseInt(req.params.rideId));
      res.json(messages);
    } catch (error) {
      res.status(400).json({ error: "Failed to fetch messages" });
    }
  });

  const httpServer = createServer(app);

  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Store active WebSocket connections
  const connections = new Map<number, WebSocket>();

  wss.on('connection', (ws) => {
    let userId: number | undefined;

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());

        // Handle initial connection setup
        if (message.type === 'init') {
          userId = message.userId;
          connections.set(userId, ws);
          return;
        }

        // Handle chat messages
        if (message.type === 'chat') {
          const validatedMessage = wsMessageSchema.parse(message);

          // Store the message
          const storedMessage = await storage.createMessage({
            rideId: validatedMessage.rideId,
            senderId: validatedMessage.senderId,
            content: validatedMessage.content
          });

          // Get ride to find participants
          const ride = await storage.getRide(validatedMessage.rideId);
          if (!ride) return;

          // Broadcast to all participants
          const participants = [ride.userId];
          participants.forEach(participantId => {
            const participantWs = connections.get(participantId);
            if (participantWs?.readyState === WebSocket.OPEN) {
              participantWs.send(JSON.stringify({
                type: 'chat',
                message: storedMessage
              }));
            }
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (userId) {
        connections.delete(userId);
      }
    });
  });

  return httpServer;
}