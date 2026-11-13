import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null
export function isSupabaseConfigured() { return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) }
export function getSupabase(): SupabaseClient {
  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anonKey) throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to the frontend environment.')
  if (!client) client = createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
  return client
}
export async function getAccessToken(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null
  const { data, error } = await getSupabase().auth.getSession()
  if (error) throw error
  return data.session?.access_token ?? null
}
export function publishAuthState(session: Session | null) {
  window.dispatchEvent(new CustomEvent('vytron:auth-changed', { detail: { session } }))
}
