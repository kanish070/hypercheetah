import { pgTable, text, serial, doublePrecision, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Types for location coordinates
export const LocationSchema = z.object({
  lat: z.number(),
  lng: z.number()
});

export type Location = z.infer<typeof LocationSchema>;

// Types for route information
export const RouteSchema = z.object({
  start: LocationSchema,
  end: LocationSchema,
  waypoints: z.array(LocationSchema)
});

export type Route = z.infer<typeof RouteSchema>;

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  currentMode: text("current_mode").notNull(), // "passenger" or "rider"
  currentLocation: jsonb("current_location").$type<Location>(),
  active: boolean("active").notNull().default(false)
});

// Active rides/requests
export const rides = pgTable("rides", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").notNull(),
  type: text("type").notNull(), // "offer" for riders, "request" for passengers
  route: jsonb("route").$type<Route>().notNull(),
  status: text("status").notNull(), // "active", "matched", "completed"
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// For creating new users
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true,
  currentLocation: true,
  active: true
});

// For creating new rides
export const insertRideSchema = createInsertSchema(rides).omit({
  id: true,
  createdAt: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertRide = z.infer<typeof insertRideSchema>;
export type Ride = typeof rides.$inferSelect;
