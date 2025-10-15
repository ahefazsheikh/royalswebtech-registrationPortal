"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function SiteHeader() {
  return (
    <header className="w-full border-b bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:py-4">
        <Link href="/" className="flex items-center gap-3" aria-label="Royals Webtech Pvt Ltd">
          {/* Logo is correctly implemented here */}
          <Image src="/images/rwtlogo.png" alt="Royals Webtech Pvt. Ltd. logo" width={180} height={32} priority />
          <span className="sr-only">{"Royals Webtech Pvt. Ltd."}</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/register/internship">Internship</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/register/job">Job</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/register/inquiry">Inquiry</Link>
          </Button>
          {/* Admin button removed for security */}
        </nav>
      </div>
    </header>
  )
}