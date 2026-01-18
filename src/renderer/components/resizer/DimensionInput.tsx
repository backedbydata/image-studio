import { motion } from 'framer-motion'
import { Link, Unlink } from 'lucide-react'
import { NumberInput } from '../shared/Input'

interface DimensionInputProps {
  width: number | undefined
  height: number | undefined
  onWidthChange: (width: number | undefined) => void
  onHeightChange: (height: number | undefined) => void
  aspectRatioLocked: boolean
  onAspectRatioLockedChange: (locked: boolean) => void
}

export function DimensionInput({
  width,
  height,
  onWidthChange,
  onHeightChange,
  aspectRatioLocked,
  onAspectRatioLockedChange,
}: DimensionInputProps) {
  return (
    <div className="flex items-end gap-3">
      <div className="flex-1">
        <NumberInput
          label="Width"
          value={width}
          onChange={onWidthChange}
          min={1}
          max={10000}
          placeholder="Auto"
          rightAddon={<span className="text-xs">px</span>}
        />
      </div>

      <motion.button
        onClick={() => onAspectRatioLockedChange(!aspectRatioLocked)}
        className={`
          h-10 w-10 flex items-center justify-center rounded-lg
          transition-all duration-200 mb-0
          ${aspectRatioLocked
            ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30'
            : 'bg-background-tertiary text-foreground-muted border border-glass-border hover:text-foreground-primary'
          }
        `}
        whileTap={{ scale: 0.95 }}
        title={aspectRatioLocked ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
      >
        {aspectRatioLocked ? <Link size={16} /> : <Unlink size={16} />}
      </motion.button>

      <div className="flex-1">
        <NumberInput
          label="Height"
          value={height}
          onChange={onHeightChange}
          min={1}
          max={10000}
          placeholder="Auto"
          rightAddon={<span className="text-xs">px</span>}
        />
      </div>
    </div>
  )
}
