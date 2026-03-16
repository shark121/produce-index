import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LoginForm } from './login-form'

export const metadata: Metadata = { title: 'Log In' }

export default function LoginPage() {
  return (
    <div className="surface-elevated rounded-[20px] p-8">
      <h1 className="text-2xl font-bold text-[#1C1C1E] mb-1">Welcome back</h1>
      <p className="text-sm text-[#8E8E93] mb-8">Sign in to your PRI account</p>
      <Suspense fallback={<div className="h-40" />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
