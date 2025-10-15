"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function AdminSetupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function onSetup() {
    setMsg(null)
    setLoading(true)
    const res = await fetch("/api/admin/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, code }),
    })
    setLoading(false)
    if (!res.ok) {
      setMsg(await res.text())
      return
    }
    setMsg("Admin created. You can now log in.")
    setTimeout(() => router.push("/auth/login"), 1000)
  }

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-md px-4 py-8 md:py-12">
        <Card>
          <CardHeader>
            <CardTitle>Admin Setup</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code">Setup Code</Label>
              <Input id="code" type="text" value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            {msg ? <p className="text-sm text-muted-foreground">{msg}</p> : null}
            <Button onClick={onSetup} disabled={loading}>
              {loading ? "Setting up..." : "Create Admin"}
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
