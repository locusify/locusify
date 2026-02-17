import { AnimatePresence, m } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useReplayStore } from '@/stores/replayStore'

const SPEED_OPTIONS = [0.5, 1, 1.5, 2, 4]

/**
 * Bottom control bar: play/pause, reset, speed, progress bar, exit.
 * Reads state from the replay store directly.
 */
export function ReplayControls() {
  const { t } = useTranslation()

  const status = useReplayStore(s => s.status)
  const totalProgress = useReplayStore(s => s.totalProgress)
  const speedMultiplier = useReplayStore(s => s.speedMultiplier)
  const currentWaypointIndex = useReplayStore(s => s.currentWaypointIndex)
  const totalWaypoints = useReplayStore(s => s.waypoints.length)
  const togglePlayPause = useReplayStore(s => s.togglePlayPause)
  const resetReplay = useReplayStore(s => s.resetReplay)
  const setSpeedMultiplier = useReplayStore(s => s.setSpeedMultiplier)
  const seekToWaypoint = useReplayStore(s => s.seekToWaypoint)

  const totalSegments = Math.max(totalWaypoints - 1, 1)

  const [speedMenuOpen, setSpeedMenuOpen] = useState(false)
  const speedMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!speedMenuOpen)
      return
    function handleClickOutside(e: MouseEvent) {
      if (speedMenuRef.current && !speedMenuRef.current.contains(e.target as Node)) {
        setSpeedMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [speedMenuOpen])

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      const targetIndex = Math.round(ratio * totalSegments)
      seekToWaypoint(targetIndex)
    },
    [totalSegments, seekToWaypoint],
  )

  const clampedProgress = Math.min(totalProgress, 1)

  return (
    <div className="bg-material-thick border-fill-tertiary flex flex-col gap-2 rounded-2xl border px-4 py-2.5 shadow-2xl backdrop-blur-[120px]">
      {/* Progress bar */}
      <div
        className="group relative h-1 cursor-pointer rounded-full bg-white/10"
        onClick={handleProgressClick}
        role="progressbar"
        aria-valuenow={Math.round(clampedProgress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-sky-400 transition-[width] duration-100"
          style={{ width: `${clampedProgress * 100}%` }}
        />
        <div
          className="absolute top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
          style={{ left: `calc(${clampedProgress * 100}% - 5px)` }}
        />
      </div>

      {/* Controls row: progress text | playback | speed */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center">
        {/* Left: progress text */}
        <div className="text-text-tertiary text-xs">
          {t('workspace.controls.progress', {
            current: Math.min(currentWaypointIndex + 1, totalWaypoints),
            total: totalWaypoints,
          })}
        </div>

        {/* Center: Playback controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetReplay}
            className="text-text-secondary hover:text-text flex size-7 items-center justify-center rounded-lg transition-colors"
            title={t('workspace.controls.reset')}
          >
            <i className="i-mingcute-refresh-2-line text-sm" />
          </button>

          <button
            type="button"
            onClick={togglePlayPause}
            className="flex size-8 items-center justify-center rounded-full bg-sky-400 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
            title={status === 'playing' ? t('workspace.controls.pause') : t('workspace.controls.play')}
          >
            <i
              className={cn(
                'text-base',
                status === 'playing'
                  ? 'i-mingcute-pause-fill'
                  : 'i-mingcute-play-fill',
              )}
            />
          </button>

          <button
            type="button"
            onClick={() => seekToWaypoint(Math.min(currentWaypointIndex + 1, totalWaypoints - 1))}
            className="text-text-secondary hover:text-text flex size-7 items-center justify-center rounded-lg transition-colors"
            title={t('workspace.controls.next')}
          >
            <i className="i-mingcute-skip-forward-fill text-sm" />
          </button>
        </div>

        {/* Right: Speed dropdown */}
        <div className="relative flex justify-end" ref={speedMenuRef}>
          <button
            type="button"
            onClick={() => setSpeedMenuOpen(prev => !prev)}
            className={cn(
              'flex items-center gap-0.5 rounded-lg px-2 py-1 text-xs font-medium transition-colors',
              speedMenuOpen
                ? 'bg-white/10 text-sky-400'
                : 'text-text-secondary hover:text-text hover:bg-white/5',
            )}
          >
            <span>
              {speedMultiplier}
              x
            </span>
            <i className={cn('i-mingcute-down-line text-[10px] transition-transform', speedMenuOpen && 'rotate-180')} />
          </button>

          <AnimatePresence>
            {speedMenuOpen && (
              <m.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="bg-material-thick border-fill-tertiary absolute bottom-full right-0 mb-2 min-w-[100px] overflow-hidden rounded-xl border py-1 shadow-2xl backdrop-blur-[120px]"
              >
                {SPEED_OPTIONS.map(speed => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => {
                      setSpeedMultiplier(speed)
                      setSpeedMenuOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-center justify-between px-3 py-1.5 text-xs transition-colors',
                      speedMultiplier === speed
                        ? 'text-sky-400'
                        : 'text-text-secondary hover:text-text hover:bg-white/5',
                    )}
                  >
                    <span>
                      {speed}
                      x
                    </span>
                    {speedMultiplier === speed && (
                      <i className="i-mingcute-check-line text-sm" />
                    )}
                  </button>
                ))}
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
