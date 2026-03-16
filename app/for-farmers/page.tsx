import type { Metadata } from 'next'
import Link from 'next/link'
import { PublicNav } from '@/components/nav/public-nav'
import { Button } from '@/components/ui/button'
import { ArrowRight, BadgeDollarSign, BarChart3, FileCheck, Handshake } from 'lucide-react'

export const metadata: Metadata = { title: 'For Farmers' }

export default function ForFarmersPage() {
  return (
    <>
      <PublicNav />
      <main className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-bold text-[#1C1C1E] tracking-tight mb-4">For Farmers</h1>
        <p className="text-xl text-[#48484A] leading-relaxed mb-16 max-w-2xl">
          Your farm already creates public health value. PRI makes that value visible — and turns
          it into economic advantage.
        </p>

        <div className="grid md:grid-cols-2 gap-5 mb-16">
          {[
            {
              icon: BarChart3,
              title: 'Understand your score',
              body: 'Get a transparent breakdown across all five categories. Know exactly what to improve and what you already do well.',
            },
            {
              icon: BadgeDollarSign,
              title: 'Access better financing',
              body: 'High PRI scores are recognized by our lending partners as a signal of reliability. Lower rates, better terms.',
            },
            {
              icon: Handshake,
              title: 'Connect with partners',
              body: 'Hospitals, grocery retailers, and community organizations browse the verified directory looking for farms like yours.',
            },
            {
              icon: FileCheck,
              title: 'Build a verified record',
              body: 'Every submission is reviewed and archived. Your score history is a durable credential that grows over time.',
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="surface-elevated rounded-[16px] p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[rgba(52,199,89,0.12)] mb-4">
                <Icon className="h-5 w-5 text-[#34C759]" />
              </div>
              <h3 className="text-base font-semibold text-[#1C1C1E] mb-1.5">{title}</h3>
              <p className="text-sm text-[#48484A] leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        <div className="surface-elevated rounded-[20px] p-8 text-center">
          <h2 className="text-2xl font-bold text-[#1C1C1E] mb-2">Ready to get scored?</h2>
          <p className="text-[#48484A] mb-6">
            The pilot is free. Apply now and our team will onboard you personally.
          </p>
          <Button size="lg" asChild>
            <Link href="/apply">
              Apply to Pilot <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </main>
    </>
  )
}
