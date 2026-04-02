import { Member } from '../models/Member.js';

/**
 * GET /dashboard/stats — counts and basic revenue (paid members only, simplified).
 */
export async function getDashboardStats(req, res, next) {
  try {
    const now = new Date();
    const [totalMembers, activeMembers, expiredMembers, paidAgg, planBreakdown] =
      await Promise.all([
        Member.countDocuments(),
        Member.countDocuments({ endDate: { $gte: now } }),
        Member.countDocuments({ endDate: { $lt: now } }),
        Member.aggregate([
          { $match: { paymentStatus: 'paid' } },
          {
            $group: {
              _id: '$plan',
              count: { $sum: 1 },
            },
          },
        ]),
        Member.aggregate([
          { $match: { paymentStatus: 'paid' } },
          { $count: 'paidCount' },
        ]),
      ]);

    // Simple illustrative revenue: assign a flat fee per plan type for overview
    const planPrices = {
      monthly: 50,
      quarterly: 135,
      'half-yearly': 250,
      yearly: 450,
    };
    let revenueEstimate = 0;
    for (const row of paidAgg) {
      revenueEstimate += (planPrices[row._id] || 0) * row.count;
    }

    const expiringSoon = await Member.find({
      endDate: { $gte: now, $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
    })
      .sort({ endDate: 1 })
      .limit(10)
      .select('name email endDate plan')
      .lean();

    res.json({
      totalMembers,
      activeMembers,
      expiredMembers,
      paidMembersCount: planBreakdown[0]?.paidCount ?? 0,
      revenueOverview: {
        note: 'Estimated from paid members × default plan prices (configure as needed)',
        estimatedTotal: revenueEstimate,
        byPlan: paidAgg.map((r) => ({
          plan: r._id,
          count: r.count,
          subtotal: (planPrices[r._id] || 0) * r.count,
        })),
      },
      expiringWithin7Days: expiringSoon,
    });
  } catch (err) {
    next(err);
  }
}
