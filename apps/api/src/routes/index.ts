import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import venueRoutes from './venue.routes.js';
import itemRoutes from './item.routes.js';
import reviewRoutes from './review.routes.js';
import socialRoutes from './social.routes.js';
import geoRoutes from './geo.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/venues', venueRoutes);
router.use('/items', itemRoutes);
router.use('/reviews', reviewRoutes);
router.use('/social', socialRoutes);
router.use('/geo', geoRoutes);

export default router;
