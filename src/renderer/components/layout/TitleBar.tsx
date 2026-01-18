import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Minus, Square, X, Maximize2 } from 'lucide-react'

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    // Check initial state
    window.electron.isMaximized().then(setIsMaximized)

    // Listen for changes
    const unsubscribe = window.electron.onMaximizedChange(setIsMaximized)
    return unsubscribe
  }, [])

  const handleMinimize = () => window.electron.minimizeWindow()
  const handleMaximize = () => window.electron.maximizeWindow()
  const handleClose = () => window.electron.closeWindow()

  return (
    <div className="h-10 flex items-center justify-between bg-background-primary border-b border-glass-border drag-region">
      {/* App title */}
      <div className="flex items-center gap-3 px-4">
        <div className="w-6 h-6 rounded-lg gradient-button flex items-center justify-center">
          <span className="text-xs font-bold text-white">IS</span>
        </div>
        <span className="text-sm font-semibold text-foreground-primary no-select">
          Image Studio
        </span>
      </div>

      {/* Window controls */}
      <div className="flex items-center h-full no-drag">
        <WindowButton
          onClick={handleMinimize}
          icon={<Minus size={14} />}
          hoverClass="hover:bg-white/10"
        />
        <WindowButton
          onClick={handleMaximize}
          icon={isMaximized ? <Maximize2 size={12} /> : <Square size={12} />}
          hoverClass="hover:bg-white/10"
        />
        <WindowButton
          onClick={handleClose}
          icon={<X size={16} />}
          hoverClass="hover:bg-red-500"
          isClose
        />
      </div>
    </div>
  )
}

interface WindowButtonProps {
  onClick: () => void
  icon: React.ReactNode
  hoverClass: string
  isClose?: boolean
}

function WindowButton({ onClick, icon, hoverClass, isClose }: WindowButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`h-full px-4 flex items-center justify-center transition-colors text-foreground-secondary ${hoverClass}`}
      whileTap={{ scale: 0.95 }}
    >
      {icon}
    </motion.button>
  )
}
