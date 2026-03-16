import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-[rgba(0,0,0,0.06)] text-[#48484A]',
        green: 'bg-[rgba(52,199,89,0.12)] text-[#1A7A32]',
        blue: 'bg-[rgba(0,122,255,0.10)] text-[#0055B3]',
        orange: 'bg-[rgba(255,149,0,0.12)] text-[#B36200]',
        red: 'bg-[rgba(255,59,48,0.10)] text-[#C0392B]',
        purple: 'bg-[rgba(175,82,222,0.10)] text-[#7B2D8B]',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
