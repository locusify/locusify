import { ReplayControls } from './replay/ReplayControls'

/**
 * Overlay container for replay mode.
 * Only contains the bottom controls — photo is shown on the map via ReplayPhotoCard.
 */
export function TrajectoryOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-end">
      {/* Bottom gradient for cinematic feel */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/40 to-transparent" />

      <div className="pointer-events-auto relative mx-4 p-2 sm:mx-20 sm:p-4">
        <ReplayControls />
      </div>
    </div>
  )
}
