import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for user authentication
  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    
    // Admin hardcoded credentials
    if (username === "admin" && password === "admin123") {
      return res.json({
        id: "admin",
        name: "Administrator",
        username: "admin",
        role: "admin"
      });
    }
    
    // Regular user login
    try {
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // For artists, check if they're approved
      if (user.role === "artist" && user.status === "rejected") {
        return res.status(403).json({ message: "Your artist account has been rejected" });
      }
      
      // Return user data without password
      const { password: _, ...userData } = user;
      res.json(userData);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Register new user
  app.post("/api/auth/register", async (req, res) => {
    const userData = req.body;
    
    try {
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already in use" });
      }
      
      // Set appropriate status
      const newUserData = {
        ...userData,
        status: userData.role === "artist" ? "pending" : "active"
      };
      
      const user = await storage.createUser(newUserData);
      
      // Return user data without password
      const { password: _, ...newUser } = user;
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
