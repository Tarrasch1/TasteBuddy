import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate access token
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

/**
 * Generate refresh token and store in database
 */
export async function generateRefreshToken(userId: string, userAgent?: string, ip?: string): Promise<string> {
  const token = crypto.randomBytes(64).toString('hex');
  const hashedToken = await bcrypt.hash(token, SALT_ROUNDS);
  
  await prisma.refreshToken.create({
    data: {
      userId,
      token: hashedToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
      userAgent,
      ip,
    },
  });
  
  return token;
}

/**
 * Generate both access and refresh tokens
 */
export async function generateTokens(
  userId: string,
  email: string,
  userAgent?: string,
  ip?: string
): Promise<AuthTokens> {
  const accessToken = generateAccessToken({ userId, email });
  const refreshToken = await generateRefreshToken(userId, userAgent, ip);
  
  return {
    accessToken,
    refreshToken,
    expiresIn: 900, // 15 minutes in seconds
  };
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Verify refresh token against database
 */
export async function verifyRefreshToken(token: string, userId: string): Promise<boolean> {
  const refreshTokens = await prisma.refreshToken.findMany({
    where: {
      userId,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
  
  for (const rt of refreshTokens) {
    const isValid = await bcrypt.compare(token, rt.token);
    if (isValid) {
      return true;
    }
  }
  
  return false;
}

/**
 * Revoke a specific refresh token
 */
export async function revokeRefreshToken(token: string, userId: string): Promise<void> {
  const refreshTokens = await prisma.refreshToken.findMany({
    where: {
      userId,
      revokedAt: null,
    },
  });
  
  for (const rt of refreshTokens) {
    const isValid = await bcrypt.compare(token, rt.token);
    if (isValid) {
      await prisma.refreshToken.update({
        where: { id: rt.id },
        data: { revokedAt: new Date() },
      });
      break;
    }
  }
}

/**
 * Revoke all refresh tokens for a user
 */
export async function revokeAllRefreshTokens(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  });
}

/**
 * Clean up expired refresh tokens
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const result = await prisma.refreshToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { revokedAt: { not: null } },
      ],
    },
  });
  
  return result.count;
}

/**
 * Generate password reset token
 */
export async function generatePasswordResetToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = await bcrypt.hash(token, SALT_ROUNDS);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  
  // Store in user's metadata or separate table
  await prisma.user.update({
    where: { id: userId },
    data: {
      // @ts-ignore - We'll handle this with raw metadata
      passwordResetToken: hashedToken,
      passwordResetExpires: expiresAt,
    } as any,
  });
  
  return token;
}

/**
 * Generate email verification token
 */
export function generateEmailVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Check if user has active sessions
 */
export async function hasActiveSessions(userId: string): Promise<boolean> {
  const count = await prisma.refreshToken.count({
    where: {
      userId,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
  
  return count > 0;
}

/**
 * Get all active sessions for a user
 */
export async function getActiveSessions(userId: string) {
  return prisma.refreshToken.findMany({
    where: {
      userId,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    select: {
      id: true,
      userAgent: true,
      ip: true,
      createdAt: true,
      lastUsedAt: true,
    },
    orderBy: { lastUsedAt: 'desc' },
  });
}
