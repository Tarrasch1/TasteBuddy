import rateLimit from 'express-rate-limit';
import { RATE_LIMITS, ERROR_CODES } from '@tastebuddy/shared';

export const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: RATE_LIMITS.general,
  message: {
    success: false,
    error: {
      code: ERROR_CODES.RATE_LIMITED,
      message: 'Too many requests, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: RATE_LIMITS.auth,
  message: {
    success: false,
    error: {
      code: ERROR_CODES.RATE_LIMITED,
      message: 'Too many authentication attempts, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
