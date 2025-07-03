import { type User, type InsertUser } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = String(this.currentId++);
    
    // Create a new object with required fields to satisfy the User type
    const user: User = {
      id,
      name: insertUser.name,
      username: insertUser.username,
      email: insertUser.email,
      password: insertUser.password,
      role: insertUser.role,
      status: insertUser.status || "active",
      address: insertUser.address,
      bio: insertUser.bio
    };
    
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
