import { useEffect } from 'react'
import { useAppStore } from '../stores/appStore'
import { useResizerStore } from '../stores/resizerStore'
import { useCropperStore } from '../stores/cropperStore'

export function useKeyboardShortcuts() {
  const { currentView, setCurrentView } = useAppStore()
  const resizerStore = useResizerStore()
  const cropperStore = useCropperStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      const isCtrl = e.ctrlKey || e.metaKey

      // Global shortcuts
      if (isCtrl) {
        switch (e.key) {
          case '1':
            e.preventDefault()
            setCurrentView('resizer')
            break
          case '2':
            e.preventDefault()
            setCurrentView('cropper')
            break
          case 'o':
            e.preventDefault()
            // Open files based on current view
            if (currentView === 'resizer') {
              window.electron.openFiles().then((paths) => {
                if (paths.length > 0) {
                  Promise.all(
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
                  ).then((files) => resizerStore.addFiles(files))
                }
              })
            } else if (currentView === 'cropper') {
              window.electron.openFiles().then((paths) => {
                if (paths.length > 0) {
                  Promise.all(
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
                  ).then((files) => cropperStore.addFiles(files))
                }
              })
            }
            break
        }
      }

      // Cropper-specific shortcuts
      if (currentView === 'cropper') {
        switch (e.key) {
          case '+':
          case '=':
            e.preventDefault()
            cropperStore.setZoom(Math.min(5, cropperStore.zoom + 0.1))
            break
          case '-':
            e.preventDefault()
            cropperStore.setZoom(Math.max(0.1, cropperStore.zoom - 0.1))
            break
          case '0':
            e.preventDefault()
            cropperStore.resetView()
            break
          case 'Escape':
            e.preventDefault()
            cropperStore.setSelectedRegionId(null)
            break
          case 'a':
            if (isCtrl) {
              e.preventDefault()
              // Select all regions (set first as selected)
              const regions = cropperStore.regions.filter((r) => r.id !== 'temp')
              if (regions.length > 0) {
                cropperStore.setSelectedRegionId(regions[0].id)
              }
            }
            break
        }

        // Arrow key nudging for selected region
        if (cropperStore.selectedRegionId) {
          const nudgeAmount = e.shiftKey ? 10 : 1
          const region = cropperStore.regions.find(
            (r) => r.id === cropperStore.selectedRegionId
          )

          if (region) {
            switch (e.key) {
              case 'ArrowUp':
                e.preventDefault()
                cropperStore.updateRegion(region.id, {
                  top: Math.max(0, region.top - nudgeAmount),
                })
                break
              case 'ArrowDown':
                e.preventDefault()
                cropperStore.updateRegion(region.id, {
                  top: region.top + nudgeAmount,
                })
                break
              case 'ArrowLeft':
                e.preventDefault()
                cropperStore.updateRegion(region.id, {
                  left: Math.max(0, region.left - nudgeAmount),
                })
                break
              case 'ArrowRight':
                e.preventDefault()
                cropperStore.updateRegion(region.id, {
                  left: region.left + nudgeAmount,
                })
                break
            }
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentView, setCurrentView, resizerStore, cropperStore])
}
