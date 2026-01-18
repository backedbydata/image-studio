import { create } from 'zustand'
import type { ImageFile, ImageFormat, CropRegion, BatchResult } from '../types'

interface CropperState {
  // Source files
  files: ImageFile[]
  currentFileIndex: number

  // Canvas state
  zoom: number
  panX: number
  panY: number
  rotation: number // 0, 90, 180, 270

  // Mask regions
  regions: CropRegion[]
  selectedRegionId: string | null
  isDrawing: boolean
  drawStart: { x: number; y: number } | null

  // Mask settings
  maskAspectRatio: number | null
  maskColor: string

  // Output settings
  format: ImageFormat
  quality: number
  outputFolder: string | null
  namingTemplate: string
  preserveMetadata: boolean

  // Grid overlay
  showGrid: boolean
  gridType: 'thirds' | 'golden' | 'none'

  // Processing state
  isProcessing: boolean
  progress: { currentFile: string; percentage: number } | null
  result: BatchResult | null

  // Actions
  setFiles: (files: ImageFile[]) => void
  addFiles: (files: ImageFile[]) => void
  removeFile: (path: string) => void
  clearFiles: () => void
  setCurrentFileIndex: (index: number) => void
  setZoom: (zoom: number) => void
  setPan: (x: number, y: number) => void
  setRotation: (rotation: number) => void
  resetView: () => void

  addRegion: (region: CropRegion) => void
  updateRegion: (id: string, updates: Partial<CropRegion>) => void
  removeRegion: (id: string) => void
  clearRegions: () => void
  setSelectedRegionId: (id: string | null) => void
  setIsDrawing: (drawing: boolean) => void
  setDrawStart: (start: { x: number; y: number } | null) => void

  setMaskAspectRatio: (ratio: number | null) => void
  setMaskColor: (color: string) => void

  setFormat: (format: ImageFormat) => void
  setQuality: (quality: number) => void
  setOutputFolder: (folder: string | null) => void
  setNamingTemplate: (template: string) => void
  setPreserveMetadata: (preserve: boolean) => void

  setShowGrid: (show: boolean) => void
  setGridType: (type: 'thirds' | 'golden' | 'none') => void

  setIsProcessing: (processing: boolean) => void
  setProgress: (progress: { currentFile: string; percentage: number } | null) => void
  setResult: (result: BatchResult | null) => void

  reset: () => void
}

const initialState = {
  files: [],
  currentFileIndex: 0,
  zoom: 1,
  panX: 0,
  panY: 0,
  rotation: 0,
  regions: [],
  selectedRegionId: null,
  isDrawing: false,
  drawStart: null,
  maskAspectRatio: null,
  maskColor: 'rgba(99, 102, 241, 0.3)',
  format: 'jpeg' as ImageFormat,
  quality: 95,
  outputFolder: null,
  namingTemplate: '{original}_{index}',
  preserveMetadata: true,
  showGrid: false,
  gridType: 'thirds' as const,
  isProcessing: false,
  progress: null,
  result: null,
}

export const useCropperStore = create<CropperState>((set) => ({
  ...initialState,

  setFiles: (files) => set({ files, currentFileIndex: 0, regions: [], rotation: 0, zoom: 1, panX: 0, panY: 0 }),
  addFiles: (newFiles) => set((state) => {
    const existingPaths = new Set(state.files.map(f => f.path))
    const uniqueNewFiles = newFiles.filter(f => !existingPaths.has(f.path))
    return { files: [...state.files, ...uniqueNewFiles] }
  }),
  removeFile: (path) => set((state) => {
    const newFiles = state.files.filter(f => f.path !== path)
    const newIndex = Math.min(state.currentFileIndex, Math.max(0, newFiles.length - 1))
    return { files: newFiles, currentFileIndex: newIndex, regions: [] }
  }),
  clearFiles: () => set({ files: [], currentFileIndex: 0, regions: [] }),
  setCurrentFileIndex: (index) => set({ currentFileIndex: index, regions: [], zoom: 1, panX: 0, panY: 0, rotation: 0 }),

  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),
  setPan: (x, y) => set({ panX: x, panY: y }),
  setRotation: (rotation) => set({ rotation: rotation % 360, regions: [] }),
  resetView: () => set({ zoom: 1, panX: 0, panY: 0, rotation: 0 }),

  addRegion: (region) => set((state) => ({
    regions: [...state.regions, region],
    selectedRegionId: region.id
  })),
  updateRegion: (id, updates) => set((state) => ({
    regions: state.regions.map(r => r.id === id ? { ...r, ...updates } : r)
  })),
  removeRegion: (id) => set((state) => ({
    regions: state.regions.filter(r => r.id !== id),
    selectedRegionId: state.selectedRegionId === id ? null : state.selectedRegionId
  })),
  clearRegions: () => set({ regions: [], selectedRegionId: null }),
  setSelectedRegionId: (id) => set({ selectedRegionId: id }),
  setIsDrawing: (drawing) => set({ isDrawing: drawing }),
  setDrawStart: (start) => set({ drawStart: start }),

  setMaskAspectRatio: (ratio) => set({ maskAspectRatio: ratio }),
  setMaskColor: (color) => set({ maskColor: color }),

  setFormat: (format) => set({ format }),
  setQuality: (quality) => set({ quality }),
  setOutputFolder: (folder) => set({ outputFolder: folder }),
  setNamingTemplate: (template) => set({ namingTemplate: template }),
  setPreserveMetadata: (preserve) => set({ preserveMetadata: preserve }),

  setShowGrid: (show) => set({ showGrid: show }),
  setGridType: (type) => set({ gridType: type }),

  setIsProcessing: (processing) => set({ isProcessing: processing }),
  setProgress: (progress) => set({ progress }),
  setResult: (result) => set({ result }),

  reset: () => set(initialState),
}))
