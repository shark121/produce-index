import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ModeNoticeProps {
  title: string
  body: string
  className?: string
}

export function ModeNotice({ title, body, className }: ModeNoticeProps) {
  return (
    <div
      className={cn(
        'surface-elevated rounded-[18px] border border-[rgba(0,122,255,0.14)] bg-[linear-gradient(135deg,rgba(0,122,255,0.08),rgba(52,199,89,0.08))] p-4',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <Badge variant="blue" className="mt-0.5">Demo data active</Badge>
        <div>
          <p className="text-sm font-semibold text-[#1C1C1E]">{title}</p>
          <p className="mt-1 text-sm text-[#48484A] leading-relaxed">{body}</p>
        </div>
      </div>
    </div>
  )
}
