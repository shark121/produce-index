import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, MapPin, ShieldCheck, Truck } from 'lucide-react'
import { PublicNav } from '@/components/nav/public-nav'
import { ReserveOrderCard } from '@/components/marketplace/reserve-order-card'
import { SourcingInquiryCard } from '@/components/marketplace/sourcing-inquiry-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ModeNotice } from '@/components/ui/mode-notice'
import { ScoreRing } from '@/components/ui/score-ring'
import { NUTRIENT_TAG_OPTIONS } from '@/lib/marketplace'
import { getMarketplaceListingViewById } from '@/lib/marketplace-server'
import { isMockMode } from '@/lib/is-mock-mode'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Exchange Listing' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function MarketplaceListingDetailPage({ params }: Props) {
  const { id } = await params
  const listingView = getMarketplaceListingViewById(id)
  if (!listingView) notFound()

  return (
    <>
      <PublicNav />
      <main className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-16">
        {isMockMode() && (
          <ModeNotice
            title="This exchange listing is a live demo record."
            body="Guest reservations and institutional sourcing inquiries are fully functional in demo mode and persist locally."
          />
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="surface-elevated rounded-[24px] p-6 md:p-7">
              <div className="flex items-start justify-between gap-6 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-3xl font-bold tracking-tight text-[#1C1C1E]">{listingView.listing.title}</h1>
                    <Badge variant="green">{listingView.listing.listingType === 'weekly_offer' ? 'Weekly offer' : 'Catalog item'}</Badge>
                    <Badge variant="blue">PRI {listingView.scorecard.score.overallScore.toFixed(1)}</Badge>
                  </div>
                  <p className="mt-2 flex items-center gap-1 text-sm text-[#8E8E93]">
                    <MapPin className="h-3.5 w-3.5" />
                    {listingView.scorecard.farm.name} · {listingView.scorecard.farm.city}, {listingView.scorecard.farm.state}
                  </p>
                  <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#48484A]">
                    {listingView.listing.description}
                  </p>
                </div>
                <ScoreRing score={listingView.scorecard.score.overallScore} size="lg" />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {listingView.nutrientTags.map((tag) => (
                  <Badge key={tag} variant="green">
                    {NUTRIENT_TAG_OPTIONS.find((option) => option.value === tag)?.label ?? tag}
                  </Badge>
                ))}
                {listingView.listing.acceptsSnap && <Badge variant="blue">SNAP accepted</Badge>}
                {listingView.listing.communityDiscountPct ? <Badge variant="orange">{listingView.listing.communityDiscountPct}% community discount</Badge> : null}
                {listingView.listing.acceptsBulkInquiries && <Badge>Bulk inquiries</Badge>}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[16px] bg-[rgba(0,0,0,0.03)] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#8E8E93]">Price</p>
                  <p className="mt-1 text-lg font-semibold text-[#1C1C1E]">
                    ${listingView.listing.pricePerUnit.toFixed(2)} / {listingView.listing.unit}
                  </p>
                </div>
                <div className="rounded-[16px] bg-[rgba(0,0,0,0.03)] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#8E8E93]">Available quantity</p>
                  <p className="mt-1 text-lg font-semibold text-[#1C1C1E]">
                    {listingView.listing.quantityAvailable} {listingView.listing.unit}
                  </p>
                </div>
                <div className="rounded-[16px] bg-[rgba(0,0,0,0.03)] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#8E8E93]">Verified</p>
                  <p className="mt-1 text-lg font-semibold text-[#1C1C1E]">{formatDate(listingView.scorecard.verifiedAt)}</p>
                </div>
              </div>
            </div>

            <div className="surface-elevated rounded-[20px] p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#34C759]" />
                <h2 className="text-base font-semibold text-[#1C1C1E]">Health-aware trust signals</h2>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[16px] bg-[rgba(52,199,89,0.08)] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#8E8E93]">Verification confidence</p>
                  <p className="mt-2 text-lg font-semibold text-[#1C1C1E]">{listingView.scorecard.verificationConfidence.score}/100</p>
                  <p className="mt-1 text-sm text-[#48484A]">
                    {listingView.scorecard.verificationConfidence.evidenceCoveragePct}% evidence coverage
                  </p>
                </div>
                <div className="rounded-[16px] bg-[rgba(0,122,255,0.08)] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#8E8E93]">Local accessibility</p>
                  <p className="mt-2 text-lg font-semibold text-[#1C1C1E]">{listingView.scorecard.healthImpactSummary.localDistributionPct}%</p>
                  <p className="mt-1 text-sm text-[#48484A]">of produce distributed within 30 miles</p>
                </div>
              </div>
            </div>

            <div className="surface-elevated rounded-[20px] p-5">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-[#007AFF]" />
                <h2 className="text-base font-semibold text-[#1C1C1E]">Fulfillment options</h2>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-[#8E8E93]">Pickup</p>
                  <div className="mt-2 space-y-2">
                    {listingView.pickupLocations.map((location) => (
                      <div key={location.id} className="rounded-[14px] border border-[rgba(0,0,0,0.06)] px-4 py-3">
                        <p className="text-sm font-medium text-[#1C1C1E]">{location.label}</p>
                        <p className="mt-1 text-sm text-[#48484A]">{location.address}</p>
                        <p className="mt-1 text-xs text-[#8E8E93]">{location.pickupWindow}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-[#8E8E93]">Local delivery</p>
                  <div className="mt-2 space-y-2">
                    {listingView.deliveryZones.map((zone) => (
                      <div key={zone.id} className="rounded-[14px] border border-[rgba(0,0,0,0.06)] px-4 py-3">
                        <p className="text-sm font-medium text-[#1C1C1E]">{zone.label}</p>
                        <p className="mt-1 text-sm text-[#48484A]">{zone.areaSummary}</p>
                        <p className="mt-1 text-xs text-[#8E8E93]">${zone.deliveryFee.toFixed(2)} delivery fee · {zone.deliveryDays.join(', ')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" asChild>
                <Link href={`/marketplace/farms/${listingView.scorecard.farm.id}`}>Open farm storefront</Link>
              </Button>
              <Button asChild>
                <Link href="/marketplace">
                  Back to exchange <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <ReserveOrderCard
              listingId={listingView.listing.id}
              listingTitle={listingView.listing.title}
              farmName={listingView.scorecard.farm.name}
              pricePerUnit={listingView.listing.pricePerUnit}
              unit={listingView.listing.unit}
              minimumOrderQuantity={listingView.listing.minimumOrderQuantity}
              pickupLocations={listingView.pickupLocations}
              deliveryZones={listingView.deliveryZones}
            />

            <SourcingInquiryCard
              farmId={listingView.scorecard.farm.id}
              listingId={listingView.listing.id}
              defaultRegion={listingView.scorecard.farm.region}
            />
          </div>
        </div>
      </main>
    </>
  )
}
