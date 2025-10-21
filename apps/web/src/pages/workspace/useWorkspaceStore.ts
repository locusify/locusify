import type {
  PhotoGpsData,
  PhotoGpsError,
  PlaybackState,
  TrajectoryWaypoint,
  UploadedPhoto,
  WorkspaceStep,
} from '@/types/workspace'
import { create } from 'zustand'

/**
 * 工作区状态管理接口
 * 管理整个工作区工作流程的状态，包括照片管理、GPS 提取和轨迹回放
 */
interface WorkspaceStore {
  /* ==================== 步骤导航状态 ==================== */

  /**
   * 当前工作区流程步骤 (1-3)
   * 步骤 1: 照片选择
   * 步骤 2: GPS 提取与路线预览
   * 步骤 3: 轨迹回放与 Vlog 生成
   */
  currentStep: WorkspaceStep

  /**
   * 直接设置当前工作流程步骤
   * @param step - 目标步骤号 (1-3)
   */
  setCurrentStep: (step: WorkspaceStep) => void

  /**
   * 前往下一步
   * 不会超过步骤 3
   */
  goToNextStep: () => void

  /**
   * 返回上一步
   * 不会低于步骤 1
   */
  goToPreviousStep: () => void

  /* ==================== 照片管理状态 ==================== */

  /**
   * 已选择的照片数组，包含元数据
   * 每张照片包含文件信息、预览 URL
   */
  photos: UploadedPhoto[]

  /**
   * 全局加载状态
   * 用于 GPS 提取、轨迹生成等异步操作
   */
  loading: boolean

  /**
   * 全局错误状态
   * 存储最近的操作错误
   */
  error: Error | null

  /* ==================== 照片管理操作 ==================== */

  /**
   * 添加新照片到队列
   * 自动生成预览 URL 并初始化元数据
   * @param files - 来自文件选择器的 File 对象数组
   */
  addPhotos: (files: File[]) => void

  /**
   * 批量添加已经创建好的照片对象(用于测试数据)
   * @param photos - UploadedPhoto 对象数组
   */
  addUploadedPhotos: (photos: UploadedPhoto[]) => void

  /**
   * 从队列中移除照片
   * 自动释放预览 URL 以防止内存泄漏
   * @param photoId - 要移除的照片唯一标识符
   */
  removePhoto: (photoId: string) => void

  /**
   * 清空所有照片
   * 自动释放所有预览 URL
   */
  clearPhotos: () => void

  /**
   * 设置全局加载状态
   * @param loading - 是否正在加载
   */
  setLoading: (loading: boolean) => void

  /**
   * 设置全局错误状态
   * @param error - 错误对象，传入 null 可清除错误
   */
  setError: (error: Error | null) => void

  /* ==================== GPS 提取状态 ==================== */

  /**
   * 从照片中提取的 GPS 数据数组
   * 每条数据包含坐标、时间戳和位置元数据
   */
  gpsData: PhotoGpsData[]

  /**
   * GPS 提取错误数组
   * 跟踪 GPS 提取失败的照片及其错误详情
   */
  gpsErrors: PhotoGpsError[]

  /* ==================== GPS 提取操作 ==================== */

  /**
   * 用新数据集替换所有 GPS 数据
   * 通常在批量 GPS 提取后使用
   * @param data - 完整的 GPS 数据数组
   */
  setGpsData: (data: PhotoGpsData[]) => void

  /**
   * 向现有集合中添加单条 GPS 数据
   * 用于增量 GPS 提取
   * @param data - 单张照片的 GPS 数据
   */
  addGpsData: (data: PhotoGpsData) => void

  /**
   * 更新指定照片的 GPS 数据
   * 支持部分更新（例如添加逆地理编码结果）
   * @param photoId - 照片的唯一标识符
   * @param data - 要合并的部分 GPS 数据
   */
  updateGpsData: (photoId: string, data: Partial<PhotoGpsData>) => void

  /**
   * 向错误集合中添加 GPS 提取错误
   * @param error - 错误详情，包括 photoId 和错误消息
   */
  addGpsError: (error: PhotoGpsError) => void

  /**
   * 清空所有 GPS 提取错误
   * 通常在重试提取或重置工作流程时调用
   */
  clearGpsErrors: () => void

  /* ==================== 轨迹回放状态 ==================== */

  /**
   * 完整的轨迹路径，作为坐标数组 [经度, 纬度]
   * 用于在地图上渲染完整路线
   */
  trajectoryPath: [number, number][]

  /**
   * 包含照片元数据和时间戳的路径点数组
   * 每个路径点代表轨迹上的一个照片位置
   */
  waypoints: TrajectoryWaypoint[]

  /**
   * 当前回放位置 [经度, 纬度]
   * 回放空闲或完成时为 null
   */
  currentPosition: [number, number] | null

  /**
   * 轨迹动画的回放状态
   * 包括回放状态、进度、速度倍率和当前路径点
   */
  playbackState: PlaybackState

  /* ==================== 轨迹回放操作 ==================== */

  /**
   * 设置用于地图渲染的完整轨迹路径
   * @param path - 坐标对数组 [经度, 纬度]
   */
  setTrajectoryPath: (path: [number, number][]) => void

  /**
   * 设置轨迹的所有路径点
   * @param waypoints - 包含照片元数据的路径点数组
   */
  setWaypoints: (waypoints: TrajectoryWaypoint[]) => void

  /**
   * 更新当前回放位置
   * @param position - 当前坐标 [经度, 纬度]
   */
  setCurrentPosition: (position: [number, number]) => void

