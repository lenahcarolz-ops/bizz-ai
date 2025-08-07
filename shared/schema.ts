import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const businessProfiles = pgTable("business_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  businessType: text("business_type").notNull(),
  teamSize: text("team_size").notNull(),
  objective: text("objective").notNull(),
  currentTools: json("current_tools").$type<string[]>(),
  otherTools: text("other_tools"),
  aiKnowledge: text("ai_knowledge").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiRecommendations = pgTable("ai_recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").references(() => businessProfiles.id).notNull(),
  toolName: text("tool_name").notNull(),
  category: text("category").notNull(),
  useCase: text("use_case").notNull(),
  automationLevel: text("automation_level").notNull(),
  description: text("description").notNull(),
  link: text("link"),
  features: json("features").$type<string[]>(),
  priority: integer("priority").default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiStacks = pgTable("ai_stacks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").references(() => businessProfiles.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  overallAnalysis: text("overall_analysis").notNull(),
  implementationTips: json("implementation_tips").$type<string[]>(),
  estimatedSavings: text("estimated_savings"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  email: true,
});

export const insertBusinessProfileSchema = createInsertSchema(businessProfiles).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertAiRecommendationSchema = createInsertSchema(aiRecommendations).omit({
  id: true,
  createdAt: true,
});

export const insertAiStackSchema = createInsertSchema(aiStacks).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertBusinessProfile = z.infer<typeof insertBusinessProfileSchema>;
export type BusinessProfile = typeof businessProfiles.$inferSelect;
export type InsertAiRecommendation = z.infer<typeof insertAiRecommendationSchema>;
export type AiRecommendation = typeof aiRecommendations.$inferSelect;
export type InsertAiStack = z.infer<typeof insertAiStackSchema>;
export type AiStack = typeof aiStacks.$inferSelect;
