import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Image as ImageIcon, FileWarning } from 'lucide-react'
import type { ImageFile } from '../../types'

interface FileListProps {
  files: ImageFile[]
  onRemove: (path: string) => void
  onClear: () => void
  maxHeight?: string
}

export function FileList({ files, onRemove, onClear, maxHeight = '300px' }: FileListProps) {
  if (files.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground-secondary">
          {files.length} file{files.length !== 1 ? 's' : ''} selected
        </span>
        <button
          onClick={onClear}
          className="text-xs text-accent-error hover:text-accent-error/80 transition-colors"
        >
          Clear all
        </button>
      </div>

      <div
        className="space-y-1 overflow-y-auto pr-2"
        style={{ maxHeight }}
      >
        <AnimatePresence mode="popLayout">
          {files.map((file) => (
            <FileListItem key={file.path} file={file} onRemove={onRemove} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

interface FileListItemProps {
  file: ImageFile
  onRemove: (path: string) => void
}

function FileListItem({ file, onRemove }: FileListItemProps) {
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    window.electron.getThumbnail(file.path, 48).then((thumb) => {
      if (!cancelled) {
        if (thumb) {
          setThumbnail(thumb)
        } else {
          setError(true)
        }
      }
    })

    return () => {
      cancelled = true
    }
  }, [file.path])

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 p-2 rounded-lg bg-background-tertiary/50 hover:bg-background-tertiary transition-colors group"
    >
      {/* Thumbnail */}
      <div className="w-10 h-10 rounded-md bg-background-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
        {thumbnail ? (
          <img src={thumbnail} alt="" className="w-full h-full object-cover" />
        ) : error ? (
          <FileWarning size={18} className="text-accent-warning" />
        ) : (
          <ImageIcon size={18} className="text-foreground-muted" />
        )}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm text-foreground-primary truncate">{file.name}</div>
        <div className="flex items-center gap-2 text-xs text-foreground-muted">
          <span>{file.extension.toUpperCase().replace('.', '')}</span>
          <span>•</span>
          <span>{formatSize(file.size)}</span>
          {file.width && file.height && (
            <>
              <span>•</span>
              <span>{file.width} × {file.height}</span>
            </>
          )}
        </div>
      </div>

      {/* Remove button */}
      <button
        onClick={() => onRemove(file.path)}
        className="p-1.5 rounded-md text-foreground-muted hover:text-accent-error hover:bg-accent-error/10 transition-colors opacity-0 group-hover:opacity-100"
      >
        <X size={14} />
      </button>
    </motion.div>
  )
}
