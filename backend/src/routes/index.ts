import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import * as c from '../controllers/app.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { requireDatabase } from '../middlewares/database.js';
import { asyncHandler } from '../utils/async-handler.js';

export const apiRouter = Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: { message: 'Too many authentication attempts. Please try again later.' } },
});

apiRouter.get('/health', (_req, res) => res.json({ status: 'ok' }));
apiRouter.post('/auth/signup', authLimiter, requireDatabase, asyncHandler(c.signup));
apiRouter.post('/auth/login', authLimiter, requireDatabase, asyncHandler(c.login));
apiRouter.get('/auth/me', authenticate, requireDatabase, asyncHandler(c.currentUser));

apiRouter.use(authenticate);
apiRouter.use(requireDatabase);
apiRouter.get('/dashboard', asyncHandler(c.dashboard));
apiRouter
  .route('/businesses')
  .get(asyncHandler(c.listBusinesses))
  .post(authorize('admin', 'researcher'), asyncHandler(c.createBusiness));
apiRouter.post(
  '/businesses/import',
  authorize('admin', 'researcher'),
  asyncHandler(c.importBusinesses),
);
apiRouter
  .route('/businesses/:id')
  .get(asyncHandler(c.getBusiness))
  .patch(authorize('admin', 'researcher'), asyncHandler(c.updateBusiness))
  .delete(authorize('admin'), asyncHandler(c.deleteBusiness));
apiRouter
  .route('/niches')
  .get(asyncHandler(c.listNiches))
  .post(authorize('admin'), asyncHandler(c.createNiche));
apiRouter.get('/niches/:id/stats', asyncHandler(c.nicheStats));
apiRouter.post('/audits', authorize('admin', 'researcher'), asyncHandler(c.saveAudit));
apiRouter.patch('/audits/:id', authorize('admin', 'researcher'), asyncHandler(c.saveAudit));
apiRouter.post(
  '/scoring/recalculate',
  authorize('admin', 'researcher'),
  asyncHandler(c.recalculateScores),
);
apiRouter.get('/prospects/top', asyncHandler(c.topProspects));
apiRouter.post('/research', authorize('admin', 'researcher'), asyncHandler(c.createResearch));
apiRouter.post(
  '/research/live-search',
  authorize('admin', 'researcher'),
  asyncHandler(c.liveResearch),
);
apiRouter.get('/research/:id', asyncHandler(c.getResearch));
apiRouter.post('/outreach/generate', authorize('admin', 'sales'), asyncHandler(c.generateOutreach));
apiRouter.patch('/pipeline/:id', authorize('admin', 'sales'), asyncHandler(c.updateLead));
apiRouter.get('/reports/market', asyncHandler(c.marketReport));
