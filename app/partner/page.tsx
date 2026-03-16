import type { Metadata } from 'next'
import Link from 'next/link'
import { ScoreRing } from '@/components/ui/score-ring'
import { Badge } from '@/components/ui/badge'
import { scoreLabel } from '@/lib/types'
import { MapPin, Sprout } from 'lucide-react'
import { getVerifiedFarms } from '@/lib/mock'

import { isMockMode } from '@/lib/is-mock-mode'
const MOCK_MODE = isMockMode()

export const metadata: Metadata = { title: 'Farm Directory' }


export default async function PartnerDirectoryPage() {
  const farms = MOCK_MODE ? getVerifiedFarms() : []

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Farm Directory</h1>
        <p className="text-sm text-[#8E8E93] mt-1">
          {farms.length} verified farm{farms.length !== 1 ? 's' : ''} · All scores reviewed by PRI admin team
        </p>
      </div>

      {/* Search bar */}
      <div className="surface-elevated rounded-[12px] px-4 py-3 flex items-center gap-3">
        <svg className="h-4 w-4 text-[#AEAEB2] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="search"
          placeholder="Search by name, region, or crop…"
          className="flex-1 bg-transparent text-sm text-[#1C1C1E] placeholder:text-[#AEAEB2] outline-none"
        />
      </div>

      {farms.length === 0 ? (
        <div className="surface-elevated rounded-[20px] p-12 text-center">
          <p className="text-sm text-[#8E8E93]">No verified farms yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {farms.map(({ farm, score, crops, verifiedAt }) => (
            <Link
              key={farm.id}
              href={`/partner/farms/${farm.id}`}
              className="surface-elevated rounded-[16px] p-5 hover:border-[rgba(52,199,89,0.30)] transition-colors group block"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-semibold text-[#1C1C1E]">{farm.name}</h3>
                  <p className="flex items-center gap-1 text-xs text-[#8E8E93] mt-0.5">
                    <MapPin className="h-3 w-3" /> {farm.city}, {farm.state} · {farm.region}
                  </p>
                </div>
                <ScoreRing score={score.overallScore} size="sm" showLabel={false} />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap mb-3">
                {crops.slice(0, 3).map((c) => (
                  <Badge key={c.id} variant="green">
                    <Sprout className="h-2.5 w-2.5" /> {c.name}
                  </Badge>
                ))}
                {crops.length > 3 && <Badge>+{crops.length - 3} more</Badge>}
              </div>
              <p className="text-xs text-[#C7C7CC]">
                {scoreLabel(score.overallScore)} · {farm.acreageTilled} ac · Verified {new Date(verifiedAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
