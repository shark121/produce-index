import type { Metadata } from 'next'
import { ModeNotice } from '@/components/ui/mode-notice'
import { normalizeSafetyRow } from '@/lib/farm-section-data'
import { isMockMode } from '@/lib/is-mock-mode'
import { getSafetyPracticesForFarm } from '@/lib/mock'
import { createClient } from '@/lib/supabase/server'
import { SafetyManager } from './safety-manager'

export const metadata: Metadata = { title: 'Safety Practices' }

export default async function SafetyPage() {
  let initialPractices = getSafetyPracticesForFarm('farm-1')

  if (!isMockMode()) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.id) {
      const { data: farm } = await supabase.from('farm_profiles').select('id').eq('user_id', user.id).single()
      if (farm?.id) {
        const { data } = await supabase.from('safety_practices').select('*').eq('farm_id', farm.id).order('category')
        initialPractices = (data ?? []).map((row) => normalizeSafetyRow(row))
      }
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {isMockMode() && (
        <ModeNotice
          title="Safety practices are persisting locally in demo mode."
          body="Documentation flags and certification timing flow into the food-safety recommendation before admin verification."
        />
      )}
      <SafetyManager initialPractices={initialPractices} />
    </div>
  )
}
