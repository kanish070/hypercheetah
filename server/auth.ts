import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";

declare global {
  namespace Express {
    // Extend Express.User with our app's user properties
    interface User {
      id: number;
      name: string;
      email: string;
      passwordHash: string;
      role: string;
      avatar: string | null;
      createdAt: Date;
    }
  }
}

const scryptAsync = promisify(scrypt);

// Hash password using scrypt with salt
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Compare a plain text password with a hashed password
async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Session setup
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "ridelink-session-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: process.env.NODE_ENV === "production",
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Passport to use local strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          console.log("Looking up user by email:", email);
          const user = await storage.getUserByEmail(email);
          
          if (!user) {
            console.log("User not found for email:", email);
            return done(null, false, { message: "User not found" });
          }
          
          console.log("User found, verifying password for user ID:", user.id);
          
          // Debug the hashed password
          if (!user.passwordHash) {
            console.error("No password hash stored for user:", user.id);
            return done(null, false, { message: "Invalid user data" });
          }
          
          const isValidPassword = await comparePasswords(password, user.passwordHash);
          
          if (!isValidPassword) {
            console.log("Password validation failed for user ID:", user.id);
            return done(null, false, { message: "Invalid password" });
          }
          
          console.log("Authentication successful for user ID:", user.id);
          return done(null, user);
        } catch (error) {
          console.error("Authentication error:", error);
          return done(error);
        }
      }
    )
  );

  // Serialize/deserialize user instance to/from session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Register route
  app.post("/api/register", async (req, res, next) => {
    try {
      const { email, password, name, role = "user", avatar = null } = req.body;
      
      console.log("Registration attempt:", { email, name, role, hasPassword: !!password });
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        console.log("Registration failed: Email already exists", email);
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password
      console.log("Hashing password...");
      const passwordHash = await hashPassword(password);
      console.log("Password hashed, length:", passwordHash.length);
      
      // Create new user
      const userData = {
        name,
        email,
        passwordHash, // This needs to match the parameter expected by createUser
        role,
        avatar,
      };
      
      console.log("Creating user with data:", { 
        name, 
        email, 
        passwordHashLength: passwordHash.length,
        role
      });
      
      const user = await storage.createUser(userData);

      console.log("User registered successfully:", { 
        id: user.id, 
        name: user.name, 
        email: user.email,
        hasPasswordHash: !!user.passwordHash
      });

      // Log user in
      req.login(user, (err) => {
        if (err) {
          console.error("Login after registration failed:", err);
          return next(err);
        }
        console.log("User logged in after registration");
        return res.status(201).json(user);
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Failed to register user" });
    }
  });

  // Login route
  app.post("/api/login", (req, res, next) => {
    console.log("Login attempt:", { email: req.body.email });
    
    passport.authenticate("local", (err: any, user: Express.User | false, info: { message: string } | undefined) => {
      if (err) {
        console.error("Login error:", err);
        return next(err);
      }
      
      if (!user) {
        console.log("Login failed:", info?.message || "Authentication failed");
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      
      console.log("Login successful:", { id: user.id, name: user.name, email: user.email });
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("Session error:", loginErr);
          return next(loginErr);
        }
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  // Logout route
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    res.json(req.user);
  });
}