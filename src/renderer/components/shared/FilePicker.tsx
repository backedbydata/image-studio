import { useCallback } from 'react'
import { motion } from 'framer-motion'
import { Upload, FolderOpen, Files } from 'lucide-react'
import { Button } from './Button'
import type { ImageFile } from '../../types'

interface FilePickerProps {
  onFilesSelected: (files: ImageFile[]) => void
  multiple?: boolean
  showFolderOption?: boolean
}

export function FilePicker({
  onFilesSelected,
  multiple = true,
  showFolderOption = true,
}: FilePickerProps) {
  const handleOpenFiles = useCallback(async () => {
    const paths = await window.electron.openFiles()
    if (paths.length === 0) return

    const files = await Promise.all(
      paths.map(async (path) => {
        const info = await window.electron.getFileInfo(path)
        const metadata = await window.electron.getImageMetadata(path)

        return {
          path,
          name: info?.name || path.split(/[\\/]/).pop() || 'Unknown',
          extension: info?.extension || '',
          size: info?.size || 0,
          width: metadata?.width,
          height: metadata?.height,
        } as ImageFile
      })
    )

    onFilesSelected(files)
  }, [onFilesSelected])

  const handleOpenFolder = useCallback(async () => {
    const folderPath = await window.electron.openFolder()
    if (!folderPath) return

    const paths = await window.electron.getImagesFromFolder(folderPath)
    if (paths.length === 0) return

    const files = await Promise.all(
      paths.map(async (path) => {
        const info = await window.electron.getFileInfo(path)
        const metadata = await window.electron.getImageMetadata(path)

        return {
          path,
          name: info?.name || path.split(/[\\/]/).pop() || 'Unknown',
          extension: info?.extension || '',
          size: info?.size || 0,
          width: metadata?.width,
          height: metadata?.height,
        } as ImageFile
      })
    )

    onFilesSelected(files)
  }, [onFilesSelected])

  return (
    <motion.div
      className="border-2 border-dashed border-glass-border rounded-xl p-8 text-center hover:border-accent-primary/50 transition-colors"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-accent-primary/10 flex items-center justify-center">
          <Upload size={28} className="text-accent-primary" />
        </div>

        <div>
          <h3 className="text-lg font-medium text-foreground-primary mb-1">
            Select Images
          </h3>
          <p className="text-sm text-foreground-muted">
            Choose individual files or an entire folder
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={handleOpenFiles}
            leftIcon={<Files size={16} />}
          >
            Select Files
          </Button>

          {showFolderOption && (
            <Button
              variant="secondary"
              onClick={handleOpenFolder}
              leftIcon={<FolderOpen size={16} />}
            >
              Select Folder
            </Button>
          )}
        </div>

        <p className="text-xs text-foreground-muted">
          Supports JPEG, PNG, WebP, GIF, TIFF, BMP, HEIC
        </p>
      </div>
    </motion.div>
  )
}
