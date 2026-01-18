import { motion } from 'framer-motion'

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'gradient'
}

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
}

const variantClasses = {
  default: 'bg-accent-primary',
  success: 'bg-accent-success',
  gradient: 'bg-gradient-to-r from-accent-primary to-accent-secondary',
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = false,
  size = 'md',
  variant = 'gradient',
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm text-foreground-secondary">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm font-mono text-foreground-primary">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full rounded-full bg-background-tertiary overflow-hidden ${sizeClasses[size]}`}
      >
        <motion.div
          className={`h-full rounded-full ${variantClasses[variant]}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

interface ProcessingProgressProps {
  currentFile: string
  currentIndex: number
  totalFiles: number
  percentage: number
}

export function ProcessingProgress({
  currentFile,
  currentIndex,
  totalFiles,
  percentage,
}: ProcessingProgressProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground-secondary">
          Processing file {currentIndex + 1} of {totalFiles}
        </span>
        <span className="text-sm font-mono text-foreground-primary">
          {Math.round(percentage)}%
        </span>
      </div>
      <ProgressBar value={percentage} size="lg" />
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
        <span className="text-sm text-foreground-muted truncate">{currentFile}</span>
      </div>
    </div>
  )
}
