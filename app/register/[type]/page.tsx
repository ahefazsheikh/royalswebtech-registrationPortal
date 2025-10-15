import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { RegistrationForm } from "@/components/registration-form"

// 💥 FIX 1: Convert the function to 'async'
export default async function RegisterTypePage({
  params,
}: {
  params: { type: "internship" | "job" | "inquiry" }
}) {
  // 💥 FIX 2: Await the parameter access. We use (await params) to satisfy the strict check.
  const type = (await params).type

  if (!["internship", "job", "inquiry"].includes(type)) notFound()
  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <RegistrationForm type={type} />
      </section>
    </main>
  )
}