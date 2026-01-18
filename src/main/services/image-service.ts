import sharp from 'sharp'
import { join, basename, extname } from 'path'
import { fileService } from './file-service'

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

export const imageService = {
  async getMetadata(filePath: string): Promise<ImageMetadata | null> {
    try {
      // Get original metadata first
      const originalMeta = await sharp(filePath).metadata()
      const stats = await fileService.getFileInfo(filePath)

      // Apply EXIF auto-rotation and convert to buffer to get actual rotated dimensions
      const rotatedBuffer = await sharp(filePath).rotate().toBuffer()
      const rotatedMeta = await sharp(rotatedBuffer).metadata()

      console.log('getMetadata - Original:', originalMeta.width, 'x', originalMeta.height,
                  '-> After rotation:', rotatedMeta.width, 'x', rotatedMeta.height)

      return {
        width: rotatedMeta.width || 0,
        height: rotatedMeta.height || 0,
        format: originalMeta.format || 'unknown',
        size: stats?.size || 0,
        hasAlpha: originalMeta.hasAlpha || false
      }
    } catch (error) {
      console.error('Error getting metadata:', error)
      return null
    }
  },

  async getThumbnail(filePath: string, size: number = 100): Promise<string | null> {
    try {
      const buffer = await sharp(filePath)
        .rotate() // Apply EXIF auto-rotation
        .resize(size, size, { fit: 'inside' })
        .jpeg({ quality: 80 })
        .toBuffer()

      return `data:image/jpeg;base64,${buffer.toString('base64')}`
    } catch (error) {
      console.error('Error generating thumbnail:', error)
      return null
    }
  },

  async getImageDataUrl(filePath: string, maxSize: number = 2000, rotation: number = 0): Promise<string | null> {
    try {
      const metadata = await sharp(filePath).metadata()
      const format = metadata.format || 'jpeg'

      // Resize if image is too large for performance
      let image = sharp(filePath)

      // First apply EXIF auto-rotation to correct orientation
      image = image.rotate()

      // Then apply manual rotation if specified
      if (rotation && rotation !== 0) {
        image = image.rotate(rotation)
      }

      if (metadata.width && metadata.height) {
        if (metadata.width > maxSize || metadata.height > maxSize) {
          image = image.resize(maxSize, maxSize, { fit: 'inside' })
        }
      }

      const buffer = await image.toBuffer()
      const mimeType = format === 'jpeg' ? 'image/jpeg' : `image/${format}`

      return `data:${mimeType};base64,${buffer.toString('base64')}`
    } catch (error) {
      console.error('Error generating image data URL:', error)
      return null
    }
  },

  async resize(options: {
    inputPath: string
    outputPath: string
    width?: number
    height?: number
    fit: 'fill' | 'contain' | 'cover' | 'inside' | 'outside'
    kernel: 'lanczos3' | 'lanczos2' | 'bilinear' | 'bicubic' | 'nearest'
    format: 'jpeg' | 'png' | 'webp' | 'tiff'
    quality: number
    preserveMetadata: boolean
  }): Promise<ProcessingResult> {
    try {
      let image = sharp(options.inputPath)

      if (options.preserveMetadata) {
        image = image.withMetadata()
      }

      image = image.resize(options.width, options.height, {
        fit: options.fit,
        kernel: options.kernel
      })

      // Apply format-specific settings
      switch (options.format) {
        case 'jpeg':
          image = image.jpeg({ quality: options.quality })
          break
        case 'png':
          image = image.png({ compressionLevel: Math.floor((100 - options.quality) / 11) })
          break
        case 'webp':
          image = image.webp({ quality: options.quality })
          break
        case 'tiff':
          image = image.tiff({ quality: options.quality })
          break
      }

      await image.toFile(options.outputPath)

      return {
        success: true,
        inputPath: options.inputPath,
        outputPath: options.outputPath
      }
    } catch (error) {
      return {
        success: false,
        inputPath: options.inputPath,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  async batchResize(
    options: {
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
    },
    onProgress: (progress: ProcessingProgress) => void
  ): Promise<BatchResult> {
    const startTime = Date.now()
    const completed: ProcessingResult[] = []
    const failed: ProcessingResult[] = []

    await fileService.ensureDirectory(options.outputFolder)

    for (let i = 0; i < options.files.length; i++) {
      const filePath = options.files[i]
      const outputFileName = fileService.getOutputFileName(filePath, options.format, {
        suffix: options.suffix,
        prefix: options.prefix
      })
      const outputPath = join(options.outputFolder, outputFileName)

      onProgress({
        currentFile: basename(filePath),
        currentIndex: i,
        totalFiles: options.files.length,
        percentage: (i / options.files.length) * 100
      })

      const result = await this.resize({
        inputPath: filePath,
        outputPath,
        width: options.width,
        height: options.height,
        fit: options.fit,
        kernel: options.kernel,
        format: options.format,
        quality: options.quality,
        preserveMetadata: options.preserveMetadata
      })

      if (result.success) {
        completed.push(result)
      } else {
        failed.push(result)
      }
    }

    onProgress({
      currentFile: 'Complete',
      currentIndex: options.files.length,
      totalFiles: options.files.length,
      percentage: 100
    })

    return {
      completed,
      failed,
      totalTime: Date.now() - startTime
    }
  },

  async crop(
    options: {
      inputPath: string
      outputPath: string
      regions: { left: number; top: number; width: number; height: number }[]
      format: 'jpeg' | 'png' | 'webp' | 'tiff'
      quality: number
      preserveMetadata: boolean
      namingTemplate: string
      rotation: number
    },
    onProgress: (progress: ProcessingProgress) => void
  ): Promise<BatchResult> {
    const startTime = Date.now()
    const completed: ProcessingResult[] = []
    const failed: ProcessingResult[] = []

    const originalName = basename(options.inputPath, extname(options.inputPath))
    const outputDir = options.outputPath

    await fileService.ensureDirectory(outputDir)

    for (let i = 0; i < options.regions.length; i++) {
      const region = options.regions[i]

      onProgress({
        currentFile: `Region ${i + 1}`,
        currentIndex: i,
        totalFiles: options.regions.length,
        percentage: (i / options.regions.length) * 100
      })

      try {
        console.log('Processing region', i + 1, ':', {
          left: Math.round(region.left),
          top: Math.round(region.top),
          width: Math.round(region.width),
          height: Math.round(region.height),
          rotation: options.rotation
        })

        // Build the rotation pipeline
        let rotationPipeline = sharp(options.inputPath).rotate()

        if (options.rotation && options.rotation !== 0) {
          rotationPipeline = rotationPipeline.rotate(options.rotation)
        }

        // Convert to buffer to get the rotated image data
        const rotatedBuffer = await rotationPipeline.toBuffer()

        // Log the dimensions of the rotated image
        const rotatedMeta = await sharp(rotatedBuffer).metadata()
        console.log('Rotated image dimensions:', rotatedMeta.width, 'x', rotatedMeta.height)

        // Now extract from the rotated buffer
        let image = sharp(rotatedBuffer)

        if (options.preserveMetadata) {
          image = image.withMetadata()
        }

        image = image.extract({
          left: Math.round(region.left),
          top: Math.round(region.top),
          width: Math.round(region.width),
          height: Math.round(region.height)
        })

        // Apply format-specific settings
        switch (options.format) {
          case 'jpeg':
            image = image.jpeg({ quality: options.quality })
            break
          case 'png':
            image = image.png({ compressionLevel: Math.floor((100 - options.quality) / 11) })
            break
          case 'webp':
            image = image.webp({ quality: options.quality })
            break
          case 'tiff':
            image = image.tiff({ quality: options.quality })
            break
        }

        // Generate output filename from template
        const outputFileName = options.namingTemplate
          .replace('{original}', originalName)
          .replace('{index}', String(i + 1).padStart(2, '0'))
          + `.${options.format}`

        const outputFilePath = join(outputDir, outputFileName)

        await image.toFile(outputFilePath)

        completed.push({
          success: true,
          inputPath: options.inputPath,
          outputPath: outputFilePath
        })
      } catch (error) {
        failed.push({
          success: false,
          inputPath: options.inputPath,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    onProgress({
      currentFile: 'Complete',
      currentIndex: options.regions.length,
      totalFiles: options.regions.length,
      percentage: 100
    })

    return {
      completed,
      failed,
      totalTime: Date.now() - startTime
    }
  }
}
