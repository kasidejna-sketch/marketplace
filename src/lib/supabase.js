import { createClient } from '@supabase/supabase-js'

// Support both VITE_ prefixed (Vite standard) and plain env vars
// For Cloudflare Workers, env vars are injected at build time via wrangler
// For AWS Amplify, use VITE_ prefix in Amplify console environment variables
export const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.SUPABASE_URL ||
  ''

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.SUPABASE_ANON_KEY ||
  ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Marketplace] Supabase env vars missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // public marketplace — no auth needed
    storage: localStorage, // Use localStorage if token exists, otherwise fallback to default (in-memory)
  },
})
