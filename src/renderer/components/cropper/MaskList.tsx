import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Move, Eye, EyeOff } from 'lucide-react'
import { useCropperStore } from '../../stores/cropperStore'
import { Button } from '../shared/Button'

export function MaskList() {
  const {
    regions,
    selectedRegionId,
    setSelectedRegionId,
    removeRegion,
    clearRegions,
  } = useCropperStore()

  // Filter out temp regions
  const permanentRegions = regions.filter((r) => r.id !== 'temp')

  if (permanentRegions.length === 0) {
    return (
      <div className="p-4 text-center text-foreground-muted">
        <p className="text-sm">No crop regions defined</p>
        <p className="text-xs mt-1">Click and drag on the image to create regions</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-sm font-medium text-foreground-secondary">
          {permanentRegions.length} Region{permanentRegions.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={clearRegions}
          className="text-xs text-accent-error hover:text-accent-error/80 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-1 max-h-64 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {permanentRegions.map((region, index) => (
            <motion.div
              key={region.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.15 }}
              onClick={() => setSelectedRegionId(region.id)}
              className={`
                flex items-center gap-3 p-2 rounded-lg cursor-pointer
                transition-colors duration-150
                ${selectedRegionId === region.id
                  ? 'bg-accent-primary/20 border border-accent-primary/30'
                  : 'bg-background-tertiary/50 hover:bg-background-tertiary border border-transparent'
                }
              `}
            >
              {/* Region number */}
              <div
                className={`
                  w-6 h-6 rounded flex items-center justify-center text-xs font-bold
                  ${selectedRegionId === region.id
                    ? 'bg-accent-primary text-white'
                    : 'bg-background-tertiary text-foreground-secondary'
                  }
                `}
              >
                {index + 1}
              </div>

              {/* Region info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm text-foreground-primary font-mono">
                  {Math.round(region.width)} × {Math.round(region.height)}
                </div>
                <div className="text-xs text-foreground-muted">
                  at ({Math.round(region.left)}, {Math.round(region.top)})
                </div>
              </div>

              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeRegion(region.id)
                }}
                className="p-1.5 rounded text-foreground-muted hover:text-accent-error hover:bg-accent-error/10 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
