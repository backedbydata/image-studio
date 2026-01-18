import { contextBridge, ipcRenderer } from 'electron'

export type ImageFormat = 'jpeg' | 'png' | 'webp' | 'tiff'
export type ResizeKernel = 'lanczos3' | 'lanczos2' | 'bilinear' | 'bicubic' | 'nearest'
export type ResizeFit = 'fill' | 'contain' | 'cover' | 'inside' | 'outside'

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
  left: number
  top: number
  width: number
  height: number
}

const api = {
  // Window controls
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized') as Promise<boolean>,
  onMaximizedChange: (callback: (maximized: boolean) => void) => {
    const handler = (_: unknown, maximized: boolean) => callback(maximized)
    ipcRenderer.on('window:maximized', handler)
    return () => ipcRenderer.removeListener('window:maximized', handler)
  },

  // File dialogs
  openFiles: () => ipcRenderer.invoke('dialog:openFiles') as Promise<string[]>,
  openFolder: () => ipcRenderer.invoke('dialog:openFolder') as Promise<string | null>,
  selectOutputFolder: () => ipcRenderer.invoke('dialog:selectOutputFolder') as Promise<string | null>,

  // File operations
  getImagesFromFolder: (folderPath: string) =>
    ipcRenderer.invoke('files:getImagesFromFolder', folderPath) as Promise<string[]>,
  getFileInfo: (filePath: string) =>
    ipcRenderer.invoke('files:getFileInfo', filePath) as Promise<{
      path: string
      name: string
      extension: string
      size: number
      modifiedAt: Date
    } | null>,
  openInExplorer: (folderPath: string) =>
    ipcRenderer.invoke('files:openInExplorer', folderPath) as Promise<string>,

  // Image operations
  getImageMetadata: (filePath: string) =>
    ipcRenderer.invoke('image:getMetadata', filePath) as Promise<ImageMetadata | null>,
  getThumbnail: (filePath: string, size?: number) =>
    ipcRenderer.invoke('image:getThumbnail', filePath, size || 100) as Promise<string | null>,
  getImageDataUrl: (filePath: string, maxSize?: number, rotation?: number) =>
    ipcRenderer.invoke('image:getImageDataUrl', filePath, maxSize, rotation) as Promise<string | null>,

  // Resize operations
  resizeImage: (options: {
    inputPath: string
    outputPath: string
    width?: number
    height?: number
    fit: ResizeFit
    kernel: ResizeKernel
    format: ImageFormat
    quality: number
    preserveMetadata: boolean
  }) => ipcRenderer.invoke('image:resize', options) as Promise<ProcessingResult>,

  batchResize: (options: {
    files: string[]
    outputFolder: string
    width?: number
    height?: number
    fit: ResizeFit
    kernel: ResizeKernel
    format: ImageFormat
    quality: number
    preserveMetadata: boolean
    suffix?: string
    prefix?: string
  }) => ipcRenderer.invoke('image:batchResize', options) as Promise<BatchResult>,

  // Crop operations
  cropImage: (options: {
    inputPath: string
    outputPath: string
    regions: CropRegion[]
    format: ImageFormat
    quality: number
    preserveMetadata: boolean
    namingTemplate: string
    rotation: number
  }) => ipcRenderer.invoke('image:crop', options) as Promise<BatchResult>,

  // Progress events
  onProgress: (callback: (progress: ProcessingProgress) => void) => {
    const handler = (_: unknown, progress: ProcessingProgress) => callback(progress)
    ipcRenderer.on('processing:progress', handler)
    return () => ipcRenderer.removeListener('processing:progress', handler)
  }
}

contextBridge.exposeInMainWorld('electron', api)

export type ElectronAPI = typeof api
