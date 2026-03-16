import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { MOCK_BENCHMARKS } from '@/lib/mock'

import { isMockMode } from '@/lib/is-mock-mode'
const MOCK_MODE = isMockMode()

export const metadata: Metadata = { title: 'Benchmarks' }


export default async function BenchmarksPage() {
  const benchmarks = MOCK_MODE ? MOCK_BENCHMARKS : []

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1E]">Regional Benchmarks</h1>
          <p className="text-sm text-[#8E8E93] mt-1">
            Baseline values for Affordability and Local Accessibility scoring. Used to keep scores fair across pilot regions.
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-3.5 w-3.5" /> Add benchmark
        </Button>
      </div>

      <div className="surface-elevated rounded-[20px] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[rgba(0,0,0,0.06)]">
              {['Region', 'Category', 'Metric', 'Baseline', 'Good ≥', 'Effective from', ''].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-[#8E8E93] font-medium text-xs whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {benchmarks.map((b) => (
              <tr key={b.id} className="border-b border-[rgba(0,0,0,0.04)] last:border-0 hover:bg-[rgba(0,0,0,0.015)] transition-colors">
                <td className="px-5 py-3 font-medium text-[#1C1C1E] whitespace-nowrap">{b.region}</td>
                <td className="px-5 py-3 text-[#48484A] capitalize">{b.category.replace('_', ' ')}</td>
                <td className="px-5 py-3 text-[#48484A]">{b.label}</td>
                <td className="px-5 py-3 font-medium">{b.baselineValue} {b.unit}</td>
                <td className="px-5 py-3 text-[#34C759] font-medium">{b.thresholdGood} {b.unit}</td>
                <td className="px-5 py-3 text-[#8E8E93] whitespace-nowrap">
                  {new Date(b.effectiveFrom).toLocaleDateString()}
                </td>
                <td className="px-5 py-3">
                  <Button size="sm" variant="ghost">Edit</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
