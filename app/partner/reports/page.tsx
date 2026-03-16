import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Download, FileText } from 'lucide-react'

export const metadata: Metadata = { title: 'Reports' }

export default function ReportsPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Reports</h1>
        <p className="text-sm text-[#8E8E93] mt-1">
          Export scorecards and farm summaries for internal procurement and compliance use.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {[
          {
            title: 'Full pilot directory',
            desc: 'All verified farms with complete scorecard data',
            format: 'CSV',
          },
          {
            title: 'Score summary report',
            desc: 'Aggregated score distributions across the pilot region',
            format: 'PDF',
          },
          {
            title: 'Individual farm scorecard',
            desc: 'Detailed scorecard for a single farm — select from directory',
            format: 'PDF',
          },
          {
            title: 'Crop availability matrix',
            desc: 'Which farms grow which crops and when',
            format: 'CSV',
          },
        ].map(({ title, desc, format }) => (
          <div key={title} className="surface-elevated rounded-[16px] p-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[rgba(0,122,255,0.10)] shrink-0">
                <FileText className="h-4 w-4 text-[#007AFF]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1C1C1E]">{title}</p>
                <p className="text-xs text-[#8E8E93] mt-0.5">{desc}</p>
              </div>
            </div>
            <Button size="icon-sm" variant="secondary">
              <Download className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      <p className="text-xs text-[#C7C7CC]">
        Report generation is wired to /api/partners/reports in Sprint 4.
      </p>
    </div>
  )
}
