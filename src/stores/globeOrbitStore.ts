import { create } from 'zustand'

/** Wrap longitude to [-180, 180] */
function wrapLng(lng: number): number {
  return ((((lng + 180) % 360) + 360) % 360) - 180
}

/**
 * Compute a zoom level that shows the full globe in MapLibre globe projection.
 * Uses the smaller viewport dimension to ensure the globe fits regardless of orientation.
 */
function computeOrbitZoom(): number {
  const minDim = Math.min(window.innerWidth, window.innerHeight)
  // Empirical values for MapLibre globe projection.
  // The globe should fill most of the viewport while remaining fully visible.
  if (minDim < 400)
    return 1.8
  if (minDim < 700)
    return 2.0
  return 2.2
}

interface GlobeOrbitState {
  isOrbiting: boolean
  status: 'idle' | 'zooming' | 'playing' | 'paused' | 'completed'
  progress: number
  startLongitude: number
  currentLongitude: number
  latitude: number
  zoom: number
  duration: number

  startOrbit: (longitude: number, latitude: number) => void
  /** Called by the controller once the initial flyTo finishes */
  onZoomReady: () => void
  togglePlayPause: () => void
  exitOrbit: () => void
  _tick: (delta: number) => void
}

export const useGlobeOrbitStore = create<GlobeOrbitState>((set, get) => ({
  isOrbiting: false,
  status: 'idle',
  progress: 0,
  startLongitude: 0,
  currentLongitude: 0,
  latitude: 20,
  zoom: 1.5,
  duration: 15000,

  startOrbit: (longitude, latitude) => {
    const zoom = computeOrbitZoom()
    set({
      isOrbiting: true,
      status: 'zooming',
      progress: 0,
      startLongitude: longitude,
      currentLongitude: longitude,
      latitude,
      zoom,
      duration: 15000,
    })
  },

  onZoomReady: () => {
    const { status } = get()
    if (status === 'zooming') {
      set({ status: 'paused' })
    }
  },

  togglePlayPause: () => {
    const { status } = get()
    if (status === 'playing') {
      set({ status: 'paused' })
    }
    else if (status === 'paused') {
      set({ status: 'playing' })
    }
  },

  exitOrbit: () => {
    set({
      isOrbiting: false,
      status: 'idle',
      progress: 0,
      currentLongitude: 0,
    })
  },

  _tick: (delta) => {
    const state = get()
    if (state.status !== 'playing')
      return

    const cappedDelta = Math.min(delta, 200)
    const newProgress = state.progress + cappedDelta / state.duration

    if (newProgress >= 1) {
      set({
        status: 'completed',
        progress: 1,
        currentLongitude: wrapLng(state.startLongitude + 360),
      })
      return
    }

    set({
      progress: newProgress,
      currentLongitude: wrapLng(state.startLongitude + newProgress * 360),
    })
  },
}))

// --- rAF loop managed outside React ---
let rafId = 0
let lastTime = 0

function startLoop() {
  lastTime = 0
  const animate = (time: number) => {
    if (lastTime === 0) {
      lastTime = time
      rafId = requestAnimationFrame(animate)
      return
    }
    const delta = time - lastTime
    lastTime = time
    useGlobeOrbitStore.getState()._tick(delta)
    rafId = requestAnimationFrame(animate)
  }
  rafId = requestAnimationFrame(animate)
}

function stopLoop() {
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = 0
  }
}

// Auto-start/stop the rAF loop when status changes
useGlobeOrbitStore.subscribe((state, prevState) => {
  if (state.status === 'playing' && prevState.status !== 'playing') {
    startLoop()
  }
  else if (state.status !== 'playing' && prevState.status === 'playing') {
    stopLoop()
  }
})
