import type { Metadata } from 'next'
import { ModeNotice } from '@/components/ui/mode-notice'
import { MarketplaceManager } from './marketplace-manager'
import { getFarmerMarketplaceWorkspace } from '@/lib/marketplace-server'
import { isMockMode } from '@/lib/is-mock-mode'

export const metadata: Metadata = { title: 'Marketplace Workspace' }

export default function FarmerMarketplacePage() {
  const workspace = getFarmerMarketplaceWorkspace('farm-1') ?? {
    verified: false,
    scorecard: null,
    sellerProfile: null,
    pickupLocations: [],
    deliveryZones: [],
    listings: [],
    orders: [],
    inquiries: [],
    commissions: [],
  }

  return (
    <div className="space-y-6">
      {isMockMode() && (
        <ModeNotice
          title="Marketplace workspace is running in demo mode."
          body="Seller profile edits, listing CRUD, guest reservations, and institutional sourcing inquiries persist locally until production marketplace tables are connected."
        />
      )}

      <MarketplaceManager initialData={workspace} />
    </div>
  )
}
