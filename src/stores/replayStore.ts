import type { PhotoMarker } from '@/types/map'
import type { SegmentMeta, TransportMode } from '@/types/replay'
import type { PlaybackState } from '@/types/workspace'
import { create } from 'zustand'
import { haversineDistance } from '@/lib/geo'

/** Duration per segment in ms at 1x speed */
const BASE_SEGMENT_DURATION = 2000

interface ReplayWaypoint {
  /** Marker ID */
  id: string
  /** [longitude, latitude] */
  position: [number, number]
  /** The original PhotoMarker for rendering */
  marker: PhotoMarker
  /** Timestamp for ordering */
  timestamp: Date
  /** Sequence index */
  index: number
}

function markersToWaypoints(markers: PhotoMarker[]): ReplayWaypoint[] {
  return markers
    .filter(m => m.photo.dateTaken)
    .sort((a, b) => new Date(a.photo.dateTaken).getTime() - new Date(b.photo.dateTaken).getTime())
    .map((marker, index) => ({
      id: marker.id,
      position: [marker.longitude, marker.latitude] as [number, number],
      marker,
      timestamp: new Date(marker.photo.dateTaken),
      index,
    }))
}

function computePosition(
  waypoints: ReplayWaypoint[],
  waypointIndex: number,
  segmentProgress: number,
): [number, number] | null {
  if (waypoints.length === 0)
    return null
  if (waypointIndex >= waypoints.length - 1) {
    return waypoints[waypoints.length - 1].position
  }
  const from = waypoints[waypointIndex].position
  const to = waypoints[waypointIndex + 1].position
  const t = Math.max(0, Math.min(1, segmentProgress))
  return [
    from[0] + (to[0] - from[0]) * t,
    from[1] + (to[1] - from[1]) * t,
  ]
}

function computeSegments(waypoints: ReplayWaypoint[]): SegmentMeta[] {
  const segments: SegmentMeta[] = []
  for (let i = 0; i < waypoints.length - 1; i++) {
    const from = waypoints[i]
    const to = waypoints[i + 1]
    const distanceKm = haversineDistance(from.position, to.position)
    const timeDeltaMs = to.timestamp.getTime() - from.timestamp.getTime()
    segments.push({
      fromIndex: i,
      toIndex: i + 1,
      distanceKm,
      timeDeltaMs,
      mode: 'walking',
    })
  }
  return segments
}

interface ReplayState {
  isReplayMode: boolean
  waypoints: ReplayWaypoint[]
  status: PlaybackState['status']
  currentWaypointIndex: number
  segmentProgress: number
  totalProgress: number
  speedMultiplier: number
  currentPosition: [number, number] | null
  segments: SegmentMeta[]
  currentSegmentMode: TransportMode
  recordingActive: boolean

  startReplay: (markers: PhotoMarker[], startPaused?: boolean) => void
  prepareReplay: (markers: PhotoMarker[]) => void
  confirmConfig: () => void
  togglePlayPause: () => void
  resetReplay: () => void
  exitReplay: () => void
  setSpeedMultiplier: (speed: number) => void
  seekToWaypoint: (index: number) => void
  setSegmentMode: (segmentIndex: number, mode: TransportMode) => void
  setRecordingActive: (active: boolean) => void
  /** Internal: advance animation by delta ms */
  _tick: (delta: number) => void
}

