import type {
  PhotoGpsData,
  PhotoGpsError,
  PlaybackState,
  TrajectoryWaypoint,
  UploadedPhoto,
  WorkspaceStep,
} from '@/types/workspace'
import { create } from 'zustand'

interface WorkspaceStore {
  // Form state
  currentStep: WorkspaceStep
  setCurrentStep: (step: WorkspaceStep) => void
  goToNextStep: () => void
  goToPreviousStep: () => void

  // Photo upload state
  photos: UploadedPhoto[]
  uploadProgress: Record<string, number> // Photo ID → progress %
  isUploading: boolean
  uploadError: Error | null

  // Actions
  addPhotos: (files: File[]) => void
  removePhoto: (photoId: string) => void
  updatePhotoProgress: (photoId: string, progress: number) => void
  updatePhotoStatus: (
    photoId: string,
    status: UploadedPhoto['uploadStatus'],
    uploadedUrl?: string,
    error?: string,
  ) => void
  clearPhotos: () => void
  setIsUploading: (isUploading: boolean) => void
  setUploadError: (error: Error | null) => void

  // GPS extraction state
  gpsData: PhotoGpsData[]
  isExtractingGps: boolean
  gpsErrors: PhotoGpsError[]

  setGpsData: (data: PhotoGpsData[]) => void
  addGpsData: (data: PhotoGpsData) => void
  updateGpsData: (photoId: string, data: Partial<PhotoGpsData>) => void
  setIsExtractingGps: (isExtracting: boolean) => void
  addGpsError: (error: PhotoGpsError) => void
  clearGpsErrors: () => void

  // Trajectory replay state
  trajectoryPath: [number, number][]
  waypoints: TrajectoryWaypoint[]
  currentPosition: [number, number] | null
  playbackState: PlaybackState

  setTrajectoryPath: (path: [number, number][]) => void
  setWaypoints: (waypoints: TrajectoryWaypoint[]) => void
  setCurrentPosition: (position: [number, number]) => void
  updatePlaybackState: (state: Partial<PlaybackState>) => void
  resetPlayback: () => void

  // Persistence & reset
  resetStore: () => void
}

const initialPlaybackState: PlaybackState = {
  status: 'idle',
  currentWaypointIndex: 0,
  segmentProgress: 0,
  totalProgress: 0,
  speedMultiplier: 2.0,
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  (set, get) => ({
    // Initial state
    currentStep: 1,
    photos: [],
    uploadProgress: {},
    isUploading: false,
    uploadError: null,
    gpsData: [],
    isExtractingGps: false,
    gpsErrors: [],
    trajectoryPath: [],
    waypoints: [],
    currentPosition: null,
    playbackState: initialPlaybackState,

    // Form navigation
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

    // Photo upload actions
    addPhotos: (files) => {
      const newPhotos: UploadedPhoto[] = files.map(file => ({
        id: new Date().getTime().toString(),
        file,
        previewUrl: URL.createObjectURL(file),
        size: file.size,
        mimeType: file.type,
        uploadProgress: 0,
        uploadStatus: 'pending',
        createdAt: new Date(),
      }))

      set(state => ({
        photos: [...state.photos, ...newPhotos],
      }))
    },

    removePhoto: (photoId) => {
      const { photos } = get()
      const photo = photos.find(p => p.id === photoId)

      // Revoke object URL to prevent memory leak
      if (photo?.previewUrl) {
        URL.revokeObjectURL(photo.previewUrl)
      }

      set(state => ({
        photos: state.photos.filter(p => p.id !== photoId),
        uploadProgress: Object.fromEntries(
          Object.entries(state.uploadProgress).filter(([id]) => id !== photoId),
        ),
      }))
    },

    updatePhotoProgress: (photoId, progress) => {
      set(state => ({
        uploadProgress: {
          ...state.uploadProgress,
          [photoId]: progress,
        },
        photos: state.photos.map(p =>
          p.id === photoId ? { ...p, uploadProgress: progress } : p,
        ),
      }))
    },

    updatePhotoStatus: (photoId, status, uploadedUrl, error) => {
      set(state => ({
        photos: state.photos.map(p =>
          p.id === photoId
            ? { ...p, uploadStatus: status, uploadedUrl, uploadError: error }
            : p,
        ),
      }))
    },

    clearPhotos: () => {
      const { photos } = get()

      // Revoke all object URLs
      photos.forEach((photo) => {
        if (photo.previewUrl) {
          URL.revokeObjectURL(photo.previewUrl)
        }
      })

      set({
        photos: [],
        uploadProgress: {},
        isUploading: false,
        uploadError: null,
      })
    },

    setIsUploading: (isUploading) => {
      set({ isUploading })
    },

    setUploadError: (error) => {
      set({ uploadError: error })
    },

    // GPS extraction actions
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

    setIsExtractingGps: (isExtracting) => {
      set({ isExtractingGps: isExtracting })
    },

    addGpsError: (error) => {
      set(state => ({
        gpsErrors: [...state.gpsErrors, error],
      }))
    },

    clearGpsErrors: () => {
      set({ gpsErrors: [] })
    },

    // Trajectory replay actions
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

    // Reset entire store
    resetStore: () => {
      const { photos } = get()

      // Cleanup object URLs
      photos.forEach((photo) => {
        if (photo.previewUrl) {
          URL.revokeObjectURL(photo.previewUrl)
        }
      })

      set({
        currentStep: 1,
        photos: [],
        uploadProgress: {},
        isUploading: false,
        uploadError: null,
        gpsData: [],
        isExtractingGps: false,
        gpsErrors: [],
        trajectoryPath: [],
        waypoints: [],
        currentPosition: null,
        playbackState: initialPlaybackState,
      })
    },
  }),
)
