import { useRef, useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useCropperStore } from '../../stores/cropperStore'
import type { CropRegion } from '../../types'

interface ImageCanvasProps {
  imagePath: string
}

export function ImageCanvas({ imagePath }: ImageCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 })
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)

  const {
    zoom,
    panX,
    panY,
    rotation,
    regions,
    selectedRegionId,
    isDrawing,
    drawStart,
    maskColor,
    setZoom,
    setPan,
    addRegion,
    updateRegion,
    setSelectedRegionId,
    setIsDrawing,
    setDrawStart,
    removeRegion,
  } = useCropperStore()

  // Track container size
  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current) {
        setContainerDimensions({
          width: canvasRef.current.clientWidth,
          height: canvasRef.current.clientHeight,
        })
      }
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Load image via IPC and get dimensions
  useEffect(() => {
    setImageLoaded(false)
    setImageDataUrl(null)

    const loadImage = async () => {
      try {
        // Get ORIGINAL image dimensions from metadata (not from resized data URL)
        const metadata = await window.electron.getImageMetadata(imagePath)
        if (!metadata) {
          console.error('Failed to get image metadata:', imagePath)
          return
        }
        console.log('Image dimensions from metadata:', metadata.width, 'x', metadata.height)
        setImageDimensions({ width: metadata.width, height: metadata.height })

        // Get image data URL from main process (use larger size for canvas, with rotation applied)
        const dataUrl = await window.electron.getImageDataUrl(imagePath, 4000, rotation)
        if (!dataUrl) {
          console.error('Failed to load image:', imagePath)
          return
        }

        setImageDataUrl(dataUrl)
        setImageLoaded(true)
      } catch (error) {
        console.error('Error loading image:', error)
        setImageLoaded(false)
      }
    }

    loadImage()
  }, [imagePath, rotation])

  // Calculate image display size and position
  const getImageDisplayInfo = useCallback(() => {
    if (!imageLoaded || containerDimensions.width === 0) {
      return { displayWidth: 0, displayHeight: 0, offsetX: 0, offsetY: 0, scale: 1 }
    }

    // Swap dimensions if rotated 90° or 270°
    const isRotated90or270 = rotation === 90 || rotation === 270
    const effectiveWidth = isRotated90or270 ? imageDimensions.height : imageDimensions.width
    const effectiveHeight = isRotated90or270 ? imageDimensions.width : imageDimensions.height

    const containerRatio = containerDimensions.width / containerDimensions.height
    const imageRatio = effectiveWidth / effectiveHeight

    let displayWidth: number
    let displayHeight: number

    if (imageRatio > containerRatio) {
      displayWidth = containerDimensions.width * 0.9
      displayHeight = displayWidth / imageRatio
    } else {
      displayHeight = containerDimensions.height * 0.9
      displayWidth = displayHeight * imageRatio
    }

    displayWidth *= zoom
    displayHeight *= zoom

    const offsetX = (containerDimensions.width - displayWidth) / 2 + panX
    const offsetY = (containerDimensions.height - displayHeight) / 2 + panY

    const scale = displayWidth / effectiveWidth

    return { displayWidth, displayHeight, offsetX, offsetY, scale }
  }, [imageLoaded, containerDimensions, imageDimensions, zoom, panX, panY, rotation])

  // Convert screen coordinates to image coordinates
  const screenToImage = useCallback(
    (screenX: number, screenY: number) => {
      const { offsetX, offsetY, scale } = getImageDisplayInfo()
      if (!canvasRef.current) return { x: 0, y: 0 }

      const rect = canvasRef.current.getBoundingClientRect()
      const x = (screenX - rect.left - offsetX) / scale
      const y = (screenY - rect.top - offsetY) / scale

      // Use effective dimensions based on rotation for clamping
      const isRotated90or270 = rotation === 90 || rotation === 270
      const effectiveWidth = isRotated90or270 ? imageDimensions.height : imageDimensions.width
      const effectiveHeight = isRotated90or270 ? imageDimensions.width : imageDimensions.height

      return {
        x: Math.max(0, Math.min(effectiveWidth, x)),
        y: Math.max(0, Math.min(effectiveHeight, y)),
      }
    },
    [getImageDisplayInfo, imageDimensions, rotation]
  )

  // Handle mouse events for drawing regions
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return // Only left click

    const { x, y } = screenToImage(e.clientX, e.clientY)

    // Check if clicking on existing region
    const clickedRegion = regions.find((r) => {
      return x >= r.left && x <= r.left + r.width && y >= r.top && y <= r.top + r.height
    })

    if (clickedRegion) {
      setSelectedRegionId(clickedRegion.id)
      return
    }

    // Start drawing new region
    setIsDrawing(true)
    setDrawStart({ x, y })
    setSelectedRegionId(null)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !drawStart) return

    const { x, y } = screenToImage(e.clientX, e.clientY)

    const left = Math.min(drawStart.x, x)
    const top = Math.min(drawStart.y, y)
    const width = Math.abs(x - drawStart.x)
    const height = Math.abs(y - drawStart.y)

    // Update preview region (temporary)
    const tempRegion = regions.find((r) => r.id === 'temp')
    if (tempRegion) {
      updateRegion('temp', { left, top, width, height })
    } else if (width > 5 && height > 5) {
      addRegion({ id: 'temp', left, top, width, height })
    }
  }

  const handleMouseUp = () => {
    if (!isDrawing) return

    const tempRegion = regions.find((r) => r.id === 'temp')
    if (tempRegion && tempRegion.width > 10 && tempRegion.height > 10) {
      // Convert temp region to permanent
      const newId = `region-${Date.now()}`
      // First remove the temp region, then add the permanent one
      removeRegion('temp')
      addRegion({
        id: newId,
        left: tempRegion.left,
        top: tempRegion.top,
        width: tempRegion.width,
        height: tempRegion.height,
      })
      setSelectedRegionId(newId)
    } else {
      removeRegion('temp')
    }

    setIsDrawing(false)
    setDrawStart(null)
  }

  // Handle zoom with mouse wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoom(Math.max(0.1, Math.min(5, zoom + delta)))
  }

  // Handle keyboard for deleting selected region
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedRegionId) {
        removeRegion(selectedRegionId)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedRegionId, removeRegion])

  const { displayWidth, displayHeight, offsetX, offsetY, scale } = getImageDisplayInfo()

  // Calculate effective dimensions for rotated image
  const isRotated90or270 = rotation === 90 || rotation === 270
  const effectiveDimensions = {
    width: isRotated90or270 ? imageDimensions.height : imageDimensions.width,
    height: isRotated90or270 ? imageDimensions.width : imageDimensions.height,
  }

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full bg-background-primary overflow-hidden cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {imageLoaded && (
        <div
          style={{
            position: 'absolute',
            left: offsetX,
            top: offsetY,
            width: displayWidth,
            height: displayHeight,
          }}
        >
          {/* Image */}
          <img
            ref={imageRef}
            src={imageDataUrl || ''}
            alt=""
            className="w-full h-full object-contain pointer-events-none"
            draggable={false}
          />

          {/* Mask regions */}
          {regions.map((region) => (
            <MaskRegion
              key={region.id}
              region={region}
              regions={regions}
              scale={scale}
              isSelected={region.id === selectedRegionId}
              maskColor={maskColor}
              onSelect={() => setSelectedRegionId(region.id)}
              onUpdate={(updates) => updateRegion(region.id, updates)}
              onRemove={() => removeRegion(region.id)}
              imageDimensions={effectiveDimensions}
            />
          ))}
        </div>
      )}

      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}

