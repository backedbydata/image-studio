import { promises as fs } from 'fs'
import { join, extname, basename } from 'path'

const SUPPORTED_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.tif', '.webp', '.heic', '.heif'
])

export interface FileInfo {
  path: string
  name: string
  extension: string
  size: number
  modifiedAt: Date
}

export const fileService = {
  async getImagesFromFolder(folderPath: string): Promise<string[]> {
    try {
      const entries = await fs.readdir(folderPath, { withFileTypes: true })
      const imageFiles: string[] = []

      for (const entry of entries) {
        if (entry.isFile()) {
          const ext = extname(entry.name).toLowerCase()
          if (SUPPORTED_EXTENSIONS.has(ext)) {
            imageFiles.push(join(folderPath, entry.name))
          }
        }
      }

      return imageFiles.sort()
    } catch (error) {
      console.error('Error reading folder:', error)
      return []
    }
  },

  async getFileInfo(filePath: string): Promise<FileInfo | null> {
    try {
      const stats = await fs.stat(filePath)
      const name = basename(filePath)
      const extension = extname(filePath).toLowerCase()

      return {
        path: filePath,
        name,
        extension,
        size: stats.size,
        modifiedAt: stats.mtime
      }
    } catch (error) {
      console.error('Error getting file info:', error)
      return null
    }
  },

  async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true })
    } catch (error) {
      // Directory already exists
    }
  },

  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  },

  getOutputFileName(
    originalPath: string,
    format: string,
    options?: { suffix?: string; prefix?: string; index?: number }
  ): string {
    const name = basename(originalPath, extname(originalPath))
    const prefix = options?.prefix || ''
    const suffix = options?.suffix || ''
    const indexPart = options?.index !== undefined ? `_${options.index}` : ''

    return `${prefix}${name}${suffix}${indexPart}.${format}`
  }
}
