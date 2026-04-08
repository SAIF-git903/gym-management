'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api/client'
function StatCard({ title, value, hint, tone = 'default' }) {
  const tones = {
    default: 'border-zinc-200 dark:border-zinc-800',
    success: 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30',
    warning: 'border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/30',
    danger: 'border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/30',
  }
  return (
    <div className={`rounded-xl border p-5 ${tones[tone]}`}>
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get('/api/dashboard/stats')
        if (!cancelled) setStats(data)
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || 'Failed to load dashboard')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-zinc-500">Loading dashboard…</div>
    )
  }
  if (error) {
    return (
      <div className="rounded-lg bg-red-50 px-4 py-3 text-red-800 dark:bg-red-950/40 dark:text-red-200">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Dashboard</h2>
        <p className="mt-1 text-sm text-zinc-500">Overview of members</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total members" value={stats.totalMembers} />
        <StatCard title="Active memberships" value={stats.activeMembers} tone="success" />
        <StatCard title="Expired" value={stats.expiredMembers} tone="warning" />
        <StatCard title="Paid members" value={stats.paidMembersCount} />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Expiring within 7 days
          </h3>
          <Link
            href="/members"
            className="text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
          >
            View all members
          </Link>
        </div>
        {stats.expiringWithin7Days?.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">No memberships expiring this week.</p>
        ) : (
          <ul className="mt-4 divide-y divide-zinc-100 dark:divide-zinc-800">
            {stats.expiringWithin7Days.map((m) => (
              <li
                key={m._id}
                className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
              >
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{m.name}</span>
                <span className="text-zinc-500">
                  {new Date(m.endDate).toLocaleDateString()} ·{' '}
                  <span className="capitalize">{m.plan}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
