import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { SiteFooter } from "@/components/site-footer"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Royals Webtech Pvt. Ltd.",
  description: "Developed by Royals Webtech Pvt. Ltd.",
  generator: "Royals Webtech Pvt. Ltd.",
  // ✅ ADDED: Configure the favicon using your logo.png file
  icons: {
    icon: '/logo.png', 
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
      <body className="font-sans">
        <Suspense fallback={<div>Loading...</div>}>
          {children}
          <SiteFooter />
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}