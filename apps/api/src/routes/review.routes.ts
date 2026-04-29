import { Router } from 'express';
import { 
  createItemReviewSchema, 
  createVenueReviewSchema,
  reviewListSchema,
  ERROR_CODES,
  calculateVenueOverallScore,
  calculateItemOverallScore,
} from '@tastebuddy/shared';
import { prisma } from '../lib/prisma.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/error-handler.js';
import { verifyLocation } from '../services/geo.service.js';

const router = Router();

// POST /items/:itemId/reviews
router.post('/items/:itemId', authenticate, validate(createItemReviewSchema), async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { criteriaScores, content, verification, photoIds } = req.body;
    const userId = req.user!.id;
    
    // Get item and venue
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        venue: true,
        category: {
          include: {
            ratingCriteria: true,
          },
        },
      },
    });
    
    if (!item) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Item not found');
    }
    
    // Check for existing review
    const existingReview = await prisma.itemReview.findFirst({
      where: { userId, itemId },
    });
    
    if (existingReview) {
      throw new AppError(409, ERROR_CODES.REVIEW_EXISTS, 'You have already reviewed this item');
    }
    
    // Verify location if provided
    let isVerified = false;
    let verificationLat: number | null = null;
    let verificationLng: number | null = null;
    
    if (verification) {
      const verificationResult = verifyLocation(
        verification.latitude,
        verification.longitude,
        item.venue.latitude,
        item.venue.longitude
      );
      
      isVerified = verificationResult.isVerified;
      if (isVerified) {
        verificationLat = verification.latitude;
        verificationLng = verification.longitude;
      }
    }
    
    // Calculate overall score
    const criteriaWeights: Record<string, number> = {};
    for (const criterion of item.category.ratingCriteria) {
      criteriaWeights[criterion.name] = criterion.weight;
    }
    const overallScore = calculateItemOverallScore(criteriaScores, criteriaWeights);
    
    // Create review
    const review = await prisma.itemReview.create({
      data: {
        userId,
        itemId,
        venueId: item.venueId,
        criteriaScores,
        overallScore,
        content,
        isVerified,
        verificationLat,
        verificationLng,
        verificationTime: isVerified ? new Date() : null,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });
    
    // Link photos if provided
    if (photoIds && photoIds.length > 0) {
      await prisma.photo.updateMany({
        where: {
          id: { in: photoIds },
          userId,
        },
        data: {
          itemReviewId: review.id,
        },
      });
    }
    
    // Update item aggregate scores (async)
    updateItemScores(itemId).catch(console.error);
    
    // Create activity
    await prisma.activity.create({
      data: {
        userId,
        type: 'ITEM_REVIEW',
        targetType: 'item',
        targetId: itemId,
        metadata: {
          itemName: item.name,
          venueName: item.venue.name,
          score: overallScore,
        },
      },
    });
    
    res.status(201).json({
      success: true,
      data: {
        id: review.id,
        overallScore: review.overallScore,
        criteriaScores: review.criteriaScores,
        isVerified: review.isVerified,
        createdAt: review.createdAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /venues/:venueId/reviews
router.post('/venues/:venueId', authenticate, validate(createVenueReviewSchema), async (req, res, next) => {
  try {
    const { venueId } = req.params;
    const { scores, content, verification, photoIds } = req.body;
    const userId = req.user!.id;
    
    // Get venue
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
    });
    
    if (!venue) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Venue not found');
    }
    
    // Check for existing review
    const existingReview = await prisma.venueReview.findUnique({
      where: {
        userId_venueId: {
          userId,
          venueId,
        },
      },
    });
    
    if (existingReview) {
      throw new AppError(409, ERROR_CODES.REVIEW_EXISTS, 'You have already reviewed this venue');
    }
    
    // Verify location if provided
    let isVerified = false;
    let verificationLat: number | null = null;
    let verificationLng: number | null = null;
    
    if (verification) {
      const verificationResult = verifyLocation(
        verification.latitude,
        verification.longitude,
        venue.latitude,
        venue.longitude
      );
      
      isVerified = verificationResult.isVerified;
      if (isVerified) {
        verificationLat = verification.latitude;
        verificationLng = verification.longitude;
      }
    }
    
    // Calculate overall score
    const overallScore = calculateVenueOverallScore(scores);
    
    // Create review
    const review = await prisma.venueReview.create({
      data: {
        userId,
        venueId,
        serviceScore: scores.service,
        atmosphereScore: scores.atmosphere,
        cleanlinessScore: scores.cleanliness,
        valueScore: scores.value,
        locationScore: scores.location,
        noiseScore: scores.noise,
        overallScore,
        content,
        isVerified,
        verificationLat,
        verificationLng,
        verificationTime: isVerified ? new Date() : null,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });
    
    // Link photos if provided
    if (photoIds && photoIds.length > 0) {
      await prisma.photo.updateMany({
        where: {
          id: { in: photoIds },
          userId,
        },
        data: {
          venueReviewId: review.id,
        },
      });
    }
    
    // Update venue aggregate scores (async)
    updateVenueScores(venueId).catch(console.error);
    
    // Create activity
    await prisma.activity.create({
      data: {
        userId,
        type: 'VENUE_REVIEW',
        targetType: 'venue',
        targetId: venueId,
        metadata: {
          venueName: venue.name,
          score: overallScore,
        },
      },
    });
    
    res.status(201).json({
      success: true,
      data: {
        id: review.id,
        overallScore: review.overallScore,
        isVerified: review.isVerified,
        createdAt: review.createdAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /items/:itemId/reviews
router.get('/items/:itemId', optionalAuth, validate(reviewListSchema, 'query'), async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { sortBy, page, limit } = req.query as any;
    
    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'oldest') orderBy = { createdAt: 'asc' };
    if (sortBy === 'highest') orderBy = { overallScore: 'desc' };
    if (sortBy === 'lowest') orderBy = { overallScore: 'asc' };
    if (sortBy === 'helpful') orderBy = { likeCount: 'desc' };
    
    const [reviews, total] = await Promise.all([
      prisma.itemReview.findMany({
        where: { itemId, isHidden: false },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          photos: {
            select: { id: true, url: true, thumbnailUrl: true },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.itemReview.count({
        where: { itemId, isHidden: false },
      }),
    ]);
    
    // Check if user liked each review
    let likedReviewIds: string[] = [];
    if (req.user) {
      const likes = await prisma.reviewLike.findMany({
        where: {
          userId: req.user.id,
          itemReviewId: { in: reviews.map((r) => r.id) },
        },
        select: { itemReviewId: true },
      });
      likedReviewIds = likes.map((l) => l.itemReviewId!);
    }
    
    res.json({
      success: true,
      data: reviews.map((r) => ({
        id: r.id,
        user: r.user,
        overallScore: r.overallScore,
        criteriaScores: r.criteriaScores,
        content: r.content,
        isVerified: r.isVerified,
        photos: r.photos,
        likeCount: r.likeCount,
        commentCount: r.commentCount,
        isLiked: likedReviewIds.includes(r.id),
        createdAt: r.createdAt.toISOString(),
      })),
      meta: {
        page,
        limit,
        total,
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /reviews/:id/like
router.post('/:id/like', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    // Check if it's an item review or venue review
    const itemReview = await prisma.itemReview.findUnique({ where: { id } });
    const venueReview = await prisma.venueReview.findUnique({ where: { id } });
    
    if (!itemReview && !venueReview) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Review not found');
    }
    
    // Create like
    await prisma.reviewLike.create({
      data: {
        userId,
        itemReviewId: itemReview ? id : null,
        venueReviewId: venueReview ? id : null,
      },
    });
    
    // Update like count
    if (itemReview) {
      await prisma.itemReview.update({
        where: { id },
        data: { likeCount: { increment: 1 } },
      });
    } else {
      await prisma.venueReview.update({
        where: { id },
        data: { likeCount: { increment: 1 } },
      });
    }
    
    res.json({
      success: true,
      data: { liked: true },
    });
  } catch (error) {
    if ((error as any).code === 'P2002') {
      return res.json({
        success: true,
        data: { liked: true, message: 'Already liked' },
      });
    }
    next(error);
  }
});

// DELETE /reviews/:id/like
router.delete('/:id/like', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    // Try to delete item review like
    const itemLike = await prisma.reviewLike.deleteMany({
      where: {
        userId,
        itemReviewId: id,
      },
    });
    
    if (itemLike.count > 0) {
      await prisma.itemReview.update({
        where: { id },
        data: { likeCount: { decrement: 1 } },
      });
    } else {
      // Try venue review
      const venueLike = await prisma.reviewLike.deleteMany({
        where: {
          userId,
          venueReviewId: id,
        },
      });
      
      if (venueLike.count > 0) {
        await prisma.venueReview.update({
          where: { id },
          data: { likeCount: { decrement: 1 } },
        });
      }
    }
    
    res.json({
      success: true,
      data: { liked: false },
    });
  } catch (error) {
    next(error);
  }
});

// Helper functions to update aggregate scores
async function updateItemScores(itemId: string) {
  const reviews = await prisma.itemReview.findMany({
    where: { itemId, isHidden: false },
    select: {
      overallScore: true,
      criteriaScores: true,
    },
  });
  
  if (reviews.length === 0) return;
  
  // Calculate average overall score
  const avgOverall = reviews.reduce((sum, r) => sum + r.overallScore, 0) / reviews.length;
  
  // Calculate average criteria scores
  const criteriaSum: Record<string, number> = {};
  const criteriaCount: Record<string, number> = {};
  
  for (const review of reviews) {
    const scores = review.criteriaScores as Record<string, number>;
    for (const [key, value] of Object.entries(scores)) {
      criteriaSum[key] = (criteriaSum[key] || 0) + value;
      criteriaCount[key] = (criteriaCount[key] || 0) + 1;
    }
  }
  
  const avgCriteria: Record<string, number> = {};
  for (const key of Object.keys(criteriaSum)) {
    avgCriteria[key] = Math.round((criteriaSum[key] / criteriaCount[key]) * 10) / 10;
  }
  
  await prisma.item.update({
    where: { id: itemId },
    data: {
      avgOverallScore: Math.round(avgOverall * 10) / 10,
      avgCriteriaScores: avgCriteria,
      reviewCount: reviews.length,
    },
  });
}

async function updateVenueScores(venueId: string) {
  const reviews = await prisma.venueReview.findMany({
    where: { venueId, isHidden: false },
  });
  
  if (reviews.length === 0) return;
  
  const avgService = reviews.reduce((sum, r) => sum + r.serviceScore, 0) / reviews.length;
  const avgAtmosphere = reviews.reduce((sum, r) => sum + r.atmosphereScore, 0) / reviews.length;
  const avgCleanliness = reviews.reduce((sum, r) => sum + r.cleanlinessScore, 0) / reviews.length;
  const avgValue = reviews.reduce((sum, r) => sum + r.valueScore, 0) / reviews.length;
  const avgLocation = reviews.reduce((sum, r) => sum + r.locationScore, 0) / reviews.length;
  const avgNoise = reviews.reduce((sum, r) => sum + r.noiseScore, 0) / reviews.length;
  const avgOverall = reviews.reduce((sum, r) => sum + r.overallScore, 0) / reviews.length;
  
  await prisma.venue.update({
    where: { id: venueId },
    data: {
      avgServiceScore: Math.round(avgService * 10) / 10,
      avgAtmosphereScore: Math.round(avgAtmosphere * 10) / 10,
      avgCleanlinessScore: Math.round(avgCleanliness * 10) / 10,
      avgValueScore: Math.round(avgValue * 10) / 10,
      avgLocationScore: Math.round(avgLocation * 10) / 10,
      avgNoiseScore: Math.round(avgNoise * 10) / 10,
      avgOverallScore: Math.round(avgOverall * 10) / 10,
      reviewCount: reviews.length,
    },
  });
}

export default router;
