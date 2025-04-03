import { 
  users, 
  rides, 
  rideMatches, 
  messages, 
  userRatings,
  achievements,
  userAchievements,
  savedLocations,
  type User, 
  type InsertUser, 
  type Ride, 
  type InsertRide, 
  type Route,
  type Location,
  type RideMatch, 
  type InsertRideMatch, 
  type Message, 
  type InsertMessage, 
  type UserRating, 
  type InsertUserRating,
  type Achievement,
  type InsertAchievement,
  type UserAchievement,
  type InsertUserAchievement,
  type SavedLocation,
  type InsertSavedLocation,
  type DbSavedLocation
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and, or, gte, lte, not, like, desc, sql } from "drizzle-orm";
import pg from "pg";
import connectPg from "connect-pg-simple";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const { Pool } = pg;

// Set up database connections for PostgreSQL
const PostgresSessionStore = connectPg(session);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);

export interface IStorage {
  // Session store for authentication
  sessionStore: session.Store;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<User, "id" | "createdAt"> & { passwordHash: string }): Promise<User>;
  updateUser(id: number, userData: Partial<Omit<User, "id" | "createdAt" | "passwordHash">> & { password?: string }): Promise<User>;
  getNearbyUsers(location: Location, radius: number): Promise<User[]>;
  updateUserLocation(userId: number, location: Location): Promise<User>;

  // Ride operations
  getRide(id: number): Promise<Ride | undefined>;
  getUserRides(userId: number): Promise<Ride[]>;
  createRide(ride: InsertRide & { route: Route }): Promise<Ride>;
  updateRideStatus(id: number, status: string): Promise<Ride>;
  getNearbyRides(location: Location, type: string, radius: number): Promise<Ride[]>;
  findRideMatches(route: Route, type: string): Promise<Ride[]>;

  // Ride Match operations
  createRideMatch(match: InsertRideMatch): Promise<RideMatch>;
  getRideMatches(rideId: number): Promise<RideMatch[]>;
  updateRideMatchStatus(id: number, status: string): Promise<RideMatch>;

  // Message operations
  getMessages(rideMatchId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Rating operations
  createRating(rating: InsertUserRating): Promise<UserRating>;
  getUserRatings(userId: number): Promise<UserRating[]>;

  // Achievement operations
  getAchievement(id: number): Promise<Achievement | undefined>;
  getAllAchievements(): Promise<Achievement[]>;
  getAchievementsByCategory(category: string): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;

  // User Achievement operations
  getUserAchievements(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]>;
  createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement>;
  updateUserAchievementProgress(id: number, progress: number, unlocked?: boolean): Promise<UserAchievement>;

  // Saved Location operations
  getSavedLocation(id: number): Promise<SavedLocation | undefined>;
  getUserSavedLocations(userId: number): Promise<SavedLocation[]>;
  createSavedLocation(location: InsertSavedLocation): Promise<SavedLocation>;
  updateSavedLocation(id: number, location: Partial<SavedLocation>): Promise<SavedLocation>;
  deleteSavedLocation(id: number): Promise<boolean>;
  getUserSavedLocationsByCategory(userId: number, category: string): Promise<SavedLocation[]>;
}

export class MemStorage implements IStorage {
  sessionStore: session.Store;
  private users: Map<number, User>;
  private rides: Map<number, Ride>;
  private rideMatches: Map<number, RideMatch>;
  private messages: Map<number, Message>;
  private userRatings: Map<number, UserRating>;
  private achievements: Map<number, Achievement>;
  private userAchievements: Map<number, UserAchievement>;
  private savedLocations: Map<number, SavedLocation>;
  private userId: number;
  private rideId: number;
  private rideMatchId: number;
  private messageId: number;
  private userRatingId: number;
  private achievementId: number;
  private userAchievementId: number;
  private savedLocationId: number;

