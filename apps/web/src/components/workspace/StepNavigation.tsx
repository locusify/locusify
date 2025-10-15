import type { FC } from 'react'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

interface StepNavigationProps {
  onNext?: () => void
  onBack?: () => void
  nextDisabled?: boolean
  backDisabled?: boolean
  nextLabel?: string
  backLabel?: string
  showNext?: boolean
  showBack?: boolean
  loading?: boolean
}

export const StepNavigation: FC<StepNavigationProps> = ({
  onNext,
  onBack,
  nextDisabled = false,
  backDisabled = false,
  nextLabel,
  backLabel,
  showNext = true,
  showBack = true,
  loading = false,
}) => {
  const { t } = useTranslation()

  const defaultNextLabel = t('workspace.controls.next', {
    defaultValue: 'Next',
  })
  const defaultBackLabel = t('workspace.controls.back', {
    defaultValue: 'Back',
  })

  return (
    <div className="flex items-center justify-between gap-3">
      {/* Back button */}
      {showBack
        ? (
            <Button
              type="button"
              variant="default"
              size="default"
              onClick={onBack}
              disabled={backDisabled || loading}
              className="flex items-center gap-1.5 h-9 bg-primary hover:bg-primary/90 text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              {backLabel || defaultBackLabel}
            </Button>
          )
        : <div />}

      {/* Next button */}
      {showNext && (
        <Button
          type="button"
          variant="default"
          size="default"
          onClick={onNext}
          disabled={nextDisabled || loading}
          className="flex items-center gap-1.5 h-9 bg-primary hover:bg-primary/90 text-white"
        >
          {loading
            ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('workspace.controls.processing', {
                    defaultValue: 'Processing...',
                  })}
                </>
              )
            : (
                <>
                  {nextLabel || defaultNextLabel}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
        </Button>
      )}
    </div>
  )
}
