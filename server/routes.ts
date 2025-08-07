import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertUserSchema, insertBusinessProfileSchema } from "@shared/schema";
import { generateAIStack } from "./services/openai";
import { sendStackEmail } from "./services/email";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
}) : null;

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Create user and business profile, generate AI stack
  app.post("/api/generate-stack", async (req, res) => {
    try {
      const { name, email, ...profileData } = req.body;

      // Validate input
      const userData = insertUserSchema.parse({ name, email });
      const businessData = insertBusinessProfileSchema.parse(profileData);

      // Check if user already exists
      let user = await storage.getUserByEmail(email);
      if (!user) {
        user = await storage.createUser(userData);
      }

      // Create business profile
      const profile = await storage.createBusinessProfile({
        ...businessData,
        userId: user.id,
      });

      // Generate AI stack recommendations
      const aiStack = await generateAIStack(profile);

      // Save AI stack and recommendations
      const savedStack = await storage.createAiStack({
        profileId: profile.id,
        ...aiStack,
      });

      // Save individual recommendations
      const savedRecommendations = await Promise.all(
        aiStack.recommendations.map((rec, index) => 
          storage.createAiRecommendation({
            profileId: profile.id,
            ...rec,
            priority: index + 1,
          })
        )
      );

      // Send email with results
      await sendStackEmail(user.email, user.name, savedStack, savedRecommendations);

      res.json({
        stackId: savedStack.id,
        profileId: profile.id,
        userId: user.id,
        stack: savedStack,
        recommendations: savedRecommendations,
      });
    } catch (error: any) {
      console.error("Error generating stack:", error);
      res.status(500).json({ message: "Error generating AI stack: " + error.message });
    }
  });

  // Get existing stack by profile ID
  app.get("/api/stack/:profileId", async (req, res) => {
    try {
      const { profileId } = req.params;
      
      const stack = await storage.getAiStackByProfileId(profileId);
      const recommendations = await storage.getRecommendationsByProfileId(profileId);

      if (!stack) {
        return res.status(404).json({ message: "Stack not found" });
      }

      res.json({ stack, recommendations });
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching stack: " + error.message });
    }
  });

  // Text-to-speech endpoint using Kyutai AI
  app.post("/api/tts", async (req, res) => {
    try {
      const { text, voice = "default" } = req.body;
      
      // TODO: Implement Kyutai AI TTS integration
      // For now, return success - browser Speech Synthesis API will be used as fallback
      res.json({ success: true, message: "TTS request processed" });
    } catch (error: any) {
      res.status(500).json({ message: "TTS error: " + error.message });
    }
  });

  // Stripe payment route for strategy sessions
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(400).json({ message: "Payment processing not configured. Please contact support." });
      }
      
      const { amount = 19700 } = req.body; // Default to R$ 197 in cents
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount),
        currency: "brl",
        metadata: {
          service: "strategy-session",
        },
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Error creating payment intent: " + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
