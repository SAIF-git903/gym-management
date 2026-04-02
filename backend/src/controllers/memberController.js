import { validationResult } from 'express-validator';
import { Member } from '../models/Member.js';

const PLAN_VALUES = ['monthly', 'quarterly', 'half-yearly', 'yearly'];

/**
 * Build filter from query params for search & filters.
 */
function buildMemberFilter(query) {
  const filter = {};
  if (query.search && String(query.search).trim()) {
    const q = String(query.search).trim();
    filter.$or = [
      { name: new RegExp(q, 'i') },
      { email: new RegExp(q, 'i') },
      { phone: new RegExp(q, 'i') },
      { notes: new RegExp(q, 'i') },
    ];
  }
  if (query.paymentStatus === 'paid' || query.paymentStatus === 'unpaid') {
    filter.paymentStatus = query.paymentStatus;
  }
  if (query.plan && PLAN_VALUES.includes(query.plan)) {
    filter.plan = query.plan;
  }
  const now = new Date();
  if (query.membershipStatus === 'active') {
    filter.endDate = { $gte: now };
  } else if (query.membershipStatus === 'expired') {
    filter.endDate = { $lt: now };
  }
  return filter;
}

/**
 * GET /members — list with pagination, search, filters.
 */
export async function getMembers(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;
    const filter = buildMemberFilter(req.query);

    const [items, total] = await Promise.all([
      Member.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Member.countDocuments(filter),
    ]);

    res.json({
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /members — create member.
 */
export async function createMember(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    const member = await Member.create(req.body);
    res.status(201).json(member);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /members/:id — update member.
 */
export async function updateMember(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json(member);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /members/:id
 */
export async function deleteMember(req, res, next) {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json({ message: 'Member removed' });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /members/:id — single member (optional for edit form).
 */
export async function getMemberById(req, res, next) {
  try {
    const member = await Member.findById(req.params.id).lean();
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json(member);
  } catch (err) {
    next(err);
  }
}
