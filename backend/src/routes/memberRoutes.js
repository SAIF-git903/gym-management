import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
} from '../controllers/memberController.js';

const router = Router();

const planValues = ['monthly', 'quarterly', 'half-yearly', 'yearly'];
const paymentValues = ['paid', 'unpaid'];

const memberBodyRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('address').optional().trim(),
  body('notes').optional().trim().isLength({ max: 5000 }).withMessage('Notes max 5000 characters'),
  body('plan').isIn(planValues).withMessage('Invalid plan'),
  body('startDate').isISO8601().withMessage('Valid startDate (ISO) required'),
  body('endDate').isISO8601().withMessage('Valid endDate (ISO) required'),
  body('paymentStatus').optional().isIn(paymentValues),
];

const memberUpdateRules = [
  body('name').optional().trim().notEmpty(),
  body('phone').optional().trim().notEmpty(),
  body('email').optional().isEmail(),
  body('address').optional().trim(),
  body('notes').optional().trim().isLength({ max: 5000 }).withMessage('Notes max 5000 characters'),
  body('plan').optional().isIn(planValues),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('paymentStatus').optional().isIn(paymentValues),
];

const idParam = param('id').isMongoId().withMessage('Invalid member id');

router.get('/', getMembers);
router.get('/:id', idParam, getMemberById);
router.post('/', memberBodyRules, createMember);
router.put('/:id', idParam, memberUpdateRules, updateMember);
router.delete('/:id', idParam, deleteMember);

export default router;
