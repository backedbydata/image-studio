import { forwardRef, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftAddon?: React.ReactNode
  rightAddon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftAddon, rightAddon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground-secondary mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftAddon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">
              {leftAddon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full h-10 px-3 rounded-lg
              bg-background-tertiary border border-glass-border
              text-foreground-primary placeholder:text-foreground-muted
              focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              font-mono text-sm
              ${leftAddon ? 'pl-10' : ''}
              ${rightAddon ? 'pr-10' : ''}
              ${error ? 'border-accent-error focus:ring-accent-error/50 focus:border-accent-error' : ''}
              ${className}
            `}
            {...props}
          />
          {rightAddon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted">
              {rightAddon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-accent-error">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-foreground-muted">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

interface NumberInputProps extends Omit<InputProps, 'type' | 'onChange'> {
  value: number | undefined
  onChange: (value: number | undefined) => void
  min?: number
  max?: number
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value, onChange, min, max, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      if (val === '') {
        onChange(undefined)
      } else {
        const num = parseInt(val, 10)
        if (!isNaN(num)) {
          if (min !== undefined && num < min) return
          if (max !== undefined && num > max) return
          onChange(num)
        }
      }
    }

    return (
      <Input
        ref={ref}
        type="number"
        value={value ?? ''}
        onChange={handleChange}
        min={min}
        max={max}
        {...props}
      />
    )
  }
)

NumberInput.displayName = 'NumberInput'
