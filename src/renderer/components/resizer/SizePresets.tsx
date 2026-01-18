import { motion } from 'framer-motion'
import { SIZE_PRESETS, type SizePreset } from '../../types'

interface SizePresetsProps {
  onSelect: (preset: SizePreset) => void
}

export function SizePresets({ onSelect }: SizePresetsProps) {
  const standardPresets = SIZE_PRESETS.filter((p) => p.category === 'standard')
  const socialPresets = SIZE_PRESETS.filter((p) => p.category === 'social')

  return (
    <div className="space-y-4">
      <PresetGroup title="Standard Sizes" presets={standardPresets} onSelect={onSelect} />
      <PresetGroup title="Social Media" presets={socialPresets} onSelect={onSelect} />
    </div>
  )
}

interface PresetGroupProps {
  title: string
  presets: SizePreset[]
  onSelect: (preset: SizePreset) => void
}

function PresetGroup({ title, presets, onSelect }: PresetGroupProps) {
  return (
    <div>
      <h4 className="text-xs font-medium text-foreground-muted uppercase tracking-wider mb-2">
        {title}
      </h4>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <motion.button
            key={preset.name}
            onClick={() => onSelect(preset)}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-background-tertiary border border-glass-border text-foreground-secondary hover:text-foreground-primary hover:border-accent-primary/50 transition-all"
            whileTap={{ scale: 0.95 }}
          >
            <span>{preset.name}</span>
            <span className="ml-1.5 text-foreground-muted font-mono">
              {preset.width}×{preset.height}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
