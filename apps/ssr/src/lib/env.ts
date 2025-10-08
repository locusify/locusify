import process from 'node:process'
import { z } from 'zod'

/** Environment variables schema */
const envSchema = z.object({
  /** Node.js environment mode */
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  /** API base URL for backend services */
  API_URL: z.url().optional(),
  /** Google Analytics tracking ID */
  GA_TRACKING_ID: z.string().optional(),
  /** Supabase URL */
  SUPABASE_URL: z.url(),
  /** Supabase anon key */
  SUPABASE_ANON_KEY: z.string(),
})

export type Env = z.infer<typeof envSchema>

/** Validate environment variables */
function validateEnv(): Env {
  try {
    return envSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
      API_URL: process.env.NEXT_PUBLIC_API_URL,
      GA_TRACKING_ID: process.env.NEXT_PUBLIC_GA_TRACKING_ID,
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })
  }
  catch (error) {
    console.error('❌ Environment validation failed:', error)
    throw new Error('Invalid environment variables')
  }
}

/** Export validated environment variables */
export const env = validateEnv()
