'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import MemberForm from '@/components/MemberForm'
import { api } from '@/lib/api/client'

export default function MemberEditPage() {
  const { id } = useParams()
  const router = useRouter()
  const [initial, setInitial] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get(`/api/members/${id}`)
        if (!cancelled) setInitial(data)
      } catch (e) {
        if (!cancelled) setLoadError(e.response?.data?.message || 'Member not found')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  async function onSubmit(payload) {
    setSaveError('')
    try {
      await api.put(`/api/members/${id}`, payload)
      router.push('/members')
    } catch (e) {
      const msg = e.response?.data?.message
      const errs = e.response?.data?.errors
      if (Array.isArray(errs) && errs.length) {
        setSaveError(errs.map((x) => x.msg || x.message).join('. '))
      } else {
        setSaveError(msg || 'Could not update member')
      }
      throw e
    }
  }

  if (loading) {
    return <div className="py-12 text-center text-zinc-500">Loading member…</div>
  }
  if (loadError) {
    return (
      <div className="rounded-lg bg-red-50 px-4 py-3 text-red-800 dark:bg-red-950/40 dark:text-red-200">
        {loadError}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Edit member</h2>
          <p className="mt-1 text-sm text-zinc-500">Update details and membership</p>
        </div>
        <Link
          href={`/members/${id}/receipt`}
          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Print payment receipt
        </Link>
      </div>
      <MemberForm
        initial={initial}
        onSubmit={onSubmit}
        submitLabel="Save changes"
        error={saveError}
      />
    </div>
  )
}
