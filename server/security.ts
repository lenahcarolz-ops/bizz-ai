import { Request, Response, NextFunction } from 'express';

/**
 * Security middleware with comprehensive headers for LGPD compliance and security
 */
export function securityMiddleware(req: Request, res: Response, next: NextFunction) {
  // Content Security Policy - Restrict resource loading
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://va.vercel-scripts.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self' https://api.openai.com https://api.anthropic.com https://api.perplexity.ai https://*.supabase.co wss://*.supabase.co; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self';"
  );

  // HTTP Strict Transport Security - Force HTTPS
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  // X-Frame-Options - Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // X-Content-Type-Options - Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // X-XSS-Protection - Enable XSS filtering
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer Policy - Control referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy - Control browser features
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );

  // LGPD Compliance Headers
  res.setHeader('X-Privacy-Policy', '/legal/privacy');
  res.setHeader('X-Data-Protection', 'LGPD-compliant');
  res.setHeader('X-Cookie-Policy', 'essential-only');

  // Security Headers
  res.setHeader('X-Powered-By', 'Lunora Bizz AI');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Download-Options', 'noopen');

  next();
}

/**
 * Rate limiting configuration for different routes
 */
export const rateLimitConfig = {
  // Critical API routes - stricter limits
  '/api/generate': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: {
      error: 'Too many requests, please try again later.',
      retryAfter: '15 minutes'
    }
  },
  '/api/results': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each IP to 50 requests per windowMs
    message: {
      error: 'Too many requests, please try again later.',
      retryAfter: '15 minutes'
    }
  },
  // General API routes
  '/api/*': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests, please try again later.',
      retryAfter: '15 minutes'
    }
  }
};

/**
 * CORS configuration for security
 */
export const corsConfig = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://lunora.club', 'https://www.lunora.club', 'https://staging.lunora.club']
    : ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:3000', 'http://127.0.0.1:5000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};
