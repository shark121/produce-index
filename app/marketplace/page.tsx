import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, HeartPulse, MapPin, Search, ShoppingBasket } from 'lucide-react'
import { PublicNav } from '@/components/nav/public-nav'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ModeNotice } from '@/components/ui/mode-notice'
import { ScoreRing } from '@/components/ui/score-ring'
import { BUYER_TYPE_OPTIONS, MARKETPLACE_FULFILLMENT_OPTIONS, NUTRIENT_TAG_OPTIONS, rankFarmScorecardsForBuyer, rankMarketplaceListings } from '@/lib/marketplace'
import { getMarketplaceFarmMatchInputs, getMarketplaceListingViews } from '@/lib/marketplace-server'
import { isMockMode } from '@/lib/is-mock-mode'
import { formatDate } from '@/lib/utils'
import type { BuyerType, FulfillmentMethod, NutrientProfileTag } from '@/lib/types'

export const metadata: Metadata = { title: 'Health-Aware Produce Exchange' }

interface SearchParams {
  q?: string
  buyerType?: BuyerType
  nutrientTag?: NutrientProfileTag
  fulfillmentMethod?: FulfillmentMethod
  minPriScore?: string
  affordabilityNeeded?: string
}

interface Props {
  searchParams: Promise<SearchParams>
}

