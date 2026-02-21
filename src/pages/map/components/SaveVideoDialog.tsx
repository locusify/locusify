import type { PendingVideo } from '@/hooks/useVideoRecorder'
import { m } from 'motion/react'
import { useTranslation } from 'react-i18next'

interface SaveVideoDialogProps {
  pendingVideo: PendingVideo
  onSave: () => void
  onDiscard: () => void
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function SaveVideoDialog({ pendingVideo, onSave, onDiscard }: SaveVideoDialogProps) {
  const { t } = useTranslation()

  return (
    <m.div
      className="absolute inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Card */}
      <m.div
        className="bg-material-thick border-fill-tertiary relative w-72 overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-[120px] sm:w-80"
        initial={{ scale: 0.92, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 12 }}
        transition={{ duration: 0.25, type: 'spring', stiffness: 400, damping: 28 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-400/15">
            <i className="i-mingcute-video-camera-line text-xl text-sky-400" />
          </div>
          <div className="min-w-0">
            <p className="text-text text-sm font-semibold leading-tight">
              {t('workspace.recording.ready.title')}
            </p>
            <p className="text-text-secondary mt-0.5 text-xs">
              {formatBytes(pendingVideo.blob.size)}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="bg-fill-tertiary mx-4 h-px" />

        {/* Actions */}
        <div className="flex gap-2 p-4">
          <button
            type="button"
            onClick={onSave}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-sky-400 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 active:opacity-80"
          >
            <i className="i-mingcute-download-2-line text-base" />
            {t('workspace.recording.save')}
          </button>
          <button
            type="button"
            onClick={onDiscard}
            className="border-fill-tertiary text-text-secondary hover:text-text rounded-xl border px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
          >
            {t('workspace.recording.discard')}
          </button>
        </div>
      </m.div>
    </m.div>
  )
}
