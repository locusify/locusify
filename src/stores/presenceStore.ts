import type { NearbyUser, NearbyUserResponse, PresenceSettings, PresenceVisibility } from '@/types/presence'
import { create } from 'zustand'
import * as presenceApi from '@/lib/api/presence'
import { useAuthStore } from '@/stores/authStore'

interface PresenceState {
  myLocation: NearbyUser | null
  nearbyUsers: NearbyUser[]
  settings: PresenceSettings | null
  loading: boolean
  lastReportedAt: number | null

  /** Set my marker immediately from geolocation — no API needed */
  setMyLocation: (latitude: number, longitude: number) => void
  reportLocation: (latitude: number, longitude: number, accuracy?: number) => Promise<void>
  fetchNearbyUsers: (latitude: number, longitude: number) => Promise<void>
  fetchSettings: () => Promise<void>
  updateSettings: (visibility?: PresenceVisibility, statusText?: string | null) => Promise<void>
  clear: () => void
}

/** Minimum interval between location reports (5 minutes) */
const REPORT_DEBOUNCE_MS = 5 * 60 * 1000

function mapNearbyUser(raw: NearbyUserResponse): NearbyUser {
  return {
    userId: raw.user_id,
    displayName: raw.display_name,
    avatarUrl: raw.avatar_url,
    latitude: raw.latitude,
    longitude: raw.longitude,
    distanceKm: raw.distance_km,
    lastSeenAt: raw.last_seen_at,
    statusText: raw.status_text,
    onlineStatus: raw.online_status,
  }
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  myLocation: null,
  nearbyUsers: [],
  settings: null,
  loading: false,
  lastReportedAt: null,

  setMyLocation: (latitude, longitude) => {
    const { user } = useAuthStore.getState()
    if (!user)
      return
    set({
      myLocation: {
        userId: user.id,
        displayName: user.name,
        avatarUrl: user.avatarUrl ?? '',
        latitude,
        longitude,
        distanceKm: 0,
        lastSeenAt: new Date().toISOString(),
        statusText: null,
        onlineStatus: 'online',
        isMe: true,
      },
    })
  },

  reportLocation: async (latitude, longitude, accuracy) => {
    const { lastReportedAt } = get()
    if (lastReportedAt && Date.now() - lastReportedAt < REPORT_DEBOUNCE_MS)
      return

    try {
      await presenceApi.reportLocation({ latitude, longitude, accuracy })
      set({ lastReportedAt: Date.now() })
    }
    catch (err) {
      console.warn('Failed to report location:', err)
    }
  },

  fetchNearbyUsers: async (latitude, longitude) => {
    set({ loading: true })
    try {
      const data = await presenceApi.fetchNearbyUsers({ latitude, longitude })
      set({
        nearbyUsers: data.map(mapNearbyUser),
        loading: false,
      })
    }
    catch (err) {
      console.warn('Failed to fetch nearby users:', err)
      set({ loading: false })
    }
  },

  fetchSettings: async () => {
    try {
      const data = await presenceApi.getPresenceSettings()
      set({
        settings: {
          userId: data.user_id,
          visibility: data.visibility,
          statusText: data.status_text,
        },
      })
    }
    catch (err) {
      console.warn('Failed to fetch presence settings:', err)
    }
  },

  updateSettings: async (visibility, statusText) => {
    try {
      const data = await presenceApi.updatePresenceSettings({
        visibility,
        status_text: statusText,
      })
      set({
        settings: {
          userId: data.user_id,
          visibility: data.visibility,
          statusText: data.status_text,
        },
      })
    }
    catch (err) {
      console.warn('Failed to update presence settings:', err)
    }
  },

  clear: () => set({ myLocation: null, nearbyUsers: [], settings: null, loading: false, lastReportedAt: null }),
}))
