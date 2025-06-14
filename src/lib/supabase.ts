
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and/or anon key are not set in environment variables. Please connect your Supabase project in Lovable.")
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

