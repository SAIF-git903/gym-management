'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, ready } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!ready) return
    if (!isAuthenticated) {
      const q = pathname ? `?from=${encodeURIComponent(pathname)}` : ''
      router.replace(`/login${q}`)
    }
  }, [ready, isAuthenticated, router, pathname])

  if (!ready || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-500 dark:bg-zinc-900">
        Loading…
      </div>
    )
  }

  return children
}
