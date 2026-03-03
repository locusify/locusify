import { z } from 'zod'

/** Environment variables schema */
const envSchema = z.object({
  /** Node.js environment mode */
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  /** Google OAuth client ID */
  VITE_GOOGLE_CLIENT_ID: z.string().default(''),
  /** GitHub OAuth App client ID */
  VITE_GITHUB_CLIENT_ID: z.string().default(''),
  /** URL to proxy for GitHub token exchange */
  VITE_GITHUB_PROXY_URL: z.string().default(''),
})

export type Env = z.infer<typeof envSchema>

/** Validate environment variables */
function validateEnv(): Env {
  try {
    const parsedEnv = envSchema.parse({
      NODE_ENV: import.meta.env.MODE,
      VITE_GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      VITE_GITHUB_CLIENT_ID: import.meta.env.VITE_GITHUB_CLIENT_ID,
      VITE_GITHUB_PROXY_URL: import.meta.env.VITE_GITHUB_PROXY_URL,
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
