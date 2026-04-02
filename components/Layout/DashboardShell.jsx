'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import AppLayout from '@/components/Layout/AppLayout'

export default function DashboardShell({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  )
}
