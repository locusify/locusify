import { AnimatePresence, m } from 'motion/react'
import { useEffect, useState } from 'react'
import locusifyLogo from '@/assets/locusify-fit.png'
import { useReplayStore } from '@/stores/replayStore'

// Must match INTRO_MS in useVideoRecorder.ts
const FADE_IN_S = 0.7
const HOLD_MS = 1400
const FADE_OUT_S = 0.7

export function ReplayIntroOverlay() {
  const [visible, setVisible] = useState(true)
  const togglePlayPause = useReplayStore(s => s.togglePlayPause)

  useEffect(() => {
    // Start exit animation after fade-in + hold
    const t = setTimeout(() => setVisible(false), FADE_IN_S * 1000 + HOLD_MS)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence onExitComplete={togglePlayPause}>
      {visible && (
        <m.div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_IN_S, ease: 'easeInOut' }}
        >
          <m.div
            className="flex flex-col items-center gap-5"
            initial={{ scale: 0.88, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: FADE_OUT_S, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Logo image */}
            <img
              src={locusifyLogo}
              alt="Locusify"
              className="size-20 rounded-2xl sm:size-24"
            />

            {/* Brand */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Locusify
              </span>
              <span className="text-sm text-white/40 sm:text-base">
                Your Journey, Mapped
              </span>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