  /**
   * 更新回放状态（状态、进度、速度等）
   * 支持通过扩展运算符进行部分更新
   * @param state - 要合并的部分回放状态
   */
  updatePlaybackState: (state: Partial<PlaybackState>) => void

  /**
   * 重置回放到初始状态
   * 重置回放状态、进度和当前位置
   */
  resetPlayback: () => void

  /* ==================== 持久化与重置 ==================== */

  /**
   * 将整个 store 重置为初始状态
   * 清理所有照片预览 URL 以防止内存泄漏
   * 在开始新的工作区会话时使用
   */
  resetStore: () => void
}

/**
 * 轨迹回放的初始状态
 * 默认速度倍率为 2.0x，以实现更流畅的动画
 */
const initialPlaybackState: PlaybackState = {
  status: 'idle',
  currentWaypointIndex: 0,
  segmentProgress: 0,
  totalProgress: 0,
  speedMultiplier: 2.0,
}

/**
 * 工作区状态管理 Store
 *
 * 此 Store 处理旅行 Vlog 创建的整个工作流程：
 * 1. 照片选择 - 选择旅行照片
 * 2. GPS 提取 - 提取 EXIF GPS 数据并生成轨迹
 * 3. 轨迹回放 - 路线回放动画并生成 Vlog
 *
 * @example
 * ```tsx
 * const { photos, addPhotos, goToNextStep, loading } = useWorkspaceStore()
 *
 * // 添加照片
 * addPhotos(selectedFiles)
 *
 * // 处理完成后前往下一步
 * goToNextStep()
 * ```
 */
export const useWorkspaceStore = create<WorkspaceStore>()(
  (set, get) => ({
    /* ==================== 初始状态 ==================== */
    currentStep: 1,
    photos: [],
    loading: false,
    error: null,
    gpsData: [],
    gpsErrors: [],
    trajectoryPath: [],
    waypoints: [],
    currentPosition: null,
    playbackState: initialPlaybackState,

    /* ==================== 步骤导航操作 ==================== */

    setCurrentStep: (step) => {
      set({ currentStep: step })
    },

    goToNextStep: () => {
      const { currentStep } = get()
      if (currentStep < 3) {
        set({ currentStep: (currentStep + 1) as WorkspaceStep })
      }
    },

    goToPreviousStep: () => {
      const { currentStep } = get()
      if (currentStep > 1) {
        set({ currentStep: (currentStep - 1) as WorkspaceStep })
      }
    },

    /* ==================== 照片管理操作 ==================== */

    addPhotos: (files) => {
      // 为每张照片生成唯一 ID 和预览 URL
      const newPhotos: UploadedPhoto[] = files.map(file => ({
        id: new Date().getTime().toString(),
        file,
        previewUrl: URL.createObjectURL(file),
        size: file.size,
        mimeType: file.type,
        createdAt: new Date(),
      }))

      set(state => ({
        photos: [...state.photos, ...newPhotos],
      }))
    },

    addUploadedPhotos: (photos) => {
      set(state => ({
        photos: [...state.photos, ...photos],
      }))
    },

    removePhoto: (photoId) => {
      const { photos } = get()
      const photo = photos.find(p => p.id === photoId)

      // 释放对象 URL 以防止内存泄漏
      if (photo?.previewUrl) {
        URL.revokeObjectURL(photo.previewUrl)
      }

      set(state => ({
        photos: state.photos.filter(p => p.id !== photoId),
      }))
    },

    clearPhotos: () => {
      const { photos } = get()

      // 释放所有对象 URL 以防止内存泄漏
      photos.forEach((photo) => {
        if (photo.previewUrl) {
          URL.revokeObjectURL(photo.previewUrl)
        }
      })

      set({
        photos: [],
      })
    },

    setLoading: (loading) => {
      set({ loading })
    },

    setError: (error) => {
      set({ error })
    },

    /* ==================== GPS 提取操作 ==================== */

    setGpsData: (data) => {
      set({ gpsData: data })
    },

    addGpsData: (data) => {
      set(state => ({
        gpsData: [...state.gpsData, data],
      }))
    },

    updateGpsData: (photoId, data) => {
      set(state => ({
        gpsData: state.gpsData.map(item =>
          item.photoId === photoId ? { ...item, ...data } : item,
        ),
      }))
    },

    addGpsError: (error) => {
      set(state => ({
        gpsErrors: [...state.gpsErrors, error],
      }))
    },

    clearGpsErrors: () => {
      set({ gpsErrors: [] })
    },

    /* ==================== 轨迹回放操作 ==================== */

    setTrajectoryPath: (path) => {
      set({ trajectoryPath: path })
    },

    setWaypoints: (waypoints) => {
      set({ waypoints })
    },

    setCurrentPosition: (position) => {
      set({ currentPosition: position })
    },

    updatePlaybackState: (state) => {
      set(prevState => ({
        playbackState: { ...prevState.playbackState, ...state },
      }))
    },

    resetPlayback: () => {
      set({
        playbackState: initialPlaybackState,
        currentPosition: null,
      })
    },

    /* ==================== 持久化与重置 ==================== */

    resetStore: () => {
      const { photos } = get()

      // 清理所有对象 URL 以防止内存泄漏
      photos.forEach((photo) => {
        if (photo.previewUrl) {
          URL.revokeObjectURL(photo.previewUrl)
        }
      })

      // 将所有状态重置为初始值
      set({
        currentStep: 1,
        photos: [],
        loading: false,
        error: null,
        gpsData: [],
        gpsErrors: [],
        trajectoryPath: [],
        waypoints: [],
        currentPosition: null,
        playbackState: initialPlaybackState,
      })
    },
  }),
)
