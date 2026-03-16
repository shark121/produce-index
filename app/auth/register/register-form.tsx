'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { UserRole } from '@/lib/types'

export function RegisterForm() {
  const router = useRouter()
  const [role, setRole] = useState<UserRole>('farmer')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const email = form.get('email') as string
    const password = form.get('password') as string
    const fullName = form.get('fullName') as string

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role, full_name: fullName },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push(role === 'farmer' ? '/farmer' : role === 'partner' ? '/partner' : '/admin')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Role selector — farmers and partners only; admins are provisioned manually */}
      <div>
        <p className="text-sm font-medium text-[#1C1C1E] mb-2">I am a</p>
        <div className="grid grid-cols-2 gap-2">
          {(['farmer', 'partner'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`h-10 rounded-[10px] text-sm font-medium transition-all ${
                role === r
                  ? 'bg-[#34C759] text-white shadow-sm'
                  : 'bg-[rgba(0,0,0,0.04)] text-[#48484A] hover:bg-[rgba(0,0,0,0.07)]'
              }`}
            >
              {r === 'farmer' ? 'Farmer' : 'Partner / Buyer'}
            </button>
          ))}
        </div>
      </div>

      <Input label="Full name" name="fullName" required autoComplete="name" />
      <Input label="Email" name="email" type="email" required autoComplete="email" />
      <Input
        label="Password"
        name="password"
        type="password"
        required
        autoComplete="new-password"
        hint="At least 8 characters"
      />

      {error && (
        <p className="text-sm text-[#FF3B30] bg-[rgba(255,59,48,0.08)] rounded-[8px] px-3 py-2">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>
        {loading ? 'Creating account...' : 'Create Account'}
      </Button>

      <p className="text-center text-sm text-[#8E8E93]">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-[#007AFF] font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
