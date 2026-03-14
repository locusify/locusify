import type { LocationReportResponse, NearbyUserResponse, PresenceSettingsResponse, PresenceVisibility } from '@/types/presence'
import { apiClient } from './client'

export function reportLocation(payload: {
  latitude: number
  longitude: number
  accuracy?: number
}) {
  return apiClient.post<LocationReportResponse>('/presence/location', payload)
}

export function fetchNearbyUsers(params: {
  latitude: number
  longitude: number
  radius?: number
  limit?: number
}) {
  const searchParams = new URLSearchParams({
    latitude: String(params.latitude),
    longitude: String(params.longitude),
  })
  if (params.radius != null)
    searchParams.set('radius', String(params.radius))
  if (params.limit != null)
    searchParams.set('limit', String(params.limit))

  return apiClient.get<NearbyUserResponse[]>(`/presence/nearby?${searchParams}`)
}

export function getPresenceSettings() {
  return apiClient.get<PresenceSettingsResponse>('/presence/settings')
}

export function updatePresenceSettings(payload: {
  visibility?: PresenceVisibility
  status_text?: string | null
}) {
  return apiClient.patch<PresenceSettingsResponse>('/presence/settings', payload)
}
