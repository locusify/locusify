import { m } from 'motion/react'
import { lazy, Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { useTranslation } from 'react-i18next'
import locusifyLogo from '@/assets/locusify.png'

const MapSection = lazy(() =>
  import('./MapSection').then(m => ({ default: m.MapSection })),
)

function MapSkeleton() {
  return (
    <div className="flex size-full items-center justify-center bg-neutral-950">
      <m.div
        className="flex flex-col items-center gap-5"
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <m.img
          src={locusifyLogo}
          alt="Locusify"
          className="size-20 rounded-2xl sm:size-24"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="flex flex-col items-center gap-2">
          <span className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Locusify
          </span>
          <span className="text-sm text-white/40 sm:text-base">
            Your Journey, Mapped
          </span>
        </div>
      </m.div>
    </div>
  )
}

function MapError({ resetErrorBoundary }: { resetErrorBoundary: () => void }) {
  const { t } = useTranslation()

  function handleReload() {
    resetErrorBoundary()
  }

  return (
    <m.div
      className="flex size-full items-center justify-center bg-neutral-950"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center">
        <m.div
          className="mb-4 text-4xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          ❌
        </m.div>
        <m.div
          className="text-lg font-medium text-white"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {t('explory.map.error.title')}
        </m.div>
        <m.p
          className="mb-4 text-sm text-white/50"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          {t('explory.map.error.description')}
        </m.p>
        <m.button
          className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          onClick={handleReload}
        >
          {t('explory.map.error.retry')}
        </m.button>
      </div>
    </m.div>
  )
}

export function Map() {
  return (
    <Suspense fallback={<MapSkeleton />}>
      <ErrorBoundary FallbackComponent={MapError}>
        <MapSection />
      </ErrorBoundary>
    </Suspense>
  )
}
