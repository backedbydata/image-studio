import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Settings2, Image as ImageIcon } from 'lucide-react'
import { useResizerStore } from '../../stores/resizerStore'
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
import { DimensionInput } from './DimensionInput'
import { SizePresets } from './SizePresets'
import { ScaleModeSelector } from './ScaleModeSelector'
import { FORMAT_OPTIONS, KERNEL_OPTIONS, type SizePreset } from '../../types'

export function ResizerPage() {
  const store = useResizerStore()
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

  // Calculate aspect ratio when first file is selected
  useEffect(() => {
    if (store.files.length > 0 && store.files[0].width && store.files[0].height) {
      const ratio = store.files[0].width / store.files[0].height
      store.setOriginalAspectRatio(ratio)
    }
  }, [store.files])

  const handlePresetSelect = useCallback(
    (preset: SizePreset) => {
      store.setWidth(preset.width)
      store.setHeight(preset.height)
      store.setOriginalAspectRatio(preset.width / preset.height)
    },
    [store]
  )

  const handleStartProcessing = async () => {
    if (store.files.length === 0 || !store.outputFolder) return

    store.setIsProcessing(true)
    setAppProcessing(true)
    store.setResult(null)

    try {
      let finalWidth = store.width
      let finalHeight = store.height

      // Handle percentage mode
      if (store.scaleMode === 'percentage' && store.files[0].width && store.files[0].height) {
        finalWidth = Math.round((store.files[0].width * store.scalePercentage) / 100)
        finalHeight = Math.round((store.files[0].height * store.scalePercentage) / 100)
      }

      const result = await window.electron.batchResize({
        files: store.files.map((f) => f.path),
        outputFolder: store.outputFolder,
        width: finalWidth,
        height: finalHeight,
        fit: store.scaleMode === 'maxFit' ? 'inside' : store.fit,
        kernel: store.kernel,
        format: store.format,
        quality: store.quality,
        preserveMetadata: store.preserveMetadata,
        suffix: store.suffix || undefined,
        prefix: store.prefix || undefined,
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

  const canProcess =
    store.files.length > 0 &&
    store.outputFolder &&
    (store.width || store.height || store.scaleMode === 'percentage')

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-glass-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground-primary flex items-center gap-2">
              <ImageIcon size={24} className="text-accent-primary" />
              Image Resizer
            </h1>
            <p className="text-sm text-foreground-muted mt-0.5">
              Resize images to exact dimensions or scale by percentage
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
            {store.isProcessing ? 'Processing...' : 'Start Resize'}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Source files section */}
          <Card>
            <CardHeader
              title="Source Images"
              description="Select the images you want to resize"
            />
            <CardContent>
              <AnimatePresence mode="wait">
                {store.files.length === 0 ? (
                  <FilePicker
                    onFilesSelected={(files) => store.setFiles(files)}
                    multiple
                    showFolderOption
                  />
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <FileList
                      files={store.files}
                      onRemove={(path) => store.removeFile(path)}
                      onClear={() => store.clearFiles()}
                      maxHeight="200px"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={async () => {
                          const paths = await window.electron.openFiles()
                          if (paths.length > 0) {
                            const files = await Promise.all(
                              paths.map(async (path) => {
                                const info = await window.electron.getFileInfo(path)
                                const metadata = await window.electron.getImageMetadata(path)
                                return {
                                  path,
                                  name: info?.name || '',
                                  extension: info?.extension || '',
                                  size: info?.size || 0,
                                  width: metadata?.width,
                                  height: metadata?.height,
                                }
                              })
                            )
                            store.addFiles(files)
                          }
                        }}
                      >
                        Add More Files
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Resize settings */}
          <Card>
            <CardHeader
              title="Resize Settings"
              description="Configure the output dimensions"
              action={
                <div className="flex items-center gap-2">
                  <Settings2 size={16} className="text-foreground-muted" />
                </div>
              }
            />
            <CardContent className="space-y-6">
              {/* Scale mode selector */}
              <ScaleModeSelector
                value={store.scaleMode}
                onChange={store.setScaleMode}
              />

              {/* Dimension inputs based on mode */}
              {store.scaleMode === 'pixels' && (
                <>
                  <DimensionInput
                    width={store.width}
                    height={store.height}
                    onWidthChange={store.setWidth}
                    onHeightChange={store.setHeight}
                    aspectRatioLocked={store.aspectRatioLocked}
                    onAspectRatioLockedChange={store.setAspectRatioLocked}
                  />
                  <SizePresets onSelect={handlePresetSelect} />
                </>
              )}

              {store.scaleMode === 'percentage' && (
                <div className="space-y-3">
                  <Select
                    label="Scale Percentage"
                    value={store.scalePercentage.toString()}
                    onChange={(value) => store.setScalePercentage(Number(value))}
                    options={[
                      { value: '25', label: '25%' },
                      { value: '30', label: '30%' },
                      { value: '35', label: '35%' },
                      { value: '40', label: '40%' },
                      { value: '45', label: '45%' },
                      { value: '50', label: '50%' },
                      { value: '55', label: '55%' },
                      { value: '60', label: '60%' },
                      { value: '65', label: '65%' },
                      { value: '70', label: '70%' },
                      { value: '75', label: '75%' },
                      { value: '80', label: '80%' },
                      { value: '85', label: '85%' },
                      { value: '90', label: '90%' },
                      { value: '95', label: '95%' },
                      { value: '100', label: '100%' },
                      { value: '125', label: '125%' },
                      { value: '150', label: '150%' },
                      { value: '175', label: '175%' },
                      { value: '200', label: '200%' },
                      { value: 'custom', label: 'Custom...' },
                    ]}
                  />
                  {!['25', '30', '35', '40', '45', '50', '55', '60', '65', '70', '75', '80', '85', '90', '95', '100', '125', '150', '175', '200'].includes(store.scalePercentage.toString()) && (
                    <div>
                      <label className="block text-sm font-medium text-foreground-secondary mb-1.5">
                        Custom Percentage
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="400"
                        value={store.scalePercentage}
                        onChange={(e) => store.setScalePercentage(Number(e.target.value))}
                        className="w-full h-10 px-3 rounded-lg bg-background-tertiary border border-glass-border text-foreground-primary placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 text-sm"
                      />
                    </div>
                  )}
                </div>
              )}

              {store.scaleMode === 'maxFit' && (
                <>
                  <DimensionInput
                    width={store.width}
                    height={store.height}
                    onWidthChange={store.setWidth}
                    onHeightChange={store.setHeight}
                    aspectRatioLocked={false}
                    onAspectRatioLockedChange={() => {}}
                  />
                  <p className="text-xs text-foreground-muted">
                    Images will be scaled to fit within these bounds while maintaining aspect ratio
                  </p>
                </>
              )}

              {/* Resize algorithm */}
              <Select
                label="Resize Algorithm"
                value={store.kernel}
                onChange={store.setKernel}
                options={KERNEL_OPTIONS}
              />
            </CardContent>
          </Card>

          {/* Output settings */}
          <Card>
            <CardHeader
              title="Output Settings"
              description="Configure the output format and location"
            />
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Output Format"
                  value={store.format}
                  onChange={store.setFormat}
                  options={FORMAT_OPTIONS}
                />
                <div>
                  <Slider
                    label="Quality"
                    value={store.quality}
                    onChange={store.setQuality}
                    min={1}
                    max={100}
                    formatValue={(v) => `${v}%`}
                  />
                </div>
              </div>

              <FolderPicker
                label="Output Folder"
                value={store.outputFolder}
                onChange={store.setOutputFolder}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground-secondary mb-1.5">
                    Filename Prefix
                  </label>
                  <input
                    type="text"
                    value={store.prefix}
                    onChange={(e) => store.setPrefix(e.target.value)}
                    placeholder="e.g., resized_"
                    className="w-full h-10 px-3 rounded-lg bg-background-tertiary border border-glass-border text-foreground-primary placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground-secondary mb-1.5">
                    Filename Suffix
                  </label>
                  <input
                    type="text"
                    value={store.suffix}
                    onChange={(e) => store.setSuffix(e.target.value)}
                    placeholder="e.g., _800x600"
                    className="w-full h-10 px-3 rounded-lg bg-background-tertiary border border-glass-border text-foreground-primary placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 text-sm"
                  />
                </div>
              </div>

              <Toggle
                checked={store.preserveMetadata}
                onChange={store.setPreserveMetadata}
                label="Preserve Metadata"
                description="Keep EXIF data and other metadata in the output files"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Processing modal */}
      <Modal
        isOpen={store.isProcessing}
        onClose={() => {}}
        title="Processing Images"
        showCloseButton={false}
      >
        {store.progress && (
          <ProcessingProgress
            currentFile={store.progress.currentFile}
            currentIndex={Math.floor(
              (store.progress.percentage / 100) * store.files.length
            )}
            totalFiles={store.files.length}
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
