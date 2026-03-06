import { useCallback, useEffect, useRef, useState } from 'react'
import { useReplayStore } from '@/stores/replayStore'

export type RecordingStatus = 'idle' | 'recording' | 'processing' | 'unsupported'

// ─── Capability detection ──────────────────────────────────────────────────────

function detectCapability(): 'screen-capture' | 'unsupported' {
  if (typeof navigator.mediaDevices?.getDisplayMedia === 'function') {
    return 'screen-capture'
  }
  return 'unsupported'
}

// ─── Timing constants ──────────────────────────────────────────────────────────

/** How long to keep recording after replay completes before stopping. */
const WAIT_MS = 2000

// ─── Session callbacks ─────────────────────────────────────────────────────────

interface SessionCallbacks {
  /** Called the moment the session decides to stop (transition to 'processing'). */
  onStopping: () => void
  /** Called once the encoded blob is ready (transition to 'idle'). */
  onComplete: (blob: Blob, mimeType: string) => void
}

// ─── ScreenRecordingSession ────────────────────────────────────────────────────

class ScreenRecordingSession {
  private recorder: MediaRecorder
  private stream: MediaStream
  private chunks: Blob[] = []
  private callbacks: SessionCallbacks
  private mimeType: string

  static async create(callbacks: SessionCallbacks): Promise<ScreenRecordingSession | null> {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'browser',
          suppressLocalAudioPlayback: true,
        },
        audio: true,
        preferCurrentTab: true,
        selfBrowserSurface: 'include',
        surfaceSwitching: 'exclude',
      } as DisplayMediaStreamOptions)

      // Keep audio tracks if present (for capturing background music during replay)
      // Audio tracks are now captured via getDisplayMedia({ audio: true })

      return new ScreenRecordingSession(stream, callbacks)
    }
    catch {
      return null // user denied or not supported
    }
  }

  private constructor(stream: MediaStream, callbacks: SessionCallbacks) {
    this.stream = stream
    this.callbacks = callbacks

    // MIME type priority — prefer WebM (VP9/VP8) for screen capture streams;
    // H.264 via MediaRecorder + getDisplayMedia produces green frames on Chrome.
    this.mimeType = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
      .find(t => MediaRecorder.isTypeSupported(t)) ?? 'video/webm'

    this.recorder = new MediaRecorder(stream, { mimeType: this.mimeType })
    this.recorder.ondataavailable = (e) => {
      if (e.data?.size > 0)
        this.chunks.push(e.data)
    }
    this.recorder.onstop = () => {
      const blob = new Blob(this.chunks, { type: this.mimeType })
      callbacks.onComplete(blob, this.mimeType)
    }

    // User stops sharing via browser UI
    stream.getVideoTracks()[0].onended = () => {
      this.stop()
    }
  }

  start() {
    // Hide cursor so it doesn't appear in the recording
    document.documentElement.style.cursor = 'none'
    // Timeslice of 1s ensures periodic data output and avoids green-frame issues
    this.recorder.start(1000)
  }

  stop() {
    document.documentElement.style.cursor = ''
    if (this.recorder.state !== 'inactive') {
      this.callbacks.onStopping()
      try {
        this.recorder.requestData()
      }
      catch { /* no-op */ }
      this.recorder.stop()
    }
    this.stream.getTracks().forEach(t => t.stop())
  }

  dispose() {
    document.documentElement.style.cursor = ''
    if (this.recorder.state !== 'inactive') {
      try {
        this.recorder.stop()
      }
      catch { /* no-op */ }
    }
    this.stream.getTracks().forEach(t => t.stop())
  }
}

// ─── Public types ──────────────────────────────────────────────────────────────

export interface PendingVideo {
  blob: Blob
  mimeType: string
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useVideoRecorder() {
  const [status, setStatus] = useState<RecordingStatus>(() => {
    return detectCapability() === 'unsupported' ? 'unsupported' : 'idle'
  })
  const [pendingVideo, setPendingVideo] = useState<PendingVideo | null>(null)

  const sessionRef = useRef<ScreenRecordingSession | null>(null)

  /**
   * Starts recording using Screen Capture API.
   * Returns true if recording started successfully, false if user denied or unsupported.
   */
  const startRecording = useCallback(async (): Promise<boolean> => {
    if (status !== 'idle')
      return false

    const callbacks: SessionCallbacks = {
      onStopping: () => {
        setStatus('processing')
        useReplayStore.getState().setRecordingActive(false)
      },
      onComplete: (blob, mimeType) => {
        setPendingVideo({ blob, mimeType })
        setStatus('idle')
        sessionRef.current = null
      },
    }

    const session = await ScreenRecordingSession.create(callbacks)
    if (!session)
      return false

    sessionRef.current = session
    session.start()
    setStatus('recording')
    useReplayStore.getState().setRecordingActive(true)
    return true
  }, [status])

  // Auto-stop recording when replay completes
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    const unsubscribe = useReplayStore.subscribe((state) => {
      if (state.status === 'completed' && sessionRef.current) {
        timeoutId = setTimeout(() => {
          sessionRef.current?.stop()
          timeoutId = null
        }, WAIT_MS)
      }
    })
    return () => {
      unsubscribe()
      if (timeoutId)
        clearTimeout(timeoutId)
    }
  }, [])

  const saveVideo = useCallback(() => {
    if (!pendingVideo)
      return
    const { blob, mimeType } = pendingVideo
    const ext = mimeType.startsWith('video/mp4') ? 'mp4' : 'webm'
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `locusify-replay-${Date.now()}.${ext}`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 10000)
    setPendingVideo(null)
  }, [pendingVideo])

  const discardVideo = useCallback(() => {
    sessionRef.current?.dispose()
    sessionRef.current = null
    useReplayStore.getState().setRecordingActive(false)
    setPendingVideo(null)
    setStatus(prev => (prev === 'recording' || prev === 'processing') ? 'idle' : prev)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      sessionRef.current?.dispose()
      useReplayStore.getState().setRecordingActive(false)
    }
  }, [])

  return {
    status,
    pendingVideo,
    startRecording,
    saveVideo,
    discardVideo,
    isSupported: status !== 'unsupported',
    isRecording: status === 'recording',
    isProcessing: status === 'processing',
  }
}
