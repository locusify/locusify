import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { platformStorage } from '@/lib/zustand-storage'

interface FullscreenState {
  /** User permanently dismissed the fullscreen suggestion */
  dismissed: boolean
  /** Banner is currently visible in this session */
  bannerOpen: boolean

  openBanner: () => void
  closeBanner: () => void
  dismissForever: () => void
}

export const useFullscreenStore = create<FullscreenState>()(
  persist(
    (set, get) => ({
      dismissed: false,
      bannerOpen: false,

      openBanner: () => {
        if (!get().dismissed) {
          set({ bannerOpen: true })
        }
      },
      closeBanner: () => set({ bannerOpen: false }),
      dismissForever: () => set({ dismissed: true, bannerOpen: false }),
    }),
    {
      name: 'locusify-fullscreen',
      storage: createJSONStorage(() => platformStorage),
      partialize: state => ({ dismissed: state.dismissed }),
    },
  ),
)
