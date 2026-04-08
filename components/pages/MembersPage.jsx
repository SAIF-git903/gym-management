'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api/client'
import { PLANS } from '@/constants/plans'
import { formatPKR } from '@/lib/formatPKR'

export default function MembersPage() {
  const [rows, setRows] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [revenueOverview, setRevenueOverview] = useState(null)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [plan, setPlan] = useState('')
  const [membershipStatus, setMembershipStatus] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  const fetchMembers = useCallback(
    async (page = 1) => {
      setLoading(true)
      setError('')
      try {
        const params = new URLSearchParams({ page: String(page), limit: '10' })
        if (debouncedSearch) params.set('search', debouncedSearch)
        if (paymentStatus) params.set('paymentStatus', paymentStatus)
        if (plan) params.set('plan', plan)
        if (membershipStatus) params.set('membershipStatus', membershipStatus)
        const { data } = await api.get(`/api/members?${params}`)
        setRows(data.data)
        setPagination(data.pagination)
        if (data.revenueOverview) setRevenueOverview(data.revenueOverview)
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load members')
      } finally {
        setLoading(false)
      }
    },
    [debouncedSearch, paymentStatus, plan, membershipStatus]
  )

  useEffect(() => {
    fetchMembers(1)
  }, [fetchMembers])

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete member "${name}"?`)) return
    try {
      await api.delete(`/api/members/${id}`)
      fetchMembers(pagination.page)
    } catch (e) {
      alert(e.response?.data?.message || 'Delete failed')
    }
  }

  const now = new Date()
  function isExpired(endDate) {
    return new Date(endDate) < now
  }

  function notesPreview(text) {
    const t = (text || '').trim()
    if (!t) return '—'
    if (t.length <= 48) return t
    return `${t.slice(0, 48)}…`
  }

  const selectClass =
    'rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Members</h2>
          <p className="mt-1 text-sm text-zinc-500">Manage gym memberships</p>
        </div>
        <Link
          href="/members/new"
          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Add member
        </Link>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-xs font-medium text-zinc-500">Search</label>
          <input
            placeholder="Name, email, phone, notes…"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">Payment</label>
          <select
            className={selectClass}
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
          >
            <option value="">All</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">Plan</label>
          <select className={selectClass} value={plan} onChange={(e) => setPlan(e.target.value)}>
            <option value="">All</option>
            {PLANS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">Membership</label>
          <select
            className={selectClass}
            value={membershipStatus}
            onChange={(e) => setMembershipStatus(e.target.value)}
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {revenueOverview && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Revenue overview</h3>
          <p className="mt-1 text-sm text-zinc-500">{revenueOverview.note}</p>
          <p className="mt-4 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatPKR(revenueOverview.estimatedTotal ?? 0)}
            <span className="ml-2 text-sm font-normal text-zinc-500">from paid members</span>
          </p>
          {revenueOverview.byPlan?.length > 0 && (
            <ul className="mt-4 space-y-2 text-sm">
              {revenueOverview.byPlan.map((row) => (
                <li
                  key={row.plan}
                  className="flex justify-between border-b border-zinc-100 py-2 dark:border-zinc-800"
                >
                  <span className="capitalize text-zinc-700 dark:text-zinc-300">{row.plan}</span>
                  <span className="text-zinc-500">
                    {row.count} member{row.count !== 1 ? 's' : ''} ·{' '}
                    {formatPKR(row.subtotal ?? 0)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/80">
              <tr>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Name</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Contact</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Plan</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Fee</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Blood</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Period</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Payment</th>
                <th className="max-w-[200px] px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                  Notes
                </th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Status</th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-zinc-500">
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-zinc-500">
                    No members found.
                  </td>
                </tr>
              ) : (
                rows.map((m) => (
                  <tr key={m._id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50">
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                      {m.name}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      <div>
                        {m.email?.trim() ? (
                          m.email
                        ) : (
                          <span className="text-zinc-400 dark:text-zinc-500">—</span>
                        )}
                      </div>
                      <div className="text-xs">{m.phone}</div>
                    </td>
                    <td className="px-4 py-3 capitalize text-zinc-700 dark:text-zinc-300">
                      {m.plan?.replace('-', ' ')}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-zinc-800 dark:text-zinc-200">
                      {formatPKR(m.membershipFee)}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {m.bloodGroup ? (
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">
                          {m.bloodGroup}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      <div className="whitespace-nowrap text-xs">
                        {new Date(m.startDate).toLocaleDateString()} –{' '}
                        {new Date(m.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          m.paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                        }`}
                      >
                        {m.paymentStatus}
                      </span>
                    </td>
                    <td
                      className="max-w-[200px] px-4 py-3 text-zinc-600 dark:text-zinc-400"
                      title={m.notes?.trim() ? m.notes : undefined}
                    >
                      <span className="line-clamp-2 text-xs">{notesPreview(m.notes)}</span>
                    </td>
                    <td className="px-4 py-3">
                      {isExpired(m.endDate) ? (
                        <span className="text-xs font-medium text-red-600 dark:text-red-400">
                          Expired
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/members/${m._id}/receipt`}
                          className="text-zinc-700 hover:underline dark:text-zinc-300"
                        >
                          Receipt
                        </Link>
                        <Link
                          href={`/members/${m._id}/edit`}
                          className="text-emerald-600 hover:underline dark:text-emerald-400"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(m._id, m.name)}
                          className="text-red-600 hover:underline dark:text-red-400"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <p className="text-sm text-zinc-500">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1 || loading}
                onClick={() => fetchMembers(pagination.page - 1)}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-zinc-600"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages || loading}
                onClick={() => fetchMembers(pagination.page + 1)}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-zinc-600"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
