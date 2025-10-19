import type { FC } from 'react'
import type { WorkspaceStep } from '@/types/workspace'
import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface Step {
  number: WorkspaceStep
  titleKey: string
  descriptionKey: string
}

interface StepIndicatorProps {
  currentStep: WorkspaceStep
  completedSteps?: WorkspaceStep[]
}

const STEPS: Step[] = [
  {
    number: 1,
    titleKey: 'workspace.steps.upload.title',
    descriptionKey: 'workspace.steps.upload.description',
  },
  {
    number: 2,
    titleKey: 'workspace.steps.extract.title',
    descriptionKey: 'workspace.steps.extract.description',
  },
  {
    number: 3,
    titleKey: 'workspace.steps.replay.title',
    descriptionKey: 'workspace.steps.replay.description',
  },
]

export const StepIndicator: FC<StepIndicatorProps> = ({
  currentStep,
  completedSteps = [],
}) => {
  const { t } = useTranslation()

  const isStepCompleted = (stepNumber: WorkspaceStep): boolean => {
    return completedSteps.includes(stepNumber) || stepNumber < currentStep
  }

  const isStepCurrent = (stepNumber: WorkspaceStep): boolean => {
    return stepNumber === currentStep
  }

  return (
    <div className="w-full py-2 md:py-3">
      <nav aria-label={t('workspace.steps.navigation', { defaultValue: 'Progress' })}>
        <ol className="flex items-start justify-between px-2 md:px-4">
          {STEPS.map((step, index) => {
            const isCompleted = isStepCompleted(step.number)
            const isCurrent = isStepCurrent(step.number)
            const isLast = index === STEPS.length - 1

            return (
              <li key={step.number} className="flex flex-col items-center relative flex-1">
                {/* Step circle and line container */}
                <div className="flex items-center w-full">
                  {/* Spacer for first item */}
                  {index === 0 && <div className="flex-1" />}

                  {/* Left connector line */}
                  {index > 0 && (
                    <div className="flex-1 h-0.5 mr-1 md:mr-2">
                      <div
                        className={cn(
                          'h-full transition-all duration-300',
                          isCompleted || (index > 0 && STEPS.slice(0, index).every(s => isStepCompleted(s.number)))
                            ? 'bg-primary'
                            : 'bg-gray-300',
                        )}
                      />
                    </div>
                  )}

                  {/* Step circle */}
                  <div
                    className={cn(
                      'flex items-center justify-center shrink-0',
                      'size-7 md:size-8 rounded-full border-2',
                      'transition-all duration-200 z-10',
                      isCompleted && 'bg-primary border-primary',
                      isCurrent && 'bg-white border-primary',
                      !isCompleted && !isCurrent && 'bg-white border-gray-300',
                    )}
                  >
                    {isCompleted
                      ? (
                          <Check className="size-3 md:size-4 text-white" />
                        )
                      : (
                          <span
                            className={cn(
                              'text-xs font-semibold',
                              isCurrent && 'text-primary',
                              !isCurrent && 'text-gray-500',
                            )}
                          >
                            {step.number}
                          </span>
                        )}
                  </div>

                  {/* Right connector line */}
                  {!isLast && (
                    <div className="flex-1 h-0.5 ml-1 md:ml-2">
                      <div
                        className={cn(
                          'h-full transition-all duration-300',
                          isCompleted ? 'bg-primary' : 'bg-gray-300',
                        )}
                      />
                    </div>
                  )}

                  {/* Spacer for last item */}
                  {isLast && <div className="flex-1" />}
                </div>

                {/* Step label */}
                <div className="mt-1.5 md:mt-2 text-center px-1 md:px-2 max-w-[75px] md:max-w-[100px]">
                  <p
                    className={cn(
                      'text-[10px] md:text-xs font-medium truncate',
                      isCurrent && 'text-primary',
                      isCompleted && 'text-gray-900',
                      !isCompleted && !isCurrent && 'text-gray-500',
                    )}
                  >
                    {t(step.titleKey, {
                      defaultValue: `Step ${step.number}`,
                    })}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </nav>
    </div>
  )
}
