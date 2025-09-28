import type { FC } from 'react'
import { MapPin, Settings, Share2, Upload, Video } from 'lucide-react'
import { useState } from 'react'

type WorkflowStep = 'upload' | 'processing' | 'preview' | 'complete'

const UploadSection: FC<{ onPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void }> = ({ onPhotoUpload }) => (
  <div className="text-center">
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 hover:border-blue-400 transition-colors">
      <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Your Travel Photos</h3>
      <p className="text-gray-600 mb-6">Select 5-50 photos from your trip to create your travel story</p>

      <label className="inline-block">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={onPhotoUpload}
          className="hidden"
        />
        <span className="bg-blue-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors inline-block font-medium">
          Choose Photos
        </span>
      </label>

      <p className="text-sm text-gray-500 mt-4">
        Supported formats: JPEG, PNG, HEIC • Max 10MB per photo • 200MB total
      </p>
    </div>
  </div>
)

const ProcessingSection: FC<{ photoCount: number }> = ({ photoCount }) => (
  <div className="text-center">
    <div className="animate-spin w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6"></div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">Generating Your Travel Story</h3>
    <p className="text-gray-600 mb-4">
      Processing
      {photoCount}
      {' '}
      photos...
    </p>

    <div className="max-w-md mx-auto">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>Analyzing photos</span>
        <span>60%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="bg-blue-600 h-2 rounded-full w-3/5 transition-all duration-1000"></div>
      </div>
    </div>

    <div className="mt-8 grid grid-cols-3 gap-4 text-sm text-gray-600">
      <div className="flex items-center justify-center space-x-2">
        <MapPin className="w-4 h-4 text-blue-600" />
        <span>Extracting locations</span>
      </div>
      <div className="flex items-center justify-center space-x-2">
        <Video className="w-4 h-4 text-blue-600" />
        <span>Creating video</span>
      </div>
      <div className="flex items-center justify-center space-x-2">
        <Share2 className="w-4 h-4 text-blue-600" />
        <span>Generating map</span>
      </div>
    </div>
  </div>
)

const PreviewSection: FC<{
  photos: File[]
  onComplete: () => void
  onReset: () => void
}> = ({ photos, onComplete, onReset }) => (
  <div>
    <h3 className="text-xl font-semibold text-gray-900 mb-6">Preview Your Travel Story</h3>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Route Map Preview */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-800">Interactive Route Map</h4>
        <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Route map will appear here</p>
            <p className="text-sm text-gray-500">
              {photos.length}
              {' '}
              locations detected
            </p>
          </div>
        </div>
      </div>

      {/* Video Preview */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-800">Travel Video</h4>
        <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
          <div className="text-center">
            <Video className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Video preview will appear here</p>
            <p className="text-sm text-gray-500">90 seconds • Adventure style</p>
          </div>
        </div>
      </div>
    </div>

    {/* Customization Options */}
    <div className="mt-8 p-6 bg-gray-50 rounded-lg">
      <h4 className="text-lg font-medium text-gray-800 mb-4">Customization Options</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Video Style</label>
          <select className="w-full p-2 border border-gray-300 rounded-md">
            <option>Adventure</option>
            <option>Minimal</option>
            <option>Memories</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Music</label>
          <select className="w-full p-2 border border-gray-300 rounded-md">
            <option>Upbeat Travel</option>
            <option>Peaceful Journey</option>
            <option>Epic Adventure</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
          <select className="w-full p-2 border border-gray-300 rounded-md">
            <option>60 seconds</option>
            <option>90 seconds</option>
            <option>120 seconds</option>
          </select>
        </div>
      </div>
    </div>

    {/* Action Buttons */}
    <div className="mt-8 flex justify-between">
      <button
        onClick={onReset}
        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Start Over
      </button>
      <div className="space-x-4">
        <button className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
          Regenerate
        </button>
        <button
          onClick={onComplete}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Approve & Share
        </button>
      </div>
    </div>
  </div>
)

const CompleteSection: FC<{ onReset: () => void }> = ({ onReset }) => (
  <div className="text-center">
    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
      <Share2 className="w-8 h-8 text-white" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Travel Story is Ready!</h3>
    <p className="text-gray-600 mb-8">Share your adventure with the world</p>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {['Instagram', 'Facebook', 'TikTok', 'Twitter'].map(platform => (
        <button
          key={platform}
          className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="text-sm font-medium text-gray-800">{platform}</div>
        </button>
      ))}
    </div>

    <div className="space-x-4">
      <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
        Save to Device
      </button>
      <button
        onClick={onReset}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Create New Story
      </button>
    </div>
  </div>
)

const Workspace: FC = () => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload')
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([])

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      setUploadedPhotos(files)
      setCurrentStep('processing')

      // Simulate processing time
      setTimeout(() => {
        setCurrentStep('preview')
      }, 3000)
    }
  }

  const resetWorkflow = () => {
    setCurrentStep('upload')
    setUploadedPhotos([])
  }

  const completeWorkflow = () => {
    setCurrentStep('complete')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Workspace</h1>
            <p className="text-gray-600 mt-1">Transform your travel photos into compelling visual stories</p>
          </div>
          <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
            <Settings className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[
              { id: 'upload', label: 'Upload Photos', icon: Upload },
              { id: 'processing', label: 'Generate Content', icon: MapPin },
              { id: 'preview', label: 'Preview & Edit', icon: Video },
              { id: 'complete', label: 'Share', icon: Share2 },
            ].map((step, index) => {
              const isActive = step.id === currentStep
              const isCompleted = ['upload', 'processing', 'preview', 'complete'].indexOf(currentStep) > index
              const StepIcon = step.icon

              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${isActive
                    ? 'bg-blue-600 text-white'
                    : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                  >
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <span className={`ml-2 text-sm font-medium ${isActive
                    ? 'text-blue-600'
                    : isCompleted
                      ? 'text-green-600'
                      : 'text-gray-500'
                  }`}
                  >
                    {step.label}
                  </span>
                  {index < 3 && (
                    <div className={`w-16 h-0.5 ml-4 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {currentStep === 'upload' && (
            <UploadSection onPhotoUpload={handlePhotoUpload} />
          )}

          {currentStep === 'processing' && (
            <ProcessingSection photoCount={uploadedPhotos.length} />
          )}

          {currentStep === 'preview' && (
            <PreviewSection
              photos={uploadedPhotos}
              onComplete={completeWorkflow}
              onReset={resetWorkflow}
            />
          )}

          {currentStep === 'complete' && (
            <CompleteSection onReset={resetWorkflow} />
          )}
        </div>
      </div>
    </div>
  )
}

export default Workspace
