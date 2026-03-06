import type { ReplayTemplate, ReplayTemplateConfig } from '@/types/template'
import { AnimatePresence, m } from 'motion/react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getTemplateById } from '@/data/templates'
import { cn } from '@/lib/utils'
import { useReplayStore } from '@/stores/replayStore'
import { ReplayControls } from './replay/ReplayControls'
import { ReplayIntroOverlay } from './replay/ReplayIntroOverlay'
import { TemplateCustomizer } from './replay/TemplateCustomizer'
import { TemplateSelector } from './replay/TemplateSelector'

interface TrajectoryOverlayProps {
  onStartReplay?: () => Promise<void>
  onUpgradeClick?: () => void
}

/**
 * Overlay container for replay mode.
 * Contains the intro animation, template config UI, text overlay, stats, and bottom controls.
 * Photo card is now rendered as a map Marker (see MapLibre.tsx).
 */
export function TrajectoryOverlay({ onStartReplay, onUpgradeClick }: TrajectoryOverlayProps) {
  const { t } = useTranslation()

  const status = useReplayStore(s => s.status)
  const togglePlayPause = useReplayStore(s => s.togglePlayPause)
  const recordingActive = useReplayStore(s => s.recordingActive)
  const templateId = useReplayStore(s => s.templateId)
  const templateConfig = useReplayStore(s => s.templateConfig)
  const setTemplate = useReplayStore(s => s.setTemplate)
  const setCustomOverrides = useReplayStore(s => s.setCustomOverrides)
  const confirmConfig = useReplayStore(s => s.confirmConfig)
  const restartReplay = useReplayStore(s => s.restartReplay)

  const [introVisible, setIntroVisible] = useState(false)
  const [showTemplatePanel, setShowTemplatePanel] = useState(false)
  const [showCustomizePanel, setShowCustomizePanel] = useState(false)

  // Every play click (initial start, resume, restart) goes through the intro.
  const handlePlayClick = useCallback(async () => {
    if (status === 'configuring') {
      confirmConfig()
      await onStartReplay?.()
      setIntroVisible(true)
    }
    else if (status === 'completed') {
      restartReplay()
    }
    else {
      setIntroVisible(true)
    }
  }, [status, onStartReplay, confirmConfig, restartReplay])

  const handleIntroComplete = useCallback(() => {
    setIntroVisible(false)
    togglePlayPause()
  }, [togglePlayPause])

  const handleTemplateSelect = useCallback((template: ReplayTemplate) => {
    setTemplate(template.id, template.config)
    setShowTemplatePanel(false)
  }, [setTemplate])

  const handleConfigChange = useCallback((config: ReplayTemplateConfig) => {
    // Compute overrides relative to the base template
    const base = getTemplateById(templateId)
    if (!base)
      return
    const overrides: Partial<ReplayTemplateConfig> = {}
    for (const key of Object.keys(config) as (keyof ReplayTemplateConfig)[]) {
      if (JSON.stringify(config[key]) !== JSON.stringify(base.config[key])) {
        (overrides as Record<string, unknown>)[key] = config[key]
      }
    }
    setCustomOverrides(overrides)
  }, [templateId, setCustomOverrides])

  const handleUpgrade = useCallback(() => {
    onUpgradeClick?.()
  }, [onUpgradeClick])

  const isConfiguring = status === 'configuring'

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-end">
      {/* Opening logo animation */}
      <div className="pointer-events-auto">
        <ReplayIntroOverlay
          visible={introVisible}
          onExitComplete={handleIntroComplete}
          introStyle={templateConfig.intro.style}
        />
      </div>

      {/* Template selection panel (configuring phase) */}
      {isConfiguring && !showCustomizePanel && (
        <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-40 max-h-[60vh] overflow-y-auto rounded-t-2xl border border-fill-tertiary bg-white/95 p-4 shadow-2xl backdrop-blur-[120px] dark:bg-black/85">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text">{t('template.selector.title')}</h2>
            <button
              type="button"
              onClick={() => setShowCustomizePanel(true)}
              className="flex items-center gap-1 rounded-lg bg-text/5 px-2.5 py-1.5 text-[11px] font-medium text-text/60 transition-colors hover:bg-text/10 hover:text-text"
            >
              <i className="i-mingcute-settings-3-line text-xs" />
              {t('template.customize.title')}
            </button>
          </div>
          <TemplateSelector
            selectedId={templateId}
            onSelect={handleTemplateSelect}
            onUpgradeClick={handleUpgrade}
          />
          <button
            type="button"
            onClick={handlePlayClick}
            className="mt-4 w-full rounded-xl bg-sky-400 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-500"
          >
            {t('workspace.config.start')}
          </button>
        </div>
      )}

      {/* Customize panel (configuring phase, drill-in from template panel) */}
      <AnimatePresence>
        {isConfiguring && showCustomizePanel && (
          <m.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="pointer-events-auto absolute inset-x-0 bottom-0 z-40 max-h-[65vh] overflow-y-auto rounded-t-2xl border border-fill-tertiary bg-white/95 p-4 shadow-2xl backdrop-blur-[120px] dark:bg-black/85"
          >
            <div className="mb-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowCustomizePanel(false)}
                className="flex size-7 items-center justify-center rounded-lg text-text/60 transition-colors hover:bg-text/5 hover:text-text"
              >
                <i className="i-mingcute-arrow-left-line text-sm" />
              </button>
              <h2 className="text-sm font-semibold text-text">{t('template.customize.title')}</h2>
            </div>
            <TemplateCustomizer
              config={templateConfig}
              onChange={handleConfigChange}
            />
            <button
              type="button"
              onClick={() => setShowCustomizePanel(false)}
              className="mt-4 w-full rounded-xl bg-sky-400 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-500"
            >
              {t('workspace.config.start')}
            </button>
          </m.div>
        )}
      </AnimatePresence>

      {/* Template/customize popover during playback — toggled via ReplayControls buttons */}
      <AnimatePresence>
        {showTemplatePanel && !isConfiguring && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={cn(
              'pointer-events-auto absolute bottom-28 left-2 right-2 z-40 max-h-[50vh] overflow-y-auto',
              'rounded-2xl border border-fill-tertiary bg-white/95 p-4 shadow-2xl backdrop-blur-[120px] dark:bg-black/85',
            )}
          >
            <TemplateSelector
              selectedId={templateId}
              onSelect={(tmpl) => {
                handleTemplateSelect(tmpl)
                setShowTemplatePanel(false)
              }}
              onUpgradeClick={handleUpgrade}
            />
          </m.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCustomizePanel && !isConfiguring && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={cn(
              'pointer-events-auto absolute bottom-28 left-2 right-2 z-40 max-h-[55vh] overflow-y-auto',
              'rounded-2xl border border-fill-tertiary bg-white/95 p-4 shadow-2xl backdrop-blur-[120px] dark:bg-black/85',
            )}
          >
            <TemplateCustomizer
              config={templateConfig}
              onChange={handleConfigChange}
            />
          </m.div>
        )}
      </AnimatePresence>

      {/* Bottom gradient + controls — hidden during recording */}
      {!recordingActive && !isConfiguring && (
        <>
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="pointer-events-auto relative mx-2 pb-2 sm:pb-4">
            <ReplayControls
              onPlayClick={handlePlayClick}
              onTemplateClick={() => {
                setShowCustomizePanel(false)
                setShowTemplatePanel(prev => !prev)
              }}
              onCustomizeClick={() => {
                setShowTemplatePanel(false)
                setShowCustomizePanel(prev => !prev)
              }}
            />
          </div>
        </>
      )}
    </div>
  )
}
