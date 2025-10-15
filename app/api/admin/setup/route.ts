import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {
    const { email, password, code } = await req.json()
    if (!email || !password || !code) return new NextResponse("Missing fields", { status: 400 })
    if (code !== process.env.ADMIN_SETUP_CODE) return new NextResponse("Invalid setup code", { status: 401 })

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    // Create user if not exists
    const { data: userResp, error: userErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (userErr && userErr.message && !/already exists/i.test(userErr.message)) {
      return new NextResponse(userErr.message, { status: 500 })
    }

    // Allowlist email
    const { error: insErr } = await supabase.from("admin_emails").insert([{ email }]).select("email").maybeSingle()
    if (insErr && !/duplicate key/i.test(insErr.message)) {
      return new NextResponse(insErr.message, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return new NextResponse(e?.message || "Setup failed", { status: 500 })
  }
}
