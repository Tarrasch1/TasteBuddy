import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from './error-handler.js';
import { ERROR_CODES } from '@tastebuddy/shared';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, ERROR_CODES.UNAUTHORIZED, 'No token provided');
    }
    
    const token = authHeader.substring(7);
    
    const payload = jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
      type: string;
    };
    
    if (payload.type !== 'access') {
      throw new AppError(401, ERROR_CODES.TOKEN_INVALID, 'Invalid token type');
    }
    
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        username: true,
        isAdmin: true,
        isBanned: true,
      },
    });
    
    if (!user) {
      throw new AppError(401, ERROR_CODES.UNAUTHORIZED, 'User not found');
    }
    
    if (user.isBanned) {
      throw new AppError(403, ERROR_CODES.ACCOUNT_BANNED, 'Account is banned');
    }
    
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      isAdmin: user.isAdmin,
    };
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError(401, ERROR_CODES.TOKEN_EXPIRED, 'Token expired'));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError(401, ERROR_CODES.TOKEN_INVALID, 'Invalid token'));
    }
    next(error);
  }
}

export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.substring(7);
    
    const payload = jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
      type: string;
    };
    
    if (payload.type !== 'access') {
      return next();
    }
    
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        username: true,
        isAdmin: true,
        isBanned: true,
      },
    });
    
    if (user && !user.isBanned) {
      req.user = {
        id: user.id,
        email: user.email,
        username: user.username,
        isAdmin: user.isAdmin,
      };
    }
    
    next();
  } catch {
    // Silently continue without auth
    next();
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new AppError(401, ERROR_CODES.UNAUTHORIZED, 'Authentication required'));
  }
  
  if (!req.user.isAdmin) {
    return next(new AppError(403, ERROR_CODES.FORBIDDEN, 'Admin access required'));
  }
  
  next();
}
