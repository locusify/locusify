import { m } from 'motion/react'
import { Marker } from 'react-map-gl/maplibre'
import { presetAvatars } from '@/data/presetAvatars'
import { transportModeIcons } from '@/data/transportModes'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { useReplayStore } from '@/stores/replayStore'
import { useSettingsStore } from '@/stores/settingsStore'

/**
 * Pulsing dot marker at the current playback position.
 * Renders user avatar, preset character, or default blue dot
 * based on settings. Shows transport mode badge for current segment.
 */
export function WaypointDot() {
  const currentPosition = useReplayStore(s => s.currentPosition)
  const currentSegmentMode = useReplayStore(s => s.currentSegmentMode)
  const avatarSource = useSettingsStore(s => s.avatarSource)
  const user = useAuthStore(s => s.user)

  if (!currentPosition)
    return null

  const showBadge = currentSegmentMode !== 'unknown'

  return (
    <Marker longitude={currentPosition[0]} latitude={currentPosition[1]} anchor="center">
      <m.div
        className="relative flex items-center justify-center"
        initial={false}
        animate={{ scale: 1 }}
      >
        {/* Pulse ring */}
        <div className="absolute size-10 animate-ping rounded-full bg-sky-400 opacity-30" />

        {/* Avatar / dot */}
        <AvatarContent avatarSource={avatarSource} avatarUrl={user?.avatarUrl} userName={user?.name} />

        {/* Transport mode badge */}
        {showBadge && (
          <div className="absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full bg-material-thick shadow-sm">
            <span className={cn(transportModeIcons[currentSegmentMode], 'size-2.5 text-text')} />
          </div>
        )}
      </m.div>
    </Marker>
  )
}

function AvatarContent({
  avatarSource,
  avatarUrl,
  userName,
}: {
  avatarSource: { type: string, presetId?: string }
  avatarUrl?: string
  userName?: string
}) {
  // Profile avatar with image
  if (avatarSource.type === 'profile' && avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className="relative size-9 rounded-full border-2 border-sky-400 object-cover shadow-[0_0_8px_rgba(56,189,248,0.4)]"
      />
    )
  }

  // Profile avatar fallback: initial letter
  if (avatarSource.type === 'profile') {
    const initial = (userName?.[0] ?? '?').toUpperCase()
    return (
      <div className="relative flex size-9 items-center justify-center rounded-full border-2 border-sky-400 bg-sky-400 text-lg font-semibold text-white shadow-[0_0_8px_rgba(56,189,248,0.4)]">
        {initial}
      </div>
    )
  }

  // Preset avatar
  if (avatarSource.type === 'preset' && avatarSource.presetId) {
    const preset = presetAvatars.find(p => p.id === avatarSource.presetId)
    if (preset) {
      return (
        <div
          className="relative flex size-9 items-center justify-center rounded-full border-2 shadow-[0_0_8px_rgba(56,189,248,0.4)]"
          style={{ backgroundColor: preset.color, borderColor: preset.color }}
        >
          <span className={cn(preset.icon, 'size-5 text-white')} />
        </div>
      )
    }
  }

  // Default blue dot
  return (
    <div className="relative size-3 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
  )
}
