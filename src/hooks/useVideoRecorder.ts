import { useCallback, useEffect, useRef, useState } from 'react'
import locusifyLogoUrl from '@/assets/locusify-fit.png'
import { useMapStore } from '@/stores/mapStore'
import { useReplayStore } from '@/stores/replayStore'

export type RecordingStatus = 'idle' | 'recording' | 'processing' | 'unsupported'

// ─── Image cache ───────────────────────────────────────────────────────────────

// Module-level image cache — persists across renders
const imageCache = new Map<string, HTMLImageElement>()

function loadImage(url: string): void {
  if (imageCache.has(url))
    return
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => imageCache.set(url, img)
  img.src = url
}

// Eagerly load the logo so it's ready when recording starts
loadImage(locusifyLogoUrl)

// ─── Browser support ───────────────────────────────────────────────────────────

function detectMimeType(): string | null {
  if (typeof MediaRecorder === 'undefined')
    return null
  const test = document.createElement('canvas')
  if (typeof test.captureStream !== 'function')
    return null // iOS Safari
  const candidates = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4;codecs=h264',
    'video/mp4',
  ]
  return candidates.find(t => MediaRecorder.isTypeSupported(t)) ?? null
}

// ─── Canvas drawing helpers ────────────────────────────────────────────────────

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
): void {
  const scale = Math.max(dw / img.naturalWidth, dh / img.naturalHeight)
  const sw = dw / scale
  const sh = dh / scale
  const sx = (img.naturalWidth - sw) / 2
  const sy = (img.naturalHeight - sh) / 2
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
}

function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth)
    return text
  let result = text
  while (result.length > 0 && ctx.measureText(`${result}…`).width > maxWidth)
    result = result.slice(0, -1)
  return `${result}…`
}

// ─── Frame drawing functions ───────────────────────────────────────────────────

const FADE_IN_MS = 700
const HOLD_MS = 1400
const FADE_OUT_MS = 700
const INTRO_MS = FADE_IN_MS + HOLD_MS + FADE_OUT_MS // 2800ms total

/**
 * Draws the opening Locusify logo animation onto the composite canvas.
 * Returns false once the intro has finished (elapsed >= INTRO_MS).
 */
