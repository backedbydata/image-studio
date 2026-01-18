import { create } from 'zustand'

export type AppView = 'resizer' | 'cropper'

interface AppState {
  currentView: AppView
  sidebarExpanded: boolean
  isProcessing: boolean
  setCurrentView: (view: AppView) => void
  toggleSidebar: () => void
  setSidebarExpanded: (expanded: boolean) => void
  setIsProcessing: (processing: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'resizer',
  sidebarExpanded: true,
  isProcessing: false,
  setCurrentView: (view) => set({ currentView: view }),
  toggleSidebar: () => set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),
  setSidebarExpanded: (expanded) => set({ sidebarExpanded: expanded }),
  setIsProcessing: (processing) => set({ isProcessing: processing }),
}))
