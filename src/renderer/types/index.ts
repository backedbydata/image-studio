export type ImageFormat = 'jpeg' | 'png' | 'webp' | 'tiff'
export type ResizeKernel = 'lanczos3' | 'lanczos2' | 'bilinear' | 'bicubic' | 'nearest'
export type ResizeFit = 'fill' | 'contain' | 'cover' | 'inside' | 'outside'
export type ScaleMode = 'pixels' | 'percentage' | 'maxFit'

export interface ImageFile {
  path: string
  name: string
  extension: string
  size: number
  width?: number
  height?: number
  thumbnail?: string
}

export interface ImageMetadata {
  width: number
  height: number
  format: string
  size: number
  hasAlpha: boolean
}

export interface ProcessingProgress {
  currentFile: string
  currentIndex: number
  totalFiles: number
  percentage: number
}

export interface ProcessingResult {
  success: boolean
  inputPath: string
  outputPath?: string
  error?: string
}

export interface BatchResult {
  completed: ProcessingResult[]
  failed: ProcessingResult[]
  totalTime: number
}

export interface CropRegion {
  id: string
  left: number
  top: number
  width: number
  height: number
}

export interface ResizeOptions {
  width?: number
  height?: number
  fit: ResizeFit
  kernel: ResizeKernel
  format: ImageFormat
  quality: number
  preserveMetadata: boolean
  suffix?: string
  prefix?: string
}

export interface CropOptions {
  format: ImageFormat
  quality: number
  preserveMetadata: boolean
  namingTemplate: string
}

export interface SizePreset {
  name: string
  width: number
  height: number
  category: 'standard' | 'social' | 'print'
}

export const SIZE_PRESETS: SizePreset[] = [
  { name: 'Full HD', width: 1920, height: 1080, category: 'standard' },
  { name: 'HD', width: 1280, height: 720, category: 'standard' },
  { name: '4K UHD', width: 3840, height: 2160, category: 'standard' },
  { name: 'Web Standard', width: 800, height: 600, category: 'standard' },
  { name: 'Instagram Square', width: 1080, height: 1080, category: 'social' },
  { name: 'Instagram Portrait', width: 1080, height: 1350, category: 'social' },
  { name: 'Instagram Story', width: 1080, height: 1920, category: 'social' },
  { name: 'Facebook/OG', width: 1200, height: 630, category: 'social' },
  { name: 'Twitter Header', width: 1500, height: 500, category: 'social' },
  { name: 'LinkedIn Banner', width: 1584, height: 396, category: 'social' },
  { name: 'YouTube Thumbnail', width: 1280, height: 720, category: 'social' },
]

export const FORMAT_OPTIONS: { value: ImageFormat; label: string; description: string }[] = [
  { value: 'jpeg', label: 'JPEG', description: 'Best for photos, smaller file size' },
  { value: 'png', label: 'PNG', description: 'Supports transparency, lossless' },
  { value: 'webp', label: 'WebP', description: 'Modern format, great compression' },
  { value: 'tiff', label: 'TIFF', description: 'High quality, larger files' },
]

export const KERNEL_OPTIONS: { value: ResizeKernel; label: string; description: string }[] = [
  { value: 'lanczos3', label: 'Lanczos3', description: 'Best quality (recommended)' },
  { value: 'lanczos2', label: 'Lanczos2', description: 'Good quality, faster' },
  { value: 'bicubic', label: 'Bicubic', description: 'Smooth interpolation' },
  { value: 'bilinear', label: 'Bilinear', description: 'Fast, decent quality' },
  { value: 'nearest', label: 'Nearest', description: 'Fastest, pixelated result' },
]
