import { pgTable, text, serial, doublePrecision, integer, timestamp, jsonb, boolean, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("user"), // "admin" or "user"
  avatar: text("avatar"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Rides table
export const rides = pgTable("rides", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // "offer" or "request"
  status: text("status").notNull(), // "active", "completed", "cancelled"
  routeData: jsonb("route_data").notNull(), // JSON containing route information
  vehicleType: text("vehicle_type").default("car"), // "car" or "bike"
  isPooling: boolean("is_pooling").default(false), // Whether this is a carpool ride (for price calculation)
  availableSeats: integer("available_seats").default(4),
  price: doublePrecision("price"),
  departureTime: timestamp("departure_time"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Ride matches table
export const rideMatches = pgTable("ride_matches", {
  id: serial("id").primaryKey(),
  requestRideId: integer("request_ride_id").notNull(),
  offerRideId: integer("offer_ride_id").notNull(),
  status: text("status").notNull().default("pending"), // "pending", "accepted", "rejected", "completed"
  matchScore: doublePrecision("match_score").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  rideMatchId: integer("ride_match_id").notNull(),
  senderId: integer("sender_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// User ratings table
export const userRatings = pgTable("user_ratings", {
  id: serial("id").primaryKey(),
  rideMatchId: integer("ride_match_id").notNull(),
  raterId: integer("rater_id").notNull(),
  ratedUserId: integer("rated_user_id").notNull(),
  rating: integer("rating").notNull(), // 1-5 star rating
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Achievements table
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  points: integer("points").notNull(),
  icon: text("icon").notNull(),
  criteria: text("criteria").notNull(),
  category: text("category").notNull(), // 'ride', 'social', 'eco', 'milestone'
  tier: text("tier").notNull(), // 'bronze', 'silver', 'gold', 'platinum'
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// User Achievements table (tracks which users have which achievements)
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  achievementId: integer("achievement_id").notNull(),
  progress: integer("progress").notNull().default(0), // 0-100
  unlocked: boolean("unlocked").notNull().default(false),
  unlockedAt: timestamp("unlocked_at"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true,
  passwordHash: true,
  createdAt: true
}).extend({
  password: z.string().min(8, "Password must be at least 8 characters")
});

export const insertRideSchema = createInsertSchema(rides).omit({ 
  id: true,
  createdAt: true 
});

export const insertRideMatchSchema = createInsertSchema(rideMatches).omit({ 
  id: true,
  createdAt: true 
});

export const insertMessageSchema = createInsertSchema(messages).omit({ 
  id: true,
  createdAt: true 
});

export const insertUserRatingSchema = createInsertSchema(userRatings).omit({ 
  id: true,
  createdAt: true 
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  unlockedAt: true,
  createdAt: true
});

// Type definitions for frontend use
export type Location = {
  lat: number;
  lng: number;
};

export type Route = {
  start: Location;
  end: Location;
  waypoints: Location[];
};

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertRide = z.infer<typeof insertRideSchema>;
export type Ride = typeof rides.$inferSelect & {
  route: Route; // For frontend convenience, parsed from routeData
};
export type InsertRideMatch = z.infer<typeof insertRideMatchSchema>;
export type RideMatch = typeof rideMatches.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertUserRating = z.infer<typeof insertUserRatingSchema>;
export type UserRating = typeof userRatings.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;