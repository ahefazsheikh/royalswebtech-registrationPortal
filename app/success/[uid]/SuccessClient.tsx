// ./app/success/[uid]/SuccessClient.tsx

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
// FIX: Use namespace import for stability in Client Component
import * as QRCode from "qrcode" 

type Registration = {
  uid: string
  type: string
  name: string
  email: string
  phone: string
  purpose: string
  photo_url?: string | null
}

// 💥 FIX: Component now accepts 'uid' as a simple prop, not part of 'params'
export default function SuccessClient({ uid }: { uid: string }) {
  
  // Hooks are valid here because the function is synchronous
  const [qr, setQr] = useState<string | null>(null)
  const [reg, setReg] = useState<Registration | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    const makeQR = async () => {
      // Cast the QRCode import to the correct type for stability
      const QRCodeAPI = QRCode as unknown as { toDataURL: (url: string, options: any) => Promise<string> }
      
      const origin = typeof window !== "undefined" ? window.location.origin : ""
      const verifyUrl = `${origin}/admin/verify?uid=${encodeURIComponent(uid)}`
      
      const dataUrl = await QRCodeAPI.toDataURL(verifyUrl, { margin: 1, scale: 6 })
      setQr(dataUrl)
    }
    makeQR()
  }, [uid])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/registrations?uid=${encodeURIComponent(uid)}`)
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        setReg({
          uid: data.uid,
          type: data.type,
          name: data.name,
          email: data.email,
          phone: data.phone,
          purpose: data.purpose,
          photo_url: data.photo_url,
        })
      } catch (e: any) {
        setErr(e?.message || "Failed to load registration")
      }
    }
    load()
  }, [uid])

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-xl px-4 py-8 md:py-12 text-center">
        <h1 className="text-2xl font-semibold">Registration Complete</h1>
        <p className="mt-2 text-muted-foreground">Your unique ID</p>
        <p className="mt-1 text-lg font-mono">{uid}</p>

        {/* ID Card */}
        <div className="mx-auto mt-6 w-full max-w-sm rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-sm font-medium">Royals Webtech Pvt. Ltd.</p>
              <p className="text-xs text-muted-foreground capitalize">{reg?.type || "registration"}</p>
            </div>
            {reg?.photo_url ? (
              <img
                src={reg.photo_url || "/placeholder.svg"}
                alt="Applicant photo"
                className="h-16 w-16 rounded-md border object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-md border bg-muted" aria-hidden />
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 text-left">
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="text-sm font-semibold">{reg?.name || "-"}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{reg?.phone || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium break-all">{reg?.email || "-"}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Purpose</p>
              <p className="text-sm font-medium capitalize">{reg?.purpose || reg?.type || "-"}</p>
            </div>
          </div>

          {qr ? (
            <img
              src={qr || "/placeholder.svg"}
              alt="Registration QR code"
              className="mx-auto mt-4 h-auto w-40 rounded-md border"
            />
          ) : null}
        </div>

        {err ? <p className="mt-3 text-sm text-destructive">{err}</p> : null}

        <div className="mt-8 flex items-center justify-center gap-3">
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/register/internship">Register Another</Link>
          </Button>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Note: This QR can only be validated inside the admin panel of this site.
        </p>
      </section>
    </main>
  )
}