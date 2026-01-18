import { AnimatePresence, motion } from 'framer-motion'
import { Layout } from './components/layout/Layout'
import { ResizerPage } from './components/resizer/ResizerPage'
import { CropperPage } from './components/cropper/CropperPage'
import { useAppStore } from './stores/appStore'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'

export default function App() {
  const { currentView } = useAppStore()

  // Enable global keyboard shortcuts
  useKeyboardShortcuts()

  return (
    <Layout>
      <AnimatePresence mode="wait">
        {currentView === 'resizer' && (
          <motion.div
            key="resizer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <ResizerPage />
          </motion.div>
        )}
        {currentView === 'cropper' && (
          <motion.div
            key="cropper"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <CropperPage />
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  )
}
