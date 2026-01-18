import { motion } from 'framer-motion'
import { ZoomIn, ZoomOut, Maximize, RotateCw } from 'lucide-react'
import { useCropperStore } from '../../stores/cropperStore'
import { Slider } from '../shared/Slider'

export function ZoomControls() {
  const { zoom, rotation, setZoom, setRotation, resetView } = useCropperStore()

  const handleZoomIn = () => setZoom(Math.min(5, zoom + 0.25))
  const handleZoomOut = () => setZoom(Math.max(0.1, zoom - 0.25))
  const handleRotate = () => setRotation(rotation + 90)
  const handleFitToWindow = () => {
    setZoom(1)
    resetView()
  }

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg glass">
      <div className="flex items-center gap-1">
        <ZoomButton onClick={handleZoomOut} disabled={zoom <= 0.1}>
          <ZoomOut size={16} />
        </ZoomButton>

        <div className="w-32">
          <Slider
            value={zoom * 100}
            onChange={(v) => setZoom(v / 100)}
            min={10}
            max={500}
            showValue={false}
          />
        </div>

        <ZoomButton onClick={handleZoomIn} disabled={zoom >= 5}>
          <ZoomIn size={16} />
        </ZoomButton>
      </div>

      <div className="h-6 w-px bg-glass-border" />

      <span className="text-sm font-mono text-foreground-primary min-w-[4rem] text-center">
        {Math.round(zoom * 100)}%
      </span>

      <div className="h-6 w-px bg-glass-border" />

      <ZoomButton onClick={handleRotate} title="Rotate 90° clockwise">
        <RotateCw size={16} />
      </ZoomButton>

      <div className="h-6 w-px bg-glass-border" />

      <ZoomButton onClick={handleFitToWindow} title="Fit to window">
        <Maximize size={16} />
      </ZoomButton>
    </div>
  )
}

interface ZoomButtonProps {
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
  title?: string
}

function ZoomButton({ onClick, disabled, children, title }: ZoomButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        w-8 h-8 rounded-md flex items-center justify-center
        transition-colors duration-150
        ${disabled
          ? 'text-foreground-muted cursor-not-allowed'
          : 'text-foreground-secondary hover:text-foreground-primary hover:bg-white/10'
        }
      `}
      whileTap={disabled ? {} : { scale: 0.95 }}
    >
      {children}
    </motion.button>
  )
}
