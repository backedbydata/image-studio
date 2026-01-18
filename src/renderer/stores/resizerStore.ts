import { create } from 'zustand'
import type { ImageFile, ImageFormat, ResizeKernel, ResizeFit, ScaleMode, BatchResult } from '../types'

interface ResizerState {
  // Source files
  files: ImageFile[]

  // Resize settings
  width: number | undefined
  height: number | undefined
  aspectRatioLocked: boolean
  originalAspectRatio: number | null
  scaleMode: ScaleMode
  scalePercentage: number
  fit: ResizeFit
  kernel: ResizeKernel

  // Output settings
  format: ImageFormat
  quality: number
  outputFolder: string | null
  suffix: string
  prefix: string
  preserveMetadata: boolean

  // Processing state
  isProcessing: boolean
  progress: { currentFile: string; percentage: number } | null
  result: BatchResult | null

  // Actions
  setFiles: (files: ImageFile[]) => void
  addFiles: (files: ImageFile[]) => void
  removeFile: (path: string) => void
  clearFiles: () => void
  setWidth: (width: number | undefined) => void
  setHeight: (height: number | undefined) => void
  setAspectRatioLocked: (locked: boolean) => void
  setOriginalAspectRatio: (ratio: number | null) => void
  setScaleMode: (mode: ScaleMode) => void
  setScalePercentage: (percentage: number) => void
  setFit: (fit: ResizeFit) => void
  setKernel: (kernel: ResizeKernel) => void
  setFormat: (format: ImageFormat) => void
  setQuality: (quality: number) => void
  setOutputFolder: (folder: string | null) => void
  setSuffix: (suffix: string) => void
  setPrefix: (prefix: string) => void
  setPreserveMetadata: (preserve: boolean) => void
  setIsProcessing: (processing: boolean) => void
  setProgress: (progress: { currentFile: string; percentage: number } | null) => void
  setResult: (result: BatchResult | null) => void
  reset: () => void
}

const initialState = {
  files: [],
  width: undefined,
  height: undefined,
  aspectRatioLocked: true,
  originalAspectRatio: null,
  scaleMode: 'pixels' as ScaleMode,
  scalePercentage: 100,
  fit: 'inside' as ResizeFit,
  kernel: 'lanczos3' as ResizeKernel,
  format: 'jpeg' as ImageFormat,
  quality: 100,
  outputFolder: null,
  suffix: '',
  prefix: '',
  preserveMetadata: true,
  isProcessing: false,
  progress: null,
  result: null,
}

export const useResizerStore = create<ResizerState>((set, get) => ({
  ...initialState,

  setFiles: (files) => set({ files }),
  addFiles: (newFiles) => set((state) => {
    const existingPaths = new Set(state.files.map(f => f.path))
    const uniqueNewFiles = newFiles.filter(f => !existingPaths.has(f.path))
    return { files: [...state.files, ...uniqueNewFiles] }
  }),
  removeFile: (path) => set((state) => ({
    files: state.files.filter(f => f.path !== path)
  })),
  clearFiles: () => set({ files: [] }),

  setWidth: (width) => {
    const state = get()
    if (state.aspectRatioLocked && state.originalAspectRatio && width !== undefined) {
      const height = Math.round(width / state.originalAspectRatio)
      set({ width, height })
    } else {
      set({ width })
    }
  },

  setHeight: (height) => {
    const state = get()
    if (state.aspectRatioLocked && state.originalAspectRatio && height !== undefined) {
      const width = Math.round(height * state.originalAspectRatio)
      set({ width, height })
    } else {
      set({ height })
    }
  },

  setAspectRatioLocked: (locked) => set({ aspectRatioLocked: locked }),
  setOriginalAspectRatio: (ratio) => set({ originalAspectRatio: ratio }),
  setScaleMode: (mode) => set({ scaleMode: mode }),
  setScalePercentage: (percentage) => set({ scalePercentage: percentage }),
  setFit: (fit) => set({ fit }),
  setKernel: (kernel) => set({ kernel }),
  setFormat: (format) => set({ format }),
  setQuality: (quality) => set({ quality }),
  setOutputFolder: (folder) => set({ outputFolder: folder }),
  setSuffix: (suffix) => set({ suffix }),
  setPrefix: (prefix) => set({ prefix }),
  setPreserveMetadata: (preserve) => set({ preserveMetadata: preserve }),
  setIsProcessing: (processing) => set({ isProcessing: processing }),
  setProgress: (progress) => set({ progress }),
  setResult: (result) => set({ result }),
  reset: () => set(initialState),
}))
