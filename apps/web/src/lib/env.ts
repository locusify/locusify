import { z } from 'zod'

/** Environment variables schema */
const envSchema = z.object({
  /** Node.js environment mode */
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  /** API base URL for backend services */
  VITE_API_URL: z.url().optional(),
})

export type Env = z.infer<typeof envSchema>

/** Validate environment variables */
function validateEnv(): Env {
  try {
    return envSchema.parse({
      NODE_ENV: import.meta.env.NODE_ENV,
      VITE_API_URL: import.meta.env.VITE_API_URL,
    })
  }
  catch (error) {
    console.error('❌ Environment validation failed:', error)
    throw new Error('Invalid environment variables')
  }
}

/** Export validated environment variables */
export const env = validateEnv()
