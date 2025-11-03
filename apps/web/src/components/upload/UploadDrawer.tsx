import type { UploadFile } from '@/types/upload'
import { useCallback, useState } from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { GPSInfoPanel } from './GPSInfoPanel'
import { PhotoSelector } from './PhotoSelector'
import { UploadProgress } from './UploadProgress'

enum UploadStep {
  SELECT = 'select',
  PREVIEW = 'preview',
  UPLOADING = 'uploading',
  COMPLETE = 'complete',
}

interface UploadDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploadComplete?: () => void
}

export function UploadDrawer({
  open,
  onOpenChange,
  onUploadComplete,
}: UploadDrawerProps) {
  const [currentStep, setCurrentStep] = useState<UploadStep>(UploadStep.SELECT)
  const [selectedFiles, setSelectedFiles] = useState<UploadFile[]>([])
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  // Handle file selection
  const handleFilesSelected = useCallback((files: UploadFile[]) => {
    setSelectedFiles(files)
    if (files.length > 0) {
      setCurrentStep(UploadStep.PREVIEW)
    }
  }, [])

  // Handle upload confirmation
  const handleConfirmUpload = useCallback(async () => {
    setCurrentStep(UploadStep.UPLOADING)

    // Filter only files with GPS data
    const filesWithGPS = selectedFiles.filter(file => file.gpsInfo)

    // Initialize progress for files with GPS only
    const progress: Record<string, number> = {}
    filesWithGPS.forEach((file) => {
      progress[file.id] = 100 // Mark all as complete immediately
    })
    setUploadProgress(progress)

    // Update selected files to only include those with GPS
    setSelectedFiles(filesWithGPS)

    // Mark as complete
    setCurrentStep(UploadStep.COMPLETE)

    // Call completion callback
    onUploadComplete?.()
  }, [selectedFiles, onUploadComplete])

  // Handle cancel
  const handleCancel = useCallback(() => {
    setSelectedFiles([])
    setCurrentStep(UploadStep.SELECT)
  }, [])

  // Handle remove file
  const handleRemoveFile = useCallback((fileId: string) => {
    setSelectedFiles((prev) => {
      const updated = prev.filter(f => f.id !== fileId)
      if (updated.length === 0) {
        setCurrentStep(UploadStep.SELECT)
      }
      return updated
    })
  }, [])

  // Handle drawer close
  const handleClose = useCallback(() => {
    // Reset state when closing
    setCurrentStep(UploadStep.SELECT)
    setSelectedFiles([])
    setUploadProgress({})
    onOpenChange(false)
  }, [onOpenChange])

  // Prevent closing during upload
  const handleOpenChange = useCallback(
    (open: boolean) => {
      // Don't allow closing if upload is in progress
      if (!open && currentStep === UploadStep.UPLOADING) {
        return
      }
      if (!open) {
        handleClose()
      }
      else {
        onOpenChange(open)
      }
    },
    [currentStep, handleClose, onOpenChange],
  )

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="max-h-[90vh] border-none bg-transparent backdrop-blur-none">
        {/* Header - only show on select step */}
        {currentStep === UploadStep.SELECT && (
          <DrawerHeader className="hidden">
            <DrawerTitle>Upload Photos</DrawerTitle>
            <DrawerDescription>
              Select photos to upload to your collection
            </DrawerDescription>
          </DrawerHeader>
        )}

        {/* Content with glass background */}
        <div className="flex flex-col overflow-hidden rounded-t-3xl bg-gray-50/95 backdrop-blur-xl dark:bg-gray-900/95">
          {/* Header with close button */}
          <div className="flex shrink-0 items-center justify-between p-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={currentStep === UploadStep.UPLOADING}
              className="flex size-10 items-center justify-center rounded-full border border-gray-200/50 bg-white/50 text-gray-700 shadow-sm backdrop-blur-sm transition-all hover:bg-white/70 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700/50 dark:bg-black/30 dark:text-gray-300 dark:hover:bg-black/40"
              title={currentStep === UploadStep.UPLOADING ? 'Upload in progress...' : 'Close'}
            >
              <i className="i-mingcute-close-line text-lg" />
            </button>
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto p-4 pt-0">
            {/* Step 1: File Selection */}
            {currentStep === UploadStep.SELECT && (
              <PhotoSelector onFilesSelected={handleFilesSelected} />
            )}

            {/* Step 2: GPS Info Preview */}
            {currentStep === UploadStep.PREVIEW && (
              <GPSInfoPanel
                files={selectedFiles}
                onConfirm={handleConfirmUpload}
                onCancel={handleCancel}
                onRemoveFile={handleRemoveFile}
              />
            )}

            {/* Step 3 & 4: Upload Progress & Complete */}
            {(currentStep === UploadStep.UPLOADING
              || currentStep === UploadStep.COMPLETE) && (
              <UploadProgress
                files={selectedFiles}
                progress={uploadProgress}
                isComplete={currentStep === UploadStep.COMPLETE}
              />
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
