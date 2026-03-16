import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[#1C1C1E]"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'h-11 w-full rounded-[10px] border border-[rgba(0,0,0,0.12)] bg-white px-3.5 text-sm text-[#1C1C1E] placeholder:text-[#AEAEB2]',
            'transition-all duration-150',
            'focus:outline-none focus:border-[#007AFF] focus:ring-3 focus:ring-[rgba(0,122,255,0.12)]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-[#FF3B30] focus:border-[#FF3B30] focus:ring-[rgba(255,59,48,0.12)]',
            className,
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-[#8E8E93]">{hint}</p>}
        {error && <p className="text-xs text-[#FF3B30]">{error}</p>}
      </div>
    )
  },
)
Input.displayName = 'Input'

export { Input }
