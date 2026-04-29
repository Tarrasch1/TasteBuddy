import { Router } from 'express';
import { ERROR_CODES, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@tastebuddy/shared';
import { prisma } from '../lib/prisma.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { AppError } from '../middleware/error-handler.js';

const router = Router();

// ============================================================================
// FRIENDSHIP ROUTES
// ============================================================================

// GET /social/friends
router.get('/friends', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(req.query.limit as string) || DEFAULT_PAGE_SIZE));
    const skip = (page - 1) * limit;
    
    const [friends, total] = await Promise.all([
      prisma.friendship.findMany({
        where: {
          OR: [
            { requesterId: userId, status: 'ACCEPTED' },
            { addresseeId: userId, status: 'ACCEPTED' },
          ],
        },
        include: {
          requester: { select: { id: true, displayName: true, username: true, avatarUrl: true } },
          addressee: { select: { id: true, displayName: true, username: true, avatarUrl: true } },
        },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.friendship.count({
        where: {
          OR: [
            { requesterId: userId, status: 'ACCEPTED' },
            { addresseeId: userId, status: 'ACCEPTED' },
          ],
        },
      }),
    ]);
    
    // Map to friend user objects
    const friendUsers = friends.map(f => 
      f.requesterId === userId ? f.addressee : f.requester
    );
    
    res.json({
      success: true,
      data: friendUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /social/friends/pending
router.get('/friends/pending', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    
    const [incoming, outgoing] = await Promise.all([
      prisma.friendship.findMany({
        where: { addresseeId: userId, status: 'PENDING' },
        include: {
          requester: { select: { id: true, displayName: true, username: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.friendship.findMany({
        where: { requesterId: userId, status: 'PENDING' },
        include: {
          addressee: { select: { id: true, displayName: true, username: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    
    res.json({
      success: true,
      data: {
        incoming: incoming.map(f => ({
          friendshipId: f.id,
          user: f.requester,
          createdAt: f.createdAt,
        })),
        outgoing: outgoing.map(f => ({
          friendshipId: f.id,
          user: f.addressee,
          createdAt: f.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /social/friends/request/:userId
router.post('/friends/request/:userId', authenticate, async (req, res, next) => {
  try {
    const requesterId = req.user!.id;
    const addresseeId = req.params.userId;
    
    if (requesterId === addresseeId) {
      throw new AppError(400, ERROR_CODES.VALIDATION_ERROR, 'Cannot send friend request to yourself');
    }
    
    // Check if addressee exists
    const addressee = await prisma.user.findUnique({ where: { id: addresseeId } });
    if (!addressee) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'User not found');
    }
    
    // Check existing friendship
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId, addresseeId },
          { requesterId: addresseeId, addresseeId: requesterId },
        ],
      },
    });
    
    if (existing) {
      if (existing.status === 'ACCEPTED') {
        throw new AppError(400, ERROR_CODES.VALIDATION_ERROR, 'Already friends');
      }
      if (existing.status === 'PENDING') {
        throw new AppError(400, ERROR_CODES.VALIDATION_ERROR, 'Friend request already pending');
      }
      if (existing.status === 'BLOCKED') {
        throw new AppError(400, ERROR_CODES.VALIDATION_ERROR, 'Cannot send friend request');
      }
    }
    
    const friendship = await prisma.friendship.create({
      data: {
        requesterId,
        addresseeId,
        status: 'PENDING',
      },
    });
    
    // Create notification
    await prisma.notification.create({
      data: {
        userId: addresseeId,
        type: 'FRIEND_REQUEST',
        data: { friendshipId: friendship.id, fromUserId: requesterId },
      },
    });
    
    res.status(201).json({
      success: true,
      data: { friendshipId: friendship.id, status: 'PENDING' },
    });
  } catch (error) {
    next(error);
  }
});

// POST /social/friends/:friendshipId/accept
router.post('/friends/:friendshipId/accept', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const friendshipId = req.params.friendshipId;
    
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });
    
    if (!friendship || friendship.addresseeId !== userId) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Friend request not found');
    }
    
    if (friendship.status !== 'PENDING') {
      throw new AppError(400, ERROR_CODES.VALIDATION_ERROR, 'Friend request is not pending');
    }
    
    const updated = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: 'ACCEPTED' },
    });
    
    // Create notification for requester
    await prisma.notification.create({
      data: {
        userId: friendship.requesterId,
        type: 'FRIEND_ACCEPTED',
        data: { friendshipId, byUserId: userId },
      },
    });
    
    res.json({
      success: true,
      data: { friendshipId: updated.id, status: 'ACCEPTED' },
    });
  } catch (error) {
    next(error);
  }
});

// POST /social/friends/:friendshipId/decline
router.post('/friends/:friendshipId/decline', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const friendshipId = req.params.friendshipId;
    
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });
    
    if (!friendship || friendship.addresseeId !== userId) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Friend request not found');
    }
    
    await prisma.friendship.delete({
      where: { id: friendshipId },
    });
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// DELETE /social/friends/:userId
router.delete('/friends/:userId', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const friendId = req.params.userId;
    
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: userId, addresseeId: friendId, status: 'ACCEPTED' },
          { requesterId: friendId, addresseeId: userId, status: 'ACCEPTED' },
        ],
      },
    });
    
    if (!friendship) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Friendship not found');
    }
    
    await prisma.friendship.delete({
      where: { id: friendship.id },
    });
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// ACTIVITY FEED
// ============================================================================

// GET /social/feed
router.get('/feed', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(req.query.limit as string) || DEFAULT_PAGE_SIZE));
    const skip = (page - 1) * limit;
    
    // Get friend IDs
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: userId, status: 'ACCEPTED' },
          { addresseeId: userId, status: 'ACCEPTED' },
        ],
      },
      select: { requesterId: true, addresseeId: true },
    });
    
    const friendIds = friendships.map(f => 
      f.requesterId === userId ? f.addresseeId : f.requesterId
    );
    
    // Include own activities
    const userIds = [userId, ...friendIds];
    
    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where: {
          userId: { in: userIds },
          privacy: { in: ['PUBLIC', 'FRIENDS'] }, // Filter by privacy
        },
        include: {
          user: { select: { id: true, displayName: true, username: true, avatarUrl: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.activity.count({
        where: {
          userId: { in: userIds },
          privacy: { in: ['PUBLIC', 'FRIENDS'] },
        },
      }),
    ]);
    
    res.json({
      success: true,
      data: activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /social/feed/public (explore feed)
router.get('/feed/public', optionalAuth, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(req.query.limit as string) || DEFAULT_PAGE_SIZE));
    const skip = (page - 1) * limit;
    
    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where: { privacy: 'PUBLIC' },
        include: {
          user: { select: { id: true, displayName: true, username: true, avatarUrl: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.activity.count({
        where: { privacy: 'PUBLIC' },
      }),
    ]);
    
    res.json({
      success: true,
      data: activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// NOTIFICATIONS
// ============================================================================

// GET /social/notifications
router.get('/notifications', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(req.query.limit as string) || DEFAULT_PAGE_SIZE));
    const skip = (page - 1) * limit;
    const unreadOnly = req.query.unreadOnly === 'true';
    
    const where = {
      userId,
      ...(unreadOnly ? { readAt: null } : {}),
    };
    
    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, readAt: null } }),
    ]);
    
    res.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /social/notifications/:id/read
