'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api/client'
import { formatPKR } from '@/lib/formatPKR'
import { getGymOwners } from '@/constants/gym-contact'
import { PLANS } from '@/constants/plans'

function planLabel(plan) {
  return PLANS.find((p) => p.value === plan)?.label ?? plan
}

const gymName =
  typeof process.env.NEXT_PUBLIC_GYM_NAME === 'string'
    ? process.env.NEXT_PUBLIC_GYM_NAME.trim() || 'Membership'
    : 'Membership'

const gymOwners = getGymOwners()

export default function MemberReceiptPage() {
  const { id } = useParams()
  const [member, setMember] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get(`/api/members/${id}`)
        if (!cancelled) setMember(data)
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || 'Member not found')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return <div className="py-12 text-center text-zinc-500">Loading receipt…</div>
  }
  if (error || !member) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-red-50 px-4 py-3 text-red-800 dark:bg-red-950/40 dark:text-red-200">
          {error || 'Member not found'}
        </div>
        <Link href="/members" className="text-sm font-medium text-emerald-600 hover:underline">
          ← Back to members
        </Link>
      </div>
    )
  }

  const receiptRef = String(member._id).slice(-8).toUpperCase()
  const issued = new Date()
  const start = new Date(member.startDate)
  const end = new Date(member.endDate)
  const isPaid = member.paymentStatus === 'paid'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/members" className="text-sm font-medium text-emerald-600 hover:underline">
          ← Members
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/members/${id}/edit`}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Edit member
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Print receipt
          </button>
        </div>
      </div>

      <p className="text-xs text-zinc-500 print:hidden">
        In the print dialog, choose your Brother HL-L5100DN (or default printer), A4 paper, and
        black &amp; white. Margins are tuned for a simple payment slip on laser print.
      </p>

      {!isPaid && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 print:hidden dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          This member is marked <strong>unpaid</strong>. The slip will still print for your records;
          confirm payment before handing it to the member as a receipt.
        </div>
      )}

      <article className="mx-auto max-w-md rounded-xl border-2 border-dashed border-zinc-300 bg-white p-6 text-zinc-900 shadow-sm print:max-w-none print:border-2 print:border-zinc-800 print:shadow-none dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 print:dark:border-zinc-800 print:dark:bg-white print:dark:text-black">
        <header className="border-b border-zinc-200 pb-4 text-center dark:border-zinc-700 print:border-zinc-300">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 print:text-zinc-600">
            Payment receipt
          </p>
          <h1 className="mt-1 text-xl font-bold tracking-tight">{gymName}</h1>
          <p className="mt-2 font-mono text-xs text-zinc-500 print:text-zinc-600">
            Ref: {receiptRef} · Issued {issued.toLocaleDateString()}
          </p>
        </header>

        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500 print:text-zinc-600">Member</dt>
            <dd className="text-right font-semibold">{member.name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500 print:text-zinc-600">Phone</dt>
            <dd className="text-right">{member.phone}</dd>
          </div>
          {member.email?.trim() ? (
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500 print:text-zinc-600">Email</dt>
              <dd className="break-all text-right">{member.email}</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500 print:text-zinc-600">Plan</dt>
            <dd className="text-right">{planLabel(member.plan)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500 print:text-zinc-600">Period</dt>
            <dd className="text-right">
              {start.toLocaleDateString()} – {end.toLocaleDateString()}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-zinc-100 pt-3 dark:border-zinc-800 print:border-zinc-200">
            <dt className="text-zinc-500 print:text-zinc-600">Membership fee</dt>
            <dd className="text-right text-lg font-bold text-emerald-700 print:text-black">
              {formatPKR(member.membershipFee)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500 print:text-zinc-600">Payment status</dt>
            <dd className="text-right font-semibold capitalize">{member.paymentStatus}</dd>
          </div>
        </dl>

        <section className="mt-6 border-t border-zinc-100 pt-4 dark:border-zinc-800 print:border-zinc-200">
          <h2 className="text-center text-xs font-semibold uppercase tracking-wide text-zinc-500 print:text-zinc-600">
            Owners
          </h2>
          <ul className="mt-3 space-y-2.5 text-sm">
            {gymOwners.map((o) => (
              <li
                key={`${o.name}-${o.phone}`}
                className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
              >
                <span className="font-medium text-zinc-800 print:text-black">{o.name}</span>
                <span className="font-mono tabular-nums text-zinc-700 print:text-black">{o.phone}</span>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-8 border-t border-zinc-100 pt-4 text-center text-xs text-zinc-500 dark:border-zinc-800 print:border-zinc-200 print:text-zinc-600">
          <p>Thank you for your payment.</p>
          <p className="mt-3 text-zinc-400 print:text-zinc-500">Authorized signature: ____________________</p>
        </footer>
      </article>
    </div>
  )
}
