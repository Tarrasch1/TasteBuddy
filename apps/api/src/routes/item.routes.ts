import { Router } from 'express';
import { createItemSchema, updateItemSchema, itemSearchSchema, topItemsSchema, ERROR_CODES, haversineDistance } from '@tastebuddy/shared';
import { prisma } from '../lib/prisma.js';
import { authenticate, optionalAuth, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/error-handler.js';

const router = Router();

// Generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// GET /items/categories
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await prisma.itemCategory.findMany({
      include: {
        ratingCriteria: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
    
    res.json({
      success: true,
      data: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        description: cat.description,
        type: cat.type,
        ratingCriteria: cat.ratingCriteria.map((c) => ({
          id: c.id,
          name: c.name,
          label: c.label,
          description: c.description,
          weight: c.weight,
          order: c.order,
        })),
      })),
    });
  } catch (error) {
    next(error);
  }
});

// GET /items/categories/:id/criteria
router.get('/categories/:id/criteria', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const category = await prisma.itemCategory.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        ratingCriteria: {
          orderBy: { order: 'asc' },
        },
      },
    });
    
    if (!category) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Category not found');
    }
    
    res.json({
      success: true,
      data: category.ratingCriteria.map((c) => ({
        id: c.id,
        name: c.name,
        label: c.label,
        description: c.description,
        weight: c.weight,
        order: c.order,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// GET /items/top
router.get('/top', optionalAuth, validate(topItemsSchema, 'query'), async (req, res, next) => {
  try {
    const { category, lat, lng, radius, limit } = req.query as any;
    
    const itemCategory = await prisma.itemCategory.findUnique({
      where: { slug: category },
    });
    
    if (!itemCategory) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Category not found');
    }
    
    // Get items with their venues
    let items = await prisma.item.findMany({
      where: {
        categoryId: itemCategory.id,
        isAvailable: true,
        avgOverallScore: { not: null },
        reviewCount: { gte: 1 },
      },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            slug: true,
            address: true,
            latitude: true,
            longitude: true,
          },
        },
        category: true,
      },
      orderBy: { avgOverallScore: 'desc' },
      take: limit * 2, // Get more to filter by distance
    });
    
    // Filter by distance if location provided
    if (lat && lng) {
      items = items.filter((item) => {
        const distance = haversineDistance(lat, lng, item.venue.latitude, item.venue.longitude);
        return distance <= radius;
      });
    }
    
    // Take top items
    items = items.slice(0, limit);
    
    res.json({
      success: true,
      data: items.map((item, index) => ({
        rank: index + 1,
        id: item.id,
        name: item.name,
        slug: item.slug,
        category: {
          id: item.category.id,
          name: item.category.name,
          slug: item.category.slug,
          icon: item.category.icon,
        },
        venue: {
          id: item.venue.id,
          name: item.venue.name,
          slug: item.venue.slug,
          address: item.venue.address,
          distance: lat && lng 
            ? Math.round(haversineDistance(lat, lng, item.venue.latitude, item.venue.longitude))
            : undefined,
        },
        price: item.price ? Number(item.price) : null,
        currency: item.currency,
        avgOverallScore: item.avgOverallScore,
        avgCriteriaScores: item.avgCriteriaScores,
        reviewCount: item.reviewCount,
        photoUrl: item.photoUrl,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// GET /items
router.get('/', optionalAuth, validate(itemSearchSchema, 'query'), async (req, res, next) => {
  try {
    const { q, category, venueId, lat, lng, radius, minRating, sortBy, page, limit } = req.query as any;
    
    const where: any = {
      isAvailable: true,
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
    
    if (venueId) {
      where.venueId = venueId;
    }
    
    if (minRating) {
      where.avgOverallScore = { gte: minRating };
    }
    
    let orderBy: any = { avgOverallScore: 'desc' };
    if (sortBy === 'reviews') {
      orderBy = { reviewCount: 'desc' };
    } else if (sortBy === 'newest') {
      orderBy = { createdAt: 'desc' };
    }
    
    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        include: {
          category: true,
          venue: {
            select: {
              id: true,
              name: true,
              slug: true,
              address: true,
              latitude: true,
              longitude: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.item.count({ where }),
    ]);
    
    // Calculate distance and filter if needed
    let itemsWithDistance = items.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      category: {
        id: item.category.id,
        name: item.category.name,
        slug: item.category.slug,
        icon: item.category.icon,
        type: item.category.type,
      },
      venue: {
        id: item.venue.id,
        name: item.venue.name,
        slug: item.venue.slug,
        address: item.venue.address,
        distance: lat && lng
          ? Math.round(haversineDistance(lat, lng, item.venue.latitude, item.venue.longitude))
          : undefined,
      },
      price: item.price ? Number(item.price) : null,
      currency: item.currency,
      avgOverallScore: item.avgOverallScore,
      avgCriteriaScores: item.avgCriteriaScores,
      reviewCount: item.reviewCount,
      photoUrl: item.photoUrl,
    }));
    
    // Sort by distance if requested
    if (sortBy === 'distance' && lat && lng) {
      itemsWithDistance.sort((a, b) => (a.venue.distance || Infinity) - (b.venue.distance || Infinity));
    }
    
    res.json({
      success: true,
      data: itemsWithDistance,
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

// GET /items/:id
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const item = await prisma.item.findFirst({
      where: {
        OR: [{ id }],
        isAvailable: true,
      },
      include: {
        category: {
          include: {
            ratingCriteria: {
              orderBy: { order: 'asc' },
            },
          },
        },
        venue: {
          select: {
            id: true,
            name: true,
            slug: true,
            address: true,
            city: true,
            latitude: true,
            longitude: true,
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
            photos: {
              take: 3,
              select: { id: true, url: true, thumbnailUrl: true },
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
    
    if (!item) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Item not found');
    }
    
    // Check if saved by current user
    let isSaved = false;
    let userReview = null;
    
    if (req.user) {
      const savedItem = await prisma.savedItem.findUnique({
        where: {
          userId_itemId: {
            userId: req.user.id,
            itemId: item.id,
          },
        },
      });
      isSaved = !!savedItem;
      
      const review = await prisma.itemReview.findFirst({
        where: {
          userId: req.user.id,
          itemId: item.id,
        },
      });
      if (review) {
        userReview = {
          id: review.id,
          overallScore: review.overallScore,
          criteriaScores: review.criteriaScores,
          createdAt: review.createdAt.toISOString(),
        };
      }
    }
    
    // Get ranking
    const ranking = await prisma.item.count({
      where: {
        categoryId: item.categoryId,
        avgOverallScore: { gt: item.avgOverallScore || 0 },
      },
    });
    
    const totalInCategory = await prisma.item.count({
      where: {
        categoryId: item.categoryId,
        avgOverallScore: { not: null },
      },
    });
    
    res.json({
      success: true,
      data: {
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
          ratingCriteria: item.category.ratingCriteria.map((c) => ({
            id: c.id,
            name: c.name,
            label: c.label,
            weight: c.weight,
          })),
        },
        venue: item.venue,
        price: item.price ? Number(item.price) : null,
        currency: item.currency,
        photoUrl: item.photoUrl,
        avgOverallScore: item.avgOverallScore,
        avgCriteriaScores: item.avgCriteriaScores,
        reviewCount: item.reviewCount,
        isVerified: item.isVerified,
        isSaved,
        userReview,
        ranking: {
          rank: ranking + 1,
          total: totalInCategory,
          category: item.category.name,
        },
        recentReviews: item.reviews.map((r) => ({
          id: r.id,
          user: {
            id: r.user.id,
            username: r.user.username,
            displayName: r.user.displayName,
            avatarUrl: r.user.avatarUrl,
          },
          overallScore: r.overallScore,
          criteriaScores: r.criteriaScores,
          content: r.content,
          isVerified: r.isVerified,
          photos: r.photos,
          likeCount: r.likeCount,
          createdAt: r.createdAt.toISOString(),
        })),
        photos: item.photos,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /venues/:venueId/items (Admin only)
router.post('/', authenticate, requireAdmin, validate(createItemSchema), async (req, res, next) => {
  try {
    const { venueId, categoryId, name, ...rest } = req.body;
    
    // Check venue exists
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
    });
    
    if (!venue) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Venue not found');
    }
    
    const slug = generateSlug(name);
    
    // Check if item with this slug exists at venue
    const existing = await prisma.item.findUnique({
      where: {
        venueId_slug: {
          venueId,
          slug,
        },
      },
    });
    
    if (existing) {
      throw new AppError(409, ERROR_CODES.ALREADY_EXISTS, 'An item with this name already exists at this venue');
    }
    
    const item = await prisma.item.create({
      data: {
        venueId,
        categoryId,
        name,
        slug,
        ...rest,
      },
      include: {
        category: true,
        venue: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
    
    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /items/:id (Admin only)
router.patch('/:id', authenticate, requireAdmin, validate(updateItemSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const item = await prisma.item.update({
      where: { id },
      data: req.body,
      include: {
        category: true,
        venue: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
    
    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
