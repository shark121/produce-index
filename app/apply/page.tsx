import type { Metadata } from 'next'
import { PublicNav } from '@/components/nav/public-nav'
import { ApplyForm } from './apply-form'

export const metadata: Metadata = { title: 'Apply to Pilot' }

export default function ApplyPage() {
  return (
    <>
      <PublicNav />
      <main className="mx-auto max-w-lg px-4 md:px-6 py-12 md:py-20">
        <h1 className="text-3xl font-bold text-[#1C1C1E] tracking-tight mb-2">Apply to the Pilot</h1>
        <p className="text-[#48484A] mb-10">
          We are onboarding a small cohort of farms and partners in the first pilot region. Fill out
          the form below and our team will reach out within 3–5 business days.
        </p>
        <ApplyForm />
      </main>
    </>
  )
}
