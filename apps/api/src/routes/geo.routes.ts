import { Router } from 'express';
import { geoVerifySchema, ERROR_CODES, DEFAULT_VERIFICATION_RADIUS } from '@tastebuddy/shared';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/error-handler.js';
import { verifyLocation, generateVerificationToken } from '../services/geo.service.js';

const router = Router();

// POST /geo/verify
router.post('/verify', authenticate, validate(geoVerifySchema), async (req, res, next) => {
  try {
    const { venueId, coordinates } = req.body;
    
    // Get venue
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
    });
    
    if (!venue) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Venue not found');
    }
    
    // Verify location
    const result = verifyLocation(
      coordinates.latitude,
      coordinates.longitude,
      venue.latitude,
      venue.longitude,
      DEFAULT_VERIFICATION_RADIUS
    );
    
    // Generate token if verified
    let verificationToken: string | undefined;
    if (result.isVerified) {
      verificationToken = generateVerificationToken({
        userId: req.user!.id,
        venueId,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        distance: result.distance,
      });
    }
    
    res.json({
      success: true,
      data: {
        isVerified: result.isVerified,
        distance: result.distance,
        maxAllowedDistance: result.maxAllowedDistance,
        confidence: result.confidence,
        message: result.isVerified 
          ? 'Location verified successfully'
          : `You are ${result.distance}m away. Please be within ${result.maxAllowedDistance}m of the venue.`,
        verificationToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
