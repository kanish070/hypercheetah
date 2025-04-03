import { pgTable, text, serial, doublePrecision, integer, timestamp, jsonb, boolean, primaryKey, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session table for connect-pg-simple
export const sessions = pgTable("session", {
  sid: text("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire", { mode: "date" }).notNull()
});

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("user"), // "admin" or "user"
  avatar: text("avatar"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  // Default comfort preferences (can be overridden by ride-specific preferences)
  comfortPreferences: jsonb("comfort_preferences"),
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
  comfortPreferences: jsonb("comfort_preferences"), // Ride-specific comfort preferences 
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

// Saved Locations table
export const savedLocations = pgTable("saved_locations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  locationData: jsonb("location_data").notNull(), // JSON containing location information
  isFavorite: boolean("is_favorite").default(false),
  category: text("category").default("other"), // home, work, favorite, other, etc.
  lastUsed: timestamp("last_used"),
  geofenceRadius: integer("geofence_radius"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").notNull().defaultNow()
}, (table) => {
  return {
    userIdNameIdx: uniqueIndex("saved_loc_user_id_name_idx").on(table.userId, table.name)
  };
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

export const insertSavedLocationSchema = createInsertSchema(savedLocations).omit({
  id: true,
  lastUsed: true,
  createdAt: true
});

// Type definitions for frontend use
export type Location = {
  lat: number;
  lng: number;
  name?: string;
  address?: string;
  placeId?: string;
  category?: string;
};

export type SavedLocation = {
  id?: number;
  userId?: number;
  name: string;
  desc: string;
  icon: string;
  location: Location;
  isFavorite?: boolean;
  category?: string; // home, work, favorite, recent, etc.
  lastUsed?: Date;
  geofenceRadius?: number; // in meters
  tags?: string[];
};

export type Route = {
  start: Location;
  end: Location;
  waypoints: Location[];
  stops?: Location[];
  estimatedDuration?: number; // in seconds
  estimatedDistance?: number; // in meters
  trafficCondition?: string; // light, moderate, heavy
  weatherCondition?: string; // clear, rain, snow, etc.
  avoidTolls?: boolean;
  avoidHighways?: boolean;
  routePreference?: string; // fastest, shortest, eco, scenic
  calculatedAt?: Date;
};

// Comfort Preferences Type
export type ComfortPreferences = {
  temperature?: number; // Temperature setting (16-28 Celsius)
  music?: {
    genre?: string; // Pop, Rock, Classical, Jazz, etc.
    volume?: number; // 0-10 scale
    allowDriverChoice?: boolean;
  };
  conversation?: string; // 'chatty', 'quiet', 'professional', 'minimal', 'driver_choice'
  seatingPreference?: string; // 'front', 'back_left', 'back_right', 'back_middle', 'no_preference'
  smoking?: boolean; // Whether smoking is allowed
  petsAllowed?: boolean; // Whether pets are allowed
  airConditioning?: string; // 'off', 'low', 'medium', 'high', 'auto'
  windowPreference?: string; // 'closed', 'cracked', 'half_open', 'fully_open', 'driver_choice'
  luggageSpace?: number; // Required luggage space in liters
  accessibility?: string[]; // Array of accessibility requirements ['wheelchair', 'step_free', 'service_animal', etc.]
  childSeat?: string; // 'none', 'infant', 'toddler', 'booster'
  additionalStops?: boolean; // Whether additional stops are acceptable
  maxWaitTime?: number; // Maximum wait time in minutes
  routePreference?: string; // 'fastest', 'scenic', 'least_traffic', 'highway', 'no_highway'
  paymentMethod?: string; // 'cash', 'card', 'app', 'upi'
  foodDrink?: boolean; // Whether eating/drinking is allowed in the vehicle
  phoneCharger?: string[]; // Array of needed charger types ['usb_c', 'lightning', 'micro_usb', etc.]
  safetyPreferences?: string[]; // Array of safety preferences ['female_driver', 'verified_driver', 'dash_cam', etc.]
  notes?: string; // Any additional notes or preferences
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
export type InsertSavedLocation = z.infer<typeof insertSavedLocationSchema>;
export type DbSavedLocation = typeof savedLocations.$inferSelect;