router.post('/notifications/:id/read', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const notificationId = req.params.id;
    
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
    
    if (!notification) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Notification not found');
    }
    
    if (!notification.readAt) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { readAt: new Date() },
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// POST /social/notifications/read-all
router.post('/notifications/read-all', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    
    await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// SAVED ITEMS (FAVORITES/WISHLIST)
// ============================================================================

// GET /social/saved/venues
router.get('/saved/venues', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(req.query.limit as string) || DEFAULT_PAGE_SIZE));
    const skip = (page - 1) * limit;
    
    const [saved, total] = await Promise.all([
      prisma.savedVenue.findMany({
        where: { userId },
        include: {
          venue: {
            include: {
              category: true,
              photos: { take: 1 },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.savedVenue.count({ where: { userId } }),
    ]);
    
    res.json({
      success: true,
      data: saved.map(s => ({
        savedAt: s.createdAt,
        note: s.note,
        venue: s.venue,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /social/saved/venues/:venueId
router.post('/saved/venues/:venueId', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const venueId = req.params.venueId;
    const { note } = req.body;
    
    const venue = await prisma.venue.findUnique({ where: { id: venueId } });
    if (!venue) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Venue not found');
    }
    
    const saved = await prisma.savedVenue.upsert({
      where: { userId_venueId: { userId, venueId } },
      update: { note },
      create: { userId, venueId, note },
    });
    
    res.status(201).json({
      success: true,
      data: saved,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /social/saved/venues/:venueId
router.delete('/saved/venues/:venueId', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const venueId = req.params.venueId;
    
    await prisma.savedVenue.deleteMany({
      where: { userId, venueId },
    });
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// GET /social/saved/items
router.get('/saved/items', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(req.query.limit as string) || DEFAULT_PAGE_SIZE));
    const skip = (page - 1) * limit;
    
    const [saved, total] = await Promise.all([
      prisma.savedItem.findMany({
        where: { userId },
        include: {
          item: {
            include: {
              venue: { select: { id: true, name: true } },
              category: true,
              photos: { take: 1 },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.savedItem.count({ where: { userId } }),
    ]);
    
    res.json({
      success: true,
      data: saved.map(s => ({
        savedAt: s.createdAt,
        note: s.note,
        item: s.item,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /social/saved/items/:itemId
router.post('/saved/items/:itemId', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const itemId = req.params.itemId;
    const { note } = req.body;
    
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Item not found');
    }
    
    const saved = await prisma.savedItem.upsert({
      where: { userId_itemId: { userId, itemId } },
      update: { note },
      create: { userId, itemId, note },
    });
    
    res.status(201).json({
      success: true,
      data: saved,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /social/saved/items/:itemId
router.delete('/saved/items/:itemId', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const itemId = req.params.itemId;
    
    await prisma.savedItem.deleteMany({
      where: { userId, itemId },
    });
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
