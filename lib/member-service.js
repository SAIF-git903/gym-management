import { Member } from '@/lib/models/Member'

const PLAN_VALUES = ['monthly', 'quarterly', 'half-yearly', 'yearly']

export function buildMemberFilter(query) {
  const filter = {}
  if (query.search && String(query.search).trim()) {
    const q = String(query.search).trim()
    filter.$or = [
      { name: new RegExp(q, 'i') },
      { email: new RegExp(q, 'i') },
      { phone: new RegExp(q, 'i') },
      { notes: new RegExp(q, 'i') },
    ]
  }
  if (query.paymentStatus === 'paid' || query.paymentStatus === 'unpaid') {
    filter.paymentStatus = query.paymentStatus
  }
  if (query.plan && PLAN_VALUES.includes(query.plan)) {
    filter.plan = query.plan
  }
  const now = new Date()
  if (query.membershipStatus === 'active') {
    filter.endDate = { $gte: now }
  } else if (query.membershipStatus === 'expired') {
    filter.endDate = { $lt: now }
  }
  return filter
}

export async function listMembers(searchParams) {
  const query = Object.fromEntries(searchParams.entries())
  const page = Math.max(1, parseInt(query.page, 10) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10))
  const skip = (page - 1) * limit
  const filter = buildMemberFilter(query)

  const [items, total] = await Promise.all([
    Member.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Member.countDocuments(filter),
  ])

  return {
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  }
}

export async function getRevenueOverview() {
  const [paidByPlan, paidTotalFees] = await Promise.all([
    Member.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: '$plan',
          count: { $sum: 1 },
          subtotal: { $sum: { $ifNull: ['$membershipFee', 0] } },
        },
      },
    ]),
    Member.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$membershipFee', 0] } } } },
    ]),
  ])

  const revenueEstimate = paidTotalFees[0]?.total ?? 0

  return {
    note: 'Total membership fees (Rs) recorded for members marked as paid',
    currency: 'PKR',
    estimatedTotal: revenueEstimate,
    byPlan: paidByPlan.map((r) => ({
      plan: r._id,
      count: r.count,
      subtotal: r.subtotal,
    })),
  }
}

export async function getDashboardStats() {
  const now = new Date()
  const [totalMembers, activeMembers, expiredMembers, paidMembersCount] = await Promise.all([
    Member.countDocuments(),
    Member.countDocuments({ endDate: { $gte: now } }),
    Member.countDocuments({ endDate: { $lt: now } }),
    Member.countDocuments({ paymentStatus: 'paid' }),
  ])

  const expiringSoon = await Member.find({
    endDate: { $gte: now, $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
  })
    .sort({ endDate: 1 })
    .limit(10)
    .select('name email endDate plan')
    .lean()

  return {
    totalMembers,
    activeMembers,
    expiredMembers,
    paidMembersCount,
    expiringWithin7Days: expiringSoon,
  }
}
