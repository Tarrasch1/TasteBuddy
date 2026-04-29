import { Router } from 'express';
import { createVenueSchema, updateVenueSchema, venueSearchSchema, nearbyVenuesSchema, ERROR_CODES } from '@tastebuddy/shared';
import { prisma } from '../lib/prisma.js';
import { authenticate, optionalAuth, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/error-handler.js';
import { haversineDistance } from '@tastebuddy/shared';

const router = Router();

// Generate slug from name
function generateSlug(name: string, city: string): string {
  const base = `${name}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return base;
}

// GET /venues/categories
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await prisma.venueCategory.findMany({
      orderBy: { name: 'asc' },
    });
    
    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
});

// GET /venues/nearby
router.get('/nearby', optionalAuth, validate(nearbyVenuesSchema, 'query'), async (req, res, next) => {
  try {
    const { lat, lng, radius, category, limit } = req.query as any;
    
    // Use raw SQL for distance calculation
    const venues = await prisma.$queryRaw`
      SELECT 
        v.id, v.name, v.slug, v.address, v.city,
        v.latitude, v.longitude, v.price_level as "priceLevel",
        v.avg_overall_score as "avgOverallScore", v.review_count as "reviewCount",
        vc.id as "categoryId", vc.name as "categoryName", vc.slug as "categorySlug", vc.icon as "categoryIcon",
        (
          6371000 * acos(
            cos(radians(${lat})) * cos(radians(v.latitude)) *
            cos(radians(v.longitude) - radians(${lng})) +
            sin(radians(${lat})) * sin(radians(v.latitude))
          )
        ) as distance
      FROM venues v
      JOIN venue_categories vc ON v.category_id = vc.id
      WHERE v.is_active = true
        AND (
          6371000 * acos(
            cos(radians(${lat})) * cos(radians(v.latitude)) *
            cos(radians(v.longitude) - radians(${lng})) +
            sin(radians(${lat})) * sin(radians(v.latitude))
          )
        ) <= ${radius}
        ${category ? prisma.$queryRaw`AND vc.slug = ${category}` : prisma.$queryRaw``}
      ORDER BY distance
      LIMIT ${limit}
    `;
    
    res.json({
      success: true,
      data: (venues as any[]).map((v) => ({
        id: v.id,
        name: v.name,
        slug: v.slug,
        address: v.address,
        city: v.city,
        category: {
          id: v.categoryId,
          name: v.categoryName,
          slug: v.categorySlug,
          icon: v.categoryIcon,
        },
        priceLevel: v.priceLevel,
        avgOverallScore: v.avgOverallScore,
        reviewCount: v.reviewCount,
        distance: Math.round(v.distance),
      })),
    });
  } catch (error) {
    next(error);
  }
});

// GET /venues
router.get('/', optionalAuth, validate(venueSearchSchema, 'query'), async (req, res, next) => {
  try {
    const { q, category, city, lat, lng, radius, minRating, priceLevel, sortBy, page, limit } = req.query as any;
    
    // Build where clause
    const where: any = {
      isActive: true,
    };
    
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }
    
    if (category) {
      where.category = { slug: category };
    }
    
    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }
    
    if (minRating) {
      where.avgOverallScore = { gte: minRating };
    }
    
    if (priceLevel) {
      const levels = priceLevel.split(',').map(Number);
      where.priceLevel = { in: levels };
    }
    
    // Build orderBy
    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'rating') {
      orderBy = { avgOverallScore: 'desc' };
    } else if (sortBy === 'reviews') {
      orderBy = { reviewCount: 'desc' };
    }
    
    const [venues, total] = await Promise.all([
      prisma.venue.findMany({
        where,
        include: {
          category: true,
          items: {
            where: { avgOverallScore: { not: null } },
            orderBy: { avgOverallScore: 'desc' },
            take: 3,
            select: {
              id: true,
              name: true,
              avgOverallScore: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.venue.count({ where }),
    ]);
    
    // Calculate distance if lat/lng provided
    const venuesWithDistance = venues.map((venue) => {
      let distance: number | undefined;
      if (lat && lng) {
        distance = Math.round(haversineDistance(lat, lng, venue.latitude, venue.longitude));
      }
      
      return {
        id: venue.id,
        name: venue.name,
        slug: venue.slug,
        address: venue.address,
        city: venue.city,
        category: {
          id: venue.category.id,
          name: venue.category.name,
          slug: venue.category.slug,
          icon: venue.category.icon,
        },
        priceLevel: venue.priceLevel,
        avgOverallScore: venue.avgOverallScore,
        reviewCount: venue.reviewCount,
        distance,
        topItems: venue.items.map((item) => ({
          id: item.id,
          name: item.name,
          avgOverallScore: item.avgOverallScore,
        })),
      };
    });
    
    // Sort by distance if requested
    if (sortBy === 'distance' && lat && lng) {
      venuesWithDistance.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    }
    
    res.json({
      success: true,
      data: venuesWithDistance,
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

// GET /venues/:id
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const venue = await prisma.venue.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        isActive: true,
      },
      include: {
        category: true,
        items: {
          where: { avgOverallScore: { not: null } },
          orderBy: { avgOverallScore: 'desc' },
          take: 5,
          select: {
            id: true,
            name: true,
            slug: true,
            avgOverallScore: true,
            reviewCount: true,
          },
        },
        reviews: {
          where: { isHidden: false },
          orderBy: { createdAt: 'desc' },
          take: 5,
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
        },
        photos: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            url: true,
            thumbnailUrl: true,
            caption: true,
          },
        },
      },
    });
    
    if (!venue) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Venue not found');
    }
    
    // Check if saved by current user
    let isSaved = false;
    let userReview = null;
    
    if (req.user) {
      const savedVenue = await prisma.savedVenue.findUnique({
        where: {
          userId_venueId: {
            userId: req.user.id,
            venueId: venue.id,
          },
        },
      });
      isSaved = !!savedVenue;
      
      const review = await prisma.venueReview.findUnique({
        where: {
          userId_venueId: {
            userId: req.user.id,
            venueId: venue.id,
          },
        },
      });
      if (review) {
        userReview = {
          id: review.id,
          overallScore: review.overallScore,
          createdAt: review.createdAt.toISOString(),
        };
      }
    }
    
    res.json({
      success: true,
      data: {
        id: venue.id,
        name: venue.name,
        slug: venue.slug,
        description: venue.description,
        address: venue.address,
        city: venue.city,
        state: venue.state,
        country: venue.country,
        postalCode: venue.postalCode,
        latitude: venue.latitude,
        longitude: venue.longitude,
        category: {
          id: venue.category.id,
          name: venue.category.name,
          slug: venue.category.slug,
          icon: venue.category.icon,
        },
        priceLevel: venue.priceLevel,
        phone: venue.phone,
        website: venue.website,
        hours: venue.hours,
        scores: {
          overall: venue.avgOverallScore,
          service: venue.avgServiceScore,
          atmosphere: venue.avgAtmosphereScore,
          cleanliness: venue.avgCleanlinessScore,
          value: venue.avgValueScore,
          location: venue.avgLocationScore,
          noise: venue.avgNoiseScore,
        },
        reviewCount: venue.reviewCount,
        isVerified: venue.isVerified,
        isSaved,
        userReview,
        topItems: venue.items,
        recentReviews: venue.reviews.map((r) => ({
          id: r.id,
          user: {
            id: r.user.id,
            username: r.user.username,
            displayName: r.user.displayName,
            avatarUrl: r.user.avatarUrl,
          },
          overallScore: r.overallScore,
          content: r.content,
          isVerified: r.isVerified,
          createdAt: r.createdAt.toISOString(),
        })),
        photos: venue.photos,
        createdAt: venue.createdAt.toISOString(),
        updatedAt: venue.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /venues/:id/items
router.get('/:id/items', async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    
    const venue = await prisma.venue.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        isActive: true,
      },
    });
    
    if (!venue) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Venue not found');
    }
    
    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where: { venueId: venue.id, isAvailable: true },
        include: {
          category: true,
        },
        orderBy: { avgOverallScore: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.item.count({
        where: { venueId: venue.id, isAvailable: true },
      }),
    ]);
    
    res.json({
      success: true,
      data: items.map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        category: {
          id: item.category.id,
          name: item.category.name,
          slug: item.category.slug,
          icon: item.category.icon,
          type: item.category.type,
        },
        price: item.price ? Number(item.price) : null,
        currency: item.currency,
        photoUrl: item.photoUrl,
        avgOverallScore: item.avgOverallScore,
        avgCriteriaScores: item.avgCriteriaScores,
        reviewCount: item.reviewCount,
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

// POST /venues (Admin only)
router.post('/', authenticate, requireAdmin, validate(createVenueSchema), async (req, res, next) => {
  try {
    const data = req.body;
    const slug = generateSlug(data.name, data.city);
    
    // Check if slug exists
    const existing = await prisma.venue.findUnique({
      where: { slug },
    });
    
    if (existing) {
      throw new AppError(409, ERROR_CODES.ALREADY_EXISTS, 'A venue with this name already exists in this city');
    }
    
    const venue = await prisma.venue.create({
      data: {
        ...data,
        slug,
      },
      include: {
        category: true,
      },
    });
    
    res.status(201).json({
      success: true,
      data: venue,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /venues/:id (Admin only)
router.patch('/:id', authenticate, requireAdmin, validate(updateVenueSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const venue = await prisma.venue.update({
      where: { id },
      data: req.body,
      include: {
        category: true,
      },
    });
    
    res.json({
      success: true,
      data: venue,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