export default async function MarketplacePage({ searchParams }: Props) {
  const params = await searchParams
  const nutrientTags = params.nutrientTag ? [params.nutrientTag] : undefined
  const matchRequest = {
    buyerType: params.buyerType ?? 'individual',
    q: params.q,
    nutrientTags,
    fulfillmentMethod: params.fulfillmentMethod,
    minPriScore: params.minPriScore ? Number(params.minPriScore) : undefined,
    affordabilityNeeded: params.affordabilityNeeded === 'true',
  }

  const listingMatches = rankMarketplaceListings(getMarketplaceListingViews(), matchRequest)
  const farmMatches = rankFarmScorecardsForBuyer(getMarketplaceFarmMatchInputs(), matchRequest).slice(0, 4)

  return (
    <>
      <PublicNav />
      <main className="pb-20">
        <section className="border-b border-[rgba(0,0,0,0.06)] bg-[radial-gradient(circle_at_top_left,rgba(52,199,89,0.16),transparent_34%),radial-gradient(circle_at_top_right,rgba(0,122,255,0.12),transparent_28%),linear-gradient(180deg,#FFFFFF_0%,#F3F7F5_100%)]">
          <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-18">
            <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
              <div>
                <Badge variant="green">Health-Aware Produce Exchange</Badge>
                <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight text-[#1C1C1E] md:text-5xl">
                  Match verified farms to nutrient goals, local access needs, and community-ready produce offers.
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#48484A]">
                  This exchange layers smart buyer matching on top of PRI scorecards so hospitals, schools,
                  community organizations, and households can find produce with stronger trust signals.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button size="lg" asChild>
                    <Link href="/for-institutions">See institution brief</Link>
                  </Button>
                  <Button size="lg" variant="secondary" asChild>
                    <Link href="/apply">
                      Join pilot <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="surface-elevated rounded-[28px] p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-[#8E8E93]">How matching works</p>
                <div className="mt-5 space-y-4">
                  {[
                    'PRI score and verification confidence anchor trust.',
                    'Nutrient tags are derived from crop mix and evidence, not free-form claims.',
                    'Affordability, SNAP support, and pickup/delivery options influence the ranking.',
                    'Institution buyers can send sourcing inquiries instead of using a consumer cart.',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(0,122,255,0.10)]">
                        <HeartPulse className="h-4 w-4 text-[#007AFF]" />
                      </div>
                      <p className="text-sm leading-relaxed text-[#48484A]">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-8 md:px-6">
          {isMockMode() && (
            <ModeNotice
              title="The exchange is fully interactive in demo mode."
              body="Listings, reservations, sourcing inquiries, and the smart match ranking all run on explicit pilot data until production tables are connected."
            />
          )}
        </section>

        <section className="mx-auto max-w-6xl px-4 md:px-6">
          <form className="surface-elevated rounded-[20px] p-4 grid gap-3 lg:grid-cols-[1.2fr_0.9fr_0.8fr_0.8fr_0.8fr_auto]">
            <div className="flex items-center gap-3 rounded-[12px] border border-[rgba(0,0,0,0.08)] bg-white px-4 py-3">
              <Search className="h-4 w-4 text-[#AEAEB2] shrink-0" />
              <input
                type="search"
                name="q"
                defaultValue={params.q ?? ''}
                placeholder="Search by farm, crop, or region"
                className="flex-1 bg-transparent text-sm text-[#1C1C1E] placeholder:text-[#AEAEB2] outline-none"
              />
            </div>
            <select
              name="buyerType"
              defaultValue={params.buyerType ?? 'individual'}
              className="h-[50px] rounded-[12px] border border-[rgba(0,0,0,0.08)] bg-white px-3.5 text-sm text-[#1C1C1E] focus:outline-none focus:border-[#007AFF]"
            >
              {BUYER_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              name="nutrientTag"
              defaultValue={params.nutrientTag ?? ''}
              className="h-[50px] rounded-[12px] border border-[rgba(0,0,0,0.08)] bg-white px-3.5 text-sm text-[#1C1C1E] focus:outline-none focus:border-[#007AFF]"
            >
              <option value="">Any nutrient profile</option>
              {NUTRIENT_TAG_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              name="fulfillmentMethod"
              defaultValue={params.fulfillmentMethod ?? ''}
              className="h-[50px] rounded-[12px] border border-[rgba(0,0,0,0.08)] bg-white px-3.5 text-sm text-[#1C1C1E] focus:outline-none focus:border-[#007AFF]"
            >
              <option value="">Pickup or delivery</option>
              {MARKETPLACE_FULFILLMENT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              name="minPriScore"
              defaultValue={params.minPriScore ?? ''}
              className="h-[50px] rounded-[12px] border border-[rgba(0,0,0,0.08)] bg-white px-3.5 text-sm text-[#1C1C1E] focus:outline-none focus:border-[#007AFF]"
            >
              <option value="">Any PRI score</option>
              <option value="65">65+</option>
              <option value="75">75+</option>
              <option value="85">85+</option>
            </select>
            <Button type="submit">Find matches</Button>
            <label className="flex items-center gap-2 text-sm text-[#48484A] lg:col-span-full">
              <input type="checkbox" name="affordabilityNeeded" value="true" defaultChecked={params.affordabilityNeeded === 'true'} />
              Prioritize affordability and SNAP/community pricing
            </label>
          </form>
        </section>

        <section className="mx-auto mt-8 max-w-6xl px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-2xl font-bold text-[#1C1C1E]">Matched produce offers</h2>
                  <p className="mt-1 text-sm text-[#8E8E93]">
                    {listingMatches.length} published listing{listingMatches.length !== 1 ? 's' : ''} matched to this search
                  </p>
                </div>
              </div>

              {listingMatches.length === 0 ? (
                <div className="surface-elevated rounded-[20px] p-10 text-center text-sm text-[#8E8E93]">
                  No produce offers matched those filters.
                </div>
              ) : (
                listingMatches.map(({ listingView, matchScore, reasons }) => (
                  <div key={listingView.listing.id} className="surface-elevated rounded-[22px] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-[#1C1C1E]">{listingView.listing.title}</h3>
                          <Badge variant="blue">Match {matchScore}</Badge>
                          <Badge variant="green">{listingView.listing.listingType === 'weekly_offer' ? 'Weekly offer' : 'Catalog item'}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-[#48484A]">
                          {listingView.scorecard.farm.name} · {listingView.scorecard.farm.region}
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-[#48484A]">{listingView.listing.description}</p>
                      </div>
                      <ScoreRing score={listingView.scorecard.score.overallScore} size="sm" showLabel={false} />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {listingView.nutrientTags.map((tag) => (
                        <Badge key={tag} variant="green">{NUTRIENT_TAG_OPTIONS.find((option) => option.value === tag)?.label ?? tag}</Badge>
                      ))}
                      {listingView.listing.acceptsSnap && <Badge variant="blue">SNAP</Badge>}
                      {listingView.listing.communityDiscountPct ? <Badge variant="orange">{listingView.listing.communityDiscountPct}% community discount</Badge> : null}
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-[16px] bg-[rgba(0,0,0,0.03)] p-3">
                        <p className="text-xs uppercase tracking-[0.14em] text-[#8E8E93]">Price</p>
                        <p className="mt-1 text-sm font-semibold text-[#1C1C1E]">
                          ${listingView.listing.pricePerUnit.toFixed(2)} / {listingView.listing.unit}
                        </p>
                      </div>
                      <div className="rounded-[16px] bg-[rgba(0,0,0,0.03)] p-3">
                        <p className="text-xs uppercase tracking-[0.14em] text-[#8E8E93]">Available</p>
                        <p className="mt-1 text-sm font-semibold text-[#1C1C1E]">{listingView.listing.quantityAvailable} {listingView.listing.unit}</p>
                      </div>
                      <div className="rounded-[16px] bg-[rgba(0,0,0,0.03)] p-3">
                        <p className="text-xs uppercase tracking-[0.14em] text-[#8E8E93]">Verified</p>
                        <p className="mt-1 text-sm font-semibold text-[#1C1C1E]">{formatDate(listingView.scorecard.verifiedAt)}</p>
                      </div>
                    </div>

                    <ul className="mt-4 flex flex-wrap gap-2 text-xs text-[#48484A]">
                      {reasons.map((reason) => (
                        <li key={reason} className="rounded-full bg-[rgba(0,122,255,0.08)] px-3 py-1.5">
                          {reason}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
                      <p className="flex items-center gap-1 text-xs text-[#8E8E93]">
                        <MapPin className="h-3.5 w-3.5" />
                        {listingView.pickupLocations.length > 0 ? 'Pickup' : ''}{listingView.pickupLocations.length > 0 && listingView.deliveryZones.length > 0 ? ' + ' : ''}{listingView.deliveryZones.length > 0 ? 'Local delivery' : ''}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" asChild>
                          <Link href={`/marketplace/farms/${listingView.scorecard.farm.id}`}>Farm storefront</Link>
                        </Button>
                        <Button size="sm" asChild>
                          <Link href={`/marketplace/listings/${listingView.listing.id}`}>View listing</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-4">
              <div className="surface-elevated rounded-[22px] p-5">
                <div className="flex items-center gap-2">
                  <ShoppingBasket className="h-5 w-5 text-[#34C759]" />
                  <h2 className="text-lg font-semibold text-[#1C1C1E]">Top farm matches</h2>
                </div>
                <p className="mt-2 text-sm text-[#48484A]">
                  Institutions can use these PRI-backed farm matches to shortlist sourcing conversations before they request a formal packet.
                </p>
              </div>

              {farmMatches.map((match) => (
                <div key={match.scorecard.farm.id} className="surface-elevated rounded-[20px] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-[#1C1C1E]">{match.scorecard.farm.name}</h3>
                      <p className="mt-1 text-sm text-[#8E8E93]">{match.scorecard.farm.city}, {match.scorecard.farm.state}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.14em] text-[#8E8E93]">Smart match</p>
                      <p className="mt-1 text-xl font-semibold text-[#1C1C1E]">{match.matchScore}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="green">{match.scorecard.financingReadiness.label}</Badge>
                    {match.sellerSignals.acceptsSnap && <Badge variant="blue">SNAP</Badge>}
                    {match.sellerSignals.supportsDelivery && <Badge variant="orange">Delivery</Badge>}
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-[#48484A]">
                    {match.reasons.map((reason) => (
                      <li key={reason}>• {reason}</li>
                    ))}
                  </ul>
                  <div className="mt-4 flex justify-end">
                    <Button variant="secondary" size="sm" asChild>
                      <Link href={`/partner/farms/${match.scorecard.farm.id}`}>Open PRI scorecard</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
