import { createClient } from '@supabase/supabase-js'
import { env } from './env'

const supabaseUrl = env.SUPABASE_URL
const supabaseKey = env.SUPABASE_ANON_KEY

/** Create Supabase client */
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase
