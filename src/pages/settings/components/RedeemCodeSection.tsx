import type { FC } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { redeemCode } from '@/lib/api/subscription'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { useSubscriptionStore } from '@/stores/subscriptionStore'

const ERROR_CODES = [
  'invalid_code',
  'code_inactive',
  'code_expired',
  'code_fully_used',
  'already_redeemed',
] as const

export const RedeemCodeSection: FC = () => {
  const { t } = useTranslation()
  const user = useAuthStore(s => s.user)
  const fetchSubscription = useSubscriptionStore(s => s.fetchSubscription)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRedeem = async () => {
    const trimmed = code.trim()
    if (!trimmed || !user)
      return

    setLoading(true)
    try {
      const result = await redeemCode(trimmed)
      await fetchSubscription(user.id)
      setCode('')
      toast.success(t('redeem.success', {
        plan: result.plan,
        date: new Date(result.period_end).toLocaleDateString(),
      }))
    }
    catch (err) {
      const message = err instanceof Error ? err.message : ''
      const errorCode = ERROR_CODES.find(c => message.includes(c))
      toast.error(errorCode ? t(`redeem.error.${errorCode}`) : t('redeem.error.generic'))
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-3">
      <p className="mb-2 text-sm font-medium text-text">{t('redeem.title')}</p>
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !loading && handleRedeem()}
          placeholder={t('redeem.placeholder')}
          disabled={loading}
          className="h-8 flex-1 text-sm text-text placeholder:text-text/40"
        />
        <button
          type="button"
          onClick={handleRedeem}
          disabled={loading || !code.trim()}
          className={cn(
            'flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-white transition-colors',
            'bg-sky-400 hover:bg-sky-500 disabled:opacity-50',
          )}
        >
          {loading && <Spinner className="size-3" />}
          {loading ? t('redeem.submitting') : t('redeem.submit')}
        </button>
      </div>
    </div>
  )
}
