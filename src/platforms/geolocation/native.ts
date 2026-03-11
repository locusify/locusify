import type { GeolocationAdapter, GeolocationOptions, Position } from './types'
import { Geolocation } from '@capacitor/geolocation'

export class NativeGeolocation implements GeolocationAdapter {
  async getCurrentPosition(options?: GeolocationOptions): Promise<Position> {
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: options?.enableHighAccuracy ?? true,
      timeout: options?.timeout ?? 10000,
      maximumAge: options?.maximumAge,
    })

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude ?? null,
      altitudeAccuracy: position.coords.altitudeAccuracy ?? null,
      heading: position.coords.heading ?? null,
      speed: position.coords.speed ?? null,
      timestamp: position.timestamp,
    }
  }
}
