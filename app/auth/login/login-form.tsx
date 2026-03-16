'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const email = form.get('email') as string
    const password = form.get('password') as string

    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const role = data.user?.user_metadata?.role
    const destination = redirectTo ?? (
      role === 'farmer' ? '/farmer' :
      role === 'partner' ? '/partner' :
      role === 'admin' ? '/admin' : '/'
    )

    router.push(destination)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Email" name="email" type="email" required autoComplete="email" />
      <Input label="Password" name="password" type="password" required autoComplete="current-password" />

      {error && (
        <p className="text-sm text-[#FF3B30] bg-[rgba(255,59,48,0.08)] rounded-[8px] px-3 py-2">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>

      <p className="text-center text-sm text-[#8E8E93]">
        Don&apos;t have an account?{' '}
        <Link href="/auth/register" className="text-[#007AFF] font-medium hover:underline">
          Register
        </Link>
      </p>
    </form>
  )
}
