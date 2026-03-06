import type { FC } from 'react'
import { m } from 'motion/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { createCheckoutSession, createPortalSession } from '@/lib/api/subscription'
import { env } from '@/lib/env'
import { formatDate } from '@/lib/formatters'
import { cn, glassPanel } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { useSubscriptionStore } from '@/stores/subscriptionStore'

interface PricingDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type BillingCycle = 'monthly' | 'yearly'

const freeFeatures = [
  'pricing.feature.basicTemplates',
  'pricing.feature.unlimitedPhotos',
  'pricing.feature.mapReplay',
]

const proFeatures = [
  'pricing.feature.allTemplates',
  'pricing.feature.aiRecommend',
  'pricing.feature.aiCaptions',
  'pricing.feature.customization',
  'pricing.feature.prioritySupport',
]

const proPrice = {
  monthly: { price: '$8.99', period: '/mo', originalPrice: '$9.99', discount: '11%' },
  yearly: { price: '$79.99', period: '/yr', originalPrice: '$119.88', discount: '33%' },
} as const

export const PricingDrawer: FC<PricingDrawerProps> = ({ open, onOpenChange }) => {
  const { t } = useTranslation()
  const user = useAuthStore(s => s.user)
  const { isPro, subscription } = useSubscriptionStore()
  const [loading, setLoading] = useState<string | null>(null)
  const [billing, setBilling] = useState<BillingCycle>('yearly')

  const currentProPrice = proPrice[billing]

  const handleSubscribe = async () => {
    if (!user || isPro)
      return

    setLoading('pro')
    try {
      const priceId = billing === 'monthly'
        ? env.VITE_STRIPE_MONTHLY_PRICE_ID
        : env.VITE_STRIPE_YEARLY_PRICE_ID
      if (!priceId) {
        toast.error(t('pricing.error.noPriceId'))
        return
      }
      const url = await createCheckoutSession(priceId)
      window.location.href = url
    }
    catch (err) {
      console.error('Subscription error:', err)
    }
    finally {
      setLoading(null)
    }
  }

  const [showManagePanel, setShowManagePanel] = useState(false)
  const [portalUrl, setPortalUrl] = useState<string | null>(null)

  const handleManage = async () => {
    setShowManagePanel(prev => !prev)
    // Always fetch a fresh portal URL — sessions expire within minutes
    setLoading('manage')
    try {
      const url = await createPortalSession()
      setPortalUrl(url)
    }
    catch (err) {
      console.error('Portal session error:', err)
    }
    finally {
      setLoading(null)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh] border-none bg-transparent backdrop-blur-none">
        <DrawerHeader className="hidden">
          <DrawerTitle>{t('pricing.title')}</DrawerTitle>
          <DrawerDescription>{t('pricing.description')}</DrawerDescription>
        </DrawerHeader>
        <div className={cn(glassPanel, 'flex flex-col overflow-hidden rounded-t-2xl')}>
          <div className="flex-1 overflow-y-auto p-4 pb-safe">
            {/* Header + billing toggle */}
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-text">{t('pricing.title')}</h2>
                <p className="mt-1 text-xs text-text/50">{t('pricing.description')}</p>
              </div>

              {/* Billing cycle toggle — hidden when already Pro */}
              {!isPro && (
                <div className="flex shrink-0 items-center gap-0.5 rounded-lg border border-fill-tertiary bg-material-thick p-0.5">
                  <button
                    type="button"
                    onClick={() => setBilling('monthly')}
                    className={cn(
                      'rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors',
                      billing === 'monthly'
                        ? 'bg-text/10 text-text'
                        : 'text-text/40 hover:text-text/60',
                    )}
                  >
                    {t('pricing.monthly')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBilling('yearly')}
                    className={cn(
                      'rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors',
                      billing === 'yearly'
                        ? 'bg-text/10 text-text'
                        : 'text-text/40 hover:text-text/60',
                    )}
                  >
                    {t('pricing.yearly')}
                  </button>
                </div>
              )}
            </div>

            {/* Two-column: Free | Pro */}
            <div className="grid grid-cols-2 gap-3">
              {/* Free card */}
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="relative overflow-hidden rounded-xl border border-fill-tertiary bg-material-thick p-4"
              >
                <h3 className="text-sm font-semibold text-text">
                  {t('pricing.plan.free')}
                </h3>
                <div className="mt-2 flex items-baseline gap-0.5">
                  <span className="text-3xl font-extrabold tracking-tighter text-text">
                    {t('pricing.plan.free.price')}
                  </span>
                </div>

                <ul className="mt-3 space-y-1.5">
                  {freeFeatures.map(feat => (
                    <li key={feat} className="flex items-start gap-1.5 text-[11px] text-text/60">
                      <i className="i-mingcute-check-line mt-0.5 shrink-0 text-text/30" />
                      <span>{t(feat)}</span>
                    </li>
                  ))}
                </ul>

                <div
                  className={cn(
                    'mt-4 w-full rounded-lg py-2 text-center text-xs font-medium',
                    'bg-text/5 text-text/40',
                  )}
                >
                  {isPro ? t('pricing.included') : t('pricing.currentPlan')}
                </div>
              </m.div>

              {/* Pro card */}
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.35 }}
                className="relative overflow-hidden rounded-xl border border-sky-400/50 bg-sky-400/5 p-4"
              >
                {/* Animated border glow */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-xl"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.15) 50%, transparent 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 3s ease-in-out infinite',
                  }}
                />

                {isPro
                  ? (
                      <>
                        {/* Plan name + plan badge */}
                        <div className="relative flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-text">Pro</h3>
                          <span className="rounded-full bg-sky-400/15 px-1.5 py-0.5 text-[9px] font-bold text-sky-400">
                            {subscription.plan === 'pro_yearly' ? t('pricing.yearly') : t('pricing.monthly')}
                          </span>
                        </div>

                        <div className="relative mt-2 text-[11px] text-text/40">
                          {t('pricing.currentPlan')}
                        </div>
                      </>
                    )
                  : (
                      <>
                        {/* Plan name + discount badge */}
                        <div className="relative flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-text">Pro</h3>
                          <span className="rounded-full bg-sky-400/15 px-1.5 py-0.5 text-[9px] font-bold text-sky-400">
                            -
                            {currentProPrice.discount}
                          </span>
                        </div>

                        {/* Strikethrough original price */}
                        <p className="relative mt-1 text-[11px] text-text/40 line-through">
                          {currentProPrice.originalPrice}
                        </p>

                        {/* Large price with animation */}
                        <m.div
                          key={billing}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="relative mt-1 flex items-baseline gap-0.5"
                        >
                          <span className="text-3xl font-extrabold tracking-tighter text-text">
                            {currentProPrice.price}
                          </span>
                          <span className="text-xs text-text/50">
                            {currentProPrice.period}
                          </span>
                        </m.div>
                      </>
                    )}

                <ul className="relative mt-3 space-y-1.5">
                  {proFeatures.map(feat => (
                    <li key={feat} className="flex items-start gap-1.5 text-[11px] text-text/60">
                      <i className="i-mingcute-check-line mt-0.5 shrink-0 text-sky-400" />
                      <span>{t(feat)}</span>
                    </li>
                  ))}
                </ul>

                {isPro
                  ? (
                      <>
                        <button
                          type="button"
                          disabled={loading === 'manage'}
                          onClick={handleManage}
                          className={cn(
                            'relative mt-4 w-full rounded-lg py-2 text-xs font-medium transition-colors',
                            'bg-sky-400 text-white hover:bg-sky-500',
                            loading === 'manage' && 'animate-pulse',
                          )}
                        >
                          {loading === 'manage' ? t('pricing.processing') : t('pricing.manage')}
                        </button>

                        {showManagePanel && (
                          <m.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="relative mt-3 overflow-hidden rounded-lg border border-fill-tertiary bg-material-thick p-3"
                          >
                            <div className="space-y-1.5 text-[11px] text-text/60">
                              {subscription.currentPeriodEnd
                                ? (
                                    <>
                                      <p>{t('pricing.sub.expires', { date: formatDate(new Date(subscription.currentPeriodEnd), { year: 'numeric', month: 'short', day: 'numeric' }) })}</p>
                                      <p>{t('pricing.sub.daysRemaining', { count: Math.max(0, Math.ceil((new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / 86400000)) })}</p>
                                    </>
                                  )
                                : <p>{t('pricing.sub.noExpiry')}</p>}
                              {subscription.cancelAtPeriodEnd && (
                                <p className="text-amber-400">{t('pricing.sub.willNotRenew')}</p>
                              )}
                            </div>

                            {portalUrl && (
                              <a
                                href={portalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2.5 flex items-center gap-1 text-[11px] font-medium text-sky-400 hover:text-sky-300"
                              >
                                {t('pricing.sub.manageOnStripe')}
                                <i className="i-mingcute-external-link-line text-xs" />
                              </a>
                            )}
                          </m.div>
                        )}
                      </>
                    )
                  : (
                      <button
                        type="button"
                        disabled={loading !== null}
                        onClick={handleSubscribe}
                        className={cn(
                          'relative mt-4 w-full rounded-lg py-2 text-xs font-medium transition-colors',
                          'bg-sky-400 text-white hover:bg-sky-500',
                          loading === 'pro' && 'animate-pulse',
                        )}
                      >
                        {loading === 'pro' ? t('pricing.processing') : t('pricing.upgrade')}
                      </button>
                    )}
              </m.div>
            </div>
          </div>
        </div>

        <style>
          {`
          @keyframes shimmer {
            0%, 100% { background-position: -200% 0; }
            50% { background-position: 200% 0; }
          }
        `}
        </style>
      </DrawerContent>
    </Drawer>
  )
}
