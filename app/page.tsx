import Link from 'next/link'
import { PublicNav } from '@/components/nav/public-nav'
import { Button } from '@/components/ui/button'
import { ArrowRight, Leaf, ShieldCheck, TrendingUp, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <>
      <PublicNav />
      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 md:px-6 pt-14 md:pt-24 pb-14 md:pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(52,199,89,0.12)] text-[#1A7A32] text-sm font-medium mb-8">
            <Leaf className="h-3.5 w-3.5" />
            Pilot Program Open
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-[#1C1C1E] leading-tight tracking-tight max-w-3xl mx-auto">
            The health score that rewards
            <span className="text-[#34C759]"> better farming</span>
          </h1>
          <p className="mt-6 text-xl text-[#48484A] max-w-xl mx-auto leading-relaxed">
            PRI scores small farms on nutrition, safety, and reliability — turning public health
            value into economic opportunity.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3 flex-wrap">
            <Button size="lg" asChild>
              <Link href="/apply">
                Apply to Pilot <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/how-it-works">How It Works</Link>
            </Button>
          </div>
        </section>

        {/* Score categories */}
        <section className="mx-auto max-w-6xl px-4 md:px-6 pb-14 md:pb-20">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Nutritional Value',  weight: '30%', color: '#34C759' },
              { label: 'Food Safety',        weight: '20%', color: '#007AFF' },
              { label: 'Supply Reliability', weight: '20%', color: '#AF52DE' },
              { label: 'Local Accessibility',weight: '15%', color: '#FF9500' },
              { label: 'Affordability',      weight: '15%', color: '#FF3B30' },
            ].map(({ label, weight, color }) => (
              <div key={label} className="surface-elevated rounded-[14px] p-4 flex flex-col gap-1">
                <div className="h-1.5 w-8 rounded-full mb-1" style={{ backgroundColor: color }} />
                <p className="text-sm font-semibold text-[#1C1C1E]">{label}</p>
                <p className="text-xs text-[#8E8E93]">{weight} of score</p>
              </div>
            ))}
          </div>
        </section>

        {/* Value props */}
        <section className="mx-auto max-w-6xl px-4 md:px-6 pb-16 md:pb-24">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: TrendingUp,
                title: 'For Farmers',
                body: 'Earn a verified score that unlocks better financing terms, supply contracts, and partnership opportunities.',
                href: '/for-farmers',
                cta: 'Learn more',
              },
              {
                icon: Users,
                title: 'For Partners',
                body: 'Browse a verified directory of high-scoring farms. Filter, compare, and connect with confidence.',
                href: '/for-partners',
                cta: 'Learn more',
              },
              {
                icon: ShieldCheck,
                title: 'Verified by Admins',
                body: 'Every score goes through manual evidence review. No self-reporting without verification.',
                href: '/how-it-works',
                cta: 'See the process',
              },
            ].map(({ icon: Icon, title, body, href, cta }) => (
              <div key={title} className="surface-elevated rounded-[20px] p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[rgba(52,199,89,0.12)] mb-4">
                  <Icon className="h-5 w-5 text-[#34C759]" />
                </div>
                <h3 className="text-base font-semibold text-[#1C1C1E]">{title}</h3>
                <p className="mt-2 text-sm text-[#48484A] leading-relaxed">{body}</p>
                <Link
                  href={href}
                  className="mt-4 inline-flex items-center gap-1 text-sm text-[#007AFF] font-medium hover:gap-2 transition-all"
                >
                  {cta} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
