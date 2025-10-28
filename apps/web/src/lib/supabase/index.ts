import type { Database } from './database.types'
import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'

const supabaseUrl = env.SUPABASE_URL
const supabaseKey = env.SUPABASE_ANON_KEY

/**
 * Create Supabase client with auth persistence
 * - Uses localStorage to persist auth sessions
 * - Automatically refreshes tokens
 * - Handles auth state changes
 */
const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
})

export default supabase
