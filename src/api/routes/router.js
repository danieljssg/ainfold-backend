import { Router } from 'express';
import { doubleCsrfProtection, generateCsrfToken } from '../../config/csrfConfig.js';
import { validateSign } from '../../modules/auth/auth.middleware.js';
// Routes Definition
import authRoutes from '../../modules/auth/auth.routes.js';
import userRoutes from '../../modules/users/user.routes.js';
// Middlewares
import { cacheMiddleware } from '../middlewares/cache.js';

const router = Router();

router.get('/csrf-token', (req, res) => {
  const token = generateCsrfToken(req, res);
  res.json({ csrfToken: token });
});

router.use('/auth', authRoutes);

router.use(doubleCsrfProtection);
router.use('/users', [validateSign, cacheMiddleware()], userRoutes);

router.get('/', [validateSign], (_req, res) => {
  return res.status(200).json({ message: 'Welcome to the API' });
});

export default router;
