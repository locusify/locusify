import type { PhotoMarker } from '@/types/map'
import type { SegmentMeta, TransportMode } from '@/types/replay'
import type { ReplayTemplateConfig } from '@/types/template'
import type { PlaybackState } from '@/types/workspace'
import { create } from 'zustand'
import { templates } from '@/data/templates'
import AudioManager from '@/lib/audio/AudioManager'
import { haversineDistance } from '@/lib/geo'
import { interpolateSegment } from '@/lib/replay/curves'

/** Duration per segment in ms at 1x speed */
const BASE_SEGMENT_DURATION = 2000

/** Dwell time at each waypoint before advancing to next segment (ms) */
const DWELL_DURATION = 400

/** Ease-in-out curve for smoother segment traversal */
function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
}

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
  segments: SegmentMeta[],
): [number, number] | null {
  if (waypoints.length === 0)
    return null
  if (waypointIndex >= waypoints.length - 1) {
    return waypoints[waypoints.length - 1].position
  }

  const seg = segments[waypointIndex]
  const t = easeInOut(Math.max(0, Math.min(1, segmentProgress)))

  // Walk along pre-computed curve points
  if (seg?.curvePoints && seg.curvePoints.length >= 2) {
    const totalPoints = seg.curvePoints.length - 1
    const exactIdx = t * totalPoints
    const idx = Math.floor(exactIdx)
    const frac = exactIdx - idx

    if (idx >= totalPoints) {
      return seg.curvePoints[totalPoints]
    }

    const p0 = seg.curvePoints[idx]
    const p1 = seg.curvePoints[idx + 1]
    return [
      p0[0] + (p1[0] - p0[0]) * frac,
      p0[1] + (p1[1] - p0[1]) * frac,
    ]
  }

  // Fallback: linear interpolation
  const from = waypoints[waypointIndex].position
  const to = waypoints[waypointIndex + 1].position
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
    const mode: TransportMode = 'walking'
    const curvePoints = interpolateSegment(from.position, to.position, distanceKm, mode, i)
    segments.push({
      fromIndex: i,
      toIndex: i + 1,
      distanceKm,
      timeDeltaMs,
      mode,
      curvePoints,
      isLongJump: distanceKm > 200,
    })
  }
  return segments
}

/** Default template ID */
const DEFAULT_TEMPLATE_ID = 'minimal'

/** Get default template config */
function getDefaultTemplateConfig(): ReplayTemplateConfig {
  return templates.find(t => t.id === DEFAULT_TEMPLATE_ID)!.config
}

