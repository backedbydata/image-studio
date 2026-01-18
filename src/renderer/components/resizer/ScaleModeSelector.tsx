import { motion } from 'framer-motion'
import { Maximize2, Percent, Box } from 'lucide-react'
import type { ScaleMode } from '../../types'

interface ScaleModeSelectorProps {
  value: ScaleMode
  onChange: (mode: ScaleMode) => void
}

const modes: { value: ScaleMode; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: 'pixels',
    label: 'Pixels',
    icon: <Box size={16} />,
    description: 'Set exact dimensions',
  },
  {
    value: 'percentage',
    label: 'Percentage',
    icon: <Percent size={16} />,
    description: 'Scale by percentage',
  },
  {
    value: 'maxFit',
    label: 'Max Fit',
    icon: <Maximize2 size={16} />,
    description: 'Fit within bounds',
  },
]

export function ScaleModeSelector({ value, onChange }: ScaleModeSelectorProps) {
  return (
    <div className="flex rounded-lg border border-glass-border overflow-hidden">
      {modes.map((mode) => (
        <motion.button
          key={mode.value}
          onClick={() => onChange(mode.value)}
          className={`
            flex-1 flex items-center justify-center gap-2 px-4 py-2.5
            transition-all duration-200 text-sm font-medium
            ${value === mode.value
              ? 'bg-accent-primary/20 text-accent-primary'
              : 'bg-background-tertiary text-foreground-secondary hover:text-foreground-primary hover:bg-background-tertiary/80'
            }
          `}
          whileTap={{ scale: 0.98 }}
          title={mode.description}
        >
          {mode.icon}
          <span className="hidden sm:inline">{mode.label}</span>
        </motion.button>
      ))}
    </div>
  )
}
