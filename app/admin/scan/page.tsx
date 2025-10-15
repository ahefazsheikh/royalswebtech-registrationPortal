"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

declare global {
  // @ts-ignore
  interface Window {
    BarcodeDetector?: any
  }
}

export default function AdminScanPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [supported, setSupported] = useState<boolean>(false)
  const [uid, setUid] = useState<string>("")

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "BarcodeDetector" in window)
  }, [])

  const startCamera = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    if (videoRef.current) {
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      loopDetect()
    }
  }, [])

  async function loopDetect() {
    try {
      // @ts-ignore
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] })
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const read = async () => {
        if (!videoRef.current || !ctx) return
        canvas.width = videoRef.current.videoWidth
        canvas.height = videoRef.current.videoHeight
        ctx.drawImage(videoRef.current, 0, 0)
        const barcodes = await detector.detect(canvas)
        for (const code of barcodes) {
          const raw = code.rawValue as string
          const match = /[?&]uid=([^&]+)/.exec(raw)
          if (match?.[1]) {
            setUid(decodeURIComponent(match[1]))
          }
        }
        requestAnimationFrame(read)
      }
      requestAnimationFrame(read)
    } catch (e) {
      // Fallback to manual input
      setSupported(false)
    }
  }

  async function handleVerify(u?: string) {
    const theUid = (u ?? uid).trim()
    if (!theUid) return
    const res = await fetch("/api/admin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: theUid }),
    })
    const j = await res.json().catch(() => ({}))
    alert(j?.message || (res.ok ? "Verified" : "Verification failed"))
  }

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <Card>
          <CardHeader>
            <CardTitle>QR Check-in</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {supported ? (
              <>
                <video ref={videoRef} className="w-full rounded-md border" muted playsInline />
                <div className="flex items-center gap-2">
                  <Button onClick={startCamera}>Start Camera</Button>
                  <Input
                    placeholder="UID (auto-filled when QR is read)"
                    value={uid}
                    onChange={(e) => setUid(e.target.value)}
                  />
                  <Button onClick={() => handleVerify()}>Verify</Button>
                </div>
              </>
            ) : (
              <div className="grid gap-2">
                <p className="text-sm text-muted-foreground">BarcodeDetector not available. Enter the UID manually.</p>
                <div className="flex items-center gap-2">
                  <Input placeholder="Enter UID" value={uid} onChange={(e) => setUid(e.target.value)} />
                  <Button onClick={() => handleVerify()}>Verify</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
