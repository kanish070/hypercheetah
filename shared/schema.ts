import { pgTable, text, serial, doublePrecision, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: doublePrecision("price").notNull(),
  stock: integer("stock").notNull().default(0),
  categoryId: serial("category_id").notNull(),
  images: text("images").array(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description")
});

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("customer") // "admin" or "customer"
});

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").notNull(),
  status: text("status").notNull().default("pending"), // "pending", "confirmed", "shipped", "delivered"
  total: doublePrecision("total").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Order items table
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: serial("order_id").notNull(),
  productId: serial("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  priceAtTime: doublePrecision("price_at_time").notNull()
});

// Insert schemas
export const insertProductSchema = createInsertSchema(products).omit({ 
  id: true,
  createdAt: true 
});

export const insertCategorySchema = createInsertSchema(categories).omit({ 
  id: true 
});

export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true,
  passwordHash: true 
}).extend({
  password: z.string().min(8, "Password must be at least 8 characters")
});

export const insertOrderSchema = createInsertSchema(orders).omit({ 
  id: true,
  createdAt: true 
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ 
  id: true 
});

// Types
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;