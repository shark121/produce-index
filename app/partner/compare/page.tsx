import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Compare Farms' }

const CATEGORIES = [
  { key: 'nutritionalValue',   label: 'Nutritional Value',   weight: '30%' },
  { key: 'foodSafety',         label: 'Food Safety',         weight: '20%' },
  { key: 'supplyReliability',  label: 'Supply Reliability',  weight: '20%' },
  { key: 'localAccessibility', label: 'Local Accessibility', weight: '15%' },
  { key: 'affordability',      label: 'Affordability',       weight: '15%' },
]

interface SearchParams {
  ids?: string
}

interface Props {
  searchParams: Promise<SearchParams>
}

export default async function ComparePage({ searchParams }: Props) {
  const { ids } = await searchParams
  const farmIds = ids?.split(',').filter(Boolean) ?? []

  // TODO: fetch FarmScorecard[] for each id from /api/partners/directory

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Compare Farms</h1>
        <p className="text-sm text-[#8E8E93] mt-1">
          Side-by-side scorecard comparison. Add farms from the directory using the{' '}
          <span className="text-[#007AFF]">Compare</span> button on each scorecard.
        </p>
      </div>

      {farmIds.length < 2 ? (
        <div className="surface-elevated rounded-[20px] p-12 text-center">
          <p className="text-sm text-[#8E8E93]">
            Select at least 2 farms from the directory to compare.
          </p>
        </div>
      ) : (
        <div className="surface-elevated rounded-[20px] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.06)]">
                <th className="text-left px-5 py-4 text-[#8E8E93] font-medium w-40">Category</th>
                {farmIds.map((id) => (
                  <th key={id} className="text-right px-5 py-4 text-[#1C1C1E] font-semibold">
                    {/* TODO: render farm name */}
                    Farm {id.slice(0, 6)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[rgba(0,0,0,0.06)] bg-[rgba(52,199,89,0.04)]">
                <td className="px-5 py-3 font-semibold text-[#1C1C1E]">Overall PRI</td>
                {farmIds.map((id) => (
                  <td key={id} className="text-right px-5 py-3 font-bold text-[#1C1C1E]">—</td>
                ))}
              </tr>
              {CATEGORIES.map(({ key, label, weight }) => (
                <tr key={key} className="border-b border-[rgba(0,0,0,0.04)] last:border-0">
                  <td className="px-5 py-3 text-[#48484A]">
                    {label}
                    <span className="ml-1 text-[#C7C7CC]">({weight})</span>
                  </td>
                  {farmIds.map((id) => (
                    <td key={id} className="text-right px-5 py-3 text-[#1C1C1E]">—</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
