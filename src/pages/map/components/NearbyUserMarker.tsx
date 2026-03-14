import type { FC } from 'react'
import type { NearbyUser, OnlineStatus } from '@/types/presence'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@radix-ui/react-hover-card'
import { m } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { Marker } from 'react-map-gl/maplibre'
import { cn } from '@/lib/utils'
import { usePresenceStore } from '@/stores/presenceStore'

interface NearbyUserMarkerProps {
  user: NearbyUser
  clusteredUsers?: NearbyUser[]
  longitude?: number
  latitude?: number
}

const statusRingColor: Record<OnlineStatus, string> = {
  online: 'ring-green-500',
  recently_active: 'ring-yellow-500',
  away: 'ring-gray-400',
  offline: 'ring-gray-300',
}

function formatLastSeen(isoDate: string, t: (key: string, opts?: Record<string, unknown>) => string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1)
    return t('presence.nearby.online')
  if (minutes < 60)
    return t('presence.nearby.lastSeen', { time: `${minutes}m` })
  const hours = Math.floor(minutes / 60)
  if (hours < 24)
    return t('presence.nearby.lastSeen', { time: `${hours}h` })
  const days = Math.floor(hours / 24)
  return t('presence.nearby.lastSeen', { time: `${days}d` })
}

export const NearbyUserMarker: FC<NearbyUserMarkerProps> = ({ user, clusteredUsers, longitude, latitude }) => {
  const { t } = useTranslation()
  const lng = longitude ?? user.longitude
  const lat = latitude ?? user.latitude
  const isCluster = !!clusteredUsers && clusteredUsers.length > 1
  // Single marker showing "me" only (not a cluster)
  const isSelfOnly = !isCluster && !!user.isMe
  // Does this marker contain the current user?
  const hasMe = user.isMe || (isCluster && clusteredUsers!.some(u => u.isMe))
  const nearbyCount = usePresenceStore(s => s.nearbyUsers).length

  return (
    <Marker
      longitude={lng}
      latitude={lat}
      style={{ zIndex: isSelfOnly ? 10 : 0 }}
    >
      <div className="flex flex-col items-center">
        <HoverCard
          openDelay={400}
          closeDelay={100}
        >
          <HoverCardTrigger asChild>
            <m.div
              className="group relative cursor-pointer"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30,
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {/* Selection ring — self only */}
              {isSelfOnly && (
                <div className="bg-blue/30 absolute inset-0 -m-2 animate-pulse rounded-full" />
              )}

              {/* Background preview overlay */}
              <div className="absolute inset-0 overflow-hidden rounded-full">
                {/* Overlay */}
                <div className="from-green/60 to-emerald/80 dark:from-green/70 dark:to-emerald/90 absolute inset-0 bg-gradient-to-br" />
              </div>

              {/* Main marker container — blue when self only, matching PhotoMarkerPin isSelected */}
              <div
                className={cn('relative flex size-10 items-center justify-center rounded-full border shadow-lg backdrop-blur-md transition-all duration-300 hover:shadow-xl', isSelfOnly
                  ? 'border-blue/40 bg-blue/90 shadow-blue/50 dark:border-blue/30 dark:bg-blue/80'
                  : 'border-white/40 bg-white/95 hover:bg-white dark:border-white/20 dark:bg-black/80 dark:hover:bg-black/90')}
              >
                {/* Glass morphism overlay */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-white/10 dark:from-white/20 dark:to-white/5" />

                {/* User icon */}
                <i
                  className={cn('relative z-10 text-lg drop-shadow-sm', isSelfOnly ? 'i-mingcute-user-3-fill text-white' : 'i-mingcute-user-3-line text-gray-700 dark:text-white')}
                />

                {/* Subtle inner shadow for depth */}
                <div className="absolute inset-0 rounded-full shadow-inner shadow-black/5" />

                {/* Cluster count badge */}
                {isCluster && (
                  <div className="bg-blue absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-white dark:ring-black">
                    {clusteredUsers!.length}
                  </div>
                )}
              </div>
            </m.div>
          </HoverCardTrigger>

          <HoverCardContent
            className={cn('z-50 overflow-hidden border-white/20 bg-white/95 p-0 backdrop-blur-[120px] dark:bg-black/95', isCluster ? 'w-80' : 'w-56 sm:w-80', isSelfOnly ? 'shadow-2xl' : '')}
            side="top"
            align="center"
            sideOffset={8}
          >
            <div className="relative">
              {isCluster
                ? (
                  /* Cluster mode: user list */
                    <div className="space-y-2.5 p-4">
                      {clusteredUsers!.map(u => (
                        <div key={u.userId} className="flex items-center gap-2">
                          <div
                            className={cn(
                              'size-7 shrink-0 overflow-hidden rounded-full ring-1',
                              u.isMe ? 'ring-blue-500' : statusRingColor[u.onlineStatus],
                            )}
                          >
                            {u.avatarUrl
                              ? <img src={u.avatarUrl} alt={u.displayName} className="size-full object-cover" />
                              : (
                                  <div className="bg-primary text-primary-foreground flex size-full items-center justify-center text-[10px] font-bold">
                                    {(u.displayName || '?').charAt(0).toUpperCase()}
                                  </div>
                                )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-text block truncate text-xs font-medium">
                              {u.displayName || '?'}
                              {u.isMe && (
                                <span className="ml-1 text-[10px] text-blue-500">
                                  (
                                  {t('presence.nearby.you')}
                                  )
                                </span>
                              )}
                            </span>
                            <span className="text-text-secondary text-[10px]">{formatLastSeen(u.lastSeenAt, t)}</span>
                          </div>
                          {!u.isMe && (
                            <span className="text-text-secondary shrink-0 text-[10px]">
                              {u.distanceKm.toFixed(1)}
                              km
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                : (
                  /* Single user mode */
                    <>
                      {/* Content */}
                      <div className="space-y-3 p-4">
                        {/* Name */}
                        <h3
                          className="text-text truncate text-sm font-semibold"
                          title={user.displayName || '?'}
                        >
                          {user.displayName || '?'}
                        </h3>

                        {/* Metadata */}
                        <div className="space-y-2">
                          <div className="text-text-secondary flex items-center gap-2 text-xs">
                            <i className="i-mingcute-time-line text-sm" />
                            <span>{formatLastSeen(user.lastSeenAt, t)}</span>
                          </div>

                          {user.statusText && (
                            <div className="text-text-secondary flex items-center gap-2 text-xs">
                              <i className="i-mingcute-chat-3-line text-sm" />
                              <span className="truncate">{user.statusText}</span>
                            </div>
                          )}

                          <div className="text-text-secondary space-y-1 text-xs">
                            {!user.isMe && (
                              <div className="flex items-center gap-2">
                                <i className="i-mingcute-location-line text-sm" />
                                <span>
                                  {t('presence.nearby.distance', { distance: user.distanceKm.toFixed(1) })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
            </div>
          </HoverCardContent>
        </HoverCard>

        {/* Nearby count label — shown below the pin that contains "me" */}
        {hasMe && nearbyCount > 0 && (
          <div className="mt-1.5 flex items-center gap-1 whitespace-nowrap rounded-full bg-black/60 px-2 py-0.5 backdrop-blur-sm">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-green-500" />
            </span>
            <span className="text-[10px] font-medium text-white">
              {t('presence.nearby.count', { count: nearbyCount })}
            </span>
          </div>
        )}
      </div>
    </Marker>
  )
}
