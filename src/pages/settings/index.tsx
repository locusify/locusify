import type { FC } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Separator } from '@/components/ui/separator'
import { cn, glassPanel } from '@/lib/utils'
import { PricingDrawer } from '@/pages/pricing'
import { useAuthStore } from '@/stores/authStore'
import { useSubscriptionStore } from '@/stores/subscriptionStore'
import { AboutSection } from './components/AboutSection'
import { AvatarSetting } from './components/AvatarSetting'
import { LanguageSetting } from './components/LanguageSetting'
import { PrivacySection } from './components/PrivacySection'
import { RedeemCodeSection } from './components/RedeemCodeSection'
import { SettingsSection } from './components/SettingsSection'
import { ThemeSetting } from './components/ThemeSetting'

interface SettingsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const SettingsDrawer: FC<SettingsDrawerProps> = ({ open, onOpenChange }) => {
  const { t } = useTranslation()
  const user = useAuthStore(s => s.user)
  const { subscription, isPro } = useSubscriptionStore()
  const [pricingOpen, setPricingOpen] = useState(false)

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[80vh] border-none bg-transparent backdrop-blur-none">
          <DrawerHeader className="hidden">
            <DrawerTitle>{t('settings.title')}</DrawerTitle>
            <DrawerDescription>{t('settings.section.appearance')}</DrawerDescription>
          </DrawerHeader>
          <div className={cn(glassPanel, 'flex flex-col overflow-hidden rounded-t-2xl')}>
            <div className="flex-1 overflow-y-auto p-4 pb-safe">
              <h2 className="mb-4 text-lg font-semibold text-text">{t('settings.title')}</h2>
              <SettingsSection label={t('settings.section.appearance')}>
                <ThemeSetting />
                <Separator />
                <LanguageSetting />
              </SettingsSection>
              <SettingsSection label={t('settings.section.replay')}>
                <AvatarSetting />
              </SettingsSection>
              {user && (
                <SettingsSection label={t('settings.section.subscription')}>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-text">
                        {t('settings.subscription.currentPlan')}
                      </p>
                      <p className="text-xs text-text/50">
                        {isPro
                          ? subscription.plan === 'pro_monthly'
                            ? t('settings.subscription.proMonthly')
                            : t('settings.subscription.proYearly')
                          : t('settings.subscription.free')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onOpenChange(false)
                        setTimeout(() => setPricingOpen(true), 300)
                      }}
                      className={cn(
                        'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                        isPro
                          ? 'bg-text/10 text-text hover:bg-text/15'
                          : 'bg-sky-400 text-white hover:bg-sky-500',
                      )}
                    >
                      {isPro ? t('settings.subscription.manage') : t('settings.subscription.upgrade')}
                    </button>
                  </div>
                  <Separator />
                  <RedeemCodeSection />
                </SettingsSection>
              )}
              <SettingsSection label={t('settings.section.privacy')}>
                <PrivacySection />
              </SettingsSection>
              <SettingsSection label={t('settings.section.about')}>
                <AboutSection />
              </SettingsSection>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
      <PricingDrawer open={pricingOpen} onOpenChange={setPricingOpen} />
    </>
  )
}
