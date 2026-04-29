import { Router } from 'express';
import { updateProfileSchema, ERROR_CODES } from '@tastebuddy/shared';
import { prisma } from '../lib/prisma.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/error-handler.js';

const router = Router();

// Format user for response
function formatUserProfile(user: any, isOwner: boolean = false) {
  const base = {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    isVerified: user.isVerified,
    privacyLevel: user.privacyLevel,
    createdAt: user.createdAt.toISOString(),
    stats: {
      venueReviewCount: user._count?.venueReviews || 0,
      itemReviewCount: user._count?.itemReviews || 0,
      friendCount: 0, // Calculated separately
      savedVenueCount: user._count?.savedVenues || 0,
      savedItemCount: user._count?.savedItems || 0,
      photoCount: user._count?.photos || 0,
    },
  };
  
  if (isOwner) {
    return {
      ...base,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
    };
  }
  
  return base;
}

// GET /users/me
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        _count: {
          select: {
            venueReviews: true,
            itemReviews: true,
            savedVenues: true,
            savedItems: true,
            photos: true,
          },
        },
      },
    });
    
    if (!user) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'User not found');
    }
    
    // Get friend count
    const friendCount = await prisma.friendship.count({
      where: {
        OR: [
          { requesterId: user.id, status: 'ACCEPTED' },
          { addresseeId: user.id, status: 'ACCEPTED' },
        ],
      },
    });
    
    const profile = formatUserProfile(user, true);
    profile.stats.friendCount = friendCount;
    
    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /users/me
router.patch('/me', authenticate, validate(updateProfileSchema), async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: req.body,
      include: {
        _count: {
          select: {
            venueReviews: true,
            itemReviews: true,
            savedVenues: true,
            savedItems: true,
            photos: true,
          },
        },
      },
    });
    
    res.json({
      success: true,
      data: formatUserProfile(user, true),
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /users/me
router.delete('/me', authenticate, async (req, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        deletedAt: new Date(),
        email: `deleted_${req.user!.id}@deleted.com`,
        username: `deleted_${req.user!.id}`,
        passwordHash: null,
      },
    });
    
    // Revoke all tokens
    await prisma.refreshToken.updateMany({
      where: { userId: req.user!.id },
      data: { revokedAt: new Date() },
    });
    
    res.json({
      success: true,
      data: { message: 'Account deleted successfully' },
    });
  } catch (error) {
    next(error);
  }
});

// GET /users/:username
router.get('/:username', optionalAuth, async (req, res, next) => {
  try {
    const { username } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        _count: {
          select: {
            venueReviews: true,
            itemReviews: true,
            savedVenues: true,
            savedItems: true,
            photos: true,
          },
        },
      },
    });
    
    if (!user || user.deletedAt) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'User not found');
    }
    
    // Check if this is the current user
    const isOwner = req.user?.id === user.id;
    
    // If private and not owner, check friendship
    if (user.privacyLevel === 'PRIVATE' && !isOwner) {
      throw new AppError(403, ERROR_CODES.FORBIDDEN, 'This profile is private');
    }
    
    if (user.privacyLevel === 'FRIENDS_ONLY' && !isOwner && req.user) {
      const friendship = await prisma.friendship.findFirst({
        where: {
          status: 'ACCEPTED',
          OR: [
            { requesterId: req.user.id, addresseeId: user.id },
            { requesterId: user.id, addresseeId: req.user.id },
          ],
        },
      });
      
      if (!friendship) {
        throw new AppError(403, ERROR_CODES.FORBIDDEN, 'This profile is only visible to friends');
      }
    }
    
    const friendCount = await prisma.friendship.count({
      where: {
        OR: [
          { requesterId: user.id, status: 'ACCEPTED' },
          { addresseeId: user.id, status: 'ACCEPTED' },
        ],
      },
    });
    
    const profile = formatUserProfile(user, isOwner);
    profile.stats.friendCount = friendCount;
    
    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
});

// GET /users/:username/reviews
router.get('/:username/reviews', optionalAuth, async (req, res, next) => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    
    const user = await prisma.user.findUnique({
      where: { username },
    });
    
    if (!user || user.deletedAt) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'User not found');
    }
    
    // Get item reviews
    const [itemReviews, totalItems] = await Promise.all([
      prisma.itemReview.findMany({
        where: { userId: user.id, isHidden: false },
        include: {
          item: {
            select: {
              id: true,
              name: true,
              slug: true,
              venue: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          photos: {
            select: { id: true, url: true, thumbnailUrl: true },
            take: 3,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.itemReview.count({
        where: { userId: user.id, isHidden: false },
      }),
    ]);
    
    res.json({
      success: true,
      data: itemReviews.map((review) => ({
        id: review.id,
        type: 'item',
        item: {
          id: review.item.id,
          name: review.item.name,
          slug: review.item.slug,
        },
        venue: {
          id: review.item.venue.id,
          name: review.item.venue.name,
          slug: review.item.venue.slug,
        },
        overallScore: review.overallScore,
        content: review.content,
        isVerified: review.isVerified,
        photos: review.photos,
        likeCount: review.likeCount,
        commentCount: review.commentCount,
        createdAt: review.createdAt.toISOString(),
      })),
      meta: {
        page,
        limit,
        total: totalItems,
        hasMore: page * limit < totalItems,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
