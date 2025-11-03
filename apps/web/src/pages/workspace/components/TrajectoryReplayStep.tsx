import type { FC } from 'react'
import type { MapRef } from 'react-map-gl/maplibre'
import { AlertCircle, Pause, Play, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Map, { Layer, Marker, Source } from 'react-map-gl/maplibre'
import logoUrl from '@/assets/locusify.png'
import { Button } from '@/components/ui/button'
import { useWorkspaceStore } from '../useWorkspaceStore'
import { StepNavigation } from './StepNavigation'

/**
 * 轨迹回放组件
 * 在地图上回放用户上传照片的GPS轨迹，支持播放控制
 * 使用 MapLibre GL
 */
export const TrajectoryReplayStep: FC = () => {
  const { t } = useTranslation()
  const { gpsData, goToPreviousStep } = useWorkspaceStore()

  /** 当前正在显示的照片索引 */
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  /** 动画是否正在播放 */
  const [isPlaying, setIsPlaying] = useState(false)

  /** 地图实例引用 */
  const mapRef = useRef<MapRef>(null)

  /** 动画定时器引用 */
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * 从GPS数据生成轨迹信息
   * 过滤出有效的GPS数据，按时间排序，生成轨迹坐标和路径点
   */
  const trajectoryData = useMemo(() => {
    /** 过滤并排序有效的GPS数据 */
    const validGpsData = gpsData
      .filter(d => d.hasValidGps && d.gps)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

    /** 轨迹坐标数组 [经度, 纬度] - GeoJSON格式 */
    const trajectory: [number, number][] = validGpsData.map(d => [
      d.gps!.longitude,
      d.gps!.latitude,
    ])

    /** 路径点数组 - 包含位置、照片、时间戳等信息 */
    const waypoints = validGpsData.map(d => ({
      position: [d.gps!.longitude, d.gps!.latitude] as [number, number],
      photoUrl: d.photo.previewUrl,
      timestamp: d.timestamp,
      locationName: d.locationName,
    }))

    return { trajectory, waypoints, validGpsData }
  }, [gpsData])

  const { trajectory, waypoints, validGpsData } = trajectoryData

  /**
   * 计算地图中心点和缩放级别
   * 根据轨迹的边界框自动计算合适的地图视图
   */
  const mapConfig = useMemo(() => {
    if (trajectory.length === 0) {
      return {
        center: [0, 0] as [number, number],
        zoom: 2,
      }
    }

    /** 提取所有纬度坐标 */
    const lats = trajectory.map(([_, lat]) => lat)
    /** 提取所有经度坐标 */
    const lngs = trajectory.map(([lng]) => lng)

    /** 最小纬度 */
    const minLat = Math.min(...lats)
    /** 最大纬度 */
    const maxLat = Math.max(...lats)
    /** 最小经度 */
    const minLng = Math.min(...lngs)
    /** 最大经度 */
    const maxLng = Math.max(...lngs)

    /** 纬度差值 */
    const latDiff = maxLat - minLat
    /** 经度差值 */
    const lngDiff = maxLng - minLng
    /** 最大差值 - 用于确定缩放级别 */
    const maxDiff = Math.max(latDiff, lngDiff)

    /** 根据轨迹范围计算缩放级别 */
    let zoom = 18 // 默认值 - 非常近的点
    if (maxDiff > 0.001)
      zoom = 17
    if (maxDiff > 0.005)
      zoom = 16
    if (maxDiff > 0.01)
      zoom = 15
    if (maxDiff > 0.05)
      zoom = 14
    if (maxDiff > 0.1)
      zoom = 13
    if (maxDiff > 0.5)
      zoom = 11
    if (maxDiff > 1)
      zoom = 9
    if (maxDiff > 5)
      zoom = 7

    return {
      center: trajectory[0] as [number, number], // 以第一个点为中心
      zoom,
    }
  }, [trajectory])

  /**
   * 获取当前显示的照片URL
   * 如果当前索引无效，则使用默认logo
   */
  const currentPhotoUrl = useMemo(() => {
    return waypoints[currentPhotoIndex]?.photoUrl || logoUrl
  }, [waypoints, currentPhotoIndex])

  /**
   * 当前标记位置
   */
  const currentPosition = useMemo(() => {
    return trajectory[currentPhotoIndex]
  }, [trajectory, currentPhotoIndex])

  /**
   * GeoJSON格式的轨迹线数据
   */
  const trajectoryGeoJSON = useMemo(() => {
    return {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: trajectory,
      },
    }
  }, [trajectory])

  /**
   * 清理动画定时器
   */
  const clearAnimationTimer = useCallback(() => {
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current)
      animationTimerRef.current = null
    }
  }, [])

  /**
   * 播放到下一个照片点
   */
  const playToNextPoint = useCallback(() => {
    if (currentPhotoIndex >= trajectory.length - 1) {
      // 到达终点，停止播放
      setIsPlaying(false)
      clearAnimationTimer()
      return
    }

    /** 每段移动的时长（毫秒） */
    const segmentDuration = 2000 // 2秒

    // 设置定时器移动到下一个点
    animationTimerRef.current = setTimeout(() => {
      setCurrentPhotoIndex(prev => prev + 1)
    }, segmentDuration)
  }, [currentPhotoIndex, trajectory.length, clearAnimationTimer])

  /**
   * 监听播放状态和索引变化
   */
  useEffect(() => {
    if (isPlaying) {
      playToNextPoint()
    }
    return () => {
      clearAnimationTimer()
    }
  }, [isPlaying, currentPhotoIndex, playToNextPoint, clearAnimationTimer])

  /**
   * 开始动画播放
   */
  const startAnimation = useCallback(() => {
    if (isPlaying)
      return
    setIsPlaying(true)
  }, [isPlaying])

  /**
   * 暂停动画播放
   */
  const pauseAnimation = useCallback(() => {
    setIsPlaying(false)
    clearAnimationTimer()
  }, [clearAnimationTimer])

  /**
   * 重置动画到初始状态
   */
  const resetAnimation = useCallback(() => {
    setIsPlaying(false)
    clearAnimationTimer()
    setCurrentPhotoIndex(0)
  }, [clearAnimationTimer])

  /**
   * 组件卸载时清理动画
   */
  useEffect(() => {
    return () => {
      clearAnimationTimer()
    }
  }, [clearAnimationTimer])

  // No GPS data case
  if (trajectory.length < 2) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {t('workspace.replay.title', {
              defaultValue: 'Trajectory Replay',
            })}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {t('workspace.replay.description', {
              defaultValue: 'View and replay your journey on the map.',
            })}
          </p>
        </div>

        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-8 text-center">
          <AlertCircle className="mx-auto mb-3 size-12 text-yellow-600" />
          <p className="mb-1 text-sm font-medium text-yellow-900">
            {t('workspace.replay.noData', {
              defaultValue: 'No trajectory data available',
            })}
          </p>
          <p className="text-sm text-yellow-700">
            {t('workspace.replay.noDataMessage', {
              defaultValue:
                'At least 2 photos with valid GPS coordinates are required. Please go back and upload more photos.',
            })}
          </p>
        </div>

        <StepNavigation onBack={goToPreviousStep} showNext={false} />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Map Container */}
      <div
        className="relative flex-1 overflow-hidden rounded-lg border border-gray-200 shadow-sm"
        style={{ minHeight: '400px' }}
      >
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: mapConfig.center[0],
            latitude: mapConfig.center[1],
            zoom: mapConfig.zoom,
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        >
          {/* Trajectory Line */}
          <Source id="trajectory" type="geojson" data={trajectoryGeoJSON}>
            <Layer
              id="trajectory-line"
              type="line"
              paint={{
                'line-color': '#1677ff',
                'line-width': 4,
                'line-opacity': 0.6,
              }}
            />
          </Source>

          {/* Current Position Marker with Photo */}
          {currentPosition && currentPhotoUrl && (
            <Marker
              longitude={currentPosition[0]}
              latitude={currentPosition[1]}
              anchor="center"
            >
              <div className="size-24 rounded-2xl shadow-2xl ring-4 ring-black/10 md:size-32">
                <img
                  src={currentPhotoUrl}
                  className="size-full rounded-xl object-cover"
                  alt="Current position"
                />
              </div>
            </Marker>
          )}

          {/* End Point Marker */}
          {trajectory.length > 0 && (
            <Marker
              longitude={trajectory[trajectory.length - 1][0]}
              latitude={trajectory[trajectory.length - 1][1]}
              anchor="center"
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-red-500 text-white shadow-lg">
                <span className="text-sm font-bold">🏁</span>
              </div>
            </Marker>
          )}
        </Map>

        {/* Progress indicator */}
        <div className="absolute left-2 top-2 max-w-[160px] rounded-lg bg-white/95 px-2 py-2 shadow-lg backdrop-blur-sm md:left-4 md:top-4 md:max-w-xs md:px-4 md:py-3">
          <div className="text-xs font-semibold text-gray-900 md:text-base">
            {t('workspace.replay.progress', {
              defaultValue: 'Progress: {{current}} / {{total}}',
              current: currentPhotoIndex + 1,
              total: trajectory.length,
            })}
          </div>
          <div className="mt-1.5 h-1.5 w-28 rounded-full bg-gray-200 md:mt-2 md:h-2 md:w-40">
            <div
              className="h-1.5 rounded-full bg-primary transition-all duration-300 md:h-2"
              style={{
                width: `${(currentPhotoIndex / (trajectory.length - 1)) * 100}%`,
              }}
            />
          </div>
          {validGpsData[currentPhotoIndex]?.locationName && (
            <p className="mt-1 truncate text-[10px] text-gray-600 md:mt-2 md:text-xs">
              📍
              {validGpsData[currentPhotoIndex].locationName}
            </p>
          )}
        </div>

        {/* Photo count indicator */}
        <div className="absolute right-2 top-2 rounded-lg bg-white/95 px-2 py-2 shadow-lg backdrop-blur-sm md:right-4 md:top-4 md:px-4 md:py-3">
          <div className="text-xs font-medium text-gray-700 md:text-sm">
            📸
            {t('workspace.replay.photoCount', {
              defaultValue: '{{count}} Photos',
              count: validGpsData.length,
            })}
          </div>
        </div>
      </div>

      {/* Control Panel and Navigation - Fixed at bottom */}
      <div className="mt-3 space-y-3">
        {/* Control Panel */}
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center justify-center gap-3">
            {/* Playback controls */}
            {isPlaying
              ? (
                  <Button
                    variant="default"
                    size="icon"
                    onClick={pauseAnimation}
                    className="size-10 text-white"
                    title={t('workspace.controls.pause', { defaultValue: 'Pause' })}
                  >
                    <Pause className="size-5" />
                  </Button>
                )
              : (
                  <Button
                    variant="default"
                    size="icon"
                    onClick={startAnimation}
                    className="size-10 text-white"
                    title={t('workspace.controls.play', { defaultValue: 'Play' })}
                  >
                    <Play className="size-5" />
                  </Button>
                )}

            <Button
              variant="outline"
              size="icon"
              onClick={resetAnimation}
              className="size-10"
              title={t('workspace.controls.reset', { defaultValue: 'Reset' })}
            >
              <RotateCcw className="size-5" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <StepNavigation
          onBack={goToPreviousStep}
          showNext={false}
          backLabel={t('workspace.controls.backToGps', {
            defaultValue: 'Back to GPS Data',
          })}
        />
      </div>
    </div>
  )
}