function drawIntro(ctx: CanvasRenderingContext2D, W: number, H: number, elapsed: number): boolean {
  if (elapsed >= INTRO_MS)
    return false

  let alpha: number
  if (elapsed < FADE_IN_MS) {
    alpha = elapsed / FADE_IN_MS
  }
  else if (elapsed < FADE_IN_MS + HOLD_MS) {
    alpha = 1
  }
  else {
    alpha = 1 - (elapsed - FADE_IN_MS - HOLD_MS) / FADE_OUT_MS
  }

  ctx.save()

  // Dark overlay
  ctx.globalAlpha = alpha * 0.92
  ctx.fillStyle = '#0a0a0a'
  ctx.fillRect(0, 0, W, H)

  ctx.globalAlpha = alpha
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Logo image
  const logoImg = imageCache.get(locusifyLogoUrl)
  const logoSize = Math.max(24, Math.round(W * 0.038))
  const imgSize = Math.max(64, Math.round(W * 0.09))
  const gap = Math.round(imgSize * 0.3)
  const totalH = imgSize + gap + logoSize + Math.round(logoSize * 1.6)
  const blockTop = H / 2 - totalH / 2

  if (logoImg) {
    const r = Math.max(8, Math.round(imgSize * 0.18))
    ctx.save()
    ctx.beginPath()
    ctx.roundRect(W / 2 - imgSize / 2, blockTop, imgSize, imgSize, r)
    ctx.clip()
    ctx.drawImage(logoImg, W / 2 - imgSize / 2, blockTop, imgSize, imgSize)
    ctx.restore()
  }

  // Brand name
  ctx.font = `700 ${logoSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
  ctx.fillStyle = '#ffffff'
  ctx.fillText('Locusify', W / 2, blockTop + imgSize + gap + logoSize / 2)

  // Tagline
  const subSize = Math.max(11, Math.round(W * 0.013))
  ctx.font = `400 ${subSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.fillText('Your Journey, Mapped', W / 2, blockTop + imgSize + gap + logoSize + Math.round(logoSize * 0.9))

  ctx.restore()
  return true
}

function drawPhotoCard(ctx: CanvasRenderingContext2D, W: number, _H: number): void {
  const { waypoints, currentWaypointIndex } = useReplayStore.getState()
  const waypoint = waypoints[currentWaypointIndex]
  if (!waypoint)
    return

  const { marker } = waypoint
  const { photo } = marker

  if (photo.thumbnailUrl)
    loadImage(photo.thumbnailUrl)

  const MARGIN = Math.max(16, Math.round(W * 0.018))
  const CARD_W = Math.round(W * 0.26)
  const PHOTO_H = Math.round(CARD_W * 0.65)
  const FONT_TITLE = Math.max(12, Math.round(W * 0.014))
  const FONT_META = Math.max(10, Math.round(W * 0.011))
  const LINE_H = Math.round(FONT_TITLE * 1.6)
  const PAD = Math.round(FONT_TITLE * 0.7)
  const INFO_H = PAD * 2 + LINE_H + Math.round(FONT_META * 1.6)
  const CARD_H = PHOTO_H + INFO_H
  const RADIUS = Math.max(10, Math.round(W * 0.009))

  const cx = W - CARD_W - MARGIN
  const cy = MARGIN

  ctx.save()

  ctx.beginPath()
  ctx.roundRect(cx, cy, CARD_W, CARD_H, RADIUS)
  ctx.clip()

  ctx.fillStyle = 'rgba(0,0,0,0.85)'
  ctx.fillRect(cx, cy, CARD_W, CARD_H)

  const img = photo.thumbnailUrl ? imageCache.get(photo.thumbnailUrl) : undefined
  if (img)
    drawImageCover(ctx, img, cx, cy, CARD_W, PHOTO_H)

  const grad = ctx.createLinearGradient(cx, cy + PHOTO_H * 0.4, cx, cy + PHOTO_H)
  grad.addColorStop(0, 'rgba(0,0,0,0)')
  grad.addColorStop(1, 'rgba(0,0,0,0.5)')
  ctx.fillStyle = grad
  ctx.fillRect(cx, cy, CARD_W, PHOTO_H)

  if (photo.dateTaken) {
    const dateStr = new Date(photo.dateTaken).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    ctx.font = `${FONT_META}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.textBaseline = 'bottom'
    ctx.fillText(dateStr, cx + PAD, cy + PHOTO_H - PAD)
  }

  ctx.font = `600 ${FONT_TITLE}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  ctx.textBaseline = 'top'
  ctx.fillText(
    truncateText(ctx, photo.title || marker.id, CARD_W - PAD * 2),
    cx + PAD,
    cy + PHOTO_H + PAD,
  )

  const coordStr = `${Math.abs(marker.latitude).toFixed(4)}°${marker.latitudeRef ?? 'N'}, ${Math.abs(marker.longitude).toFixed(4)}°${marker.longitudeRef ?? 'E'}`
  ctx.font = `${FONT_META}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.fillText(
    truncateText(ctx, coordStr, CARD_W - PAD * 2),
    cx + PAD,
    cy + PHOTO_H + PAD + LINE_H,
  )

  ctx.restore()

  ctx.save()
  ctx.beginPath()
  ctx.roundRect(cx, cy, CARD_W, CARD_H, RADIUS)
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.restore()
}

function drawWatermark(ctx: CanvasRenderingContext2D, W: number, H: number): void {
  const text = 'Made with Locusify'
  const fontSize = Math.max(12, Math.round(W * 0.018))
  ctx.save()
  ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
  const textW = ctx.measureText(text).width
  const paddingX = fontSize * 0.7
  const paddingY = fontSize * 0.5
  const pillW = textW + paddingX * 2
  const pillH = fontSize + paddingY * 2
  const margin = Math.max(10, W * 0.015)
  const x = W - pillW - margin
  const y = H - pillH - margin
  const r = pillH / 2

  ctx.globalAlpha = 0.55
  ctx.fillStyle = '#000000'
  ctx.beginPath()
  ctx.roundRect(x, y, pillW, pillH, r)
  ctx.fill()

  ctx.globalAlpha = 1
  ctx.fillStyle = '#ffffff'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x + paddingX, y + pillH / 2)
  ctx.restore()
}

// ─── RecordingSession class ────────────────────────────────────────────────────

/**
 * Encapsulates the composite canvas + MediaRecorder lifecycle for one
 * recording session. All rAF / chunk / recorder state is internal.
 */
class RecordingSession {
  /** The composite canvas whose stream is being recorded */
  readonly canvas: HTMLCanvasElement

  private readonly ctx: CanvasRenderingContext2D
  private readonly W: number
  private readonly H: number
  private readonly mapCanvas: HTMLCanvasElement
  private readonly recorder: MediaRecorder
  private readonly chunks: Blob[] = []

  private startTime: number | null = null
  private introEnded = false
  private rafId: number | null = null
  private disposed = false

  constructor(
    mapCanvas: HTMLCanvasElement,
    mimeType: string,
    onComplete: (blob: Blob) => void,
  ) {
    this.mapCanvas = mapCanvas
    this.W = mapCanvas.width
    this.H = mapCanvas.height

    const composite = document.createElement('canvas')
    composite.width = this.W
    composite.height = this.H
    this.canvas = composite
    this.ctx = composite.getContext('2d')!

    const stream = composite.captureStream(30)
    this.recorder = new MediaRecorder(stream, { mimeType })

    this.recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0)
        this.chunks.push(e.data)
    }

    this.recorder.onstop = () => {
      this.cancelRaf()
      if (!this.disposed) {
        const blob = new Blob(this.chunks, { type: mimeType })
        onComplete(blob)
      }
    }
  }

  /** Begin composite rendering and MediaRecorder capture */
  start(): void {
    this.rafId = requestAnimationFrame(this.drawFrame)
    this.recorder.start()
  }

  /** Flush remaining data and stop — triggers onComplete via onstop */
  stop(): void {
    if (this.recorder.state === 'inactive')
      return
    try {
      this.recorder.requestData()
    }
    catch { /* no-op */ }
    this.recorder.stop()
  }

  /** Tear down without emitting a blob (e.g. user discards before stop) */
  dispose(): void {
    this.disposed = true
    this.cancelRaf()
    if (this.recorder.state !== 'inactive')
      this.recorder.stop()
  }

  private cancelRaf(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  private readonly drawFrame = (timestamp: number): void => {
    if (this.startTime === null)
      this.startTime = timestamp
    const elapsed = timestamp - this.startTime

    this.ctx.drawImage(this.mapCanvas, 0, 0, this.W, this.H)

    if (!this.introEnded) {
      const stillIntro = drawIntro(this.ctx, this.W, this.H, elapsed)
      if (!stillIntro)
        this.introEnded = true
    }

    if (this.introEnded) {
      drawPhotoCard(this.ctx, this.W, this.H)
      drawWatermark(this.ctx, this.W, this.H)
    }

    this.rafId = requestAnimationFrame(this.drawFrame)
  }
}

// ─── Public types ──────────────────────────────────────────────────────────────

export interface PendingVideo {
  blob: Blob
  mimeType: string
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useVideoRecorder() {
  const mapInstance = useMapStore(s => s.mapInstance)
  const replayStatus = useReplayStore(s => s.status)

  const [status, setStatus] = useState<RecordingStatus>('idle')
  const [pendingVideo, setPendingVideo] = useState<PendingVideo | null>(null)

  const mimeTypeRef = useRef<string | null>(null)
  const sessionRef = useRef<RecordingSession | null>(null)

  // Detect browser support on mount
  useEffect(() => {
    const mime = detectMimeType()
    mimeTypeRef.current = mime
    if (mime === null)
      setStatus('unsupported')
  }, [])

  // Eagerly preload waypoint photos into cache
  useEffect(() => {
    return useReplayStore.subscribe((state) => {
      for (const wp of state.waypoints) {
        if (wp.marker.photo.thumbnailUrl)
          loadImage(wp.marker.photo.thumbnailUrl)
      }
    })
  }, [])

  const stopRecording = useCallback(() => {
    const session = sessionRef.current
    if (session) {
      setStatus('processing')
      session.stop()
    }
  }, [])

  // Auto-stop when replay animation completes
  useEffect(() => {
    if (status === 'recording' && replayStatus === 'completed')
      stopRecording()
  }, [replayStatus, status, stopRecording])

  /**
   * Starts recording immediately.
   * Draws the logo intro on the composite canvas for INTRO_MS, then switches
   * to drawing the map with photo card + watermark overlay.
   * The visible UI intro is handled by ReplayIntroOverlay which calls
   * togglePlayPause when its animation completes — both share the same duration
   * so they stay in sync.
   */
  const startAutoRecord = useCallback(() => {
    if (!mapInstance || status !== 'idle')
      return
    const mimeType = mimeTypeRef.current
    if (mimeType === null)
      return

    const mapCanvas = mapInstance.getCanvas()
    mapInstance.triggerRepaint()

    const session = new RecordingSession(mapCanvas, mimeType, (blob) => {
      setPendingVideo({ blob, mimeType })
      setStatus('idle')
      sessionRef.current = null
    })
    sessionRef.current = session
    session.start()
    setStatus('recording')
  }, [mapInstance, status])

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
    setPendingVideo(null)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      sessionRef.current?.dispose()
    }
  }, [])

  return {
    status,
    pendingVideo,
    startAutoRecord,
    saveVideo,
    discardVideo,
    isSupported: status !== 'unsupported',
    isRecording: status === 'recording',
    isProcessing: status === 'processing',
  }
}
