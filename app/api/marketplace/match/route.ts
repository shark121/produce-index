import { NextResponse } from 'next/server'
import { getMarketplaceFarmMatchInputs, getMarketplaceListingViews } from '@/lib/marketplace-server'
import { rankFarmScorecardsForBuyer, rankMarketplaceListings } from '@/lib/marketplace'
import { isMockMode } from '@/lib/is-mock-mode'

export async function POST(request: Request) {
  const body = await request.json()

  if (!isMockMode()) {
    return NextResponse.json({
      data: { listings: [], farms: [] },
      error: null,
    })
  }

  const listings = rankMarketplaceListings(getMarketplaceListingViews(), body)
  const farms = rankFarmScorecardsForBuyer(getMarketplaceFarmMatchInputs(), body)

  return NextResponse.json({ data: { listings, farms }, error: null })
}
