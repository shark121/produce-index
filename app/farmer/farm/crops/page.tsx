import type { Metadata } from 'next'
import { ModeNotice } from '@/components/ui/mode-notice'
import { isMockMode } from '@/lib/is-mock-mode'
import { getCropsForFarm } from '@/lib/mock'
import { normalizeCropRow } from '@/lib/farm-section-data'
import { createClient } from '@/lib/supabase/server'
import { CropsManager } from './crops-manager'

export const metadata: Metadata = { title: 'Crops' }

export default async function CropsPage() {
  let initialCrops = getCropsForFarm('farm-1')

  if (!isMockMode()) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.id) {
      const { data: farm } = await supabase.from('farm_profiles').select('id').eq('user_id', user.id).single()
      if (farm?.id) {
        const { data } = await supabase.from('crop_profiles').select('*').eq('farm_id', farm.id).order('name')
        initialCrops = (data ?? []).map((row) => normalizeCropRow(row))
      }
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {isMockMode() && (
        <ModeNotice
          title="Crop edits are persisting locally in demo mode."
          body="This lets the scoring engine and review panel react to your crop updates immediately, even before Supabase is connected."
        />
      )}
      <CropsManager initialCrops={initialCrops} />
    </div>
  )
}
