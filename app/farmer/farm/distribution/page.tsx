import type { Metadata } from 'next'
import { ModeNotice } from '@/components/ui/mode-notice'
import { normalizeDistributionRow } from '@/lib/farm-section-data'
import { isMockMode } from '@/lib/is-mock-mode'
import { getDistributionForFarm } from '@/lib/mock'
import { createClient } from '@/lib/supabase/server'
import { DistributionManager } from './distribution-manager'

export const metadata: Metadata = { title: 'Distribution' }

export default async function DistributionPage() {
  let initialChannels = getDistributionForFarm('farm-1')

  if (!isMockMode()) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.id) {
      const { data: farm } = await supabase.from('farm_profiles').select('id').eq('user_id', user.id).single()
      if (farm?.id) {
        const { data } = await supabase.from('distribution_channels').select('*').eq('farm_id', farm.id).order('name')
        initialChannels = (data ?? []).map((row) => normalizeDistributionRow(row))
      }
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {isMockMode() && (
        <ModeNotice
          title="Distribution edits are persisting locally in demo mode."
          body="Local delivery share and underserved-area coverage feed directly into the accessibility and health-impact recommendations."
        />
      )}
      <DistributionManager initialChannels={initialChannels} />
    </div>
  )
}
