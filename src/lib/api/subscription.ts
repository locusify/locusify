import { env } from '@/lib/env'
import { supabase } from '@/lib/supabase'

async function invokeFunction<T>(name: string, body?: Record<string, unknown>): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session)
    throw new Error('Not authenticated')

  const res = await fetch(`${env.VITE_SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || 'Request failed')
  }

  return res.json()
}

export interface RedeemCodeResult {
  success: boolean
  plan: string
  duration_days: number
  period_end: string
}

export async function redeemCode(code: string): Promise<RedeemCodeResult> {
  return invokeFunction<RedeemCodeResult>('redeem-code', { code })
}

export async function createCheckoutSession(priceId: string): Promise<string> {
  const result = await invokeFunction<{ url: string }>('stripe-checkout', { priceId })
  return result.url
}

export async function createPortalSession(): Promise<string> {
  const result = await invokeFunction<{ url: string }>('stripe-portal')
  return result.url
}

export interface AIRecommendation {
  templateId: string
  adjustments: {
    segmentDuration: number | null
    filterIntensity: number | null
  }
  reasoning: string
}

export async function getAIRecommendation(
  waypoints: { lat: number, lng: number, timestamp: string }[],
  totalDistance: number,
  totalDuration: number,
  photoCount: number,
): Promise<AIRecommendation> {
  return invokeFunction<AIRecommendation>('ai-recommend-template', {
    waypoints,
    totalDistance,
    totalDuration,
    photoCount,
  })
}

export async function getAICaptions(
  waypoints: { lat: number, lng: number, timestamp: string }[],
): Promise<{ captions: string[] }> {
  return invokeFunction<{ captions: string[] }>('ai-generate-captions', { waypoints })
}
