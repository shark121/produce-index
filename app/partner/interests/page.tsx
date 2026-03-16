import type { Metadata } from 'next'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import type { PartnerInterest } from '@/lib/types'
import { MOCK_INTERESTS } from '@/lib/mock'

import { isMockMode } from '@/lib/is-mock-mode'
const MOCK_MODE = isMockMode()

export const metadata: Metadata = { title: 'My Interests' }


const statusVariant: Record<PartnerInterest['status'], 'default' | 'blue' | 'green'> = {
  pending: 'default', acknowledged: 'blue', connected: 'green',
}

export default async function InterestsPage() {
  const interests = MOCK_MODE ? MOCK_INTERESTS : []

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-[#1C1C1E]">My Interests</h1>
        <p className="text-sm text-[#8E8E93] mt-1">Farms you have expressed interest in. PRI facilitates introductions.</p>
      </div>

      {interests.length === 0 ? (
        <div className="surface-elevated rounded-[20px] p-12 text-center">
          <p className="text-sm text-[#8E8E93]">No interests yet. Browse the directory and express interest on any farm scorecard.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {interests.map((interest) => (
            <div key={interest.id} className="surface-elevated rounded-[14px] px-5 py-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#1C1C1E]">{interest.farmName}</p>
                <p className="text-xs text-[#8E8E93] mt-0.5">Submitted {formatDate(interest.createdAt)}</p>
                {interest.message && (
                  <p className="text-xs text-[#48484A] mt-2 max-w-md leading-relaxed">{interest.message}</p>
                )}
              </div>
              <Badge variant={statusVariant[interest.status]}>
                {interest.status.charAt(0).toUpperCase() + interest.status.slice(1)}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
