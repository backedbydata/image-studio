import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'

interface SelectOption<T> {
  value: T
  label: string
  description?: string
}

interface SelectProps<T> {
  value: T
  onChange: (value: T) => void
  options: SelectOption<T>[]
  label?: string
  placeholder?: string
  disabled?: boolean
}

export function Select<T extends string>({
  value,
  onChange,
  options,
  label,
  placeholder = 'Select...',
  disabled,
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-foreground-secondary mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full h-10 px-3 rounded-lg
            bg-background-tertiary border border-glass-border
            text-left text-sm
            flex items-center justify-between
            focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isOpen ? 'ring-2 ring-accent-primary/50 border-accent-primary' : ''}
          `}
        >
          <span className={selectedOption ? 'text-foreground-primary' : 'text-foreground-muted'}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown
            size={16}
            className={`text-foreground-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 w-full mt-1 py-1 rounded-lg bg-background-secondary border border-glass-border shadow-xl overflow-y-auto max-h-24"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                  className={`
                    w-full px-3 py-2 text-left flex items-center justify-between
                    transition-colors duration-150
                    ${option.value === value
                      ? 'bg-accent-primary/10 text-accent-primary'
                      : 'text-foreground-secondary hover:bg-white/5 hover:text-foreground-primary'
                    }
                  `}
                >
                  <div>
                    <div className="text-sm font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-foreground-muted mt-0.5">
                        {option.description}
                      </div>
                    )}
                  </div>
                  {option.value === value && <Check size={16} />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
