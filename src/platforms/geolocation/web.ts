import type { GeolocationAdapter, GeolocationOptions, Position } from './types'

export class WebGeolocation implements GeolocationAdapter {
  getCurrentPosition(options?: GeolocationOptions): Promise<Position> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp,
          })
        },
        (error) => {
          reject(error)
        },
        {
          enableHighAccuracy: options?.enableHighAccuracy,
          timeout: options?.timeout,
          maximumAge: options?.maximumAge,
        },
      )
    })
  }
}
