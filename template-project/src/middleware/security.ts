import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const RATE_LIMIT_WINDOW_MS = env.rateLimitWindowMs;
const RATE_LIMIT_MAX_REQUESTS = env.rateLimitMaxRequests;

const corsOrigin = env.corsAllowedOrigins === '*' ? true : env.corsAllowedOrigins;

export const corsMiddleware = cors({
  origin: corsOrigin,
});

export const secureHeadersMiddleware = helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
});

export const rateLimitMiddleware = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  limit: RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      error: 'rate_limited',
      message: 'Too many requests. Try again later.',
    });
  },
});
