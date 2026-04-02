import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import FormField from './ui/FormField'
import { PLANS, PAYMENT_STATUSES } from '../constants/plans'

const empty = {
  name: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
  plan: 'monthly',
  startDate: '',
  endDate: '',
  paymentStatus: 'unpaid',
}

function toInputDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export default function MemberForm({ initial, onSubmit, submitLabel, error: apiError }) {
  const [values, setValues] = useState(empty)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (initial) {
      setValues({
        name: initial.name ?? '',
        phone: initial.phone ?? '',
        email: initial.email ?? '',
        address: initial.address ?? '',
        notes: initial.notes ?? '',
        plan: initial.plan ?? 'monthly',
        startDate: toInputDate(initial.startDate),
        endDate: toInputDate(initial.endDate),
        paymentStatus: initial.paymentStatus ?? 'unpaid',
      })
    } else {
      setValues(empty)
    }
  }, [initial])

  const set = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }))
    setErrors((er) => ({ ...er, [key]: undefined }))
  }

  function validate() {
    const e = {}
    if (!values.name.trim()) e.name = 'Name is required'
    if (!values.phone.trim()) e.phone = 'Phone is required'
    if (!values.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) e.email = 'Invalid email'
    if (!values.startDate) e.startDate = 'Start date is required'
    if (!values.endDate) e.endDate = 'End date is required'
    if (values.startDate && values.endDate && values.endDate < values.startDate) {
      e.endDate = 'End date must be on or after start date'
    }
    if (values.notes.length > 5000) e.notes = 'Notes must be at most 5000 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const payload = {
        ...values,
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
      }
      await onSubmit(payload)
    } catch {
      /* parent sets API error state */
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-emerald-500/30 focus:border-emerald-500 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100'

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-4">
      {apiError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
          {apiError}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Full name" error={errors.name}>
          <input className={inputClass} value={values.name} onChange={set('name')} />
        </FormField>
        <FormField label="Phone" error={errors.phone}>
          <input className={inputClass} value={values.phone} onChange={set('phone')} />
        </FormField>
        <FormField label="Email" error={errors.email} className="sm:col-span-2">
          <input
            type="email"
            className={inputClass}
            value={values.email}
            onChange={set('email')}
          />
        </FormField>
        <FormField label="Address" className="sm:col-span-2">
          <textarea
            rows={2}
            className={inputClass}
            value={values.address}
            onChange={set('address')}
          />
        </FormField>
        <FormField
          label="Internal notes"
          error={errors.notes}
          className="sm:col-span-2"
        >
          <textarea
            rows={4}
            className={inputClass}
            value={values.notes}
            onChange={set('notes')}
            placeholder="Injuries, goals, payment reminders — visible only in this dashboard"
            maxLength={5000}
          />
          <p className="mt-1 text-xs text-zinc-500">{values.notes.length} / 5000</p>
        </FormField>
        <FormField label="Membership plan" error={errors.plan}>
          <select className={inputClass} value={values.plan} onChange={set('plan')}>
            {PLANS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Payment status">
          <select
            className={inputClass}
            value={values.paymentStatus}
            onChange={set('paymentStatus')}
          >
            {PAYMENT_STATUSES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Start date" error={errors.startDate}>
          <input type="date" className={inputClass} value={values.startDate} onChange={set('startDate')} />
        </FormField>
        <FormField label="End date" error={errors.endDate}>
          <input type="date" className={inputClass} value={values.endDate} onChange={set('endDate')} />
        </FormField>
      </div>
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>
        <Link
          to="/members"
          className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
