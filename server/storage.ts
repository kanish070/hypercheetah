import { users, rides, messages, type User, type InsertUser, type Ride, type InsertRide, type Message, type InsertMessage, type Route, type Location } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserMode(id: number, mode: string): Promise<User>;
  updateUserLocation(id: number, location: Location): Promise<User>;
  setUserActive(id: number, active: boolean): Promise<User>;

  // Ride operations
  createRide(ride: InsertRide): Promise<Ride>;
  getRide(id: number): Promise<Ride | undefined>;
  getNearbyRides(location: Location, type: string): Promise<Ride[]>;
  updateRideStatus(id: number, status: string): Promise<Ride>;
  findMatchingRides(route: Route): Promise<Ride[]>;

  // Chat operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(rideId: number): Promise<Message[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private rides: Map<number, Ride>;
  private messages: Map<number, Message>;
  private userId: number;
  private rideId: number;
  private messageId: number;

  constructor() {
    this.users = new Map();
    this.rides = new Map();
    this.messages = new Map();
    this.userId = 1;
    this.rideId = 1;
    this.messageId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = {
      id,
      ...insertUser,
      currentLocation: null,
      active: false
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserMode(id: number, mode: string): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, currentMode: mode };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserLocation(id: number, location: Location): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, currentLocation: location };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async setUserActive(id: number, active: boolean): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, active };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async createRide(insertRide: InsertRide): Promise<Ride> {
    const id = this.rideId++;
    const ride: Ride = {
      id,
      ...insertRide,
      createdAt: new Date()
    };
    this.rides.set(id, ride);
    return ride;
  }

  async getRide(id: number): Promise<Ride | undefined> {
    return this.rides.get(id);
  }

  async getNearbyRides(location: Location, type: string): Promise<Ride[]> {
    // Simple implementation - in real app would use spatial queries
    return Array.from(this.rides.values()).filter(ride => 
      ride.type === type && 
      ride.status === "active" &&
      this.isNearby(location, ride.route.start)
    );
  }

  async updateRideStatus(id: number, status: string): Promise<Ride> {
    const ride = await this.getRide(id);
    if (!ride) throw new Error("Ride not found");
    
    const updatedRide = { ...ride, status };
    this.rides.set(id, updatedRide);
    return updatedRide;
  }

  async findMatchingRides(route: Route): Promise<Ride[]> {
    // Simple implementation - in real app would use more sophisticated route matching
    return Array.from(this.rides.values()).filter(ride => 
      ride.status === "active" &&
      this.routesOverlap(route, ride.route)
    );
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageId++;
    const message: Message = {
      id,
      ...insertMessage,
      createdAt: new Date()
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessages(rideId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.rideId === rideId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  private isNearby(loc1: Location, loc2: Location): boolean {
    // Simple distance check - would use proper distance calculation in real app
    const dx = loc1.lat - loc2.lat;
    const dy = loc1.lng - loc2.lng;
    return Math.sqrt(dx * dx + dy * dy) < 0.1; // ~11km radius
  }

  private routesOverlap(route1: Route, route2: Route): boolean {
    // Simple overlap check - would use proper route matching in real app
    return this.isNearby(route1.start, route2.start) ||
           this.isNearby(route1.end, route2.end);
  }
}

export const storage = new MemStorage();