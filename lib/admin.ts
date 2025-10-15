import type { SupabaseClient } from "@supabase/supabase-js"

export async function isAdmin(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) return false
  const { data, error } = await supabase.from("admin_emails").select("email").eq("email", user.email).maybeSingle()
  return !!data && !error
}

export async function requireAdmin(supabase: SupabaseClient) {
  const ok = await isAdmin(supabase)
  if (!ok) {
    throw new Error("Forbidden")
  }
}
