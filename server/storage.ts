import { 
  users, 
  rides, 
  rideMatches, 
  messages, 
  userRatings,
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
  type InsertUserRating
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<User, "id" | "createdAt"> & { passwordHash: string }): Promise<User>;

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private rides: Map<number, Ride>;
  private rideMatches: Map<number, RideMatch>;
  private messages: Map<number, Message>;
  private userRatings: Map<number, UserRating>;
  private userId: number;
  private rideId: number;
  private rideMatchId: number;
  private messageId: number;
  private userRatingId: number;

  constructor() {
    this.users = new Map();
    this.rides = new Map();
    this.rideMatches = new Map();
    this.messages = new Map();
    this.userRatings = new Map();
    this.userId = 1;
    this.rideId = 1;
    this.rideMatchId = 1;
    this.messageId = 1;
    this.userRatingId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: Omit<User, "id" | "createdAt"> & { passwordHash: string }): Promise<User> {
    const id = this.userId++;
    const user: User = { 
      id, 
      ...insertUser, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
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

  async createRide(rideData: InsertRide & { route: Route }): Promise<Ride> {
    const id = this.rideId++;
    const { route, ...insertRide } = rideData;
    
    const ride: Ride = {
      id,
      ...insertRide,
      availableSeats: insertRide.availableSeats ?? 4, // Default to 4 if undefined
      price: insertRide.price ?? null,
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
}

export const storage = new MemStorage();