import { motion } from 'framer-motion'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: ToggleProps) {
  return (
    <label
      className={`
        flex items-start gap-3 cursor-pointer
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`
          relative flex-shrink-0 w-11 h-6 rounded-full
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:ring-offset-2 focus:ring-offset-background-primary
          ${checked ? 'bg-accent-primary' : 'bg-background-tertiary border border-glass-border'}
        `}
      >
        <motion.span
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md"
          initial={false}
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
      {(label || description) && (
        <div className="flex-1 pt-0.5">
          {label && (
            <span className="block text-sm font-medium text-foreground-primary">
              {label}
            </span>
          )}
          {description && (
            <span className="block text-xs text-foreground-muted mt-0.5">
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  )
}
