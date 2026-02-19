import { ReplayControls } from './replay/ReplayControls'
import { ReplayPhotoCard } from './replay/ReplayPhotoCard'

/**
 * Overlay container for replay mode.
 * Contains the photo card panel and bottom controls.
 */
export function TrajectoryOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-end">
      {/* Bottom gradient for cinematic feel */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/40 to-transparent" />

      {/* Photo card — fixed panel, bottom-left */}
      <div className="pointer-events-auto">
        <ReplayPhotoCard />
      </div>

      {/* Controls bar */}
      <div className="pointer-events-auto relative mx-2 pb-2 sm:pb-4">
        <ReplayControls />
      </div>
    </div>
  )
}
