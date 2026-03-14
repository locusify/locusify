/** Online status derived from last_seen_at on the server */
export type OnlineStatus = 'online' | 'recently_active' | 'away' | 'offline'

/** Visibility levels for presence */
export type PresenceVisibility = 'visible' | 'invisible' | 'friends_only'

/** Location report response from API (snake_case) */
export interface LocationReportResponse {
  id: string
  user_id: string
  latitude: number
  longitude: number
  accuracy: number | null
  last_seen_at: string
}

/** A nearby user as returned by the API (snake_case) */
export interface NearbyUserResponse {
  user_id: string
  display_name: string
  avatar_url: string
  latitude: number
  longitude: number
  distance_km: number
  last_seen_at: string
  status_text: string | null
  online_status: OnlineStatus
}

/** A nearby user mapped to frontend conventions (camelCase) */
export interface NearbyUser {
  userId: string
  displayName: string
  avatarUrl: string
  latitude: number
  longitude: number
  distanceKm: number
  lastSeenAt: string
  statusText: string | null
  onlineStatus: OnlineStatus
  /** True when this entry represents the current user */
  isMe?: boolean
}

/** Presence settings response from API (snake_case) */
export interface PresenceSettingsResponse {
  user_id: string
  visibility: PresenceVisibility
  status_text: string | null
}

/** Presence settings in frontend conventions (camelCase) */
export interface PresenceSettings {
  userId: string
  visibility: PresenceVisibility
  statusText: string | null
}

/** Nearby users list response from API */
export interface NearbyUsersResponse {
  users: NearbyUserResponse[]
  total: number
  radius_km: number
  center: {
    latitude: number
    longitude: number
  }
}
