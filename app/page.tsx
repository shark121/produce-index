import Link from 'next/link'
import { ArrowRight, Building2, HeartPulse, Landmark, Leaf, ShieldCheck, Sprout, TrendingUp } from 'lucide-react'
import { PublicNav } from '@/components/nav/public-nav'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ModeNotice } from '@/components/ui/mode-notice'
import { ScoreRing } from '@/components/ui/score-ring'
import { isMockMode } from '@/lib/is-mock-mode'
import { getPilotMetrics, getVerifiedFarmScorecards } from '@/lib/scorecards'
import { formatDate } from '@/lib/utils'

const institutionCards = [
  {
    icon: Landmark,
    title: 'Underwrite with verified farm evidence',
    body: 'PRI packages evidence coverage, benchmark deltas, and seasonality risk into an underwriting-ready farm profile.',
  },
  {
    icon: HeartPulse,
    title: 'Connect food access to health strategy',
    body: 'See how much supply reaches low-income-serving channels, nearby communities, and nutrition-sensitive buyers.',
  },
  {
    icon: Building2,
    title: 'Build a trusted pilot region network',
    body: 'Review farms through a common scorecard instead of fragmented self-reported spreadsheets and certifications.',
  },
]

const differentiators = [
  {
    title: 'Financing readiness packet',
    body: 'One-click lender brief with PRI trend, benchmark delta, evidence confidence, and next-season supply confidence.',
  },
  {
    title: 'Community coverage map',
    body: 'A location-aware view of where verified produce flows relative to food banks, SNAP-heavy areas, and local partners.',
  },
  {
    title: 'Health impact ledger',
    body: 'Translate farm output into estimated healthy servings, low-income reach, and public-health contribution signals.',
  },
  {
    title: 'Seasonal reliability forecast',
    body: 'Show likely next-season supply confidence using crop calendars, delivery history, and channel diversity.',
  },
]

