import type { StorageAdapter } from './types'
import { Preferences } from '@capacitor/preferences'

export class NativeStorage implements StorageAdapter {
  async get(key: string): Promise<string | null> {
    const { value } = await Preferences.get({ key })
    return value
  }

  async set(key: string, value: string): Promise<void> {
    await Preferences.set({ key, value })
  }

  async remove(key: string): Promise<void> {
    await Preferences.remove({ key })
  }
}
