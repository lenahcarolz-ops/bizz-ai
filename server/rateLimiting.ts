import rateLimit from 'express-rate-limit';
import { Redis } from '@upstash/redis';
import { Request, Response } from 'express';

// Initialize Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Custom store for express-rate-limit using Upstash Redis
 */
class UpstashRedisStore {
  prefix: string;
  windowMs: number;

  constructor(windowMs: number, prefix = 'rl:') {
    this.prefix = prefix;
    this.windowMs = windowMs;
  }

  async increment(key: string): Promise<{ totalHits: number; timeToExpire?: number }> {
    const redisKey = `${this.prefix}${key}`;
    
    try {
      // Use Redis pipeline for atomic operations
      const pipeline = redis.pipeline();
      pipeline.incr(redisKey);
      pipeline.expire(redisKey, Math.ceil(this.windowMs / 1000));
      pipeline.ttl(redisKey);
      
      const results = await pipeline.exec();
      const totalHits = results[0] as number;
      const ttl = results[2] as number;
      
      return {
        totalHits,
        timeToExpire: ttl > 0 ? ttl * 1000 : undefined
      };
    } catch (error) {
      console.error('Redis rate limit error:', error);
      // Fallback: allow request if Redis fails
      return { totalHits: 1 };
    }
  }

  async decrement(key: string): Promise<void> {
    const redisKey = `${this.prefix}${key}`;
    try {
      await redis.decr(redisKey);
    } catch (error) {
      console.error('Redis decrement error:', error);
    }
  }

  async resetKey(key: string): Promise<void> {
    const redisKey = `${this.prefix}${key}`;
    try {
      await redis.del(redisKey);
    } catch (error) {
      console.error('Redis reset error:', error);
    }
  }
}

/**
 * Rate limiting configurations for different routes
 */
export const createRateLimiter = (config: {
  windowMs: number;
  max: number;
  message: any;
  keyGenerator?: (req: Request) => string;
}) => {
  const store = new UpstashRedisStore(config.windowMs);
  
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: config.message,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: config.keyGenerator || ((req: Request) => {
      // Use IP + User-Agent for better rate limiting
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';
      return `${ip}:${Buffer.from(userAgent).toString('base64').slice(0, 10)}`;
    }),
    store: {
      incr: async (key: string) => {
        const result = await store.increment(key);
        return result;
      },
      decrement: async (key: string) => {
        await store.decrement(key);
      },
      resetKey: async (key: string) => {
        await store.resetKey(key);
      }
    },
    skip: (req: Request) => {
      // Skip rate limiting for health checks
      return req.path === '/health' || req.path === '/ping';
    },
    onLimitReached: (req: Request, res: Response) => {
      console.warn(`Rate limit exceeded for ${req.ip} on ${req.path}`);
    }
  });
};

// Critical API routes - stricter limits
export const generateApiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many AI generation requests, please try again later.',
    retryAfter: '15 minutes',
    limit: 10,
    window: '15 minutes'
  }
});

export const resultsApiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: {
    error: 'Too many results requests, please try again later.',
    retryAfter: '15 minutes',
    limit: 50,
    window: '15 minutes'
  }
});

// General API routes
export const generalApiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many API requests, please try again later.',
    retryAfter: '15 minutes',
    limit: 100,
    window: '15 minutes'
  }
});

// Auth routes - prevent brute force
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth attempts per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes',
    limit: 5,
    window: '15 minutes'
  }
});
