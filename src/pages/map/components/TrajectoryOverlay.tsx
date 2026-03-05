import { useCallback, useState } from 'react'
import { useReplayStore } from '@/stores/replayStore'
import { ReplayControls } from './replay/ReplayControls'
import { ReplayIntroOverlay } from './replay/ReplayIntroOverlay'

interface TrajectoryOverlayProps {
  onStartReplay?: () => Promise<boolean>
}

/**
 * Overlay container for replay mode.
 * Contains the intro animation and bottom controls.
 * Photo card is now rendered as a map Marker (see MapLibre.tsx).
 */
export function TrajectoryOverlay({ onStartReplay }: TrajectoryOverlayProps) {
  const status = useReplayStore(s => s.status)
  const togglePlayPause = useReplayStore(s => s.togglePlayPause)
  const recordingActive = useReplayStore(s => s.recordingActive)
  const [introVisible, setIntroVisible] = useState(false)

  // Every play click (initial start, resume, restart) goes through the intro.
  const handlePlayClick = useCallback(async () => {
    if (status === 'configuring') {
      const started = await onStartReplay?.()
      if (!started)
        return // user denied permission, don't start
    }
    setIntroVisible(true)
  }, [status, onStartReplay])

  const handleIntroComplete = useCallback(() => {
    setIntroVisible(false)
    togglePlayPause()
  }, [togglePlayPause])

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-end">
      {/* Opening logo animation — pointer-events-auto so it blocks interaction during intro */}
      <div className="pointer-events-auto">
        <ReplayIntroOverlay visible={introVisible} onExitComplete={handleIntroComplete} />
      </div>

      {/* Bottom gradient + controls — hidden during recording */}
      {!recordingActive && (
        <>
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="pointer-events-auto relative mx-2 pb-2 sm:pb-4">
            <ReplayControls onPlayClick={handlePlayClick} />
          </div>
        </>
      )}
    </div>
  )
}
