import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

export const API_BASE_URL = supabaseUrl
  ? `${supabaseUrl}/functions/v1/make-server-5cf66d9e`
  : ''

export const STORAGE_BUCKET = 'make-5cf66d9e-photos'
