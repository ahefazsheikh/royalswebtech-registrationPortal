import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/admin"

export async function GET(req: Request) {
  const supabase = await createServerClient()
  await requireAdmin(supabase)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new NextResponse("Unauthorized", { status: 401 })

  const url = new URL(req.url)
  const q = url.searchParams.get("q") || ""
  const type = url.searchParams.get("type") || ""
  const status = url.searchParams.get("status") || ""
  const limit = Math.min(Number(url.searchParams.get("limit") || 200), 500)
  const from = Number(url.searchParams.get("from") || 0)

  let query = supabase.from("registrations").select("*", { count: "exact" }).order("created_at", { ascending: false })

  if (q) query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`)
  if (type) query = query.eq("type", type)
  if (status) query = query.eq("status", status)

  query = query.range(from, from + (limit - 1))

  const { data, error, count } = await query
  if (error) return new NextResponse(error.message, { status: 500 })
  return NextResponse.json({ data, count })
}

export async function PATCH(req: Request) {
  const supabase = await createServerClient()
  await requireAdmin(supabase)
  const body = await req.json()

  const uid = body?.uid as string
  if (!uid) return new NextResponse("uid is required", { status: 400 })

  const update: any = {}
  if (typeof body?.checked_in === "boolean") {
    update.checked_in = !!body.checked_in
    update.checkin_at = body.checked_in ? new Date().toISOString() : null
  }
  if (typeof body?.status === "string") {
    // allow only known statuses
    const allowed = ["new", "reviewing", "shortlisted", "rejected", "hired", "checked_in"]
    if (!allowed.includes(body.status)) {
      return new NextResponse("invalid status", { status: 400 })
    }
    update.status = body.status
  }

  if (Object.keys(update).length === 0) {
    return new NextResponse("nothing to update", { status: 400 })
  }

  const { error } = await supabase.from("registrations").update(update).eq("uid", uid)
  if (error) return new NextResponse(error.message, { status: 500 })
  return NextResponse.json({ ok: true })
}
