import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertRideSchema, LocationSchema, RouteSchema } from "@shared/schema";
import { z } from "zod";

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

  const httpServer = createServer(app);
  return httpServer;
}
