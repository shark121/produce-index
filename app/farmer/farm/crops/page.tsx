import type { Metadata } from 'next'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Crops' }

export default function CropsPage() {
  // TODO: fetch crops for this farm from Supabase

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1E]">Crops</h1>
          <p className="text-sm text-[#8E8E93] mt-1">
            List all crops you grow. Nutrient density and certifications feed into your Nutritional Value score.
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-3.5 w-3.5" /> Add crop
        </Button>
      </div>

      {/* TODO: CropList + CropForm components (Sprint 2) */}
      <div className="surface-elevated rounded-[16px] p-10 text-center">
        <p className="text-sm text-[#8E8E93]">No crops added yet. Add your first crop to get started.</p>
      </div>
    </div>
  )
}
