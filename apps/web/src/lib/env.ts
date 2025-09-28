import { z } from 'zod'

/** Environment variables schema */
const envSchema = z.object({
  /** Node.js environment mode */
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  /** API base URL for backend services */
  API_URL: z.url().optional(),
  /** Base URL for frontend */
  BASE_URL: z.url().optional(),
  /** Google Analytics tracking ID */
  GA_TRACKING_ID: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

/** Validate environment variables */
function validateEnv(): Env {
  try {
    return envSchema.parse({
      NODE_ENV: import.meta.env.NODE_ENV,
      API_URL: import.meta.env.VITE_API_URL,
      BASE_URL: import.meta.env.VITE_BASE_URL,
      GA_TRACKING_ID: import.meta.env.VITE_GA_TRACKING_ID,
    })
  }
  catch (error) {
    console.error('❌ Environment validation failed:', error)
    throw new Error('Invalid environment variables')
  }
}

/** Export validated environment variables */
export const env = validateEnv()
