"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { SiteHeader } from "@/components/site-header"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const onLogin = async () => {
    setError(null)
    setLoading(true)
    try {
      const supabase = createBrowserClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push("/admin")
    } catch (e: any) {
      setError(e?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-md px-4 py-8 md:py-12">
        <Card>
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button onClick={onLogin} disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <p className="text-xs text-muted-foreground">
              In development, set NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL if you enable sign-ups.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
