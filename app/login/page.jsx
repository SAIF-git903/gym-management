import { Suspense } from 'react'
import LoginForm from '@/components/pages/LoginForm'

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-zinc-500">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
