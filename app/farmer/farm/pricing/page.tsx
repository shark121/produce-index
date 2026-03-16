import type { Metadata } from 'next'
import { ModeNotice } from '@/components/ui/mode-notice'
import { normalizeCropRow, normalizePricingRow } from '@/lib/farm-section-data'
import { isMockMode } from '@/lib/is-mock-mode'
import { getCropsForFarm, getPricingForFarm } from '@/lib/mock'
import { createClient } from '@/lib/supabase/server'
import { PricingManager } from './pricing-manager'

export const metadata: Metadata = { title: 'Pricing' }

export default async function PricingPage() {
  let initialPricing = getPricingForFarm('farm-1')
  let initialCrops = getCropsForFarm('farm-1')

  if (!isMockMode()) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.id) {
      const { data: farm } = await supabase.from('farm_profiles').select('id').eq('user_id', user.id).single()
      if (farm?.id) {
        const [pricingResult, cropsResult] = await Promise.all([
          supabase.from('pricing_profiles').select('*').eq('farm_id', farm.id).order('crop_name'),
          supabase.from('crop_profiles').select('*').eq('farm_id', farm.id).order('name'),
        ])
        initialPricing = (pricingResult.data ?? []).map((row) => normalizePricingRow(row))
        initialCrops = (cropsResult.data ?? []).map((row) => normalizeCropRow(row))
      }
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {isMockMode() && (
        <ModeNotice
          title="Pricing entries are persisting locally in demo mode."
          body="Affordability recommendations will use these saved prices, SNAP flags, and community discount settings."
        />
      )}
      <PricingManager initialPricing={initialPricing} initialCrops={initialCrops} />
    </div>
  )
}
