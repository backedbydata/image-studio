import { motion } from 'framer-motion'

interface SliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
  showValue?: boolean
  formatValue?: (value: number) => string
  disabled?: boolean
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = true,
  formatValue = (v) => String(v),
  disabled = false,
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <label className="text-sm font-medium text-foreground-secondary">
              {label}
            </label>
          )}
          {showValue && (
            <span className="text-sm font-mono text-foreground-primary">
              {formatValue(value)}
            </span>
          )}
        </div>
      )}
      <div className="relative h-6 flex items-center">
        {/* Track background */}
        <div className="absolute w-full h-1.5 rounded-full bg-background-tertiary" />

        {/* Track fill */}
        <motion.div
          className="absolute h-1.5 rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary"
          style={{ width: `${percentage}%` }}
          initial={false}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.1 }}
        />

        {/* Native input for accessibility and interaction */}
        <input
          type="range"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="absolute w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        {/* Thumb */}
        <motion.div
          className="absolute w-4 h-4 rounded-full bg-white shadow-lg border-2 border-accent-primary pointer-events-none"
          style={{ left: `calc(${percentage}% - 8px)` }}
          initial={false}
          animate={{ left: `calc(${percentage}% - 8px)` }}
          transition={{ duration: 0.1 }}
        />
      </div>
    </div>
  )
}
