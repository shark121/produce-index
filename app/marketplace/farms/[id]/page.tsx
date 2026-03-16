import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Clock3, MapPin, ShieldCheck } from 'lucide-react'
import { PublicNav } from '@/components/nav/public-nav'
import { SourcingInquiryCard } from '@/components/marketplace/sourcing-inquiry-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScoreRing } from '@/components/ui/score-ring'
import { NUTRIENT_TAG_OPTIONS } from '@/lib/marketplace'
import { getMarketplaceFarmStoreById } from '@/lib/marketplace-server'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Farm Storefront' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function MarketplaceFarmPage({ params }: Props) {
  const { id } = await params
  const farmStore = getMarketplaceFarmStoreById(id)
  if (!farmStore) notFound()

  const publishedListings = farmStore.listings.filter((listing) => listing.status === 'published')

  return (
    <>
      <PublicNav />
      <main className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            <div className="surface-elevated rounded-[24px] p-6 md:p-7">
              <div className="flex items-start justify-between gap-6 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-3xl font-bold tracking-tight text-[#1C1C1E]">{farmStore.scorecard.farm.name}</h1>
                    <Badge variant="green">{farmStore.scorecard.financingReadiness.label}</Badge>
                    <Badge variant="blue">Confidence {farmStore.scorecard.verificationConfidence.score}</Badge>
                  </div>
                  <p className="mt-2 flex items-center gap-1 text-sm text-[#8E8E93]">
                    <MapPin className="h-3.5 w-3.5" />
                    {farmStore.scorecard.farm.city}, {farmStore.scorecard.farm.state} · {farmStore.scorecard.farm.region}
                  </p>
                  <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#48484A]">
                    {farmStore.sellerProfile.publicDescription}
                  </p>
                </div>
                <ScoreRing score={farmStore.scorecard.score.overallScore} size="lg" />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {farmStore.nutrientTags.map((tag) => (
                  <Badge key={tag} variant="green">
                    {NUTRIENT_TAG_OPTIONS.find((option) => option.value === tag)?.label ?? tag}
                  </Badge>
                ))}
                <Badge variant="orange">Verified {formatDate(farmStore.scorecard.verifiedAt)}</Badge>
              </div>
            </div>

            <div className="surface-elevated rounded-[20px] p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#34C759]" />
                <h2 className="text-base font-semibold text-[#1C1C1E]">PRI trust signals</h2>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[16px] bg-[rgba(0,0,0,0.03)] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#8E8E93]">Evidence coverage</p>
                  <p className="mt-1 text-lg font-semibold text-[#1C1C1E]">{farmStore.scorecard.verificationConfidence.evidenceCoveragePct}%</p>
                </div>
                <div className="rounded-[16px] bg-[rgba(0,0,0,0.03)] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#8E8E93]">Low-income reach</p>
                  <p className="mt-1 text-lg font-semibold text-[#1C1C1E]">{farmStore.scorecard.healthImpactSummary.lowIncomeReachPct}%</p>
                </div>
                <div className="rounded-[16px] bg-[rgba(0,0,0,0.03)] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#8E8E93]">Next season</p>
                  <p className="mt-1 text-lg font-semibold text-[#1C1C1E]">{farmStore.scorecard.financingReadiness.nextSeasonConfidence}</p>
                </div>
              </div>
            </div>

            <div className="surface-elevated rounded-[20px] p-5">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-base font-semibold text-[#1C1C1E]">Published produce offers</h2>
                  <p className="mt-1 text-sm text-[#8E8E93]">{publishedListings.length} live listing{publishedListings.length !== 1 ? 's' : ''}</p>
                </div>
                <Button variant="secondary" asChild>
                  <Link href="/marketplace">Back to exchange</Link>
                </Button>
              </div>
              <div className="mt-5 space-y-3">
                {publishedListings.map((listing) => (
                  <div key={listing.id} className="rounded-[16px] border border-[rgba(0,0,0,0.06)] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-[#1C1C1E]">{listing.title}</p>
                          <Badge variant="green">{listing.listingType === 'weekly_offer' ? 'Weekly offer' : 'Catalog item'}</Badge>
                        </div>
                        <p className="mt-2 text-sm text-[#48484A]">{listing.description}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {listing.nutrientTags.map((tag) => (
                            <Badge key={tag} variant="blue">
                              {NUTRIENT_TAG_OPTIONS.find((option) => option.value === tag)?.label ?? tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[#1C1C1E]">${listing.pricePerUnit.toFixed(2)} / {listing.unit}</p>
                        <p className="mt-1 text-xs text-[#8E8E93]">{listing.quantityAvailable} {listing.unit} available</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                      <p className="flex items-center gap-1 text-xs text-[#8E8E93]">
                        <Clock3 className="h-3.5 w-3.5" />
                        Service days: {farmStore.sellerProfile.serviceDays.join(', ')}
                      </p>
                      <Button size="sm" asChild>
                        <Link href={`/marketplace/listings/${listing.id}`}>
                          View listing <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="surface-elevated rounded-[20px] p-5">
              <p className="text-sm font-semibold text-[#1C1C1E]">Seller details</p>
              <div className="mt-4 space-y-3 text-sm text-[#48484A]">
                <p><span className="font-medium text-[#1C1C1E]">Contact:</span> {farmStore.sellerProfile.contactEmail}</p>
                <p><span className="font-medium text-[#1C1C1E]">Phone:</span> {farmStore.sellerProfile.contactPhone}</p>
                <p><span className="font-medium text-[#1C1C1E]">Order instructions:</span> {farmStore.sellerProfile.orderInstructions}</p>
              </div>
            </div>

            <div className="surface-elevated rounded-[20px] p-5">
              <p className="text-sm font-semibold text-[#1C1C1E]">Pickup and delivery coverage</p>
              <div className="mt-4 space-y-3">
                {farmStore.pickupLocations.map((location) => (
                  <div key={location.id} className="rounded-[14px] bg-[rgba(0,0,0,0.03)] p-4">
                    <p className="text-sm font-medium text-[#1C1C1E]">{location.label}</p>
                    <p className="mt-1 text-sm text-[#48484A]">{location.address}</p>
                    <p className="mt-1 text-xs text-[#8E8E93]">{location.pickupWindow}</p>
                  </div>
                ))}
                {farmStore.deliveryZones.map((zone) => (
                  <div key={zone.id} className="rounded-[14px] bg-[rgba(0,0,0,0.03)] p-4">
                    <p className="text-sm font-medium text-[#1C1C1E]">{zone.label}</p>
                    <p className="mt-1 text-sm text-[#48484A]">{zone.areaSummary}</p>
                    <p className="mt-1 text-xs text-[#8E8E93]">${zone.deliveryFee.toFixed(2)} delivery fee · {zone.deliveryDays.join(', ')}</p>
                  </div>
                ))}
              </div>
            </div>

            <SourcingInquiryCard
              farmId={farmStore.scorecard.farm.id}
              listingId={null}
              defaultRegion={farmStore.scorecard.farm.region}
            />
          </div>
        </div>
      </main>
    </>
  )
}
