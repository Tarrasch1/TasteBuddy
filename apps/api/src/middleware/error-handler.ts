import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ERROR_CODES } from '@tastebuddy/shared';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Validation failed',
        details: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
    });
  }

  // Custom app errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    
    if (prismaError.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: {
          code: ERROR_CODES.ALREADY_EXISTS,
          message: 'A record with this value already exists',
        },
      });
    }
    
    if (prismaError.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Record not found',
        },
      });
    }
  }

  // Default server error
  return res.status(500).json({
    success: false,
    error: {
      code: ERROR_CODES.SERVER_ERROR,
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    },
  });
}
