import { AnimatePresence, m } from 'motion/react'
import { useTranslation } from 'react-i18next'
import locusifyLogo from '@/assets/locusify-fit.png'
import qrcodeImg from '@/assets/qrcode.jpeg'
import { useReplayStats } from '@/hooks/useReplayStats'
import { useReplayStore } from '@/stores/replayStore'
import { AnimatedNumber } from './AnimatedNumber'

/**
 * Bottom stats bar shown during trajectory replay.
 * Left: logo + brand name. Middle: 4 animated stats. Right: QR code.
 * Visible during playing/paused/completed — including recording.
 */
export function ReplayStatsBar() {
  const { t } = useTranslation()
  const status = useReplayStore(s => s.status)
  const stats = useReplayStats()

  const isVisible = status === 'playing' || status === 'paused' || status === 'completed'

  const items = [
    {
      value: stats.durationDays,
      precision: 0,
      label: t('stats.bar.duration'),
      unit: t('stats.bar.durationUnit'),
    },
    {
      value: stats.countriesVisited,
      precision: 0,
      label: t('stats.bar.countries'),
      unit: undefined,
    },
    {
      value: stats.citiesVisited,
      precision: 0,
      label: t('stats.bar.cities'),
      unit: undefined,
    },
    {
      value: stats.totalDistanceKm,
      precision: 2,
      label: t('stats.bar.distance'),
      unit: t('stats.bar.distanceUnit'),
    },
  ]

  return (
    <AnimatePresence>
      {isVisible && (
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="pointer-events-auto relative mx-2 mb-1 flex items-center gap-4 rounded-xl bg-black/60 px-4 py-3 backdrop-blur-sm"
        >
          {/* Left: Logo + brand */}
          <div className="flex items-center gap-2 pr-4">
            <img src={locusifyLogo} alt="" className="size-6 rounded" />
            <span className="text-xs font-semibold text-white">Locusify</span>
            <span className="text-[10px] text-white/40">|</span>
            <span className="text-[10px] text-white/50">@caterpi11ar</span>
          </div>

          {/* Middle: 4 stat items */}
          <div className="flex flex-1 justify-around">
            {items.map(item => (
              <div key={item.label} className="flex flex-col items-center">
                <div className="text-base font-semibold tabular-nums text-white">
                  <AnimatedNumber
                    value={item.value}
                    precision={item.precision}
                  />
                  {item.unit && (
                    <span className="ml-0.5 text-[10px] font-normal text-white/60">
                      {item.unit}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-white/60">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Right: QR code */}
          <div className="flex flex-col items-center gap-1 border-l border-white/15 pl-4">
            <img src={qrcodeImg} alt="QR" className="size-12 rounded" />
            <span className="text-[9px] text-white/60">{t('stats.bar.scanQr')}</span>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
