import type { Metadata } from 'next'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Distribution' }

export default function DistributionPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1E]">Distribution Channels</h1>
          <p className="text-sm text-[#8E8E93] mt-1">
            Where and how far your produce travels. Local distribution to underserved areas improves
            your Local Accessibility subscore.
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-3.5 w-3.5" /> Add channel
        </Button>
      </div>

      {/* TODO: DistributionList + DistributionForm components (Sprint 2) */}
      <div className="surface-elevated rounded-[16px] p-10 text-center">
        <p className="text-sm text-[#8E8E93]">No distribution channels added yet.</p>
      </div>
    </div>
  )
}
