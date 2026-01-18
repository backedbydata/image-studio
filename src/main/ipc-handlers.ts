import { ipcMain, dialog, shell } from 'electron'
import { imageService } from './services/image-service'
import { fileService } from './services/file-service'

const IMAGE_FILTERS = [
  {
    name: 'Images',
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'tif', 'webp', 'heic', 'heif']
  }
]

export function registerIpcHandlers(): void {
  // File dialog handlers
  ipcMain.handle('dialog:openFiles', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: IMAGE_FILTERS
    })
    if (result.canceled) return []
    return result.filePaths
  })

  ipcMain.handle('dialog:openFolder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (result.canceled) return null
    return result.filePaths[0]
  })

  ipcMain.handle('dialog:selectOutputFolder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory']
    })
    if (result.canceled) return null
    return result.filePaths[0]
  })

  // File service handlers
  ipcMain.handle('files:getImagesFromFolder', async (_, folderPath: string) => {
    return fileService.getImagesFromFolder(folderPath)
  })

  ipcMain.handle('files:getFileInfo', async (_, filePath: string) => {
    return fileService.getFileInfo(filePath)
  })

  ipcMain.handle('files:openInExplorer', async (_, folderPath: string) => {
    return shell.openPath(folderPath)
  })

  // Image service handlers
  ipcMain.handle('image:getMetadata', async (_, filePath: string) => {
    return imageService.getMetadata(filePath)
  })

  ipcMain.handle('image:getThumbnail', async (_, filePath: string, size: number) => {
    return imageService.getThumbnail(filePath, size)
  })

  ipcMain.handle('image:getImageDataUrl', async (_, filePath: string, maxSize?: number, rotation?: number) => {
    return imageService.getImageDataUrl(filePath, maxSize, rotation)
  })

  ipcMain.handle('image:resize', async (event, options: {
    inputPath: string
    outputPath: string
    width?: number
    height?: number
    fit: 'fill' | 'contain' | 'cover' | 'inside' | 'outside'
    kernel: 'lanczos3' | 'lanczos2' | 'bilinear' | 'bicubic' | 'nearest'
    format: 'jpeg' | 'png' | 'webp' | 'tiff'
    quality: number
    preserveMetadata: boolean
  }) => {
    return imageService.resize(options)
  })

  ipcMain.handle('image:batchResize', async (event, options: {
    files: string[]
    outputFolder: string
    width?: number
    height?: number
    fit: 'fill' | 'contain' | 'cover' | 'inside' | 'outside'
    kernel: 'lanczos3' | 'lanczos2' | 'bilinear' | 'bicubic' | 'nearest'
    format: 'jpeg' | 'png' | 'webp' | 'tiff'
    quality: number
    preserveMetadata: boolean
    suffix?: string
    prefix?: string
  }) => {
    return imageService.batchResize(options, (progress) => {
      event.sender.send('processing:progress', progress)
    })
  })

  ipcMain.handle('image:crop', async (event, options: {
    inputPath: string
    outputPath: string
    regions: { left: number; top: number; width: number; height: number }[]
    format: 'jpeg' | 'png' | 'webp' | 'tiff'
    quality: number
    preserveMetadata: boolean
    namingTemplate: string
    rotation: number
  }) => {
    return imageService.crop(options, (progress) => {
      event.sender.send('processing:progress', progress)
    })
  })
}
