import type { FC } from 'react'
import { APILoader } from '@uiw/react-amap-api-loader'
import { Map } from '@uiw/react-amap-map'
import { Marker } from '@uiw/react-amap-marker'
import { Polyline } from '@uiw/react-amap-polyline'
import { AlertCircle, Pause, Play, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import logoUrl from '@/assets/locusify.png'
import { Button } from '@/components/ui/button'
import { env } from '@/lib/env'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { StepNavigation } from './StepNavigation'
/**
 * 轨迹回放组件
 * 在地图上回放用户上传照片的GPS轨迹，支持播放控制
 */
export const TrajectoryReplayStep: FC = () => {
  const { t } = useTranslation()
  const { gpsData, goToPreviousStep } = useWorkspaceStore()

  /** 当前正在显示的照片索引 */
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  /** 动画是否正在播放 */
  const [isPlaying, setIsPlaying] = useState(false)

  /** 地图标记点引用 - 用于控制移动动画 */
  const markerRef = useRef<AMap.Marker | null>(null)

  /** 地图实例引用 */
  const mapRef = useRef<AMap.Map | null>(null)

  /**
   * 从GPS数据生成轨迹信息
   * 过滤出有效的GPS数据，按时间排序，生成轨迹坐标和路径点
   */
  const trajectoryData = useMemo(() => {
    /** 过滤并排序有效的GPS数据 */
    const validGpsData = gpsData
      .filter(d => d.hasValidGps && d.gps)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

    /** 轨迹坐标数组 [经度, 纬度] */
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
    return waypoints[currentPhotoIndex].photoUrl || logoUrl
  }, [waypoints, currentPhotoIndex])

  /**
   * 播放到下一个照片点
   * 使用串行的方式逐段播放轨迹，确保 currentPhotoIndex 正确更新
   */
  const playToNextPoint = useCallback((fromIndex: number) => {
    const marker = markerRef.current
    if (!marker || fromIndex >= trajectory.length - 1) {
      // 到达终点，停止播放
      setIsPlaying(false)
      return
    }

    const nextIndex = fromIndex + 1
    const segment = [trajectory[fromIndex], trajectory[nextIndex]]

    /** 每段移动的时长（毫秒） */
    const segmentDuration = 2000 // 2秒

    // 移动到下一个点
    marker.moveAlong(segment, {
      duration: segmentDuration,
      autoRotation: false,
    })

    // 使用定时器在移动完成后更新索引并继续播放
    setTimeout(() => {
      // 更新当前照片索引
      setCurrentPhotoIndex(nextIndex)

      // 继续播放下一段
      playToNextPoint(nextIndex)
    }, segmentDuration)
  }, [trajectory])

  /**
   * 开始动画播放
   * 支持从头播放和从当前位置继续播放
   */
  const startAnimation = useCallback(() => {
    const marker = markerRef.current
    if (!marker || isPlaying)
      return

    setIsPlaying(true)
    // 从当前索引开始播放
    playToNextPoint(currentPhotoIndex)
  }, [isPlaying, currentPhotoIndex, playToNextPoint])

  /**
   * 暂停动画播放
   */
  const pauseAnimation = useCallback(() => {
    const marker = markerRef.current
    if (!marker)
      return

    marker.pauseMove()
    setIsPlaying(false)
  }, [])

  /**
   * 重置动画到初始状态
   * 停止播放并将标记移回起点
   */
  const resetAnimation = useCallback(() => {
    const marker = markerRef.current
    if (!marker || trajectory.length === 0)
      return

    marker.stopMove()
    setIsPlaying(false)
    marker.setPosition(trajectory[0])
    setCurrentPhotoIndex(0)
  }, [trajectory])

  /**
   * 组件卸载时清理动画
   */
  useEffect(() => {
    return () => {
      const marker = markerRef.current
      if (marker) {
        marker.stopMove()
      }
    }
  }, [])

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
          <p className="text-sm text-gray-600 mt-1">
            {t('workspace.replay.description', {
              defaultValue: 'View and replay your journey on the map.',
            })}
          </p>
        </div>

        <div className="p-8 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <AlertCircle className="size-12 text-yellow-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-yellow-900 mb-1">
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
    <div className="flex flex-col h-full">
      {/* Map Container */}
      <div
        className="flex-1 relative rounded-lg overflow-hidden border border-gray-200 shadow-sm"
        style={{ minHeight: '400px' }}
      >
        <APILoader
          akey={env.AMAP_KEY}
          version="2.0"
          plugins={['AMap.MoveAnimation']}
        >
          <Map
            ref={(instance) => {
              // 从 react-amap 包装的实例中获取原生 AMap.Map
              if (instance?.map) {
                mapRef.current = instance.map
              }
            }}
            center={mapConfig.center}
            zoom={mapConfig.zoom}
            style={{
              width: '100%',
              height: '100%',
            }}
          >
            {/* Polyline showing the full trajectory */}
            <Polyline
              path={trajectory}
              strokeColor="#1677ff"
              strokeWeight={4}
              strokeOpacity={0.6}
            />

            {/* Moving marker with photo - position is managed by moveAlong API */}
            {currentPhotoUrl && (
              <Marker
                key="current-position-marker"
                ref={(instance) => {
                  // 从 react-amap 包装的实例中获取原生 AMap.Marker
                  if (instance?.marker) {
                    markerRef.current = instance.marker
                  }
                }}
                position={trajectory[currentPhotoIndex]}
                anchor="center"
              >
                <div className="size-24 md:size-32 rounded-2xl shadow-2xl ring-4 ring-black/10">
                  <img
                    src={currentPhotoUrl}
                    className="size-full object-cover rounded-xl"
                    alt="Current position"
                  />
                </div>
              </Marker>
            )}

            {/* End marker */}
            <Marker
              position={trajectory.at(-1)}
              anchor="center"
              icon="https://webapi.amap.com/theme/v1.3/markers/n/end.png"
            />
          </Map>
        </APILoader>

        {/* Progress indicator */}
        <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-2 py-2 md:px-4 md:py-3 text-sm max-w-[160px] md:max-w-xs">
          <div className="font-semibold text-gray-900 text-xs md:text-base">
            {t('workspace.replay.progress', {
              defaultValue: 'Progress: {{current}} / {{total}}',
              current: currentPhotoIndex + 1,
              total: trajectory.length,
            })}
          </div>
          <div className="mt-1.5 md:mt-2 bg-gray-200 rounded-full h-1.5 md:h-2 w-28 md:w-40">
            <div
              className="bg-primary h-1.5 md:h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(currentPhotoIndex / (trajectory.length - 1)) * 100
                }%`,
              }}
            />
          </div>
          {validGpsData[currentPhotoIndex]?.locationName && (
            <p className="text-[10px] md:text-xs text-gray-600 mt-1 md:mt-2 truncate">
              📍
              {validGpsData[currentPhotoIndex].locationName}
            </p>
          )}
        </div>

        {/* Photo count indicator */}
        <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-2 py-2 md:px-4 md:py-3">
          <div className="text-gray-700 font-medium text-xs md:text-sm">
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
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
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
