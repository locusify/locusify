import type { StateStorage } from 'zustand/middleware'
import { getStorage } from '@/platforms'

export const platformStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return getStorage().get(name)
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await getStorage().set(name, value)
  },
  removeItem: async (name: string): Promise<void> => {
    await getStorage().remove(name)
  },
}
