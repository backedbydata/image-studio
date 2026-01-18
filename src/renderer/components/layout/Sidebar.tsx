import { motion, AnimatePresence } from 'framer-motion'
import { Scaling, Crop, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppStore, type AppView } from '../../stores/appStore'

interface NavItem {
  id: AppView
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { id: 'resizer', label: 'Resizer', icon: <Scaling size={22} /> },
  { id: 'cropper', label: 'Cropper', icon: <Crop size={22} /> },
]

export function Sidebar() {
  const { currentView, setCurrentView, sidebarExpanded, toggleSidebar } = useAppStore()

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarExpanded ? 200 : 64 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="h-full bg-background-secondary border-r border-glass-border flex flex-col"
    >
      {/* Navigation items */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <NavButton
                item={item}
                isActive={currentView === item.id}
                isExpanded={sidebarExpanded}
                onClick={() => setCurrentView(item.id)}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* Toggle button */}
      <div className="p-2 border-t border-glass-border">
        <motion.button
          onClick={toggleSidebar}
          className="w-full h-10 flex items-center justify-center rounded-lg text-foreground-muted hover:text-foreground-primary hover:bg-white/5 transition-colors"
          whileTap={{ scale: 0.95 }}
        >
          {sidebarExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </motion.button>
      </div>
    </motion.aside>
  )
}

interface NavButtonProps {
  item: NavItem
  isActive: boolean
  isExpanded: boolean
  onClick: () => void
}

function NavButton({ item, isActive, isExpanded, onClick }: NavButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 rounded-lg transition-all duration-200
        ${isExpanded ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center'}
        ${isActive
          ? 'bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 text-white border border-accent-primary/30'
          : 'text-foreground-secondary hover:text-foreground-primary hover:bg-white/5'
        }
      `}
      whileTap={{ scale: 0.98 }}
    >
      <span className={`${isActive ? 'text-accent-primary' : ''}`}>
        {item.icon}
      </span>
      <AnimatePresence mode="wait">
        {isExpanded && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15 }}
            className="text-sm font-medium whitespace-nowrap overflow-hidden"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
