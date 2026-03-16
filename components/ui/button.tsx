'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-40 select-none cursor-pointer',
  {
    variants: {
      variant: {
        primary:
          'bg-[#34C759] text-white hover:bg-[#2FB350] active:scale-[0.98] shadow-sm',
        secondary:
          'bg-white text-[#1C1C1E] border border-[rgba(0,0,0,0.12)] hover:bg-[#F5F5F7] active:scale-[0.98] shadow-xs',
        ghost:
          'text-[#1C1C1E] hover:bg-[rgba(0,0,0,0.05)] active:scale-[0.98]',
        destructive:
          'bg-[#FF3B30] text-white hover:bg-[#E6342A] active:scale-[0.98] shadow-sm',
        blue:
          'bg-[#007AFF] text-white hover:bg-[#0070EB] active:scale-[0.98] shadow-sm',
        outline:
          'border border-[rgba(0,0,0,0.12)] text-[#007AFF] hover:bg-[rgba(0,122,255,0.06)] active:scale-[0.98]',
      },
      size: {
        sm: 'h-8 px-3 text-sm rounded-[8px]',
        md: 'h-10 px-4 text-sm rounded-[10px]',
        lg: 'h-12 px-6 text-base rounded-[12px]',
        xl: 'h-14 px-8 text-base rounded-[14px]',
        icon: 'h-10 w-10 rounded-[10px]',
        'icon-sm': 'h-8 w-8 rounded-[8px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
