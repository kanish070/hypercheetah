import { 
  users, 
  rides, 
  rideMatches, 
  messages, 
  userRatings,
  achievements,
  userAchievements,
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
  type InsertUserAchievement
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
  
  // Achievement operations
  getAchievement(id: number): Promise<Achievement | undefined>;
  getAllAchievements(): Promise<Achievement[]>;
  getAchievementsByCategory(category: string): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  
  // User Achievement operations
  getUserAchievements(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]>;
  createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement>;
  updateUserAchievementProgress(id: number, progress: number, unlocked?: boolean): Promise<UserAchievement>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private rides: Map<number, Ride>;
  private rideMatches: Map<number, RideMatch>;
  private messages: Map<number, Message>;
  private userRatings: Map<number, UserRating>;
  private achievements: Map<number, Achievement>;
  private userAchievements: Map<number, UserAchievement>;
  private userId: number;
  private rideId: number;
  private rideMatchId: number;
  private messageId: number;
  private userRatingId: number;
  private achievementId: number;
  private userAchievementId: number;

  constructor() {
    this.users = new Map();
    this.rides = new Map();
    this.rideMatches = new Map();
    this.messages = new Map();
    this.userRatings = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    this.userId = 1;
    this.rideId = 1;
    this.rideMatchId = 1;
    this.messageId = 1;
    this.userRatingId = 1;
    this.achievementId = 1;
    this.userAchievementId = 1;
    
    // Initialize with mock data
    this.initMockData();
  }
  
  private initMockData() {
    // Create a test user
    const testUser = {
      id: this.userId++,
      name: "Kanish",
      email: "test@example.com",
      passwordHash: "$2a$10$EncryptedPasswordHash", // This would be a real bcrypt hash in production
      role: "user",
      avatar: "/images/kanish-selfie.jpg",
      createdAt: new Date()
    };
    this.users.set(testUser.id, testUser);
    
    // Create a second user
    const secondUser = {
      id: this.userId++,
      name: "Priya",
      email: "priya@example.com",
      passwordHash: "$2a$10$EncryptedPasswordHash",
      role: "user",
      avatar: "/images/priya-avatar.jpg",
      createdAt: new Date()
    };
    this.users.set(secondUser.id, secondUser);
    
    // Create sample rides with Vadodara locations
    const alkapuriToMSURide = {
      id: this.rideId++,
      userId: testUser.id,
      type: "offer",
      status: "active",
      availableSeats: 3,
      price: 80.00, // in INR
      departureTime: new Date(Date.now() + 3600000), // 1 hour from now
      routeData: JSON.stringify({
        start: { name: "Alkapuri", lat: 22.3071, lng: 73.1812 },
        end: { name: "MS University", lat: 22.3149, lng: 73.1873 }
      }),
      route: {
        start: { lat: 22.3071, lng: 73.1812 },
        end: { lat: 22.3149, lng: 73.1873 },
        waypoints: []
      },
      createdAt: new Date()
    };
    this.rides.set(alkapuriToMSURide.id, alkapuriToMSURide);
    
    const fatehgunjToAirportRide = {
      id: this.rideId++,
      userId: secondUser.id,
      type: "offer",
      status: "active",
      availableSeats: 2,
      price: 150.00, // in INR
      departureTime: new Date(Date.now() + 7200000), // 2 hours from now
      routeData: JSON.stringify({
        start: { name: "Fatehgunj", lat: 22.3218, lng: 73.1794 },
        end: { name: "Vadodara Airport", lat: 22.3358, lng: 73.2274 }
      }),
      route: {
        start: { lat: 22.3218, lng: 73.1794 },
        end: { lat: 22.3358, lng: 73.2274 },
        waypoints: []
      },
      createdAt: new Date()
    };
    this.rides.set(fatehgunjToAirportRide.id, fatehgunjToAirportRide);
    
    // Create a request ride
    const sayajiToRailwayRide = {
      id: this.rideId++,
      userId: secondUser.id,
      type: "request",
      status: "active",
      availableSeats: 1,
      price: null, // Passenger doesn't set price
      departureTime: new Date(Date.now() + 2700000), // 45 minutes from now
      routeData: JSON.stringify({
        start: { name: "Sayajigunj", lat: 22.3149, lng: 73.1857 },
        end: { name: "Railway Station", lat: 22.3095, lng: 73.1813 }
      }),
      route: {
        start: { lat: 22.3149, lng: 73.1857 },
        end: { lat: 22.3095, lng: 73.1813 },
        waypoints: []
      },
      createdAt: new Date()
    };
    this.rides.set(sayajiToRailwayRide.id, sayajiToRailwayRide);
    
    // Create a ride match between two Vadodara rides
    const matchVadodaraRides = {
      id: this.rideMatchId++,
      requestRideId: sayajiToRailwayRide.id,
      offerRideId: alkapuriToMSURide.id,
      status: "accepted",
      matchScore: 0.85, // High match score
      createdAt: new Date(Date.now() - 1800000) // 30 minutes ago
    };
    this.rideMatches.set(matchVadodaraRides.id, matchVadodaraRides);
    
    // Add some messages to the ride match
    const messages = [
      {
        id: this.messageId++,
        rideMatchId: matchVadodaraRides.id,
        senderId: testUser.id,
        content: "Hi! I'm heading to MS University and I can drop you at the Railway Station on the way.",
        createdAt: new Date(Date.now() - 1700000) // 28 minutes ago
      },
      {
        id: this.messageId++,
        rideMatchId: matchVadodaraRides.id,
        senderId: secondUser.id,
        content: "That would be great! What time are you planning to leave from Alkapuri?",
        createdAt: new Date(Date.now() - 1600000) // 27 minutes ago
      },
      {
        id: this.messageId++,
        rideMatchId: matchVadodaraRides.id,
        senderId: testUser.id,
        content: "I'll be leaving in about an hour. Is that okay for you?",
        createdAt: new Date(Date.now() - 1500000) // 25 minutes ago
      },
      {
        id: this.messageId++,
        rideMatchId: matchVadodaraRides.id,
        senderId: secondUser.id,
        content: "Perfect! I'll be ready. Where should I meet you in Sayajigunj?",
        createdAt: new Date(Date.now() - 1400000) // 23 minutes ago
      },
      {
        id: this.messageId++,
        rideMatchId: matchVadodaraRides.id,
        senderId: testUser.id,
        content: "Let's meet at Sayajigunj bus stop. I'll be in a white Swift with GJ-06 number plate.",
        createdAt: new Date(Date.now() - 1300000) // 22 minutes ago
      }
    ];
    
    // Add messages to storage
    messages.forEach(message => {
      this.messages.set(message.id, message);
    });
    
    // Create achievements
    const achievements = [
      {
        id: this.achievementId++,
        name: "First Ride",
        description: "Complete your first ride",
        points: 50,
        icon: "car",
        criteria: "Complete 1 ride",
        category: "ride",
        tier: "bronze",
        createdAt: new Date()
      },
      {
        id: this.achievementId++,
        name: "Road Warrior",
        description: "Complete 50 rides",
        points: 200,
        icon: "gauge",
        criteria: "Complete 50 rides",
        category: "ride",
        tier: "silver",
        createdAt: new Date()
      },
      {
        id: this.achievementId++,
        name: "Social Butterfly",
        description: "Connect with 10 new riders",
        points: 100,
        icon: "users",
        criteria: "Connect with 10 riders",
        category: "social",
        tier: "bronze",
        createdAt: new Date()
      },
      {
        id: this.achievementId++,
        name: "Green Commuter",
        description: "Save 100kg of CO2",
        points: 150,
        icon: "leaf",
        criteria: "Reduce carbon emissions by sharing rides",
        category: "eco",
        tier: "bronze",
        createdAt: new Date()
      },
      {
        id: this.achievementId++,
        name: "Eco Warrior",
        description: "Save 500kg of CO2",
        points: 300,
        icon: "leaf",
        criteria: "Reduce carbon emissions by sharing rides",
        category: "eco",
        tier: "silver",
        createdAt: new Date()
      },
      {
        id: this.achievementId++,
        name: "Perfect Rating",
        description: "Receive 10 five-star ratings",
        points: 200,
        icon: "star",
        criteria: "Maintain excellent service as a rider",
        category: "social",
        tier: "silver",
        createdAt: new Date()
      },
      {
        id: this.achievementId++,
        name: "Long Distance",
        description: "Complete a ride over 100km",
        points: 250,
        icon: "gauge",
        criteria: "Take on longer journeys",
        category: "ride",
        tier: "gold",
        createdAt: new Date()
      },
      {
        id: this.achievementId++,
        name: "Top Contributor",
        description: "Be in the top 1% of all riders",
        points: 500,
        icon: "trophy",
        criteria: "Consistently offer rides and maintain high ratings",
        category: "milestone",
        tier: "platinum",
        createdAt: new Date()
      }
    ];
    
    // Add achievements to storage
    achievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });
    
    // Create user achievements for the test user
    const userAchievements = [
      {
        id: this.userAchievementId++,
        userId: testUser.id,
        achievementId: 1, // First Ride
        progress: 100,
        unlocked: true,
        unlockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15), // 15 days ago
        createdAt: new Date()
      },
      {
        id: this.userAchievementId++,
        userId: testUser.id,
        achievementId: 2, // Road Warrior
        progress: 68,
        unlocked: false,
        unlockedAt: null,
        createdAt: new Date()
      },
      {
        id: this.userAchievementId++,
        userId: testUser.id,
        achievementId: 3, // Social Butterfly
        progress: 100,
        unlocked: true,
        unlockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
        createdAt: new Date()
      },
      {
        id: this.userAchievementId++,
        userId: testUser.id,
        achievementId: 4, // Green Commuter
        progress: 100,
        unlocked: true,
        unlockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
        createdAt: new Date()
      },
      {
        id: this.userAchievementId++,
        userId: testUser.id,
        achievementId: 5, // Eco Warrior
        progress: 27,
        unlocked: false,
        unlockedAt: null,
        createdAt: new Date()
      },
      {
        id: this.userAchievementId++,
        userId: testUser.id,
        achievementId: 6, // Perfect Rating
        progress: 80,
        unlocked: false,
        unlockedAt: null,
        createdAt: new Date()
      },
      {
        id: this.userAchievementId++,
        userId: testUser.id,
        achievementId: 7, // Long Distance
        progress: 0,
        unlocked: false,
        unlockedAt: null,
        createdAt: new Date()
      },
      {
        id: this.userAchievementId++,
        userId: testUser.id,
        achievementId: 8, // Top Contributor
        progress: 0,
        unlocked: false,
        unlockedAt: null,
        createdAt: new Date()
      }
    ];
    
    // Add user achievements to storage
    userAchievements.forEach(userAchievement => {
      this.userAchievements.set(userAchievement.id, userAchievement);
    });
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
}

export const storage = new MemStorage();