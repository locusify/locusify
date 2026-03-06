export type Feature = 'ai_recommend' | 'ai_captions' | 'premium_templates'

const PRO_PLANS = ['pro_monthly', 'pro_yearly']
const PRO_FEATURES: Feature[] = ['ai_recommend', 'ai_captions', 'premium_templates']

export function canUse(feature: Feature, plan: string): boolean {
  if (PRO_FEATURES.includes(feature))
    return PRO_PLANS.includes(plan)
  return true
}

export function isPro(plan: string): boolean {
  return PRO_PLANS.includes(plan)
}