export default function HomePage() {
  const mockMode = isMockMode()
  const featuredScorecard = getVerifiedFarmScorecards()[0]
  const pilotMetrics = getPilotMetrics()
  if (!featuredScorecard) return null
  const categories = [
    { label: 'Nutritional Value', value: featuredScorecard.score.nutritionalValue, color: '#34C759' },
    { label: 'Food Safety', value: featuredScorecard.score.foodSafety, color: '#007AFF' },
    { label: 'Supply Reliability', value: featuredScorecard.score.supplyReliability, color: '#AF52DE' },
    { label: 'Local Accessibility', value: featuredScorecard.score.localAccessibility, color: '#FF9500' },
    { label: 'Affordability', value: featuredScorecard.score.affordability, color: '#FF3B30' },
  ]

  return (
    <>
      <PublicNav />
      <main className="overflow-hidden">
        <section className="relative border-b border-[rgba(0,0,0,0.06)] bg-[radial-gradient(circle_at_top_left,rgba(52,199,89,0.18),transparent_36%),radial-gradient(circle_at_top_right,rgba(0,122,255,0.12),transparent_28%),linear-gradient(180deg,#FFFFFF_0%,#F5F8F6_100%)]">
          <div className="mx-auto max-w-6xl px-4 md:px-6 pt-14 md:pt-24 pb-14 md:pb-20">
            <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(52,199,89,0.12)] px-3 py-1.5 text-sm font-medium text-[#1A7A32]">
                  <Leaf className="h-3.5 w-3.5" />
                  Pilot cohort open for lenders, health systems, and farmers
                </div>
                <h1 className="mt-6 max-w-4xl text-5xl font-bold leading-tight tracking-tight text-[#1C1C1E] md:text-6xl">
                  Verified nutrition and supply intelligence for
                  <span className="text-[#34C759]"> lenders and health systems</span>
                </h1>
                <p className="mt-6 max-w-2xl text-xl leading-relaxed text-[#48484A]">
                  PRI turns farm evidence into institution-ready scorecards: verified nutrition,
                  supply reliability, local reach, benchmark context, and financing readiness in one
                  review workflow.
                </p>
                <div className="mt-10 flex flex-wrap items-center gap-3">
                  <Button size="lg" asChild>
                    <Link href="/apply">
                      Request Pilot Access <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="secondary" asChild>
                    <Link href="/for-institutions">See Institution Brief</Link>
                  </Button>
                  <Button size="lg" variant="ghost" asChild>
                    <Link href="/marketplace">Explore Exchange</Link>
                  </Button>
                </div>
                <div className="mt-10 grid gap-3 sm:grid-cols-3">
                  <div className="surface-elevated rounded-[18px] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#8E8E93]">Primary buyer</p>
                    <p className="mt-2 text-base font-semibold text-[#1C1C1E]">Lenders and health systems</p>
                  </div>
                  <div className="surface-elevated rounded-[18px] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#8E8E93]">Supply-side motion</p>
                    <p className="mt-2 text-base font-semibold text-[#1C1C1E]">Verified small-farm scoring</p>
                  </div>
                  <div className="surface-elevated rounded-[18px] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#8E8E93]">Secondary audience</p>
                    <p className="mt-2 text-base font-semibold text-[#1C1C1E]">Hospitals, grocers, and buyers</p>
                  </div>
                </div>
              </div>

              <div className="surface-elevated rounded-[28px] border border-[rgba(0,0,0,0.06)] p-6 shadow-[0_18px_50px_rgba(28,28,30,0.08)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[#8E8E93]">Verified farm example</p>
                    <h2 className="mt-2 text-2xl font-bold text-[#1C1C1E]">{featuredScorecard.farm.name}</h2>
                    <p className="mt-1 text-sm text-[#48484A]">
                      {featuredScorecard.farm.city}, {featuredScorecard.farm.state} · {featuredScorecard.farm.region}
                    </p>
                  </div>
                  <ScoreRing score={featuredScorecard.score.overallScore} size="lg" />
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Badge variant="green">{featuredScorecard.financingReadiness.label}</Badge>
                  <Badge variant="blue">
                    Confidence {featuredScorecard.verificationConfidence.score}/100
                  </Badge>
                  <Badge variant="orange">
                    Evidence {featuredScorecard.verificationConfidence.evidenceCoveragePct}%
                  </Badge>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[18px] bg-[rgba(0,122,255,0.06)] p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-[#8E8E93]">Health impact ledger</p>
                    <p className="mt-2 text-2xl font-semibold text-[#1C1C1E]">
                      {featuredScorecard.healthImpactSummary.estimatedHealthyServings.toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm text-[#48484A]">estimated healthy servings supported annually</p>
                  </div>
                  <div className="rounded-[18px] bg-[rgba(52,199,89,0.08)] p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-[#8E8E93]">Benchmark package</p>
                    <p className="mt-2 text-lg font-semibold text-[#1C1C1E]">
                      {featuredScorecard.scoreProvenance.benchmarkVersion}
                    </p>
                    <p className="mt-1 text-sm text-[#48484A]">{featuredScorecard.financingReadiness.benchmarkDelta}</p>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-relaxed text-[#48484A]">
                  {featuredScorecard.financingReadiness.lenderSummary} Reviewed{' '}
                  {formatDate(featuredScorecard.scoreProvenance.reviewedAt)} using{' '}
                  {featuredScorecard.scoreProvenance.reviewMethod.toLowerCase()}.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 md:px-6 py-8 md:py-10">
          {mockMode && (
            <ModeNotice
              title="Institution pages are using explicit demo records while infrastructure is being configured."
              body="Search, compare, scoring provenance, and pilot intake are live in demo mode. Once Supabase is configured, the same screens can read from production tables instead of curated pilot examples."
            />
          )}
        </section>

        <section className="mx-auto max-w-6xl px-4 md:px-6 pb-14 md:pb-20">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="surface-elevated rounded-[20px] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[#8E8E93]">Verified farms</p>
              <p className="mt-2 text-3xl font-bold text-[#1C1C1E]">{pilotMetrics.verifiedFarms}</p>
              <p className="mt-1 text-sm text-[#48484A]">reviewed against versioned pilot weights</p>
            </div>
            <div className="surface-elevated rounded-[20px] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[#8E8E93]">Pilot regions</p>
              <p className="mt-2 text-3xl font-bold text-[#1C1C1E]">{pilotMetrics.regions}</p>
              <p className="mt-1 text-sm text-[#48484A]">local benchmark packs available in demo</p>
            </div>
            <div className="surface-elevated rounded-[20px] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[#8E8E93]">Avg PRI score</p>
              <p className="mt-2 text-3xl font-bold text-[#1C1C1E]">{pilotMetrics.averageScore}</p>
              <p className="mt-1 text-sm text-[#48484A]">with evidence coverage disclosed per farm</p>
            </div>
            <div className="surface-elevated rounded-[20px] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[#8E8E93]">Healthy servings</p>
              <p className="mt-2 text-3xl font-bold text-[#1C1C1E]">
                {pilotMetrics.totalHealthyServings.toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-[#48484A]">
                {pilotMetrics.averageLowIncomeReach}% average low-income-serving channel reach
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 md:px-6 pb-16 md:pb-24">
          <div className="surface-elevated rounded-[24px] p-6 md:p-8">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#007AFF]">Secondary module</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#1C1C1E]">Health-Aware Produce Exchange</h2>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#48484A]">
                  PRI now includes a marketplace add-on where the same verified scorecards power smart buyer matching for hospitals,
                  schools, community organizations, and households looking for nutrient-aligned produce.
                </p>
              </div>
              <Button variant="secondary" asChild>
                <Link href="/marketplace">Open exchange</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 md:px-6 pb-16 md:pb-24">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#34C759]">Institution workflow</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#1C1C1E]">
                What institutions can do with PRI today
              </h2>
            </div>
            <Button variant="secondary" asChild>
              <Link href="/for-institutions">Full institution brief</Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {institutionCards.map(({ icon: Icon, title, body }) => (
              <div key={title} className="surface-elevated rounded-[22px] p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[rgba(52,199,89,0.12)]">
                  <Icon className="h-5 w-5 text-[#34C759]" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-[#1C1C1E]">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#48484A]">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 md:px-6 pb-16 md:pb-24">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="surface-elevated rounded-[24px] p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#34C759]">Score proof</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#1C1C1E]">
                A versioned score with transparent evidence coverage
              </h2>
              <div className="mt-8 space-y-4">
                {categories.map(({ label, value, color }) => (
                  <div key={label}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium text-[#1C1C1E]">{label}</span>
                      <span className="font-semibold text-[#1C1C1E]">{value.toFixed(1)}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[rgba(0,0,0,0.06)]">
                      <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[18px] bg-[rgba(0,0,0,0.03)] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#8E8E93]">Weights version</p>
                  <p className="mt-2 text-lg font-semibold text-[#1C1C1E]">{featuredScorecard.scoreProvenance.weightsVersion}</p>
                </div>
                <div className="rounded-[18px] bg-[rgba(0,0,0,0.03)] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#8E8E93]">Benchmark source</p>
                  <p className="mt-2 text-sm font-semibold text-[#1C1C1E]">{featuredScorecard.scoreProvenance.benchmarkSource}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="surface-elevated rounded-[24px] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#007AFF]">Verification trail</p>
                <div className="mt-5 space-y-4">
                  {[
                    'Farm profile and crop inventory submitted',
                    'Evidence coverage scored by category reviewers',
                    'Benchmarks applied at the regional version level',
                    'Institution-facing scorecard published with confidence disclosure',
                  ].map((step) => (
                    <div key={step} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(0,122,255,0.10)]">
                        <ShieldCheck className="h-4 w-4 text-[#007AFF]" />
                      </div>
                      <p className="text-sm leading-relaxed text-[#48484A]">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="surface-elevated rounded-[24px] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#AF52DE]">Coverage map preview</p>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="rounded-[18px] bg-[rgba(52,199,89,0.08)] p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-[#8E8E93]">Local share</p>
                    <p className="mt-2 text-2xl font-semibold text-[#1C1C1E]">
                      {featuredScorecard.healthImpactSummary.localDistributionPct}%
                    </p>
                  </div>
                  <div className="rounded-[18px] bg-[rgba(255,149,0,0.08)] p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-[#8E8E93]">Low-income reach</p>
                    <p className="mt-2 text-2xl font-semibold text-[#1C1C1E]">
                      {featuredScorecard.healthImpactSummary.lowIncomeReachPct}%
                    </p>
                  </div>
                  <div className="rounded-[18px] bg-[rgba(0,122,255,0.08)] p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-[#8E8E93]">Access points</p>
                    <p className="mt-2 text-2xl font-semibold text-[#1C1C1E]">
                      {featuredScorecard.healthImpactSummary.nearbyAccessPoints}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-[#48484A]">
                  {featuredScorecard.healthImpactSummary.narrative}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 md:px-6 pb-16 md:pb-24">
          <div className="rounded-[28px] bg-[linear-gradient(135deg,#14321D_0%,#1B4D2A_45%,#0F6A64_100%)] px-6 py-8 text-white md:px-8 md:py-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(255,255,255,0.7)]">
              Near-term differentiation
            </p>
            <h2 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight">
              Build the product moat around proof, not just scoring
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {differentiators.map(({ title, body }) => (
                <div key={title} className="rounded-[20px] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.06)] p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <TrendingUp className="h-4 w-4" />
                    {title}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[rgba(255,255,255,0.82)]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 md:px-6 pb-20 md:pb-24">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="surface-elevated rounded-[24px] p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[rgba(52,199,89,0.12)]">
                <Sprout className="h-5 w-5 text-[#34C759]" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-[#1C1C1E]">For farmers</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#48484A]">
                PRI gives farms a verified record they can bring into financing, procurement, and
                community health conversations with far less manual back-and-forth.
              </p>
              <Button className="mt-5" variant="secondary" asChild>
                <Link href="/for-farmers">See the farmer path</Link>
              </Button>
            </div>
            <div className="surface-elevated rounded-[24px] p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[rgba(0,122,255,0.10)]">
                <Building2 className="h-5 w-5 text-[#007AFF]" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-[#1C1C1E]">For produce buyers</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#48484A]">
                Produce buyers can use the same verified scorecards to compare farms, understand
                local-access reach, and find safer, more reliable regional suppliers.
              </p>
              <Button className="mt-5" variant="secondary" asChild>
                <Link href="/for-partners">See buyer workflows</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
