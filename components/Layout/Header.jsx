'use client'

import { useAuth } from '@/context/AuthContext'
import ThemeToggleButton from '@/components/ThemeToggleButton'

export default function Header({ onMenuClick, className = '' }) {
  const { user, logout } = useAuth()

  return (
    <header
      className={`flex h-14 shrink-0 items-center justify-between gap-4 border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950 md:px-6 ${className}`}
    >
      <button
        type="button"
        className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 md:hidden dark:text-zinc-400 dark:hover:bg-zinc-800"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      <h1 className="hidden text-lg font-semibold text-zinc-900 dark:text-zinc-100 md:block">
        Welcome{user?.name ? `, ${user.name}` : ''}
      </h1>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggleButton className="hover:bg-zinc-100 dark:hover:bg-zinc-800" />
        <span className="hidden max-w-[140px] truncate text-sm text-zinc-600 dark:text-zinc-400 sm:inline">
          {user?.email}
        </span>
        <button
          type="button"
          onClick={logout}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Log out
        </button>
      </div>
    </header>
  )
}
