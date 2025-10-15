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
  /** Amap API Key */
  AMAP_KEY: z.string(),
  /** Amap Security Code */
  AMAP_SECURITY_CODE: z.string(),
})

export type Env = z.infer<typeof envSchema>

/** Validate environment variables */
function validateEnv(): Env {
  try {
    const parsedEnv = envSchema.parse({
      NODE_ENV: import.meta.env.NODE_ENV,
      API_URL: import.meta.env.VITE_API_URL,
      GA_TRACKING_ID: import.meta.env.VITE_GA_TRACKING_ID,
      SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
      AMAP_KEY: import.meta.env.VITE_AMAP_KEY,
      AMAP_SECURITY_CODE: import.meta.env.VITE_AMAP_SECURITY_CODE,
    })

    console.log('loaded env:', parsedEnv)
    return parsedEnv
  }
  catch (error) {
    console.error('❌ Environment validation failed:', error)
    throw new Error('Invalid environment variables')
  }
}

/** Export validated environment variables */
export const env = validateEnv()
