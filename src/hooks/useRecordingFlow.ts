import { useCallback, useEffect, useRef, useState } from 'react'
import { useGlobeOrbitStore } from '@/stores/globeOrbitStore'
import { useReplayStore } from '@/stores/replayStore'
import { useVideoRecorder } from './useVideoRecorder'

/** How long to keep recording after playback completes before stopping. */
const STOP_DELAY_MS = 2000

/**
 * Unified recording flow hook.
 *
 * Encapsulates screen-capture recording, logo intro state, auto-stop on
 * playback completion (both trajectory replay and globe orbit), and the
 * save-video dialog — so every recording mode shares the same lifecycle:
 *
 *   beginRecording(onPlaybackStart)
 *     → screen capture prompt (best-effort) → recordingActive
 *     → logo intro → onPlaybackStart callback
 *     → playback … → auto-stop → save dialog
 */
export function useRecordingFlow() {
  const {
    startRecording,
    stopRecording,
    saveVideo: recorderSave,
    discardVideo: recorderDiscard,
    isRecording,
    isProcessing,
    pendingVideo,
  } = useVideoRecorder()

  // Intro state
  const [introVisible, setIntroVisible] = useState(false)
  const onPlaybackStartRef = useRef<(() => void) | null>(null)

  // Save dialog state
  const [videoDialogOpen, setVideoDialogOpen] = useState(false)

  // Recording active flag (shared via replayStore)
  const recordingActive = useReplayStore(s => s.recordingActive)

  // Stable refs for values needed inside store subscriptions
  const isRecordingRef = useRef(isRecording)
  isRecordingRef.current = isRecording
  const stopRecordingRef = useRef(stopRecording)
  stopRecordingRef.current = stopRecording

  // ── Actions ─────────────────────────────────────────────────────────────────

  /**
   * Start a full recording session: screen capture (best-effort) → show intro.
   * When the intro animation finishes, `onPlaybackStart` is called so the
   * consumer can begin actual playback.
   *
   * Recording is best-effort — if screen capture is denied or unsupported,
   * the intro and playback still proceed normally.
   */
  const beginRecording = useCallback(async (onPlaybackStart: () => void) => {
    recorderDiscard()
    // Best-effort: don't gate intro/playback on recording success
    await startRecording()
    onPlaybackStartRef.current = onPlaybackStart
    setIntroVisible(true)
  }, [startRecording, recorderDiscard])

  /**
   * Show only the intro (no new recording session).
   * Useful for pause-resume where recording is already active.
   */
  const showIntro = useCallback((onComplete: () => void) => {
    onPlaybackStartRef.current = onComplete
    setIntroVisible(true)
  }, [])

  /** Called by ReplayIntroOverlay's onExitComplete. */
  const onIntroComplete = useCallback(() => {
    setIntroVisible(false)
    onPlaybackStartRef.current?.()
    onPlaybackStartRef.current = null
  }, [])

  // ── Hide cursor during intro & recording ─────────────────────────────────
  // MapLibre sets inline cursor styles (grab, pointer) on the canvas, which
  // override `document.documentElement.style.cursor`. Use a <style> with
  // !important to force-hide the cursor during the entire recording experience.
  useEffect(() => {
    if (!recordingActive && !introVisible)
      return
    const style = document.createElement('style')
    style.textContent = '* { cursor: none !important; }'
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [recordingActive, introVisible])

  // ── Auto-stop: globe orbit completed ────────────────────────────────────────

  useEffect(() => {
    let tid: ReturnType<typeof setTimeout> | null = null
    const unsub = useGlobeOrbitStore.subscribe((state, prev) => {
      if (state.status === 'completed' && prev.status !== 'completed' && isRecordingRef.current) {
        tid = setTimeout(() => {
          stopRecordingRef.current()
          tid = null
        }, STOP_DELAY_MS)
      }
    })
    return () => {
      unsub()
      if (tid)
        clearTimeout(tid)
    }
  }, [])

  // ── Save dialog: open after any playback completes ──────────────────────────

  const replayStatus = useReplayStore(s => s.status)
  const orbitStatus = useGlobeOrbitStore(s => s.status)

  useEffect(() => {
    const anyCompleted = replayStatus === 'completed' || orbitStatus === 'completed'
    if (!anyCompleted)
      return
    if (!isRecording && !pendingVideo)
      return
    const t = setTimeout(() => setVideoDialogOpen(true), STOP_DELAY_MS)
    return () => clearTimeout(t)
  }, [replayStatus, orbitStatus, isRecording, pendingVideo])

  // ── Convenience wrappers ────────────────────────────────────────────────────

  const saveVideo = useCallback(() => {
    recorderSave()
    setVideoDialogOpen(false)
  }, [recorderSave])

  const discardVideo = useCallback(() => {
    recorderDiscard()
    setVideoDialogOpen(false)
  }, [recorderDiscard])

  const exitRecording = useCallback(() => {
    recorderDiscard()
    setVideoDialogOpen(false)
  }, [recorderDiscard])

  return {
    // State
    recordingActive,
    introVisible,
    videoDialogOpen,
    isRecording,
    isProcessing,
    pendingVideo,
    // Actions
    beginRecording,
    showIntro,
    onIntroComplete,
    saveVideo,
    discardVideo,
    exitRecording,
  }
}
