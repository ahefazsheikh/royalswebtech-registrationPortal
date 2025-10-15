import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import Image from "next/image"

export default function HomePage() {
  return (
    <main>
      <SiteHeader />
      <section className="border-b bg-primary/5">
        <div className="mx-auto grid max-w-6xl items-center gap-6 px-4 py-12 md:grid-cols-2 md:py-18">
          <div className="space-y-3">
            <h1 className="text-pretty text-3xl font-semibold leading-tight md:text-4xl">
              Royals Webtech Interview & Registration Portal
            </h1>
            <p className="text-muted-foreground">
              Register for Internship or Job roles, or send an Inquiry. You’ll receive a unique ID with a QR for secure
              check-in at our premises.
            </p>
            <div className="flex gap-2 pt-1">
              <Button asChild>
                <Link href="/register/internship">Internship</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/register/job">Job</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/register/inquiry">Inquiry</Link>
              </Button>
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <Image
              src="/images/rwtlogo.png"
              alt="Royals Webtech"
              width={260}
              height={48}
              className="animate-in fade-in zoom-in-95 duration-700"
              priority
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 md:py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-balance">Internship Registration</CardTitle>
              <CardDescription>Apply for our internship program.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/register/internship">Start</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-balance">Job Registration</CardTitle>
              <CardDescription>Submit your profile for open roles.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/register/job">Start</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-balance">General Inquiry</CardTitle>
              <CardDescription>Contact us for other requests.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="secondary">
                <Link href="/register/inquiry">Start</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
