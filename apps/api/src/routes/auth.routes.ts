import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { registerSchema, loginSchema, refreshTokenSchema, PASSWORD_SALT_ROUNDS, ERROR_CODES } from '@tastebuddy/shared';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import { validate } from '../middleware/validate.js';
import { authRateLimiter } from '../middleware/rate-limiter.js';
import { authenticate } from '../middleware/auth.js';
import { AppError } from '../middleware/error-handler.js';

const router = Router();

// Generate tokens
function generateTokens(userId: string) {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  return {
    accessToken,
    refreshToken,
    expiresIn: 900, // 15 minutes in seconds
  };
}

// Format user for response
function formatUser(user: any) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    isVerified: user.isVerified,
    isAdmin: user.isAdmin,
    privacyLevel: user.privacyLevel,
    createdAt: user.createdAt.toISOString(),
  };
}

// Generate unique slug from string
function generateSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// POST /auth/register
router.post('/register', authRateLimiter, validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password, username, displayName } = req.body;
    
    // Check if email exists
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingEmail) {
      throw new AppError(409, ERROR_CODES.EMAIL_ALREADY_EXISTS, 'Email already registered');
    }
    
    // Check if username exists
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });
    
    if (existingUsername) {
      throw new AppError(409, ERROR_CODES.USERNAME_ALREADY_EXISTS, 'Username already taken');
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        username,
        displayName: displayName || username,
      },
    });
    
    // Generate tokens
    const tokens = generateTokens(user.id);
    
    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    
    res.status(201).json({
      success: true,
      data: {
        user: formatUser(user),
        tokens,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /auth/login
router.post('/login', authRateLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user || !user.passwordHash) {
      throw new AppError(401, ERROR_CODES.INVALID_CREDENTIALS, 'Invalid email or password');
    }
    
    // Verify password
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    
    if (!validPassword) {
      throw new AppError(401, ERROR_CODES.INVALID_CREDENTIALS, 'Invalid email or password');
    }
    
    // Check if banned
    if (user.isBanned) {
      throw new AppError(403, ERROR_CODES.ACCOUNT_BANNED, 'Account is banned');
    }
    
    // Generate tokens
    const tokens = generateTokens(user.id);
    
    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    
    res.json({
      success: true,
      data: {
        user: formatUser(user),
        tokens,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /auth/refresh
router.post('/refresh', validate(refreshTokenSchema), async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    // Verify token
    let payload: { userId: string; type: string };
    try {
      payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as typeof payload;
    } catch {
      throw new AppError(401, ERROR_CODES.TOKEN_INVALID, 'Invalid refresh token');
    }
    
    if (payload.type !== 'refresh') {
      throw new AppError(401, ERROR_CODES.TOKEN_INVALID, 'Invalid token type');
    }
    
    // Check if token exists and not revoked
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });
    
    if (!storedToken || storedToken.revokedAt) {
      throw new AppError(401, ERROR_CODES.TOKEN_INVALID, 'Token has been revoked');
    }
    
    if (storedToken.expiresAt < new Date()) {
      throw new AppError(401, ERROR_CODES.TOKEN_EXPIRED, 'Token has expired');
    }
    
    // Revoke old token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });
    
    // Generate new tokens
    const tokens = generateTokens(storedToken.userId);
    
    // Store new refresh token
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: storedToken.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    
    res.json({
      success: true,
      data: {
        user: formatUser(storedToken.user),
        tokens,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /auth/logout
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.substring(7);
    
    // Revoke all refresh tokens for this user
    await prisma.refreshToken.updateMany({
      where: {
        userId: req.user!.id,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
    
    res.json({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
