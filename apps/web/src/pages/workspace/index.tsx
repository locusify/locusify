import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { GpsExtractionStep } from './components/GpsExtractionStep'
import { PhotoUploadStep } from './components/PhotoUploadStep'
import { StepIndicator } from './components/StepIndicator'
import { TrajectoryReplayStep } from './components/TrajectoryReplayStep'
import { useWorkspaceStore } from './useWorkspaceStore'

const Workspace: FC = () => {
  const { t } = useTranslation()
  const { currentStep } = useWorkspaceStore()

  // Render appropriate step component
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PhotoUploadStep />
      case 2:
        return <GpsExtractionStep />
      case 3:
        return <TrajectoryReplayStep />
      default:
        return <PhotoUploadStep />
    }
  }

  return (
    <div className="size-full flex flex-col bg-gray-50">
      {/* Header - Hidden on mobile */}
      <div className="bg-white border-b px-4 md:px-6 py-3 md:py-4 shrink-0 hidden md:block">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          {t('workspace.title')}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {t('workspace.subtitle')}
        </p>
      </div>

      {/* Step Indicator */}
      <div className="bg-white border-b px-2 md:px-6 shrink-0">
        <StepIndicator currentStep={currentStep} />
      </div>

      {/* Content Container */}
      <div className="flex-1 overflow-y-auto">
        <div className={currentStep === 3 ? 'h-full max-w-5xl mx-auto px-3 md:px-6 py-3 md:py-8' : 'max-w-5xl mx-auto px-3 md:px-6 py-3 md:py-8'}>
          {renderStep()}
        </div>
      </div>
    </div>
  )
}

export default Workspace
