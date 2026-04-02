import { Router } from 'express';
import { body } from 'express-validator';
import { login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/login', loginRules, login);
router.get('/me', protect, getMe);

export default router;
