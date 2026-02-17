import { ReplayControls } from './replay/ReplayControls'
import { ReplayPhotoCard } from './replay/ReplayPhotoCard'

/**
 * Overlay container for replay mode.
 * No props — all state comes from the replay store via child components.
 */
export function TrajectoryOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-end">
      {/* Bottom gradient for cinematic feel */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/40 to-transparent" />

      <div className="pointer-events-auto relative flex flex-col gap-3 p-4 mx-20">
        <ReplayPhotoCard />
        <ReplayControls />
      </div>
    </div>
  )
}
