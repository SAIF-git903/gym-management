'use client'

import { useState } from 'react'
import Sidebar from '@/components/Layout/Sidebar'
import Header from '@/components/Layout/Header'

export default function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen items-stretch bg-zinc-50 print:block print:min-h-0 print:bg-white dark:bg-zinc-900">
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity print:hidden md:hidden ${
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden
      />
      <div
        className={`fixed inset-y-0 left-0 z-50 flex min-h-screen w-64 shrink-0 flex-col transform transition-transform print:hidden md:static md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onNavigate={() => setMobileOpen(false)} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col print:block">
        <Header onMenuClick={() => setMobileOpen(true)} className="print:hidden" />
        <main className="flex-1 overflow-auto p-4 md:p-6 print:p-0 print:overflow-visible">
          {children}
        </main>
      </div>
    </div>
  )
}
