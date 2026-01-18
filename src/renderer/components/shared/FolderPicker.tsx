import { FolderOpen, Check } from 'lucide-react'
import { Button } from './Button'

interface FolderPickerProps {
  value: string | null
  onChange: (folder: string | null) => void
  label?: string
  placeholder?: string
}

export function FolderPicker({
  value,
  onChange,
  label,
  placeholder = 'No folder selected',
}: FolderPickerProps) {
  const handleSelect = async () => {
    const folder = await window.electron.selectOutputFolder()
    if (folder) {
      onChange(folder)
    }
  }

  // Get display path (shorten if too long)
  const displayPath = value
    ? value.length > 50
      ? '...' + value.slice(-47)
      : value
    : placeholder

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-foreground-secondary mb-1.5">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <div
          className={`
            flex-1 min-w-0 h-10 px-3 rounded-lg
            bg-background-tertiary border border-glass-border
            flex items-center gap-2
            ${value ? 'text-foreground-primary' : 'text-foreground-muted'}
          `}
        >
          {value && <Check size={14} className="text-accent-success flex-shrink-0" />}
          <span className="text-sm truncate font-mono block overflow-hidden">{displayPath}</span>
        </div>
        <Button
          variant="secondary"
          onClick={handleSelect}
          leftIcon={<FolderOpen size={16} />}
          className="flex-shrink-0"
        >
          Browse
        </Button>
      </div>
    </div>
  )
}
