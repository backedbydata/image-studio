import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCropperStore } from '../../stores/cropperStore'

export function ImageQueue() {
  const { files, currentFileIndex, setCurrentFileIndex } = useCropperStore()

  if (files.length <= 1) return null

  const handlePrevious = () => {
    if (currentFileIndex > 0) {
      setCurrentFileIndex(currentFileIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentFileIndex < files.length - 1) {
      setCurrentFileIndex(currentFileIndex + 1)
    }
  }

  return (
    <div className="flex items-center gap-2 p-2 glass rounded-lg">
      <motion.button
        onClick={handlePrevious}
        disabled={currentFileIndex === 0}
        className="w-8 h-8 rounded flex items-center justify-center text-foreground-secondary hover:text-foreground-primary hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
        whileTap={{ scale: 0.95 }}
      >
        <ChevronLeft size={18} />
      </motion.button>

      <div className="flex gap-1 overflow-x-auto max-w-[200px] py-1">
        {files.map((file, index) => (
          <ImageQueueItem
            key={file.path}
            file={file}
            index={index}
            isActive={index === currentFileIndex}
            onClick={() => setCurrentFileIndex(index)}
          />
        ))}
      </div>

      <motion.button
        onClick={handleNext}
        disabled={currentFileIndex === files.length - 1}
        className="w-8 h-8 rounded flex items-center justify-center text-foreground-secondary hover:text-foreground-primary hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
        whileTap={{ scale: 0.95 }}
      >
        <ChevronRight size={18} />
      </motion.button>

      <span className="text-xs text-foreground-muted ml-2">
        {currentFileIndex + 1} / {files.length}
      </span>
    </div>
  )
}

interface ImageQueueItemProps {
  file: { path: string; name: string }
  index: number
  isActive: boolean
  onClick: () => void
}

function ImageQueueItem({ file, index, isActive, onClick }: ImageQueueItemProps) {
  const [thumbnail, setThumbnail] = useState<string | null>(null)

  useEffect(() => {
    window.electron.getThumbnail(file.path, 40).then(setThumbnail)
  }, [file.path])

  return (
    <motion.button
      onClick={onClick}
      className={`
        flex-shrink-0 w-10 h-10 rounded overflow-hidden
        transition-all duration-150
        ${isActive
          ? 'ring-2 ring-accent-primary ring-offset-2 ring-offset-background-primary'
          : 'opacity-60 hover:opacity-100'
        }
      `}
      whileTap={{ scale: 0.95 }}
      title={file.name}
    >
      {thumbnail ? (
        <img src={thumbnail} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-background-tertiary flex items-center justify-center text-xs text-foreground-muted">
          {index + 1}
        </div>
      )}
    </motion.button>
  )
}
