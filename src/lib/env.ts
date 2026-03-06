import { z } from 'zod'

/** Environment variables schema */
const envSchema = z.object({
  /** Node.js environment mode */
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  /** Supabase project URL */
  VITE_SUPABASE_URL: z.string().default(''),
  /** Supabase anonymous key */
  VITE_SUPABASE_ANON_KEY: z.string().default(''),
  /** Stripe publishable key */
  VITE_STRIPE_PUBLISHABLE_KEY: z.string().default(''),
  /** Stripe monthly price ID */
  VITE_STRIPE_MONTHLY_PRICE_ID: z.string().default(''),
  /** Stripe yearly price ID */
  VITE_STRIPE_YEARLY_PRICE_ID: z.string().default(''),
  /** Debug: force Pro subscription status */
  VITE_DEBUG_PRO: z.coerce.boolean().default(false),
})

export type Env = z.infer<typeof envSchema>

/** Validate environment variables */
function validateEnv(): Env {
  try {
    const parsedEnv = envSchema.parse({
      NODE_ENV: import.meta.env.MODE,
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
      VITE_STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
      VITE_STRIPE_MONTHLY_PRICE_ID: import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID,
      VITE_STRIPE_YEARLY_PRICE_ID: import.meta.env.VITE_STRIPE_YEARLY_PRICE_ID,
      VITE_DEBUG_PRO: import.meta.env.DEV && import.meta.env.VITE_DEBUG_PRO,
    })

    console.log('loaded env successfully')
    return parsedEnv
  }
  catch (error) {
    console.error('❌ Environment validation failed:', error)
    throw new Error('Invalid environment variables')
  }
}

/** Export validated environment variables */
export const env = validateEnv()
