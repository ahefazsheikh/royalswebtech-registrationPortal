import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/admin"

export async function POST(req: Request) {
  const supabase = await createServerClient()
  await requireAdmin(supabase)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new NextResponse("Unauthorized", { status: 401 })

  const { uid } = await req.json()
  if (!uid) return new NextResponse("Missing uid", { status: 400 })

  const { data, error } = await supabase
    .from("registrations")
    .update({ checked_in: true, scanned_at: new Date().toISOString(), status: "checked_in" })
    .eq("uid", uid)
    .select("uid")
    .maybeSingle()

  if (error) return new NextResponse(error.message, { status: 500 })
  if (!data) return NextResponse.json({ ok: false, message: "UID not found" }, { status: 404 })

  return NextResponse.json({ ok: true, message: `Checked in ${uid}` })
}