  constructor() {
    // Initialize memory store for sessions
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Prune expired entries every 24h
    });

    this.users = new Map();
    this.rides = new Map();
    this.rideMatches = new Map();
    this.messages = new Map();
    this.userRatings = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    this.savedLocations = new Map();
    this.userId = 1;
    this.rideId = 1;
    this.rideMatchId = 1;
    this.messageId = 1;
    this.userRatingId = 1;
    this.achievementId = 1;
    this.userAchievementId = 1;
    this.savedLocationId = 1;

    // Initialize with mock data
    this.initMockData();
  }

  private initMockData() {
    // Initialize empty data structures
    this.users = new Map();
    this.rides = new Map();
    this.rideMatches = new Map();
    this.messages = new Map();
    this.userRatings = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    this.savedLocations = new Map();
    this.userId = 1;
    this.rideId = 1;
    this.rideMatchId = 1;
    this.messageId = 1;
    this.userRatingId = 1;
    this.achievementId = 1;
    this.userAchievementId = 1;
    this.savedLocationId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: Omit<User, "id" | "createdAt"> & { passwordHash: string }): Promise<User> {
    console.log("Creating user with data:", {
      name: insertUser.name,
      email: insertUser.email,
      hasPasswordHash: !!insertUser.passwordHash,
      passwordHashLength: insertUser.passwordHash?.length
    });

    const id = this.userId++;
    const user: User = { 
      id, 
      ...insertUser, 
      createdAt: new Date() 
    };

    // Verify the passwordHash was correctly transferred
    console.log("User created with ID:", id, {
      hasPasswordHash: !!user.passwordHash,
      passwordHashLength: user.passwordHash?.length
    });

    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<Omit<User, "id" | "createdAt" | "passwordHash">> & { password?: string }): Promise<User> {
    const user = await this.getUser(id);

    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    // Handle password update if provided
    if (userData.password) {
      // This would be the actual hash function in auth.ts
      // Here we're just simulating it for storage implementation
      const hashPassword = async (password: string) => {
        const crypto = require('crypto');
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
        return `${hash}.${salt}`;
      };

      // Update the passwordHash
      user.passwordHash = await hashPassword(userData.password);

      // Remove password from userData to avoid storing it directly
      delete userData.password;
    }

    // Update other user properties
    Object.assign(user, userData);

    // Update the user in the map
    this.users.set(id, user);

    return user;
  }

  async getNearbyUsers(location: Location, radius: number): Promise<User[]> {
    // Get all users
    const allUsers = Array.from(this.users.values());

    // In a real implementation, we would filter users by their last known location
    // For now, we'll simulate that all users are nearby (within the radius)
    return allUsers;
  }

  async updateUserLocation(userId: number, location: Location): Promise<User> {
    const user = await this.getUser(userId);

    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }

    // In a real implementation, we would update the user's location in the database
    // For this demo in memory storage, we'll just return the user without updates
    return user;
  }

  // Ride operations
  async getRide(id: number): Promise<Ride | undefined> {
    return this.rides.get(id);
  }

  async getUserRides(userId: number): Promise<Ride[]> {
    return Array.from(this.rides.values())
      .filter(ride => ride.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Calculate price based on distance and vehicle type
  private calculatePrice(route: Route, vehicleType: string = 'car', isPooling: boolean = false): number {
    // Get distance between start and end points
    const distance = this.getDistanceInKm(route.start, route.end);

    // Calculate price based on vehicle type
    let pricePerKm = 15; // Default price for car is 15 rupees per km

    if (vehicleType === 'bike') {
      pricePerKm = 6; // Price for bike is 6 rupees per km
    } else if (vehicleType === 'car' && isPooling) {
      // For carpooling, the price per km is reduced since costs are shared
      pricePerKm = 12; // Slightly reduced rate for carpooling
    }

    const price = Math.ceil(distance * pricePerKm); // Round up to nearest rupee

    return price;
  }

  async createRide(rideData: InsertRide & { route: Route }): Promise<Ride> {
    const id = this.rideId++;
    const { route, ...insertRide } = rideData;

    // Get vehicle type and pooling status from the request (or use defaults)
    const vehicleType = insertRide.vehicleType || 'car';
    const isPooling = insertRide.isPooling || false;

    // Calculate price based on vehicle type and pooling status
    const calculatedPrice = this.calculatePrice(route, vehicleType, isPooling);

    const ride: Ride = {
      id,
      ...insertRide,
      vehicleType: vehicleType, // Use the provided vehicle type or default
      isPooling: isPooling, // Use the provided pooling status or default
      availableSeats: insertRide.availableSeats ?? 4, // Default to 4 if undefined
      price: calculatedPrice, // Use calculated price based on distance and vehicle type
      departureTime: insertRide.departureTime ?? null,
      routeData: route, // Store the route in routeData
      route, // Keep the route for frontend convenience
      createdAt: new Date()
    };

    this.rides.set(id, ride);
    return ride;
  }

  async updateRideStatus(id: number, status: string): Promise<Ride> {
    const ride = await this.getRide(id);
    if (!ride) throw new Error("Ride not found");

    const updatedRide = { ...ride, status };
    this.rides.set(id, updatedRide);
    return updatedRide;
  }

  async getNearbyRides(location: Location, type: string, radius: number): Promise<Ride[]> {
    // Calculate distance between two points using Haversine formula
    const getDistanceInKm = (loc1: Location, loc2: Location): number => {
      const R = 6371; // Earth's radius in km
      const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
      const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) * 
        Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    return Array.from(this.rides.values())
      .filter(ride => {
        if (ride.type !== type) return false;
        if (ride.status !== 'active') return false;

        // For simplicity, just check the starting point
        const distance = getDistanceInKm(location, ride.route.start);
        return distance <= radius;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findRideMatches(route: Route, type: string): Promise<Ride[]> {
    // The opposite type we're looking for
    const oppositeType = type === 'request' ? 'offer' : 'request';

    // Calculate route overlap
    const calculateMatchScore = (route1: Route, route2: Route): number => {
      // Simple distance-based matching for the prototype
      const startDistance = this.getDistanceInKm(route1.start, route2.start);
      const endDistance = this.getDistanceInKm(route1.end, route2.end);

      // Lower distances mean better matches
      const maxDistance = 100; // km
      const startScore = Math.max(0, 1 - startDistance / maxDistance);
      const endScore = Math.max(0, 1 - endDistance / maxDistance);

      return (startScore + endScore) / 2; // Average score between 0 and 1
    };

    return Array.from(this.rides.values())
      .filter(ride => {
        if (ride.type !== oppositeType) return false;
        if (ride.status !== 'active') return false;

        const matchScore = calculateMatchScore(route, ride.route);
        return matchScore > 0.3; // Only return rides with reasonable match score
      })
      .sort((a, b) => {
        const scoreA = calculateMatchScore(route, a.route);
        const scoreB = calculateMatchScore(route, b.route);
        return scoreB - scoreA; // Sort by match score, highest first
      });
  }

  // Helper method for distance calculation
  private getDistanceInKm(loc1: Location, loc2: Location): number {
    const R = 6371; // Earth's radius in km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Ride Match operations
  async createRideMatch(match: InsertRideMatch): Promise<RideMatch> {
    const id = this.rideMatchId++;
    const rideMatch: RideMatch = {
      id,
      ...match,
      status: match.status || 'pending', // Default to pending if not provided
      createdAt: new Date()
    };
    this.rideMatches.set(id, rideMatch);
    return rideMatch;
  }

  async getRideMatches(rideId: number): Promise<RideMatch[]> {
    return Array.from(this.rideMatches.values())
      .filter(match => match.requestRideId === rideId || match.offerRideId === rideId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateRideMatchStatus(id: number, status: string): Promise<RideMatch> {
    const match = this.rideMatches.get(id);
    if (!match) throw new Error("Ride match not found");

    const updatedMatch = { ...match, status };
    this.rideMatches.set(id, updatedMatch);
    return updatedMatch;
  }

  // Message operations
  async getMessages(rideMatchId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.rideMatchId === rideMatchId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageId++;
    const newMessage: Message = {
      id,
      ...message,
      createdAt: new Date()
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  // Rating operations
  async createRating(rating: InsertUserRating): Promise<UserRating> {
    const id = this.userRatingId++;
    const newRating: UserRating = {
      id,
      ...rating,
      comment: rating.comment ?? null, // Set to null if undefined
      createdAt: new Date()
    };
    this.userRatings.set(id, newRating);
    return newRating;
  }

  async getUserRatings(userId: number): Promise<UserRating[]> {
    return Array.from(this.userRatings.values())
      .filter(rating => rating.ratedUserId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Achievement operations
  async getAchievement(id: number): Promise<Achievement | undefined> {
    return this.achievements.get(id);
  }

  async getAllAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values())
      .sort((a, b) => a.id - b.id);
  }

  async getAchievementsByCategory(category: string): Promise<Achievement[]> {
    return Array.from(this.achievements.values())
      .filter(achievement => achievement.category === category)
      .sort((a, b) => a.id - b.id);
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const id = this.achievementId++;
    const newAchievement: Achievement = {
      id,
      ...achievement,
      createdAt: new Date()
    };
    this.achievements.set(id, newAchievement);
    return newAchievement;
  }

  // User Achievement operations
  async getUserAchievements(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]> {
    return Array.from(this.userAchievements.values())
      .filter(userAchievement => userAchievement.userId === userId)
      .map(userAchievement => {
        const achievement = this.achievements.get(userAchievement.achievementId);
        if (!achievement) {
          throw new Error(`Achievement with id ${userAchievement.achievementId} not found`);
        }
        return {
          ...userAchievement,
          achievement
        };
      })
      .sort((a, b) => {
        // Sort by unlocked status first, then by most recently unlocked
        if (a.unlocked && !b.unlocked) return -1;
        if (!a.unlocked && b.unlocked) return 1;
        if (a.unlocked && b.unlocked && a.unlockedAt && b.unlockedAt) {
          return b.unlockedAt.getTime() - a.unlockedAt.getTime();
        }
        // If they're both not unlocked, sort by progress
        return b.progress - a.progress;
      });
  }

  async createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const id = this.userAchievementId++;
    const newUserAchievement: UserAchievement = {
      id,
      ...userAchievement,
      progress: userAchievement.progress || 0,
      unlocked: userAchievement.unlocked || false,
      unlockedAt: userAchievement.unlocked ? new Date() : null,
      createdAt: new Date()
    };
    this.userAchievements.set(id, newUserAchievement);
    return newUserAchievement;
  }

  async updateUserAchievementProgress(id: number, progress: number, unlocked?: boolean): Promise<UserAchievement> {
    const userAchievement = this.userAchievements.get(id);
    if (!userAchievement) {
      throw new Error(`User achievement with id ${id} not found`);
    }

    const wasUnlocked = userAchievement.unlocked;
    const isNowUnlocked = unlocked ?? (progress >= 100 ? true : wasUnlocked);

    const updatedUserAchievement: UserAchievement = {
      ...userAchievement,
      progress: Math.min(100, progress),
      unlocked: isNowUnlocked,
      unlockedAt: isNowUnlocked && !wasUnlocked ? new Date() : userAchievement.unlockedAt
    };

    this.userAchievements.set(id, updatedUserAchievement);
    return updatedUserAchievement;
  }

  // Saved Location operations
  async getSavedLocation(id: number): Promise<SavedLocation | undefined> {
    const savedLocation = this.savedLocations.get(id);
    if (!savedLocation) return undefined;

    return savedLocation;
  }

  async getUserSavedLocations(userId: number): Promise<SavedLocation[]> {
    return Array.from(this.savedLocations.values())
      .filter(location => location.userId === userId)
      .sort((a, b) => {
        // Sort by favorite status first, then by last used date
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;

        // If both have lastUsed dates, sort by most recent
        if (a.lastUsed && b.lastUsed) {
          return b.lastUsed.getTime() - a.lastUsed.getTime();
        }

        // If only one has lastUsed, prioritize the one with lastUsed
        if (a.lastUsed && !b.lastUsed) return -1;
        if (!a.lastUsed && b.lastUsed) return 1;

        // Otherwise, sort alphabetically by name
        return a.name.localeCompare(b.name);
      });
  }

  async createSavedLocation(location: InsertSavedLocation): Promise<SavedLocation> {
    const id = this.savedLocationId++;

    const newLocation: SavedLocation = {
      id,
      userId: location.userId,
      name: location.name,
      desc: location.description,
      icon: location.icon,
      location: JSON.parse(location.locationData as string),
      isFavorite: location.isFavorite || false,
      category: location.category || "other",
      lastUsed: new Date(),
      geofenceRadius: location.geofenceRadius === null ? undefined : location.geofenceRadius,
      tags: location.tags === null ? undefined : location.tags,
    };

    this.savedLocations.set(id, newLocation);
    return newLocation;
  }

  async updateSavedLocation(id: number, locationUpdate: Partial<SavedLocation>): Promise<SavedLocation> {
    const location = await this.getSavedLocation(id);
    if (!location) throw new Error("Saved location not found");

    const updatedLocation: SavedLocation = {
      ...location,
      ...locationUpdate,
      lastUsed: new Date()
    };

    this.savedLocations.set(id, updatedLocation);
    return updatedLocation;
  }

  async deleteSavedLocation(id: number): Promise<boolean> {
    const exists = this.savedLocations.has(id);
    if (!exists) return false;

    this.savedLocations.delete(id);
    return true;
  }

  async getUserSavedLocationsByCategory(userId: number, category: string): Promise<SavedLocation[]> {
    const userLocations = await this.getUserSavedLocations(userId);
    return userLocations.filter(location => location.category === category);
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // Initialize PostgreSQL session store
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });

    // Test database connection
    pool.query('SELECT NOW()', (err, res) => {
      if (err) {
        console.error('Database connection error:', err);
      } else {
        console.log('Database connected successfully');
      }
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error("Error getting user by id:", error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
      return result[0];
    } catch (error) {
      console.error("Error getting user by email:", error);
      return undefined;
    }
  }

  async createUser(userData: Omit<User, "id" | "createdAt"> & { passwordHash: string }): Promise<User> {
    try {
      const result = await db.insert(users).values({
        name: userData.name,
        email: userData.email,
        passwordHash: userData.passwordHash,
        role: userData.role || "user",
        avatar: userData.avatar
      }).returning();
      
      return result[0];
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Failed to create user");
    }
  }

  async updateUser(id: number, userData: Partial<Omit<User, "id" | "createdAt" | "passwordHash">> & { password?: string }): Promise<User> {
    try {
      // Handle password update separately
      if (userData.password) {
        const scryptAsync = promisify(scrypt);
        const salt = randomBytes(16).toString("hex");
        const buf = (await scryptAsync(userData.password, salt, 64)) as Buffer;
        const passwordHash = `${buf.toString("hex")}.${salt}`;

        // Remove password from userData
        delete userData.password;

        // Update with new password hash
        const result = await db.update(users)
          .set({ ...userData, passwordHash })
          .where(eq(users.id, id))
          .returning();

        return result[0];
      }

      // Update without changing password
      const result = await db.update(users)
        .set(userData)
        .where(eq(users.id, id))
        .returning();

      return result[0];
    } catch (error) {
      console.error("Error updating user:", error);
      throw new Error("Failed to update user");
    }
  }

  // Implement the rest of the methods as needed
  // For now, we'll focus on the user-related functionality which is required for auth

  // Return empty arrays or placeholder implementations for other methods
  async getNearbyUsers(location: Location, radius: number): Promise<User[]> {
    try {
      // For now, just return all users
      // In a real implementation, we would filter by location proximity
      const allUsers = await db.select().from(users);
      return allUsers;
    } catch (error) {
      console.error("Error getting nearby users:", error);
      return [];
    }
  }

  async updateUserLocation(userId: number, location: Location): Promise<User> {
    try {
      const user = await this.getUser(userId);
      if (!user) {
        throw new Error(`User with id ${userId} not found`);
      }
      
      // In a real implementation, we would update the user's location
      // For now, just return the user
      return user;
    } catch (error) {
      console.error("Error updating user location:", error);
      throw new Error("Failed to update user location");
    }
  }

  async getRide(id: number): Promise<Ride | undefined> {
    return undefined;
  }

  async getUserRides(userId: number): Promise<Ride[]> {
    return [];
  }

  async createRide(ride: InsertRide & { route: Route }): Promise<Ride> {
    throw new Error("Method not implemented");
  }

  async updateRideStatus(id: number, status: string): Promise<Ride> {
    throw new Error("Method not implemented");
  }

  async getNearbyRides(location: Location, type: string, radius: number): Promise<Ride[]> {
    return [];
  }

  async findRideMatches(route: Route, type: string): Promise<Ride[]> {
    return [];
  }

  async createRideMatch(match: InsertRideMatch): Promise<RideMatch> {
    throw new Error("Method not implemented");
  }

  async getRideMatches(rideId: number): Promise<RideMatch[]> {
    return [];
  }

  async updateRideMatchStatus(id: number, status: string): Promise<RideMatch> {
    throw new Error("Method not implemented");
  }

  async getMessages(rideMatchId: number): Promise<Message[]> {
    return [];
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    throw new Error("Method not implemented");
  }

  async createRating(rating: InsertUserRating): Promise<UserRating> {
    throw new Error("Method not implemented");
  }

  async getUserRatings(userId: number): Promise<UserRating[]> {
    return [];
  }

  async getAchievement(id: number): Promise<Achievement | undefined> {
    return undefined;
  }

  async getAllAchievements(): Promise<Achievement[]> {
    return [];
  }

  async getAchievementsByCategory(category: string): Promise<Achievement[]> {
    return [];
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    throw new Error("Method not implemented");
  }

  async getUserAchievements(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]> {
    return [];
  }

  async createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement> {
    throw new Error("Method not implemented");
  }

  async updateUserAchievementProgress(id: number, progress: number, unlocked?: boolean): Promise<UserAchievement> {
    throw new Error("Method not implemented");
  }

  async getSavedLocation(id: number): Promise<SavedLocation | undefined> {
    return undefined;
  }

  async getUserSavedLocations(userId: number): Promise<SavedLocation[]> {
    return [];
  }

  async createSavedLocation(location: InsertSavedLocation): Promise<SavedLocation> {
    throw new Error("Method not implemented");
  }

  async updateSavedLocation(id: number, location: Partial<SavedLocation>): Promise<SavedLocation> {
    throw new Error("Method not implemented");
  }

  async deleteSavedLocation(id: number): Promise<boolean> {
    return false;
  }

  async getUserSavedLocationsByCategory(userId: number, category: string): Promise<SavedLocation[]> {
    return [];
  }
}

// Use DatabaseStorage instead of MemStorage for persistence
export const storage = new DatabaseStorage();