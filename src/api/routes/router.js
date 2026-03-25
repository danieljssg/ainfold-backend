import { Router } from 'express';
import { doubleCsrfProtection, generateCsrfToken } from '../../config/csrfConfig.js';
import { validateSign } from '../../modules/auth/auth.middleware.js';
import analyzesRoutes from '../../modules/analyzes/analyzes.routes.js';
import authRoutes from '../../modules/auth/auth.routes.js';
import jobsRoutes from '../../modules/jobs/jobs.routes.js';
import userRoutes from '../../modules/users/user.routes.js';
import { cacheMiddleware } from '../middlewares/cache.js';

const router = Router();

router.get('/csrf-token', (req, res) => {
  const token = generateCsrfToken(req, res);
  res.json({ csrfToken: token });
});

router.use('/auth', authRoutes);

router.use(doubleCsrfProtection);
router.use('/analyzes', [validateSign, cacheMiddleware()], analyzesRoutes);
router.use('/jobs', [validateSign], jobsRoutes);
router.use('/users', [validateSign, cacheMiddleware()], userRoutes);

export default router;