export type EarthZoomPhase = 'idle' | 'setup' | 'revealing' | 'flying' | 'done'

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
  templateId: string
  templateConfig: ReplayTemplateConfig
  customOverrides: Partial<ReplayTemplateConfig>
  captions: string[]
  earthZoomPhase: EarthZoomPhase
  /** Remaining dwell time (ms) at current waypoint before advancing */
  dwellRemaining: number

  startReplay: (markers: PhotoMarker[], startPaused?: boolean) => void
  prepareReplay: (markers: PhotoMarker[]) => void
  confirmConfig: () => void
  togglePlayPause: () => void
  restartReplay: () => void
  resetReplay: () => void
  exitReplay: () => void
  setSpeedMultiplier: (speed: number) => void
  seekToWaypoint: (index: number) => void
  setSegmentMode: (segmentIndex: number, mode: TransportMode) => void
  setRecordingActive: (active: boolean) => void
  setTemplate: (templateId: string, config: ReplayTemplateConfig) => void
  setCustomOverrides: (overrides: Partial<ReplayTemplateConfig>) => void
  setCaptions: (captions: string[]) => void
  startEarthZoom: () => void
  setEarthZoomPhase: (phase: EarthZoomPhase) => void
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
  templateId: DEFAULT_TEMPLATE_ID,
  templateConfig: getDefaultTemplateConfig(),
  customOverrides: {},
  captions: [],
  earthZoomPhase: 'idle',
  dwellRemaining: 0,

  setRecordingActive: active => set({ recordingActive: active }),

  startEarthZoom: () => set({ earthZoomPhase: 'setup' }),
  setEarthZoomPhase: phase => set({ earthZoomPhase: phase }),

  setTemplate: (templateId, config) => set({ templateId, templateConfig: config, customOverrides: {} }),

  setCustomOverrides: (overrides) => {
    const { templateConfig } = get()
    set({
      customOverrides: overrides,
      templateConfig: { ...templateConfig, ...overrides } as ReplayTemplateConfig,
    })
  },

  setCaptions: captions => set({ captions }),

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
      dwellRemaining: 0,
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
      speedMultiplier: get().templateConfig.defaultSpeed || get().speedMultiplier,
      currentPosition: waypoints[0].position,
      dwellRemaining: 0,
    })
  },

  confirmConfig: () => {
    const { status, templateConfig } = get()
    if (status === 'configuring') {
      // Preload audio for the selected template
      const audio = AudioManager.getInstance()
      audio.configure(templateConfig.music.volume, templateConfig.music.fadeIn, templateConfig.music.fadeOut)
      audio.loadTrack(templateConfig.music.trackId).then(() => {
        // Only transition if still in configuring/paused state (user hasn't exited)
        const current = get().status
        if (current === 'configuring' || current === 'paused') {
          set({ status: 'paused', speedMultiplier: templateConfig.defaultSpeed || 1 })
        }
      })
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

  restartReplay: () => {
    const { waypoints } = get()
    if (waypoints.length < 2)
      return
    AudioManager.getInstance().stop()
    set({
      status: 'configuring',
      currentWaypointIndex: 0,
      segmentProgress: 0,
      totalProgress: 0,
      currentPosition: waypoints[0]?.position ?? null,
      recordingActive: false,
      earthZoomPhase: 'idle',
      dwellRemaining: 0,
    })
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
      earthZoomPhase: 'idle',
      dwellRemaining: 0,
    })
  },

  exitReplay: () => {
    AudioManager.getInstance().stop()
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
      templateId: DEFAULT_TEMPLATE_ID,
      templateConfig: getDefaultTemplateConfig(),
      customOverrides: {},
      captions: [],
      earthZoomPhase: 'idle',
      dwellRemaining: 0,
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
        dwellRemaining: 0,
      })
      return
    }
    set({
      currentWaypointIndex: clampedIndex,
      segmentProgress: 0,
      totalProgress: clampedIndex / totalSegments,
      currentPosition: waypoints[clampedIndex].position,
      status: status === 'completed' ? 'paused' : status,
      dwellRemaining: 0,
    })
  },

  setSegmentMode: (segmentIndex, mode) => {
    const { segments, currentWaypointIndex, waypoints } = get()
    if (segmentIndex < 0 || segmentIndex >= segments.length)
      return
    const updated = [...segments]
    const seg = updated[segmentIndex]
    // Recompute curve points for the new mode
    const from = waypoints[seg.fromIndex].position
    const to = waypoints[seg.toIndex].position
    const curvePoints = interpolateSegment(from, to, seg.distanceKm, mode, segmentIndex)
    updated[segmentIndex] = { ...seg, mode, curvePoints }
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

    // --- Dwell phase: pause at waypoint before advancing ---
    if (state.dwellRemaining > 0) {
      const remaining = state.dwellRemaining - cappedDelta
      if (remaining > 0) {
        set({ dwellRemaining: remaining })
        return
      }
      // Dwell finished — advance to next segment
      const wpIdx = state.currentWaypointIndex + 1
      if (wpIdx >= totalSegments) {
        set({
          status: 'completed',
          currentWaypointIndex: totalSegments,
          segmentProgress: 0,
          totalProgress: 1,
          currentPosition: state.waypoints[totalSegments].position,
          dwellRemaining: 0,
        })
        return
      }
      set({
        dwellRemaining: 0,
        currentWaypointIndex: wpIdx,
        segmentProgress: 0,
        currentSegmentMode: state.segments[wpIdx]?.mode ?? 'walking',
      })
      return
    }

    const segmentDuration = (state.templateConfig.segmentDuration || BASE_SEGMENT_DURATION) / state.speedMultiplier
    const progressIncrement = cappedDelta / segmentDuration

    let segProg = state.segmentProgress + progressIncrement
    const wpIdx = state.currentWaypointIndex

    // Segment completed — enter dwell phase
    if (segProg >= 1) {
      // Last segment completed
      if (wpIdx >= totalSegments - 1) {
        set({
          status: 'completed',
          currentWaypointIndex: totalSegments,
          segmentProgress: 0,
          totalProgress: 1,
          currentPosition: state.waypoints[totalSegments].position,
          dwellRemaining: 0,
        })
        return
      }
      // Clamp at end and start dwelling
      set({
        segmentProgress: 1,
        totalProgress: Math.min((wpIdx + 1) / totalSegments, 1),
        currentPosition: state.waypoints[wpIdx + 1].position,
        dwellRemaining: DWELL_DURATION,
      })
      return
    }

    // Normal progress within segment
    segProg = Math.min(segProg, 0.9999)
    const totalProgress = Math.min((wpIdx + segProg) / totalSegments, 1)
    const currentPosition = computePosition(state.waypoints, wpIdx, segProg, state.segments)

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
// Also sync AudioManager with replay status
useReplayStore.subscribe((state, prevState) => {
  if (state.status === 'playing' && prevState.status !== 'playing') {
    startLoop()
  }
  else if (state.status !== 'playing' && prevState.status === 'playing') {
    stopLoop()
  }

  // Sync audio with replay status changes
  if (state.status !== prevState.status) {
    AudioManager.getInstance().syncWithReplayStatus(state.status)
  }
})
