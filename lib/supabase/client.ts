import { createBrowserClient as createBrowserClientSSR } from "@supabase/ssr"

export function createBrowserClient() {
  return createBrowserClientSSR(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

export const createClientBrowser = createBrowserClient

export function createClient() {
  return createBrowserClientSSR(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