export const useReplayStore = create<ReplayState>((set, get) => ({
  isReplayMode: false,
  waypoints: [],
  status: 'idle',
  currentWaypointIndex: 0,
  segmentProgress: 0,
  totalProgress: 0,
  speedMultiplier: 1,
  currentPosition: null,
  segments: [],
  currentSegmentMode: 'walking',
  recordingActive: false,

  setRecordingActive: active => set({ recordingActive: active }),

  startReplay: (markers, startPaused = false) => {
    const waypoints = markersToWaypoints(markers)
    if (waypoints.length < 2)
      return
    const segments = computeSegments(waypoints)
    set({
      isReplayMode: true,
      waypoints,
      segments,
      currentSegmentMode: segments[0]?.mode ?? 'walking',
      status: startPaused ? 'paused' : 'playing',
      currentWaypointIndex: 0,
      segmentProgress: 0,
      totalProgress: 0,
      speedMultiplier: get().speedMultiplier,
      currentPosition: waypoints[0].position,
    })
  },

  prepareReplay: (markers) => {
    const waypoints = markersToWaypoints(markers)
    if (waypoints.length < 2)
      return
    const segments = computeSegments(waypoints)
    set({
      isReplayMode: true,
      waypoints,
      segments,
      currentSegmentMode: segments[0]?.mode ?? 'walking',
      status: 'configuring',
      currentWaypointIndex: 0,
      segmentProgress: 0,
      totalProgress: 0,
      speedMultiplier: get().speedMultiplier,
      currentPosition: waypoints[0].position,
    })
  },

  confirmConfig: () => {
    const { status } = get()
    if (status === 'configuring') {
      set({ status: 'paused' })
    }
  },

  togglePlayPause: () => {
    const { status, speedMultiplier, waypoints } = get()
    if (status === 'playing') {
      set({ status: 'paused' })
    }
    else if (status === 'paused') {
      set({ status: 'playing' })
    }
    else if (status === 'completed') {
      set({
        status: 'playing',
        currentWaypointIndex: 0,
        segmentProgress: 0,
        totalProgress: 0,
        speedMultiplier,
        currentPosition: waypoints[0]?.position ?? null,
      })
    }
  },

  resetReplay: () => {
    const { waypoints, speedMultiplier } = get()
    set({
      status: 'paused',
      currentWaypointIndex: 0,
      segmentProgress: 0,
      totalProgress: 0,
      speedMultiplier,
      currentPosition: waypoints[0]?.position ?? null,
    })
  },

  exitReplay: () => {
    set({
      isReplayMode: false,
      waypoints: [],
      status: 'idle',
      currentWaypointIndex: 0,
      segmentProgress: 0,
      totalProgress: 0,
      currentPosition: null,
      segments: [],
      currentSegmentMode: 'walking',
      recordingActive: false,
    })
  },

  setSpeedMultiplier: speed => set({ speedMultiplier: speed }),

  seekToWaypoint: (index) => {
    const { waypoints, status } = get()
    const maxIndex = waypoints.length - 1
    if (maxIndex < 1)
      return
    const clampedIndex = Math.max(0, Math.min(index, maxIndex))
    const totalSegments = waypoints.length - 1
    // If seeking to the last waypoint, mark completed
    if (clampedIndex >= maxIndex) {
      set({
        currentWaypointIndex: maxIndex,
        segmentProgress: 0,
        totalProgress: 1,
        currentPosition: waypoints[maxIndex].position,
        status: 'completed',
      })
      return
    }
    set({
      currentWaypointIndex: clampedIndex,
      segmentProgress: 0,
      totalProgress: clampedIndex / totalSegments,
      currentPosition: waypoints[clampedIndex].position,
      status: status === 'completed' ? 'paused' : status,
    })
  },

  setSegmentMode: (segmentIndex, mode) => {
    const { segments, currentWaypointIndex } = get()
    if (segmentIndex < 0 || segmentIndex >= segments.length)
      return
    const updated = [...segments]
    updated[segmentIndex] = { ...updated[segmentIndex], mode }
    const patch: Partial<ReplayState> = { segments: updated }
    if (segmentIndex === currentWaypointIndex) {
      patch.currentSegmentMode = mode
    }
    set(patch as ReplayState)
  },

  _tick: (delta) => {
    const state = get()
    if (state.status !== 'playing')
      return

    const totalSegments = state.waypoints.length - 1
    if (totalSegments <= 0)
      return

    // Cap delta to prevent large jumps (e.g. after tab switch)
    const cappedDelta = Math.min(delta, 200)
    const segmentDuration = BASE_SEGMENT_DURATION / state.speedMultiplier
    const progressIncrement = cappedDelta / segmentDuration

    let segProg = state.segmentProgress + progressIncrement
    let wpIdx = state.currentWaypointIndex

    // Advance through completed segments
    while (segProg >= 1 && wpIdx < totalSegments - 1) {
      segProg -= 1
      wpIdx += 1
    }

    // Completion: last segment finished
    if (wpIdx >= totalSegments - 1 && segProg >= 1) {
      set({
        status: 'completed',
        currentWaypointIndex: totalSegments,
        segmentProgress: 0,
        totalProgress: 1,
        currentPosition: state.waypoints[totalSegments].position,
      })
      return
    }

    // Clamp segment progress to [0, 1) for safety
    segProg = Math.min(segProg, 0.9999)
    const totalProgress = Math.min((wpIdx + segProg) / totalSegments, 1)
    const currentPosition = computePosition(state.waypoints, wpIdx, segProg)

    set({
      currentWaypointIndex: wpIdx,
      segmentProgress: segProg,
      totalProgress,
      currentPosition,
      currentSegmentMode: state.segments[wpIdx]?.mode ?? 'walking',
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
    useReplayStore.getState()._tick(delta)
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
useReplayStore.subscribe((state, prevState) => {
  if (state.status === 'playing' && prevState.status !== 'playing') {
    startLoop()
  }
  else if (state.status !== 'playing' && prevState.status === 'playing') {
    stopLoop()
  }
})
