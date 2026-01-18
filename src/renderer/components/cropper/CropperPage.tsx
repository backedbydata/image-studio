import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Crop, Play, Settings2 } from 'lucide-react'
import { useCropperStore } from '../../stores/cropperStore'
import { useAppStore } from '../../stores/appStore'
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  FilePicker,
  FileList,
  FolderPicker,
  Select,
  Slider,
  Toggle,
  Modal,
  ProcessingProgress,
  ProcessingReport,
} from '../shared'
import { ImageCanvas } from './ImageCanvas'
import { ZoomControls } from './ZoomControls'
import { MaskList } from './MaskList'
import { ImageQueue } from './ImageQueue'
import { FORMAT_OPTIONS } from '../../types'

export function CropperPage() {
  const store = useCropperStore()
  const { setIsProcessing: setAppProcessing } = useAppStore()

  // Set up progress listener
  useEffect(() => {
    const unsubscribe = window.electron.onProgress((progress) => {
      store.setProgress({
        currentFile: progress.currentFile,
        percentage: progress.percentage,
      })
    })
    return unsubscribe
  }, [store])

  const currentFile = store.files[store.currentFileIndex]

  const handleStartProcessing = async () => {
    console.log('Export button clicked', {
      currentFile: currentFile?.path,
      regionsCount: store.regions.length,
      outputFolder: store.outputFolder,
      rotation: store.rotation
    })

    if (!currentFile || store.regions.length === 0 || !store.outputFolder) {
      console.log('Export conditions not met')
      return
    }

    // Filter out temp regions
    const permanentRegions = store.regions.filter((r) => r.id !== 'temp')
    if (permanentRegions.length === 0) {
      console.log('No permanent regions found')
      return
    }

    console.log('Starting export with', permanentRegions.length, 'regions')

    store.setIsProcessing(true)
    setAppProcessing(true)
    store.setResult(null)

    try {
      const regions = permanentRegions.map((r) => ({
        left: Math.round(r.left),
        top: Math.round(r.top),
        width: Math.round(r.width),
        height: Math.round(r.height),
      }))

      console.log('Exporting regions:', regions, 'with rotation:', store.rotation)

      const result = await window.electron.cropImage({
        inputPath: currentFile.path,
        outputPath: store.outputFolder,
        regions,
        format: store.format,
        quality: store.quality,
        preserveMetadata: store.preserveMetadata,
        namingTemplate: store.namingTemplate,
        rotation: store.rotation,
      })

      store.setResult(result)
    } catch (error) {
      console.error('Processing error:', error)
    } finally {
      store.setIsProcessing(false)
      setAppProcessing(false)
      store.setProgress(null)
    }
  }

  const permanentRegions = store.regions.filter((r) => r.id !== 'temp')
  const canProcess =
    store.files.length > 0 && permanentRegions.length > 0 && store.outputFolder

  return (
    <div className="h-full flex overflow-hidden">
      {/* Main canvas area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-glass-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-foreground-primary flex items-center gap-2">
                <Crop size={24} className="text-accent-primary" />
                Image Cropper
              </h1>
              <p className="text-sm text-foreground-muted mt-0.5">
                Define crop regions and export each as a separate image
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartProcessing}
              disabled={!canProcess || store.isProcessing}
              isLoading={store.isProcessing}
              leftIcon={<Play size={18} />}
            >
              {store.isProcessing ? 'Processing...' : `Export ${permanentRegions.length} Region${permanentRegions.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>

        {/* Canvas or file picker */}
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {store.files.length === 0 ? (
              <motion.div
                key="picker"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex items-center justify-center p-6"
              >
                <div className="max-w-lg w-full">
                  <FilePicker
                    onFilesSelected={(files) => store.setFiles(files)}
                    multiple
                    showFolderOption={false}
                  />
                </div>
              </motion.div>
            ) : currentFile ? (
              <motion.div
                key="canvas"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <ImageCanvas imagePath={currentFile.path} />

                {/* Floating controls */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
                  <ZoomControls />
                  <ImageQueue />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* Right sidebar */}
      <div className="w-80 flex-shrink-0 border-l border-glass-border bg-background-secondary overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Source files section */}
          {store.files.length > 0 && (
            <Card variant="bordered" padding="sm">
              <CardHeader
                title="Source Images"
                action={
                  <button
                    onClick={() => store.clearFiles()}
                    className="text-xs text-accent-error hover:text-accent-error/80"
                  >
                    Clear
                  </button>
                }
              />
              <CardContent>
                <FileList
                  files={store.files}
                  onRemove={(path) => store.removeFile(path)}
                  onClear={() => store.clearFiles()}
                  maxHeight="120px"
                />
              </CardContent>
            </Card>
          )}

          {/* Mask regions */}
          <Card variant="bordered" padding="sm">
            <CardHeader
              title="Crop Regions"
              description="Click and drag to create"
            />
            <CardContent>
              <MaskList />
            </CardContent>
          </Card>

          {/* Output settings */}
          <Card variant="bordered" padding="sm">
            <CardHeader
              title="Output Settings"
              action={<Settings2 size={14} className="text-foreground-muted" />}
            />
            <CardContent className="space-y-4">
              <Select
                label="Output Format"
                value={store.format}
                onChange={store.setFormat}
                options={FORMAT_OPTIONS}
              />

              <Slider
                label="Quality"
                value={store.quality}
                onChange={store.setQuality}
                min={1}
                max={100}
                formatValue={(v) => `${v}%`}
              />

              <FolderPicker
                label="Output Folder"
                value={store.outputFolder}
                onChange={store.setOutputFolder}
              />

              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-1.5">
                  Naming Template
                </label>
                <input
                  type="text"
                  value={store.namingTemplate}
                  onChange={(e) => store.setNamingTemplate(e.target.value)}
                  placeholder="{original}_{index}"
                  className="w-full h-10 px-3 rounded-lg bg-background-tertiary border border-glass-border text-foreground-primary placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 text-sm font-mono"
                />
                <p className="mt-1 text-xs text-foreground-muted">
                  Use {'{original}'} for filename, {'{index}'} for number
                </p>
              </div>

              <Toggle
                checked={store.preserveMetadata}
                onChange={store.setPreserveMetadata}
                label="Preserve Metadata"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Processing modal */}
      <Modal
        isOpen={store.isProcessing}
        onClose={() => {}}
        title="Cropping Images"
        showCloseButton={false}
      >
        {store.progress && (
          <ProcessingProgress
            currentFile={store.progress.currentFile}
            currentIndex={Math.floor(
              (store.progress.percentage / 100) * permanentRegions.length
            )}
            totalFiles={permanentRegions.length}
            percentage={store.progress.percentage}
          />
        )}
      </Modal>

      {/* Results modal */}
      <ProcessingReport
        isOpen={store.result !== null && !store.isProcessing}
        onClose={() => store.setResult(null)}
        result={store.result}
        outputFolder={store.outputFolder}
      />
    </div>
  )
}
