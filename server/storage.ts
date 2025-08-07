import { users, businessProfiles, aiRecommendations, aiStacks, type User, type InsertUser, type BusinessProfile, type InsertBusinessProfile, type AiRecommendation, type InsertAiRecommendation, type AiStack, type InsertAiStack } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStripeInfo(id: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User>;
  
  // Business profile methods
  createBusinessProfile(profile: InsertBusinessProfile & { userId: string }): Promise<BusinessProfile>;
  getBusinessProfile(id: string): Promise<BusinessProfile | undefined>;
  getBusinessProfileByUserId(userId: string): Promise<BusinessProfile | undefined>;
  
  // AI recommendations methods
  createAiRecommendation(recommendation: InsertAiRecommendation): Promise<AiRecommendation>;
  getRecommendationsByProfileId(profileId: string): Promise<AiRecommendation[]>;
  
  // AI stack methods
  createAiStack(stack: InsertAiStack): Promise<AiStack>;
  getAiStackByProfileId(profileId: string): Promise<AiStack | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserStripeInfo(id: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId, stripeSubscriptionId })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async createBusinessProfile(profile: InsertBusinessProfile & { userId: string }): Promise<BusinessProfile> {
    const [businessProfile] = await db
      .insert(businessProfiles)
      .values([profile])
      .returning();
    return businessProfile;
  }

  async getBusinessProfile(id: string): Promise<BusinessProfile | undefined> {
    const [profile] = await db.select().from(businessProfiles).where(eq(businessProfiles.id, id));
    return profile || undefined;
  }

  async getBusinessProfileByUserId(userId: string): Promise<BusinessProfile | undefined> {
    const [profile] = await db.select().from(businessProfiles).where(eq(businessProfiles.userId, userId));
    return profile || undefined;
  }

  async createAiRecommendation(recommendation: InsertAiRecommendation): Promise<AiRecommendation> {
    const [aiRecommendation] = await db
      .insert(aiRecommendations)
      .values([recommendation])
      .returning();
    return aiRecommendation;
  }

  async getRecommendationsByProfileId(profileId: string): Promise<AiRecommendation[]> {
    return await db.select().from(aiRecommendations).where(eq(aiRecommendations.profileId, profileId));
  }

  async createAiStack(stack: InsertAiStack): Promise<AiStack> {
    const [aiStack] = await db
      .insert(aiStacks)
      .values([stack])
      .returning();
    return aiStack;
  }

  async getAiStackByProfileId(profileId: string): Promise<AiStack | undefined> {
    const [stack] = await db.select().from(aiStacks).where(eq(aiStacks.profileId, profileId));
    return stack || undefined;
  }
}

export const storage = new DatabaseStorage();
