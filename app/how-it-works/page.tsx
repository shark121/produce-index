import type { Metadata } from 'next'
import { PublicNav } from '@/components/nav/public-nav'
import { CheckCircle2, ClipboardCheck, FileUp, ShieldCheck, Star } from 'lucide-react'

export const metadata: Metadata = { title: 'How It Works' }

const steps = [
  {
    icon: ClipboardCheck,
    title: 'Farm completes profile',
    body: 'Farmers fill out a structured profile covering crops, pricing, distribution channels, and food safety practices.',
  },
  {
    icon: FileUp,
    title: 'Evidence is uploaded',
    body: 'Supporting documents — lab results, certifications, delivery logs, price lists — are attached to each category.',
  },
  {
    icon: ShieldCheck,
    title: 'Admin reviews and verifies',
    body: 'Our team reviews each submission, scores evidence coverage by category, and runs the scoring engine against a versioned benchmark pack. Farmers receive feedback if anything is missing.',
  },
  {
    icon: Star,
    title: 'Score is published',
    body: 'Verified farms appear with a full PRI scorecard, confidence disclosure, evidence coverage, and benchmark/version provenance.',
  },
  {
    icon: CheckCircle2,
    title: 'Institutions make decisions',
    body: 'Lenders, health systems, and produce buyers browse verified farms, compare scorecards, and use PRI as decision support.',
  },
]

export default function HowItWorksPage() {
  return (
    <>
      <PublicNav />
      <main className="mx-auto max-w-3xl px-4 md:px-6 py-12 md:py-20">
        <h1 className="text-4xl font-bold text-[#1C1C1E] tracking-tight mb-4">How PRI Works</h1>
        <p className="text-lg text-[#48484A] leading-relaxed mb-16">
          The Produce Reliability Index is a transparent, evidence-backed scoring process that turns
          farm documentation into institution-ready decision support.
        </p>

        <div className="space-y-6">
          {steps.map(({ icon: Icon, title, body }, i) => (
            <div key={title} className="surface-elevated rounded-[16px] p-6 flex gap-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[rgba(52,199,89,0.12)] shrink-0">
                <Icon className="h-5 w-5 text-[#34C759]" />
              </div>
              <div>
                <p className="text-xs font-medium text-[#8E8E93] mb-1">Step {i + 1}</p>
                <h3 className="text-base font-semibold text-[#1C1C1E]">{title}</h3>
                <p className="mt-1.5 text-sm text-[#48484A] leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Scoring breakdown */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-[#1C1C1E] mb-2">The scoring model</h2>
          <p className="text-[#48484A] mb-8">
            Five categories combine into one overall PRI score from 0 to 100. Every published score
            is paired with evidence coverage and benchmark provenance.
          </p>
          <div className="space-y-3">
            {[
              { label: 'Nutritional Value',  weight: 30, color: '#34C759', desc: 'Nutrient density of crops based on lab testing and USDA baselines.' },
              { label: 'Food Safety',        weight: 20, color: '#007AFF', desc: 'Pesticide practices, water handling, and certifications.' },
              { label: 'Supply Reliability', weight: 20, color: '#AF52DE', desc: 'Consistency of production and delivery across seasons.' },
              { label: 'Local Accessibility',weight: 15, color: '#FF9500', desc: 'Distribution to nearby communities and low-income areas.' },
              { label: 'Affordability',      weight: 15, color: '#FF3B30', desc: 'Pricing relative to regional benchmarks, SNAP acceptance.' },
            ].map(({ label, weight, color, desc }) => (
              <div key={label} className="surface-elevated rounded-[12px] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[#1C1C1E]">{label}</span>
                  <span className="text-sm font-bold" style={{ color }}>{weight}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[rgba(0,0,0,0.06)] mb-2">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${weight * 2}%`, backgroundColor: color }}
                  />
                </div>
                <p className="text-xs text-[#8E8E93]">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          <div className="surface-elevated rounded-[16px] p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-[#8E8E93]">Evidence coverage</p>
            <p className="mt-2 text-sm leading-relaxed text-[#48484A]">
              Reviewers capture how complete the evidence is by category so institutions can judge
              confidence, not just score.
            </p>
          </div>
          <div className="surface-elevated rounded-[16px] p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-[#8E8E93]">Versioned benchmarks</p>
            <p className="mt-2 text-sm leading-relaxed text-[#48484A]">
              Weight versions and benchmark versions are disclosed so lenders and health systems know
              exactly which rules produced a scorecard.
            </p>
          </div>
          <div className="surface-elevated rounded-[16px] p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-[#8E8E93]">Institution packet</p>
            <p className="mt-2 text-sm leading-relaxed text-[#48484A]">
              The published output includes financing readiness, local-access indicators, and
              health-impact signals alongside the PRI score.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
