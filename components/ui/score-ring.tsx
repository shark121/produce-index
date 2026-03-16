import { cn } from '@/lib/utils'
import { scoreTier } from '@/lib/types'

interface ScoreRingProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const sizeMap = {
  sm: { svg: 56, r: 22, stroke: 4, fontSize: 'text-sm', labelSize: 'text-[10px]' },
  md: { svg: 80, r: 32, stroke: 5, fontSize: 'text-lg', labelSize: 'text-xs' },
  lg: { svg: 120, r: 48, stroke: 7, fontSize: 'text-2xl', labelSize: 'text-sm' },
}

const tierColor = {
  high: '#34C759',
  medium: '#FF9500',
  low: '#FF3B30',
}

export function ScoreRing({ score, size = 'md', showLabel = true, className }: ScoreRingProps) {
  const { svg, r, stroke, fontSize, labelSize } = sizeMap[size]
  const cx = svg / 2
  const circumference = 2 * Math.PI * r
  const dashoffset = circumference * (1 - score / 100)
  const tier = scoreTier(score)
  const color = tierColor[tier]

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div className="relative" style={{ width: svg, height: svg }}>
        <svg width={svg} height={svg} viewBox={`0 0 ${svg} ${svg}`} className="-rotate-90">
          {/* Track */}
          <circle
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            stroke="rgba(0,0,0,0.06)"
            strokeWidth={stroke}
          />
          {/* Fill */}
          <circle
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        {/* Score number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('font-bold text-[#1C1C1E]', fontSize)}>
            {Math.round(score)}
          </span>
        </div>
      </div>
      {showLabel && (
        <span className={cn('font-medium text-[#8E8E93]', labelSize)}>out of 100</span>
      )}
    </div>
  )
}