interface MaskRegionProps {
  region: CropRegion
  regions: CropRegion[]
  scale: number
  isSelected: boolean
  maskColor: string
  onSelect: () => void
  onUpdate: (updates: Partial<CropRegion>) => void
  onRemove: () => void
  imageDimensions: { width: number; height: number }
}

function MaskRegion({
  region,
  regions,
  scale,
  isSelected,
  maskColor,
  onSelect,
  onUpdate,
  onRemove,
  imageDimensions,
}: MaskRegionProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, left: 0, top: 0, width: 0, height: 0 })

  const handleMouseDown = (e: React.MouseEvent, action: 'move' | string) => {
    e.stopPropagation()
    onSelect()

    if (action === 'move') {
      setIsDragging(true)
    } else {
      setIsResizing(action)
    }

    setDragStart({
      x: e.clientX,
      y: e.clientY,
      left: region.left,
      top: region.top,
      width: region.width,
      height: region.height,
    })
  }

  useEffect(() => {
    if (!isDragging && !isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = (e.clientX - dragStart.x) / scale
      const deltaY = (e.clientY - dragStart.y) / scale

      if (isDragging) {
        const newLeft = Math.max(0, Math.min(imageDimensions.width - region.width, dragStart.left + deltaX))
        const newTop = Math.max(0, Math.min(imageDimensions.height - region.height, dragStart.top + deltaY))
        onUpdate({ left: newLeft, top: newTop })
      } else if (isResizing) {
        let newLeft = dragStart.left
        let newTop = dragStart.top
        let newWidth = dragStart.width
        let newHeight = dragStart.height

        if (isResizing.includes('e')) {
          newWidth = Math.max(20, dragStart.width + deltaX)
        }
        if (isResizing.includes('w')) {
          newWidth = Math.max(20, dragStart.width - deltaX)
          newLeft = dragStart.left + deltaX
        }
        if (isResizing.includes('s')) {
          newHeight = Math.max(20, dragStart.height + deltaY)
        }
        if (isResizing.includes('n')) {
          newHeight = Math.max(20, dragStart.height - deltaY)
          newTop = dragStart.top + deltaY
        }

        // Clamp to image bounds
        newLeft = Math.max(0, newLeft)
        newTop = Math.max(0, newTop)
        if (newLeft + newWidth > imageDimensions.width) {
          newWidth = imageDimensions.width - newLeft
        }
        if (newTop + newHeight > imageDimensions.height) {
          newHeight = imageDimensions.height - newTop
        }

        onUpdate({ left: newLeft, top: newTop, width: newWidth, height: newHeight })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, isResizing, dragStart, scale, onUpdate, region, imageDimensions])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: 'absolute',
        left: region.left * scale,
        top: region.top * scale,
        width: region.width * scale,
        height: region.height * scale,
      }}
      className={`
        border-2 cursor-move
        ${isSelected ? 'border-accent-primary' : 'border-white/70'}
        ${region.id === 'temp' ? 'border-dashed' : ''}
      `}
      onMouseDown={(e) => handleMouseDown(e, 'move')}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: maskColor }}
      />

      {/* Region number label */}
      {region.id !== 'temp' && (
        <div className="absolute -top-6 left-0 px-2 py-0.5 rounded text-xs font-medium bg-accent-primary text-white">
          {regions.filter(r => r.id !== 'temp').findIndex(r => r.id === region.id) + 1}
        </div>
      )}

      {/* Resize handles (only when selected) */}
      {isSelected && region.id !== 'temp' && (
        <>
          <ResizeHandle position="nw" onMouseDown={(e) => handleMouseDown(e, 'nw')} />
          <ResizeHandle position="ne" onMouseDown={(e) => handleMouseDown(e, 'ne')} />
          <ResizeHandle position="sw" onMouseDown={(e) => handleMouseDown(e, 'sw')} />
          <ResizeHandle position="se" onMouseDown={(e) => handleMouseDown(e, 'se')} />
          <ResizeHandle position="n" onMouseDown={(e) => handleMouseDown(e, 'n')} />
          <ResizeHandle position="s" onMouseDown={(e) => handleMouseDown(e, 's')} />
          <ResizeHandle position="e" onMouseDown={(e) => handleMouseDown(e, 'e')} />
          <ResizeHandle position="w" onMouseDown={(e) => handleMouseDown(e, 'w')} />

          {/* Delete button */}
          <button
            className="absolute -top-6 -right-1 w-5 h-5 rounded bg-accent-error text-white flex items-center justify-center text-xs hover:bg-accent-error/80"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
          >
            ×
          </button>
        </>
      )}

      {/* Dimensions display */}
      {isSelected && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-xs font-mono bg-background-secondary text-foreground-primary whitespace-nowrap">
          {Math.round(region.width)} × {Math.round(region.height)}
        </div>
      )}
    </motion.div>
  )
}

interface ResizeHandleProps {
  position: string
  onMouseDown: (e: React.MouseEvent) => void
}

function ResizeHandle({ position, onMouseDown }: ResizeHandleProps) {
  const positionStyles: Record<string, string> = {
    nw: 'top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nw-resize',
    ne: 'top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-ne-resize',
    sw: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-sw-resize',
    se: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-se-resize',
    n: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-n-resize',
    s: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-s-resize',
    e: 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2 cursor-e-resize',
    w: 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 cursor-w-resize',
  }

  return (
    <div
      className={`absolute w-3 h-3 bg-white border border-accent-primary rounded-sm ${positionStyles[position]}`}
      onMouseDown={onMouseDown}
    />
  )
}
