import { useNavigate } from 'react-router-dom'
import MemberForm from '../components/MemberForm'
import { api } from '../api/client'
import { useState } from 'react'

export default function MemberNew() {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  async function onSubmit(payload) {
    setError('')
    try {
      await api.post('/members', payload)
      navigate('/members')
    } catch (e) {
      const msg = e.response?.data?.message
      const errs = e.response?.data?.errors
      if (Array.isArray(errs) && errs.length) {
        setError(errs.map((x) => x.msg || x.message).join('. '))
      } else {
        setError(msg || 'Could not create member')
      }
      throw e // MemberForm catches to avoid unhandled rejection
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Add member</h2>
        <p className="mt-1 text-sm text-zinc-500">Enter membership details</p>
      </div>
      <MemberForm onSubmit={onSubmit} submitLabel="Create member" error={error} />
    </div>
  )
}
