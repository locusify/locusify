import type { Database } from './database.types'
import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'

const supabaseUrl = env.SUPABASE_URL
const supabaseKey = env.SUPABASE_ANON_KEY

/** Create Supabase client */
const supabase = createClient<Database>(supabaseUrl, supabaseKey)

export default supabase
