import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Clock, FolderOpen } from 'lucide-react'
import { Button } from './Button'
import { Modal, ModalFooter } from './Modal'
import type { BatchResult } from '../../types'

interface ProcessingReportProps {
  isOpen: boolean
  onClose: () => void
  result: BatchResult | null
  outputFolder?: string | null
}

export function ProcessingReport({
  isOpen,
  onClose,
  result,
  outputFolder,
}: ProcessingReportProps) {
  if (!result) return null

  const successCount = result.completed.length
  const failCount = result.failed.length
  const totalTime = result.totalTime / 1000 // Convert to seconds

  const openOutputFolder = () => {
    if (outputFolder) {
      window.electron.openInExplorer(outputFolder)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Processing Complete" size="lg">
      <div className="space-y-6">
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            icon={<CheckCircle2 size={24} />}
            label="Successful"
            value={successCount}
            color="text-accent-success"
          />
          <StatCard
            icon={<XCircle size={24} />}
            label="Failed"
            value={failCount}
            color="text-accent-error"
          />
          <StatCard
            icon={<Clock size={24} />}
            label="Time"
            value={`${totalTime.toFixed(1)}s`}
            color="text-accent-primary"
          />
        </div>

        {/* Failed files list */}
        {result.failed.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground-secondary">
              Failed Files ({failCount})
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {result.failed.map((item, index) => (
                <motion.div
                  key={item.inputPath}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-accent-error/10 border border-accent-error/20"
                >
                  <XCircle size={16} className="text-accent-error flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-foreground-primary truncate">
                      {item.inputPath.split(/[\\/]/).pop()}
                    </div>
                    <div className="text-xs text-foreground-muted mt-0.5">
                      {item.error || 'Unknown error'}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Success message */}
        {result.completed.length > 0 && result.failed.length === 0 && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-accent-success/10 border border-accent-success/20">
            <CheckCircle2 size={24} className="text-accent-success" />
            <div>
              <div className="text-sm font-medium text-foreground-primary">
                All files processed successfully!
              </div>
              <div className="text-xs text-foreground-muted mt-0.5">
                {successCount} file{successCount !== 1 ? 's' : ''} saved to output folder
              </div>
            </div>
          </div>
        )}
      </div>

      <ModalFooter>
        {outputFolder && (
          <Button variant="secondary" leftIcon={<FolderOpen size={16} />} onClick={openOutputFolder}>
            Open Folder
          </Button>
        )}
        <Button variant="primary" onClick={onClose}>
          Done
        </Button>
      </ModalFooter>
    </Modal>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className="p-4 rounded-lg bg-background-tertiary/50 border border-glass-border text-center">
      <div className={`flex justify-center mb-2 ${color}`}>{icon}</div>
      <div className="text-2xl font-bold text-foreground-primary">{value}</div>
      <div className="text-xs text-foreground-muted mt-1">{label}</div>
    </div>
  )
}
