import type { Metadata } from 'next'
import { RegisterForm } from './register-form'

export const metadata: Metadata = { title: 'Register' }

export default function RegisterPage() {
  return (
    <div className="surface-elevated rounded-[20px] p-8">
      <h1 className="text-2xl font-bold text-[#1C1C1E] mb-1">Create account</h1>
      <p className="text-sm text-[#8E8E93] mb-8">Join the PRI pilot program</p>
      <RegisterForm />
    </div>
  )
}
